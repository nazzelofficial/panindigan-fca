export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string | Buffer;
  meta: Record<string, unknown>;
}

export interface ResponseContext {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body?: unknown;
  meta: Record<string, unknown>;
}

export interface ErrorContext {
  url: string;
  method: string;
  error: Error;
  meta: Record<string, unknown>;
}

export interface Middleware {
  name: string;
  onRequest?: (ctx: RequestContext, next: () => Promise<void>) => Promise<void>;
  onResponse?: (ctx: ResponseContext, next: () => Promise<void>) => Promise<void>;
  onError?: (ctx: ErrorContext, next: () => Promise<void>) => Promise<void>;
}

export class MiddlewarePipeline {
  private readonly middlewares: Middleware[] = [];

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async runRequest(ctx: RequestContext): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return;
      const mw = this.middlewares[index++];
      if (mw?.onRequest) await mw.onRequest(ctx, next);
      else await next();
    };
    await next();
  }

  async runResponse(ctx: ResponseContext): Promise<void> {
    const reversed = [...this.middlewares].reverse();
    let index = 0;
    const next = async (): Promise<void> => {
      if (index >= reversed.length) return;
      const mw = reversed[index++];
      if (mw?.onResponse) await mw.onResponse(ctx, next);
      else await next();
    };
    await next();
  }

  async runError(ctx: ErrorContext): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return;
      const mw = this.middlewares[index++];
      if (mw?.onError) await mw.onError(ctx, next);
      else await next();
    };
    await next();
  }
}
