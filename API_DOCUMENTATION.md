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

## User Management Endpoints

All user management endpoints require authentication. Include the Bearer token in the Authorization header.

### 1. Get All Users

**Endpoint:** `GET /api/v1/users`

**Description:** Retrieve a paginated list of all users with their roles and permissions

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `search` (optional): Search by name, email, or username

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/users?per_page=10&search=admin" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "username": "admin",
        "email_verified_at": null,
        "last_login_at": null,
        "created_at": "2025-11-01T07:15:19.000000Z",
        "updated_at": "2025-11-01T07:15:19.000000Z",
        "deleted_at": null,
        "roles": [...],
        "permissions": [...]
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 10,
      "total": 45
    }
  }
}
```

---

### 2. Get Single User

**Endpoint:** `GET /api/v1/users/{id}`

**Description:** Retrieve detailed information about a specific user

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/users/1 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
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
      "permissions": ["view-users", "create-users", ...],
      "created_at": "2025-11-01T07:15:19.000000Z",
      "updated_at": "2025-11-01T07:15:19.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Create User

**Endpoint:** `POST /api/v1/users`

**Description:** Create a new user with optional role assignment

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "password_confirmation": "password123",
  "roles": ["Staff"]
}
```

**Field Requirements:**
- `name`: required, string, max 255 characters
- `email`: required, email format, unique, max 255 characters
- `username`: required, string, unique, max 255 characters, alphanumeric with dashes/underscores
- `password`: required, string, min 8 characters, must match confirmation
- `password_confirmation`: required if password is provided
- `roles`: optional, array of existing role names

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "password_confirmation": "password123",
    "roles": ["Staff"]
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 10,
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "roles": ["Staff"],
      "permissions": ["view-letter-requests", ...],
      "created_at": "2025-11-01T12:04:38.000000Z"
    }
  }
}
```

**Error Response - Validation Failed (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password confirmation does not match"]
  }
}
```

---

### 4. Update User

**Endpoint:** `PUT /api/v1/users/{id}` or `PATCH /api/v1/users/{id}`

**Description:** Update an existing user's information

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "username": "johndoe_new",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "roles": ["Admin"]
}
```

**Field Requirements:**
- All fields are optional (use `sometimes` validation)
- Email and username must be unique (excluding current user)
- Password requires confirmation if provided

**Example Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/users/10 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.updated@example.com"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 10,
      "name": "John Doe Updated",
      "email": "john.updated@example.com",
      "username": "johndoe",
      "roles": ["Staff"],
      "permissions": ["view-letter-requests", ...],
      "updated_at": "2025-11-01T12:10:45.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /api/v1/users/{id}`

**Description:** Delete a user and revoke all their tokens

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/api/v1/users/10 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response - Cannot Delete Self (403):**
```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## API Response Format

All API endpoints follow a consistent response format:

### Success Response Structure:
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

### Error Response Structure:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Validation errors (for 422 responses)
  }
}
```

### HTTP Status Codes:
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `401` - Unauthenticated
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error

---

## Testing Examples

### Complete CRUD Flow:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Create User
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "password_confirmation": "password123",
    "roles": ["Staff"]
  }'

# 3. List Users
curl -X GET "http://localhost:8000/api/v1/users?per_page=10" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get Single User
curl -X GET http://localhost:8000/api/v1/users/10 \
  -H "Authorization: Bearer $TOKEN"

# 5. Update User
curl -X PUT http://localhost:8000/api/v1/users/10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated"
  }'

# 6. Delete User
curl -X DELETE http://localhost:8000/api/v1/users/10 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- All timestamps are in UTC ISO 8601 format
- User deletion also deletes all associated authentication tokens
- Users cannot delete their own account
- Password must be at least 8 characters
- Username can only contain letters, numbers, dashes and underscores
- Roles must exist in the system before assignment
- Search functionality searches across name, email, and username fields

