# Security Specification & Threat Model

This document outlines the security invariants, threat validation payloads, and test suite definitions for the Social Media Command Hub.

## 1. Core Data Invariants

- **User Access Bounds**: A user can only read, write, or look up token details belonging exactly to their own authenticated UID (`request.auth.uid`). No cross-tenant reads or identity spoofing are permitted.
- **Post Immutability & Ownership**: A publication post must be owned by the user who created it. Once created, the `userId` field cannot be modified or re-assigned to prevent orphaned or stolen post resource references.
- **Temporal Integrity**: The post's scheduling and creation events must rely strictly on server runtime verification (`request.time`). Client-provided timestamps are considered untrusted and rejected.
- **Strict Configuration Schema**: Only standard string structures with strict size bounds (<= 1000 characters) are permitted for dynamic captioning and tokens to mitigate Denial of Wallet (DoW) database size exhaustion attacks.
- **Subscription Integrity**: The subscription plan tier and billing interval are system-managed objects. Users are strictly forbidden from directly updating their own subscriber tier, which is restricted solely to authorized admin overrides or backend processors.

---

## 2. The "Dirty Dozen" Threat Payloads

The following specific JSON payloads are designed to challenge and bypass security validation barriers:

### Payload 1: Identity Spoofing User Write
Attempting to create another user's private OAuth connection registry.
- **Target Path**: `/users/legitimate_user_99`
- **Auth User ID**: `attacker_44`
- **Payload**:
  ```json
  {
    "lastUpdated": "2026-05-22T19:28:12Z",
    "tokens": {
      "facebook": { "accessToken": "stolen_token", "accountName": "Victim Page" }
    }
  }
  ```

### Payload 2: Token Size Resource Poisoning
Injecting a 2MB token payload into the user profile.
- **Target Path**: `/users/attacker_44`
- **Auth User ID**: `attacker_44`
- **Payload**:
  ```json
  {
    "lastUpdated": "2026-05-22T19:28:12Z",
    "tokens": {
      "facebook": {
        "accessToken": "A".repeat(2 * 1024 * 1024),
        "accountName": "Malicious App"
      }
    }
  }
  ```

### Payload 3: Post Ownership Spoofing
Creating a post containing an ownership ID that does not match the authenticated session.
- **Target Path**: `/posts/malicious_post_1`
- **Auth User ID**: `attacker_44`
- **Payload**:
  ```json
  {
    "userId": "victim_user_11",
    "topic": "Malicious Ad Promotion",
    "caption": "Get rich quick!",
    "platforms": ["Facebook"],
    "status": "scheduled",
    "scheduledTime": "2026-05-23T15:00:00Z"
  }
  ```

### Payload 4: Arbitrary Platform Injections
Adding random strings to the platform list to exhaust server task threads during automated scheduling poll loops.
- **Target Path**: `/posts/post_leak_1`
- **Auth User ID**: `legitimate_user_1`
- **Payload**:
  ```json
  {
    "userId": "legitimate_user_1",
    "topic": "Summer Promo",
    "caption": "Standard safe copy",
    "platforms": ["MyCustomSecretTaskRunnerNetworkPool"],
    "status": "scheduled",
    "scheduledTime": "2026-05-23T15:00:00Z"
  }
  ```

### Payload 5: Unauthorized Cross-Reader
An authenticated user attempting to retrieve another user's private social credentials.
- **Target Path**: `/users/legitimate_user_1`
- **Auth User ID**: `attacker_44`
- **Action**: `GET` (Expects `PERMISSION_DENIED`)

### Payload 6: Missing Field Integrity Bypass
Creating a post with essential keys omitted.
- **Target Path**: `/posts/bad_post_2`
- **Auth User ID**: `legitimate_user_1`
- **Payload**:
  ```json
  {
    "userId": "legitimate_user_1",
    "status": "scheduled"
  }
  ```

### Payload 7: Immortal Field Modification (Immutability Violation)
Updating a post document to swap the creator ID after it has been created.
- **Target Path**: `/posts/post_1`
- **Auth User ID**: `legitimate_user_1` (original creator)
- **Current DB State**: `{ userId: "legitimate_user_1", caption: "Original Text" }`
- **Payload**:
  ```json
  {
    "userId": "attacker_44",
    "caption": "Original Text"
  }
  ```

### Payload 8: Path Character ID Poisoning
Using ultra-long rogue query characters to prompt memory leaks or path-traversal index failures.
- **Target Path**: `/posts/malicious_post_` + "../".repeat(50) + "leak"
- **Auth User ID**: `legitimate_user_1`

### Payload 9: Client Direct Subscription Escalation
A normal client attempting to grant themselves "Enterprise" billing tier access without paying.
- **Target Path**: `/subscriptions/attacker_user_sub`
- **Auth User ID**: `attacker_44` (non-admin)
- **Payload**:
  ```json
  {
    "tier": "Enterprise",
    "interval": "annual",
    "active": true
  }
  ```

### Payload 10: State and Value Poisoning
Updating state parameters with invalid types (e.g. status set to an integer instead of string enum).
- **Target Path**: `/posts/post_1`
- **Auth User ID**: `legitimate_user_1`
- **Payload**:
  ```json
  {
    "status": 100
  }
  ```

### Payload 11: Future/Past Client Timestamp Forgery
Pre-setting future or old values to bypass chronological publisher priority loops.
- **Target Path**: `/posts/post_1`
- **Auth User ID**: `legitimate_user_1`
- **Payload (Create)**:
  ```json
  {
    "userId": "legitimate_user_1",
    "caption": "Malicious scheduled timing check",
    "platforms": ["Facebook"],
    "status": "scheduled",
    "scheduledTime": "2020-01-01T00:00:00Z"
  }
  ```

### Payload 12: Email Verification Spoofing
Bypassing account settings with an unverified email claiming to act as a system administrator.
- **Target Path**: `/posts/post_1`
- **Auth Profile ID**: `attacker_uid`, Email: `admin@company.com`, Verified: `false`

---

## 3. Threat Rule Tests Validation Map

A complete test runner setup ensures that running the ruleset returns `PERMISSION_DENIED` on each of these cases. Under a secure backend environment, we enforce complete rules matching these scenarios locally.
