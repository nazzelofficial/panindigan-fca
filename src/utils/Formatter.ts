
import { ApiCtx } from '../auth';

export class Formatter {
  constructor(private ctx: ApiCtx) {}

  public format(delta: any): any {
    if (!delta) return null;

    if (delta.class === 'NewMessage') {
      return this.formatMessage(delta);
    } else if (delta.class === 'ThreadName') {
      return this.formatThreadName(delta);
    } else if (delta.class === 'AdminTextMessage') {
      return this.formatAdminMessage(delta);
    } else if (delta.class === 'ParticipantsAddedToGroupThread') {
      return this.formatParticipantsAdded(delta);
    } else if (delta.class === 'ParticipantLeftGroupThread') {
      return this.formatParticipantLeft(delta);
    } else if (delta.class === 'ReadReceipt') {
      return this.formatReadReceipt(delta);
    } else if (delta.class === 'DeliveryReceipt') {
      return this.formatDeliveryReceipt(delta);
    }

    return { type: 'unknown', data: delta };
  }

  private formatMessage(delta: any) {
    const meta = delta.messageMetadata;
    const body = delta.body || '';
    
    // Attachments
    const attachments = (delta.attachments || []).map((att: any) => {
        const type = att.mercury.blob_attachment.type || 'unknown';
        const url = att.mercury.blob_attachment.preview?.uri || att.mercury.blob_attachment.url;
        return {
            type,
            url,
            id: att.mercury.blob_attachment.legacy_attachment_id
        };
    });

    return {
      type: 'message',
      senderID: meta.actorFbId,
      body: body,
      threadID: meta.threadKey.threadFbId || meta.threadKey.otherUserFbId,
      messageID: meta.messageId,
      attachments: attachments,
      mentions: delta.data ? delta.data.prng : {}, // Simplification
      timestamp: parseInt(meta.timestamp),
      isGroup: !!meta.threadKey.threadFbId,
      isUnread: true
    };
  }

  private formatThreadName(delta: any) {
    return {
      type: 'event',
      logMessageType: 'log:thread-name',
      threadID: delta.threadKey.threadFbId,
      name: delta.name,
      senderID: delta.actorFbId,
      timestamp: parseInt(delta.messageMetadata.timestamp)
    };
  }

  private formatAdminMessage(delta: any) {
    return {
      type: 'event',
      logMessageType: 'log:admin-message',
      threadID: delta.messageMetadata.threadKey.threadFbId,
      messageID: delta.messageMetadata.messageId,
      body: delta.messageMetadata.adminText,
      senderID: delta.messageMetadata.actorFbId,
      timestamp: parseInt(delta.messageMetadata.timestamp)
    };
  }

  private formatParticipantsAdded(delta: any) {
    return {
      type: 'event',
      logMessageType: 'log:subscribe',
      threadID: delta.messageMetadata.threadKey.threadFbId,
      addedParticipants: delta.addedParticipants,
      senderID: delta.messageMetadata.actorFbId,
      timestamp: parseInt(delta.messageMetadata.timestamp)
    };
  }

  private formatParticipantLeft(delta: any) {
    return {
      type: 'event',
      logMessageType: 'log:unsubscribe',
      threadID: delta.messageMetadata.threadKey.threadFbId,
      leftParticipantFbId: delta.leftParticipantFbId,
      senderID: delta.messageMetadata.actorFbId,
      timestamp: parseInt(delta.messageMetadata.timestamp)
    };
  }

  private formatReadReceipt(delta: any) {
    return {
        type: 'read_receipt',
        reader: delta.actorFbId,
        threadID: delta.threadKey.threadFbId || delta.threadKey.otherUserFbId,
        timestamp: parseInt(delta.actionTimestamp)
    };
  }
  
  private formatDeliveryReceipt(delta: any) {
      return {
          type: 'delivery_receipt',
          threadID: delta.threadKey.threadFbId || delta.threadKey.otherUserFbId,
          recipient: delta.actorFbId,
          timestamp: parseInt(delta.deliveryReceiptTimestampMs)
      };
  }
}
