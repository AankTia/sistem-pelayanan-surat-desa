# API Documentation - Sistem Pelayanan Surat Desa

Base URL: `http://localhost:8000/api/v1`

## Authentication Endpoints

### 1. Login

**Endpoint:** `POST /api/v1/login`

**Description:** Authenticate user and receive access token

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "username": "admin",
      "roles": ["Admin"],
      "permissions": [
        "view-letter-requests",
        "create-letter-requests",
        ...
      ]
    },
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Error Response - Validation Failed (422):**
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

**Error Response - Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "The provided credentials are incorrect."
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:8000/api/v1/login' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data-raw '{
  "email": "admin@example.com",
  "password": "password"
}'
```

---

### 2. Logout

**Endpoint:** `POST /api/v1/logout`

**Description:** Revoke current access token

**Request Headers:**
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {your_token_here}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Response - Unauthenticated (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**Example cURL:**
```bash
curl --location --request POST 'http://localhost:8000/api/v1/logout' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

---

### 3. Get Current User

**Endpoint:** `GET /api/v1/me`

**Description:** Get authenticated user information with roles and permissions

**Request Headers:**
```
Accept: application/json
Authorization: Bearer {your_token_here}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "username": "admin",
      "roles": ["Admin"],
      "permissions": [
        "view-letter-requests",
        "create-letter-requests",
        "edit-letter-requests",
        "delete-letter-requests",
        "approve-letter-requests",
        "reject-letter-requests",
        "print-letter-requests",
        "view-users",
        "create-users",
        "edit-users",
        "view-residents",
        "create-residents",
        "edit-residents",
        "delete-residents",
        "view-reports",
        "generate-reports",
        "view-analytics",
        "view-charts",
        "view-settings",
        "edit-settings",
        "view-logs"
      ]
    }
  }
}
```

**Error Response - Unauthenticated (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:8000/api/v1/me' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

---

## Test Users

If you run the database seeders, the following test users will be available:

| Email | Password | Role | Username |
|-------|----------|------|----------|
| superadmin@example.com | password | Super Admin | superadmin |
| admin@example.com | password | Admin | admin |
| budi@example.com | password | Staff | budi |
| siti@example.com | password | Staff | siti |
| ahmad@example.com | password | Operator | ahmad |

---

## Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Field-specific errors (for validation)
  }
}
```

---

## Authentication Flow

1. **Login** - Call `POST /api/v1/login` with email and password
2. **Store Token** - Save the returned token securely
3. **Make Requests** - Include token in `Authorization: Bearer {token}` header
4. **Logout** - Call `POST /api/v1/logout` to revoke token

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthenticated / Invalid credentials |
| 404 | Resource not found |
| 422 | Validation failed |
| 500 | Server error |

## Common Error Scenarios

### Accessing Protected Routes Without Token

**Request:**
```bash
curl -X POST 'http://localhost:8000/api/v1/logout' \
--header 'Accept: application/json'
```

**Response (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Using Invalid/Expired Token

**Request:**
```bash
curl -X GET 'http://localhost:8000/api/v1/me' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer invalid-token'
```

**Response (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Accessing Non-Existent API Endpoint

**Request:**
```bash
curl -X GET 'http://localhost:8000/api/v1/nonexistent' \
--header 'Accept: application/json'
```

**Response (404):**
```json
{
  "success": false,
  "message": "Resource not found."
}
```

---

## Notes

- All API routes are prefixed with `/api/v1`
- API versioning allows for future updates without breaking existing integrations
- All protected routes require `Authorization: Bearer {token}` header
- Tokens are stored in the `personal_access_tokens` table
- Old tokens are deleted when user logs in again
- Include `Accept: application/json` header for proper JSON responses