## Role Management Endpoints

All role management endpoints require authentication. Include the Bearer token in the Authorization header.

### 1. Get All Roles

**Endpoint:** `GET /api/v1/roles`

**Description:** Retrieve a paginated list of all roles with their permissions and user counts

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `search` (optional): Search by role name

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/roles?per_page=10&search=admin" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "Super Admin",
        "guard_name": "web",
        "permissions": ["view-users", "create-users", ...],
        "permissions_count": 28,
        "users_count": 2,
        "created_at": "2025-11-01T12:17:22.000000Z",
        "updated_at": "2025-11-01T12:17:22.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 10,
      "total": 4
    }
  }
}
```

---

### 2. Get Single Role

**Endpoint:** `GET /api/v1/roles/{id}`

**Description:** Retrieve detailed information about a specific role

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/roles/1 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "role": {
      "id": 1,
      "name": "Super Admin",
      "guard_name": "web",
      "permissions": ["view-users", "create-users", ...],
      "permissions_count": 28,
      "users_count": 2,
      "created_at": "2025-11-01T12:17:22.000000Z",
      "updated_at": "2025-11-01T12:17:22.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

### 3. Create Role

**Endpoint:** `POST /api/v1/roles`

**Description:** Create a new role with optional permission assignment

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "name": "Manager",
  "permissions": ["view-users", "view-residents", "view-reports"]
}
```

**Field Requirements:**
- `name`: required, string, unique, max 255 characters
- `permissions`: optional, array of existing permission names

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Manager",
    "permissions": ["view-users", "view-residents"]
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "role": {
      "id": 5,
      "name": "Manager",
      "guard_name": "web",
      "permissions": ["view-users", "view-residents"],
      "permissions_count": 2,
      "users_count": 0,
      "created_at": "2025-11-01T12:30:00.000000Z"
    }
  }
}
```

**Error Response - Validation Failed (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name has already been taken."]
  }
}
```

---

### 4. Update Role

**Endpoint:** `PUT /api/v1/roles/{id}` or `PATCH /api/v1/roles/{id}`

**Description:** Update an existing role's name and/or permissions

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Manager Updated",
  "permissions": ["view-users", "create-users", "view-residents"]
}
```

**Field Requirements:**
- `name`: optional, string, unique, max 255 characters
- `permissions`: optional, array of existing permission names

**Example Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/roles/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Manager Updated",
    "permissions": ["view-users", "create-users"]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "role": {
      "id": 5,
      "name": "Manager Updated",
      "guard_name": "web",
      "permissions": ["view-users", "create-users"],
      "permissions_count": 2,
      "users_count": 0,
      "updated_at": "2025-11-01T12:35:00.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

### 5. Delete Role

**Endpoint:** `DELETE /api/v1/roles/{id}`

**Description:** Delete a role (only if no users are assigned to it)

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/api/v1/roles/5 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error Response - Role Has Users (403):**
```json
{
  "success": false,
  "message": "Cannot delete role. It is assigned to 5 user(s)."
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Role not found"
}
```

---

### 6. Assign Permissions to Role

**Endpoint:** `POST /api/v1/roles/{id}/permissions`

**Description:** Sync permissions for a role (replaces all current permissions)

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "permissions": ["view-users", "create-users", "edit-users"]
}
```

**Field Requirements:**
- `permissions`: required, array of existing permission names

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/roles/2/permissions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "permissions": ["view-users", "create-users"]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Permissions assigned successfully",
  "data": {
    "role": {
      "id": 2,
      "name": "Admin",
      "permissions": ["view-users", "create-users"],
      "permissions_count": 2
    }
  }
}
```

---

## Permission Management Endpoints

### 1. Get All Permissions

**Endpoint:** `GET /api/v1/permissions`

**Description:** Retrieve a paginated list of all permissions

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 100)
- `search` (optional): Search by permission name
- `grouped` (optional): Set to `true` to get permissions grouped by category

**Example Request (Paginated):**
```bash
curl -X GET "http://localhost:8000/api/v1/permissions?per_page=50" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Example Request (Grouped):**
```bash
curl -X GET "http://localhost:8000/api/v1/permissions?grouped=true" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response - Paginated (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": 1,
        "name": "view-letter-requests",
        "guard_name": "web",
        "created_at": "2025-11-01T12:17:22.000000Z",
        "updated_at": "2025-11-01T12:17:22.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 100,
      "total": 28
    }
  }
}
```

