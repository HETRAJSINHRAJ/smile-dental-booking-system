# Firestore Security Rules Test Guide

This document provides guidance for testing the Firestore security rules.

## Testing Approach

### 1. Manual Testing via Firebase Console

1. Go to Firebase Console > Firestore > Rules
2. Use the "Rules Playground" to test different scenarios
3. Test with different user IDs and authentication states

### 2. Automated Testing (Recommended)

Use Firebase Emulator Suite for automated testing:

```bash
npm install -g firebase-tools
firebase emulators:start
```

## Test Scenarios

### Users Collection

**Test 1: User can read their own profile**
- Auth: User A (uid: user-a)
- Action: Read /users/user-a
- Expected: ✅ Allow

**Test 2: User cannot read another user's profile**
- Auth: User A (uid: user-a)
- Action: Read /users/user-b
- Expected: ❌ Deny

**Test 3: Admin can read any user profile**
- Auth: Admin (email in whitelist)
- Action: Read /users/user-a
- Expected: ✅ Allow

**Test 4: User can update their own profile (except role)**
- Auth: User A (uid: user-a)
- Action: Update /users/user-a (change name)
- Expected: ✅ Allow

**Test 5: User cannot update their role**
- Auth: User A (uid: user-a)
- Action: Update /users/user-a (change role to admin)
- Expected: ❌ Deny

### Appointments Collection

**Test 6: User can read their own appointments**
- Auth: User A (uid: user-a)
- Action: Read /appointments where userId == user-a
- Expected: ✅ Allow

**Test 7: User can create appointment for themselves**
- Auth: User A (uid: user-a)
- Action: Create /appointments with userId: user-a
- Expected: ✅ Allow

**Test 8: User cannot create appointment for another user**
- Auth: User A (uid: user-a)
- Action: Create /appointments with userId: user-b
- Expected: ❌ Deny

**Test 9: User can cancel their own appointment**
- Auth: User A (uid: user-a)
- Action: Update /appointments/appt-1 (where userId == user-a)
- Expected: ✅ Allow

### Audit Logs Collection

**Test 10: User can create audit log**
- Auth: User A (uid: user-a)
- Action: Create /audit_logs/log-1
- Expected: ✅ Allow

**Test 11: User cannot read audit logs**
- Auth: User A (uid: user-a)
- Action: Read /audit_logs/log-1
- Expected: ❌ Deny

**Test 12: Admin can read audit logs**
- Auth: Admin (email in whitelist)
- Action: Read /audit_logs/log-1
- Expected: ✅ Allow

**Test 13: No one can update audit logs**
- Auth: Admin (email in whitelist)
- Action: Update /audit_logs/log-1
- Expected: ❌ Deny

### Encrypted Medical Data Collection

**Test 14: User can read their own encrypted medical data**
- Auth: User A (uid: user-a)
- Action: Read /encrypted_medical_data/data-1 (where userId == user-a)
- Expected: ✅ Allow

**Test 15: User cannot read another user's encrypted medical data**
- Auth: User A (uid: user-a)
- Action: Read /encrypted_medical_data/data-2 (where userId == user-b)
- Expected: ❌ Deny

**Test 16: Admin can read encrypted medical data**
- Auth: Admin (email in whitelist)
- Action: Read /encrypted_medical_data/data-1
- Expected: ✅ Allow

### Services and Providers Collections

**Test 17: Anyone can read services**
- Auth: None (unauthenticated)
- Action: Read /services/service-1
- Expected: ✅ Allow

**Test 18: Only admin can create services**
- Auth: User A (uid: user-a)
- Action: Create /services/service-2
- Expected: ❌ Deny

**Test 19: Admin can create services**
- Auth: Admin (email in whitelist)
- Action: Create /services/service-2
- Expected: ✅ Allow

## Running Tests

### Using Firebase Emulator

1. Install dependencies:
```bash
npm install --save-dev @firebase/rules-unit-testing
```

2. Create test file (example in JavaScript):
```javascript
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

// Initialize test environment
const testEnv = await initializeTestEnvironment({
  projectId: 'demo-project',
  firestore: {
    rules: fs.readFileSync('firestore.rules', 'utf8'),
  },
});

// Test example
it('should allow user to read their own profile', async () => {
  const alice = testEnv.authenticatedContext('alice');
  await assertSucceeds(alice.firestore().doc('users/alice').get());
});
```

## Security Best Practices Verified

✅ User-based access control implemented
✅ Admin whitelist for privileged operations
✅ Immutable audit logs
✅ Encrypted medical data protection
✅ Appointment ownership validation
✅ No unauthorized data access
✅ Proper authentication checks

## Notes

- All sensitive operations require authentication
- Audit logs are immutable (cannot be updated or deleted)
- Medical data is protected with user-level access control
- Admin access is controlled via whitelist in Firestore
- Payment audit logs are tracked separately for compliance
