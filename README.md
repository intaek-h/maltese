# Small code fixes
- [x] Remove hardcoded IDs in convex/puns.ts mutations; accept animalId arg and db.get() to validate existence.

- [x] Type imageStorageId as v.id("_storage") in animals; update getAllAnimals to use typed ID.

- [x] Enforce input length caps server-side: firstRow ≤ 100, secondRow ≤ 120, reason ≤ 240; trim/collapse whitespace.

- [x] Strip HTML/JS on write and escape on render; normalize zero‑width and duplicate whitespace.

- [x] Add indexes you’ll actually query (verify in schema): by_public_key, by_status (and any by-animal you need).

- [x] Replace likes/reportCount client writes with server-calculated counts only.

- [x] Add updatedAt maintenance in mutations (still useful alongside _creationTime for edits).

# Core features (backend)

Submission

- [x] createPun(firstRow, secondRow, animalId):

- [x] Validate non-empty (post-trim), length caps, valid animalId.

- [x] Compute contentHash on canonicalized text; reject recent dupes via by_content_hash (or app-level check windowed by _creationTime).

- [x] Set status: "queued" by default; auto-promote to "visible" if basic filters pass.

Likes

- [x] Table: likes(punId, voterKey, createdAt, ipHash?) with index by_pun_voter.

- [x] likePun(punId, voterKey): upsert unique pair; increment likeCount on new insert.


Reports


- [x] Table: reports(punId, reporterKey, reason?, createdAt, ipHash?) with index by_pun_reporter.

- [x] reportPun(punId, reporterKey, reason?): insert once per reporter; increment reportCount.

Moderation

- [ ] setPunStatus(punId, status); softDeletePun(punId); restorePun(punId).

- [ ] listMostReported(since) and listQueued(offset/cursor) for review.

Rate limiting and identity (no-auth)

- [x] Generate/store authorKey/voterKey in cookie/localStorage (UUID).

- [x] Hash IP with rotating salt; store truncated hash only.

- [ ] Limits:

  - [ ] Submissions: ≤ 3/min, ≤ 20/day per authorKey/ipHash.

  - [ ] Likes: ≤ 30/min per voterKey/ipHash.

  - [ ] Reports: ≤ 10/day per reporterKey/ipHash.

- [ ] Enforce using recent-time window queries on the above indexes.

Queries and pagination

- [x] getPunByPublicKey(publicKey): use by_public_key.

Client integration

- [x] Prevent multiple like/report actions per item in UI based on current user’s state.

- [ ] Show hidden/queued states only in admin views.

Safety and content quality

- [ ] Basic profanity/URL filters; auto-queue or hide on hit.

- [ ] Emoji/ZW character normalization; collapse repeated characters.

- [ ] Throttle submissions with identical firstRow/secondRow from same authorKey within short window.

Observability and ops

- [ ] Structured logs for submissions, likes, reports, auto-hides (without raw IP).

- [ ] Metrics: submissions/min, like/report rates, auto-hide triggers.

- [ ] Admin page: queue, most-reported, quick actions.

Privacy and compliance

- [x] Store only hashed IPs; rotate salt on schedule.

- [ ] Add a brief public note about abuse handling and content removal.

Optional hardening (phase 2)

- [ ] Add Turnstile/hCaptcha to submit/report if abuse rises.

- [ ] Shadow-banning for repeat abusers (key + IP hash).

- [ ] CDN caching for read-only pun lists; stale-while-revalidate.



