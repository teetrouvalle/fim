# Fim Addis — Mature-rated non-pornographic film policy

**Status: development only; no production publication or paid playback authorized.**

## Classification and lawful sourcing
- Intended audience: adults (18+); mature-rated films/entertainment, **not pornography**.
- Confirm local counsel's review of Ethiopian film distribution, obscenity/classification, licensing and advertising laws, plus destination-market requirements before launch.
- Only publish titles for which Fim Addis has written rights to stream commercially, including the permitted territories and licensing dates. A personal Google Drive copy is not evidence of distribution rights.
- Record for each title: owner/licensor, agreement reference, permitted territories, start/end dates, language/subtitle rights, rating/classification authority, descriptors (violence, nudity, language, etc.), review date, and evidence location (private).
- Provide takedown/reporting and copyright complaint workflows and administrative unpublish functionality.

## Age gating
- Current age notice is an unverified self-declaration and **not** legal age verification.
- Before public launch, determine jurisdiction-specific age verification/age assurance needs, privacy implications and whether mature-rated films need stronger protections.
- No public trailers or premium videos before clearance.

## Publication gate
- `lib/publication-policy.ts` intentionally returns false for publication, checkout, and playback. Never toggle based on a browser flag.
- Future implementation requires server-side authorization, a verified rights record, classification compliance, geography checks where required, provider acceptability, signed playback authorization, and an auditable administrator action.
- The launch decision must be separately recorded by a privileged administrator after documented legal/business sign-off.

## Payment and provider policy
- Manual bank transfer approvals only; no activation before independent bank verification.
- Confirm Bunny Stream and deployment provider accept this particular licensed content. Do not conflate mature-rated films with explicit pornography.
- Configure accurate refund policy, terms, privacy notice, contact, and local consumer obligations before collecting payment.

## Launch checklist
- [ ] Documented commercial streaming rights for every published video
- [ ] Applicable Ethiopian and audience-country legal review
- [ ] Suitable content ratings/descriptors and age-assurance approach
- [ ] Bunny and web host policy compatibility confirmed
- [ ] User reporting/takedown and copyright contact available
- [ ] Privacy/terms/refunds published and reviewed
- [ ] Secure video, authorization, receipt and payment tests passed
- [ ] Explicit authorized production release decision
