# Pueblo Pulse Security Specification (Zero-Trust ABAC)

This specification defines the data invariants, threat model ("Dirty Dozen" payloads), and rules approach for the Pueblo Pulse Firestore deployment.

## 1. Core Data Invariants & Access Logic

*   **User Registry (`/users/{userId}`)**: 
    *   Read access is restricted to the owner of the profile (`request.auth.uid == userId`) or to authorized administrators.
    *   No user may write or alter their own `role`, `points`, or `banStatus`. Privilege escalation is strictly forbidden.
    *   Standard users must have a verified email (`request.auth.token.email_verified == true`).
*   **Forum Posts (`/posts/{postId}`)**:
    *   Create requires a valid verified user. Users cannot post on behalf of other accounts (the `author` field must match the user's name/ID, or `request.auth.uid` controls the creation).
    *   Updates are limited to the post's author or moderators/admins.
*   **Business Claims (`/claims/{claimId}`)**:
    *   Can be created by signed-in, email-verified users trying to claim a business.
    *   Status modifications (approvals/rejections) are strictly restricted to administrators.
*   **Identity Verifications (`/verifications/{verificationId}`)**:
    *   Created by citizens seeking resident status.
    *   Updates and status transitions can only be authored by administrators.
*   **Moderator Logs (`/actions/{actionId}`)**:
    *   Completely immutable once written.
    *   Writes are strictly authorized to administrators or automatic pulse guards.

---

## 2. The "Dirty Dozen" Threat Payloads (Security TDD)

Below are 12 malicious payloads that our security rules MUST block returned as `PERMISSION_DENIED`:

### Payload 1: Privilege Escalation (Self-Assigned Admin)
*   **Target**: `/users/attacker-uid` (Create or Update)
*   **Symptom**: Attacker attempts to modify their own profile to assign themselves the "Super Admin" role.
*   **Payload**: `{"role": "Super Admin", "name": "Attacker", "email": "attacker@spam.com"}`
*   **Expected Behavior**: `PERMISSION_DENIED` (role modification blocked).

### Payload 2: Email Spoofing (Unverified Admin Access)
*   **Target**: Admin actions / Reads
*   **Symptom**: Attacker attempts to register/write with an administrator's email but without actual verification (`email_verified: false`).
*   **Expected Behavior**: `PERMISSION_DENIED` due to `request.auth.token.email_verified == true` mandate.

### Payload 3: Identity Spoofing (Post on Behalf of Elena)
*   **Target**: `/posts/malicious-post-1` (Create)
*   **Symptom**: User `attacker-uid` attempts to publish a forum post setting `author` to a prominent community moderator ("Elena Gonzalez") in order to mislead the local population.
*   **Payload**: `{"id": "mp-1", "author": "Elena Gonzalez", "authorId": "user-mock-2", "title": "Scam post", "content": "Fake report", "neighborhood": "mesa"}`
*   **Expected Behavior**: `PERMISSION_DENIED` since the creator does not own or map to the matching identity.

### Payload 4: Arbitrary Claims Approval (Self-Approving Business Claim)
*   **Target**: `/claims/clm-1` (Update)
*   **Symptom**: Sincere or malicious business owner attempts to approve their own business claim directly bypassing admin reviews.
*   **Payload**: `{"status": "Approved"}`
*   **Expected Behavior**: `PERMISSION_DENIED` (only admins can transition the claim status).

### Payload 5: Poisoning Document IDs
*   **Target**: `/posts/{postId}` (Create/Get)
*   **Symptom**: Attempt to set a 2KB junk character string as the Document ID to cause Denial-of-Wallet or break index rules.
*   **Expected Behavior**: `PERMISSION_DENIED` via `isValidId()` checks that limit ID size to <= 128 characters showing correct alphanumeric regex matches.

### Payload 6: Modifying Saved Post Array Fields as Non-Owner
*   **Target**: `/users/victim-uid` (Update)
*   **Symptom**: Attacker attempts to erase or pollute another user's bookmarked collection list.
*   **Expected Behavior**: `PERMISSION_DENIED`.

### Payload 7: Modifying Immutable Forum Post Fields (Wiping Creation Dates)
*   **Target**: `/posts/some-post-id` (Update)
*   **Symptom**: Attacker attempts to set `createdAt` timestamp of a foreign thread to years ago to scramble chronological order.
*   **Expected Behavior**: `PERMISSION_DENIED`.

### Payload 8: Corrupting System Moderator Audit Logs
*   **Target**: `/actions/act-123` (Update/Delete)
*   **Symptom**: Malicious user trying to rewrite past moderator actions to cover their tracks or remove penalty files.
*   **Expected Behavior**: `PERMISSION_DENIED` (actions must be immutable, allow update/delete: if false).

### Payload 9: Denial-of-Wallet Size Exhaustion Write
*   **Target**: `/posts/some-post-id` (Create)
*   **Symptom**: Attempting to write a forum post where the body message is an extremely massive 10MB binary block.
*   **Expected Behavior**: `PERMISSION_DENIED` due to character limit checks (`data.content.size() <= 10000`).

### Payload 10: Circumventing Resident Qualification
*   **Target**: `/verifications/v-999` (Update)
*   **Symptom**: Standard user attempts to unilaterally approve their own utility bill verification.
*   **Payload**: `{"status": "Approved"}`
*   **Expected Behavior**: `PERMISSION_DENIED`.

### Payload 11: Spammer Content Insertion Bypassing Check
*   **Target**: `/posts/some-post-id` (Create)
*   **Symptom**: Creating a post containing shadow fields or promotional parameters not declared inside the validated blueprint.
*   **Expected Behavior**: `PERMISSION_DENIED`.

### Payload 12: Broad Blanket Read Mining / Admin Scrape
*   **Target**: `/claims/` (List query)
*   **Symptom**: External scraping attempts to query all merchant documents in bulk without being the claim owner or administrator.
*   **Expected Behavior**: `PERMISSION_DENIED`.
