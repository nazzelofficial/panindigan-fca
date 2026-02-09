import { ApiCtx } from '../auth';
export declare class Formatter {
    private ctx;
    constructor(ctx: ApiCtx);
    format(delta: any): any;
    private formatMessage;
    private formatThreadName;
    private formatAdminMessage;
    private formatParticipantsAdded;
    private formatParticipantLeft;
    private formatReadReceipt;
    private formatDeliveryReceipt;
}
