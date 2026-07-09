import type { HttpClient } from '../http/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildGraphQLRequest, parseJsonResponse } from '../graphql/index.js';
import { NotFoundError } from '../errors/index.js';

export interface CreatePollOptions {
  threadId: string;
  question: string;
  options: string[];
  signal?: AbortSignal;
}

export interface PollOption {
  id: string;
  text: string;
  voterIds: string[];
  voteCount: number;
}

export interface Poll {
  pollId: string;
  threadId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: Date;
}

export interface VotePollOptions {
  pollId: string;
  optionId: string;
  signal?: AbortSignal;
}

export class PollsModule {
  constructor(
    private readonly http: HttpClient,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async create(options: CreatePollOptions): Promise<Poll> {
    const tokens = this.getTokens();
    this.logger.info('Creating poll', { tag: 'POLLS', threadId: options.threadId, question: options.question });

    const { url, body } = buildGraphQLRequest({
      queryName: 'createPoll',
      variables: {
        threadID: options.threadId,
        question: options.question,
        options: options.options.map((text, idx) => ({ id: String(idx + 1), text })),
      },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal: options.signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    return this.parsePoll(options.threadId, data, options.question, options.options);
  }

  async vote(options: VotePollOptions): Promise<void> {
    const tokens = this.getTokens();
    this.logger.info('Voting on poll', { tag: 'POLLS', pollId: options.pollId, optionId: options.optionId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'votePoll',
      variables: { pollID: options.pollId, optionID: options.optionId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    await this.http.post(url, body, { signal: options.signal });
  }

  async getResults(pollId: string, signal?: AbortSignal): Promise<Poll> {
    const tokens = this.getTokens();
    this.logger.debug('Fetching poll results', { tag: 'POLLS', pollId });

    const { url, body } = buildGraphQLRequest({
      queryName: 'getPollResults',
      variables: { pollID: pollId },
      dtsg: tokens.dtsg,
      lsd: tokens.lsd,
    });

    const resp = await this.http.post(url, body, { signal });
    const text = await resp.text();
    const data = parseJsonResponse(text) as Record<string, unknown>;

    const poll = this.parsePollResults(pollId, data);
    if (!poll) throw new NotFoundError(`Poll ${pollId} not found`, { pollId });
    return poll;
  }

  private parsePoll(
    threadId: string,
    data: Record<string, unknown>,
    question: string,
    optionTexts: string[],
  ): Poll {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const node = (d?.['create_poll'] ?? d?.['poll']) as Record<string, unknown> | undefined;
      const pollId = String(node?.['poll_id'] ?? node?.['id'] ?? `poll_${Date.now()}`);
      const opts: PollOption[] = optionTexts.map((text, idx) => ({
        id: String(idx + 1),
        text,
        voterIds: [],
        voteCount: 0,
      }));
      return {
        pollId,
        threadId,
        question,
        options: opts,
        totalVotes: 0,
        createdAt: new Date(),
      };
    } catch {
      return {
        pollId: `poll_${Date.now()}`,
        threadId,
        question,
        options: optionTexts.map((text, idx) => ({ id: String(idx + 1), text, voterIds: [], voteCount: 0 })),
        totalVotes: 0,
        createdAt: new Date(),
      };
    }
  }

  private parsePollResults(pollId: string, data: Record<string, unknown>): Poll | null {
    try {
      const d = data['data'] as Record<string, unknown> | undefined;
      const node = (d?.['poll'] ?? d?.['poll_question']) as Record<string, unknown> | undefined;
      if (!node) return null;

      const rawOptions = Array.isArray(node['options']) ? (node['options'] as Array<Record<string, unknown>>) : [];
      const opts: PollOption[] = rawOptions.map((o) => {
        const voters = Array.isArray(o['voters']) ? (o['voters'] as Array<Record<string, unknown>>) : [];
        return {
          id: String(o['id'] ?? ''),
          text: String(o['text'] ?? ''),
          voterIds: voters.map((v) => String(v['id'] ?? '')),
          voteCount: Number(o['total_count'] ?? voters.length),
        };
      });

      const totalVotes = opts.reduce((sum, o) => sum + o.voteCount, 0);

      return {
        pollId,
        threadId: String(node['thread_key'] ?? ''),
        question: String(node['text'] ?? node['question'] ?? ''),
        options: opts,
        totalVotes,
        createdAt: node['creation_time'] ? new Date(Number(node['creation_time']) * 1000) : new Date(),
      };
    } catch {
      return null;
    }
  }
}
