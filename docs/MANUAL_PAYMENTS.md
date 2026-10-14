# Fim Addis manual M-PESA payment flow

**Implementation:** The routes exist; production collection is disabled until verification and launch sign-off.

**Tiers:** Basic 599 ETB, Plus 999 ETB, Premium 1,499 ETB, each covering 30 days upon administrator approval.

**Receiving number:** 0707070707 (supplied by the operator; not independently verified). **Telegram:** @keithify (supplied by operator; not independently verified).

## Customer procedure
1. Register/login using a Neon-verified email identity.
2. Choose a tier at /membership and review /checkout/{plan}.
3. When payments are open, pay the amount to the verified receiving number, obtain the M-PESA transaction ID.
4. Submit the transaction ID and either a PNG/JPG/PDF file (max 900 KB) privately on the website, or choose Telegram and send the receipt to @keithify referencing the transaction.
5. Payment starts as pending. Nothing grants access automatically.
6. Admin independently confirms settlement in the actual M-PESA receiving account and clicks Approve (or Reject with reason) at /admin/payments.
7. The Postgres function records the decision and grants a 30-day membership, extending any remaining paid period. It records an audit log. Replays are idempotent and transaction locking prevents duplicate extensions.
8. User checks membership status at /account. Videos must also be published, rights-reviewed and protected by signed Bunny playback.

## Data protection
- Payment details derive from the pricing table; users cannot choose the price.
- All uploads are stored in the private Neon database, not returned through any unauthenticated public endpoint. Receipt viewing requires a verified administrator session. Use private object storage for larger-scale production before volume grows.
- Daily submission rate limit: 3 per user; duplicate transaction IDs blocked.
- No automated payment gateway, Telegram bot, or direct bank reconciliation. Telegram is manual; no confirmation through Telegram is trustworthy without matching M-PESA receipt of funds.
- Emails about payment decisions and refunds are not automated.
- Approval and video streaming must be kept off until licensed catalog and security are tested.

## Safety and launch
`FIM_PAYMENTS_OPEN` must be true and `fim_site_settings.payments_open` must also be true for payment submission. The default is false. `FIM_PLAYBACK_OPEN` and `fim_site_settings.playback_open` are also off by default. These dual controls ensure frontend publication alone does not collect payment or unlock videos.

Neon Managed Better Auth shared SMTP currently needs verification configuration; use your own production SMTP. External verification and hosting licensing are not code-only tasks.
