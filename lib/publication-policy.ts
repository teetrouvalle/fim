/** Fail-closed launch policy. No client input may override this module. */
export const PUBLICATION_ENABLED = false as const;
export const CHECKOUT_ENABLED = false as const;
export const VIDEO_PLAYBACK_ENABLED = false as const;
export type ReviewRecord = { rightsVerified: boolean; classificationVerified: boolean; legalReviewApproved: boolean; providerApproved: boolean; publishRequested: boolean };
export function canPublishVideo(_record: ReviewRecord): boolean { return false; }
export function canAcceptPayment(): boolean { return false; }
export function canAuthorizePlayback(): boolean { return false; }
// Replace with a server-controlled, audited gate only after compliance sign-off.