**Success Response - Grouped (200):**
```json
{
  "success": true,
  "data": {
    "permissions": {
      "Letter Requests": [
        {
          "id": 1,
          "name": "view-letter-requests",
          "guard_name": "web",
          "created_at": "2025-11-01T12:17:22.000000Z"
        }
      ],
      "Users": [
        {
          "id": 8,
          "name": "view-users",
          "guard_name": "web",
          "created_at": "2025-11-01T12:17:22.000000Z"
        }
      ]
    },
    "total": 28
  }
}
```

---

### 2. Get All Permissions (Simple List)

**Endpoint:** `GET /api/v1/permissions/all`

**Description:** Get all permission names in a simple array format

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/permissions/all \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      "view-letter-requests",
      "create-letter-requests",
      "edit-letter-requests",
      "delete-letter-requests",
      "view-users",
      "create-users"
    ],
    "total": 28
  }
}
```

---

### 3. Get Single Permission

**Endpoint:** `GET /api/v1/permissions/{id}`

**Description:** Retrieve detailed information about a specific permission

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/permissions/1 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "permission": {
      "id": 1,
      "name": "view-letter-requests",
      "guard_name": "web",
      "created_at": "2025-11-01T12:17:22.000000Z",
      "updated_at": "2025-11-01T12:17:22.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Permission not found"
}
```

---

## Testing Examples for Roles & Permissions

### Complete Role Management Flow:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Get all permissions
curl -X GET http://localhost:8000/api/v1/permissions/all \
  -H "Authorization: Bearer $TOKEN"

# 3. Create a new role
curl -X POST http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Department Manager",
    "permissions": ["view-users", "view-residents", "view-reports"]
  }'

# 4. List all roles
curl -X GET "http://localhost:8000/api/v1/roles" \
  -H "Authorization: Bearer $TOKEN"

# 5. Update role permissions
curl -X POST http://localhost:8000/api/v1/roles/5/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["view-users", "create-users", "view-residents"]
  }'

# 6. Update role name
curl -X PUT http://localhost:8000/api/v1/roles/5 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Manager"
  }'

# 7. Delete role
curl -X DELETE http://localhost:8000/api/v1/roles/5 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Available Permissions

The system comes with the following predefined permissions grouped by category:

### Letter Requests
- `view-letter-requests`
- `create-letter-requests`
- `edit-letter-requests`
- `delete-letter-requests`
- `approve-letter-requests`
- `reject-letter-requests`
- `print-letter-requests`

### Users
- `view-users`
- `create-users`
- `edit-users`
- `delete-users`

### Residents
- `view-residents`
- `create-residents`
- `edit-residents`
- `delete-residents`

### Roles
- `view-roles`
- `create-roles`
- `edit-roles`
- `delete-roles`
- `assign-roles`

### Reports & Analytics
- `view-reports`
- `generate-reports`
- `view-analytics`
- `view-charts`

### Settings
- `view-settings`
- `edit-settings`

### Logs
- `view-logs`
- `delete-logs`

---

## Notes on Roles & Permissions

- All roles are created with `guard_name: web`
- Permissions cannot be created or modified via API (they are seeded)
- Roles can only be deleted if no users are assigned to them
- When updating permissions on a role, all permissions are replaced (sync operation)
- Permission names are case-sensitive
- Guard name must match between roles and permissions

