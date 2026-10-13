# Fim Addis — Manual Payment Approval (MVP)

**Status:** Approved product specification. This file is not a working payment integration.

## Non-negotiable business rule
All payments are verified **manually** by an authorized Fim Addis administrator. An uploaded receipt or customer-entered transaction reference is never sufficient to unlock a video. There is no bank API, Stripe, Chapa, or automatic payment verification in the MVP.

Once an admin verifies actual receipt of funds and selects **Approve**, the system grants the corresponding video entitlement or membership automatically. Automatic payment status emails are deferred.

## Customer journey
1. Authenticated user chooses a priced individual video or a Basic/Plus/Premium membership plan.
2. Server creates an immutable order snapshot with item, exact amount, currency (ETB or USD), duration, and unique order reference.
3. UI displays configured payment instructions for that currency. USD checkout is unavailable until a valid USD-compatible payment method is configured.
4. Customer transfers funds independently, uploads a receipt to a **private** storage bucket, and submits transaction reference.
5. Order is marked `pending_review`; user sees that state on the dashboard. **No access is granted.**
6. Authorized admin reviews the details and independently confirms settlement with the relevant account.
7. Admin approves or rejects with an optional/required explanation as appropriate.
8. Approved order immediately grants the product entitlement via a single atomic/idempotent database operation. Rejection never grants access; user can view the rejection reason.

## Admin interface
`/admin/payments`: pending/approved/rejected filters; order reference; user; product; currency; amount; receipt (authorized private view); transaction reference; submitted date; bank verification checklist; Approve; Reject; rejection reason; admin identity and action timestamp.

## State machine
- `awaiting_payment` -> `pending_review` when a receipt is submitted
- `pending_review` -> `approved` only through server-side admin approval
- `pending_review` -> `rejected` only through server-side admin rejection
- Rejected submissions may be replaced with a newly recorded attempt under carefully controlled rules.
- Never grant access in any other state.

## Security and consistency
- Server-side `requireAdmin()` for **every** approval/rejection operation; do not trust browser-provided roles.
- User receipts in private Supabase Storage; no public permanent URLs. Users see only their own orders/receipts; admins have restricted review privileges.
- Preserve approved order price and currency; clients cannot edit them.
- Use a single PostgreSQL transaction for status change, entitlement/membership creation, and audit record. Lock/check the order; repeated requests must have no second effect.
- Unique constraints/idempotency prevent double entitlement and double membership extension.
- Basic < Plus < Premium. Purchase-only videos are excluded from all subscriptions.
- Individually purchased video entitlement has no time limit while the content remains available.
- Subscription duration is configurable per plan. Renewals must preserve unused paid time.
- Payment verification is **human**, and payment confirmation emails are **not sent** by the MVP.

## Required verification tests
1. Pending or rejected order never unlocks content.
2. Normal user cannot call approve/reject operations.
3. Approved order unlocks precisely the purchased product or correct subscription.
4. Double-click and concurrent approve calls grant access only once.
5. Rejection preserves denial of access and shows reason to buyer.
6. One customer's receipt and bank details cannot be viewed by another customer.
7. Price/currency/order ownership cannot be overridden from the browser.
8. Admin actions are audit logged.

## Future work (excluded from launch)
- Automated card/mobile-money payments
- Payment-confirmation/rejection emails
- Bank API reconciliation
