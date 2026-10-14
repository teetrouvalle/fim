/** Server-only commerce and media feature gates. Defaults remain disabled. */
import "server-only";
export type ReviewRecord = { rightsVerified:boolean;classificationVerified:boolean;legalReviewApproved:boolean;providerApproved:boolean;publishRequested:boolean };
export function canPublishVideo(r:ReviewRecord){return r.rightsVerified&&r.classificationVerified&&r.legalReviewApproved&&r.providerApproved&&r.publishRequested;}
export function canAcceptPayment(){return process.env.FIM_PAYMENTS_OPEN==="true";}
export function canAuthorizePlayback(){return process.env.FIM_PLAYBACK_OPEN==="true"&&Boolean(process.env.BUNNY_STREAM_TOKEN_KEY)&&Boolean(process.env.BUNNY_STREAM_LIBRARY_ID);}
