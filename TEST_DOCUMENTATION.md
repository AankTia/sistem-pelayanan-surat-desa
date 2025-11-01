# Test Documentation - API Authentication

## Test Suite Overview

**Test File:** `tests/Feature/Api/AuthenticationTest.php`

**Total Tests:** 14
**Total Assertions:** 64
**Status:** ✅ All Passing

## Running Tests

```bash
# Run all authentication tests
php artisan test --filter=AuthenticationTest

# Run all tests
php artisan test

# Run tests with coverage
php artisan test --coverage
```

## Test Cases

### 1. Login Endpoint Tests

#### ✅ test_user_can_login_with_valid_credentials
**Description:** Verifies that a user can successfully login with correct email and password.

**Tests:**
- Response status is 200
- Response contains success, message, and data fields
- Response includes user information (id, name, email, username, roles, permissions)
- Response includes authentication token
- Token is stored in personal_access_tokens table

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

---

#### ✅ test_user_cannot_login_with_invalid_credentials
**Description:** Verifies that login fails with incorrect password.

**Tests:**
- Response status is 401
- Response contains error message
- No token is created

**Expected Response:**
```json
{
  "success": false,
  "message": "The provided credentials are incorrect."
}
```

---

#### ✅ test_login_validation_fails_when_fields_are_missing
**Description:** Verifies validation errors when email and password are not provided.

**Tests:**
- Response status is 422
- Response contains validation errors for both email and password
- Error message indicates validation failed

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

---

#### ✅ test_login_validation_fails_with_invalid_email
**Description:** Verifies validation error when email format is invalid.

**Tests:**
- Response status is 422
- Response contains validation error for email field
- Error message indicates invalid email format

---

#### ✅ test_login_fails_with_non_existent_user
**Description:** Verifies that login fails when user doesn't exist in database.

**Tests:**
- Response status is 401
- Response contains error message about incorrect credentials

---

#### ✅ test_login_response_includes_roles_and_permissions
**Description:** Verifies that login response includes user roles and permissions.

**Tests:**
- Response includes roles array
- Response includes permissions array

---

#### ✅ test_old_tokens_are_deleted_on_new_login
**Description:** Verifies that previous tokens are revoked when user logs in again.

**Tests:**
- Old token is created and stored in database
- After new login, old token is removed from database
- New token exists in database

---

### 2. Logout Endpoint Tests

#### ✅ test_authenticated_user_can_logout
**Description:** Verifies that authenticated user can successfully logout.

**Tests:**
- Token exists before logout
- Response status is 200
- Response contains success message
- Current access token is revoked

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### ✅ test_logout_fails_without_authentication
**Description:** Verifies that logout fails without authentication token.

**Tests:**
- Response status is 401
- Response contains unauthenticated error message

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

---

#### ✅ test_logout_fails_with_invalid_token
**Description:** Verifies that logout fails with invalid/expired token.

**Tests:**
- Response status is 401
- Response contains unauthenticated error message

---

### 3. Get User Info Tests

#### ✅ test_authenticated_user_can_get_their_info
**Description:** Verifies that authenticated user can retrieve their information.

**Tests:**
- Response status is 200
- Response contains user information
- User data includes id, name, email, username, roles, and permissions
- Data matches the authenticated user

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "email": "test@example.com",
      "username": "testuser",
      "roles": [],
      "permissions": []
    }
  }
}
```

---

#### ✅ test_get_user_info_fails_without_authentication
**Description:** Verifies that user info endpoint requires authentication.

**Tests:**
- Response status is 401
- Response contains unauthenticated error message

---

### 4. General API Tests

#### ✅ test_non_existent_api_endpoint_returns_404
**Description:** Verifies that non-existent endpoints return proper 404 error.

**Tests:**
- Response status is 404
- Response contains proper error message in JSON format

**Expected Response:**
```json
{
  "success": false,
  "message": "Resource not found."
}
```

---

#### ✅ test_api_always_returns_json
**Description:** Verifies that API always returns JSON responses.

**Tests:**
- Response Content-Type header is application/json
- Works even without Accept header

---

## Test Coverage Summary

### Endpoints Covered

| Endpoint | Method | Tests |
|----------|--------|-------|
| `/api/v1/login` | POST | 7 |
| `/api/v1/logout` | POST | 3 |
| `/api/v1/me` | GET | 2 |
| Non-existent routes | GET | 1 |
| JSON response | POST | 1 |

### Test Categories

| Category | Count |
|----------|-------|
| Success Cases | 5 |
| Validation Tests | 3 |
| Authentication Failures | 4 |
| Security Tests | 2 |

### HTTP Status Codes Tested

- ✅ 200 - Success
- ✅ 401 - Unauthorized
- ✅ 404 - Not Found
- ✅ 422 - Validation Error

## What's Tested

✅ **Authentication Flow**
- Login with valid credentials
- Login with invalid credentials
- Login with missing fields
- Login with invalid email format
- Login with non-existent user

✅ **Token Management**
- Token creation on login
- Token revocation on logout
- Old tokens deleted on new login
- Token validation

✅ **Authorization**
- Protected routes require authentication
- Invalid tokens are rejected
- Unauthenticated requests return 401

✅ **Response Format**
- Consistent JSON response structure
- Success field present in all responses
- Proper error messages
- Proper HTTP status codes

✅ **Data Integrity**
- User data includes all required fields
- Roles and permissions are included
- Database state is properly managed

## What's NOT Tested (Future Improvements)

- ❌ Rate limiting
- ❌ Token expiration
- ❌ Multiple concurrent logins
- ❌ Permission-based access control
- ❌ Password reset flow
- ❌ Email verification
- ❌ API versioning compatibility

## Files Updated for Testing

1. **`tests/Feature/Api/AuthenticationTest.php`** - Main test file
2. **`database/factories/UserFactory.php`** - Added username field generation

## Best Practices Followed

✅ Use `RefreshDatabase` trait for clean database state
✅ Use Laravel Sanctum's `actingAs()` for authentication in tests
✅ Test both success and failure cases
✅ Verify database state changes
✅ Test response structure and content
✅ Clear, descriptive test method names
✅ Comprehensive assertions
✅ Test edge cases and validation

## Running Specific Tests

```bash
# Run a specific test method
php artisan test --filter=test_user_can_login_with_valid_credentials

# Run tests with verbose output
php artisan test --filter=AuthenticationTest --verbose

# Run tests in parallel (faster)
php artisan test --parallel
```

## Continuous Integration

These tests should be run in your CI/CD pipeline before deployment:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: php artisan test
```

## Debugging Failed Tests

```bash
# Run with detailed output
php artisan test --filter=AuthenticationTest --verbose

# Stop on first failure
php artisan test --stop-on-failure

# Display coverage
php artisan test --coverage --min=80
```
