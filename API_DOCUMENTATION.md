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


## Letter Category Endpoints

### 1. Get All Letter Categories

**Endpoint:** `GET /api/v1/letter-categories`

**Description:** Get paginated list of letter categories with filtering and search

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Accept: application/json
```

**Query Parameters:**
- `per_page` (optional, default: 15) - Number of items per page
- `search` (optional) - Search in name or description
- `status` (optional) - Filter by status (active/inactive)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Surat Keterangan Kependudukan",
        "slug": "surat-keterangan-kependudukan",
        "description": "Surat yang menerangkan status kependudukan warga, seperti domisili, kelahiran, atau pindah tempat tinggal.",
        "icon": "fa-solid fa-id-card",
        "order": 1,
        "status": "active",
        "templates_count": 5,
        "created_at": "2025-11-01T10:00:00.000000Z",
        "updated_at": "2025-11-01T10:00:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 2,
      "per_page": 15,
      "total": 25
    }
  }
}
```

**Example cURL:**
```bash
curl --location 'http://localhost:8000/api/v1/letter-categories?per_page=10&search=kependudukan' \
--header 'Authorization: Bearer YOUR_TOKEN' \
--header 'Accept: application/json'
```

---

### 2. Get All Letter Categories (Simple List)

**Endpoint:** `GET /api/v1/letter-categories/all`

**Description:** Get all active letter categories without pagination (useful for dropdowns)

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Accept: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Surat Keterangan Kependudukan",
        "slug": "surat-keterangan-kependudukan",
        "icon": "fa-solid fa-id-card"
      }
    ],
    "total": 8
  }
}
```

---

### 3. Get Single Letter Category

**Endpoint:** `GET /api/v1/letter-categories/{id}`

**Description:** Get details of a specific letter category by ID

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Accept: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Surat Keterangan Kependudukan",
      "slug": "surat-keterangan-kependudukan",
      "description": "Surat yang menerangkan status kependudukan warga.",
      "icon": "fa-solid fa-id-card",
      "order": 1,
      "status": "active",
      "templates_count": 5,
      "created_at": "2025-11-01T10:00:00.000000Z",
      "updated_at": "2025-11-01T10:00:00.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Letter category not found"
}
```

---

### 4. Create Letter Category

**Endpoint:** `POST /api/v1/letter-categories`

**Description:** Create a new letter category

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "name": "Surat Keterangan Usaha",
  "description": "Surat keterangan untuk keperluan usaha dan ekonomi",
  "icon": "fa-solid fa-briefcase",
  "order": 9,
  "status": "active"
}
```

**Field Descriptions:**
- `name` (required, string, max:255) - Category name (must be unique)
- `description` (optional, string, max:1000) - Category description
- `icon` (optional, string, max:255) - FontAwesome icon class
- `order` (optional, integer, min:1) - Display order (auto-generated if not provided)
- `status` (required, enum) - Either "active" or "inactive"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Letter category created successfully",
  "data": {
    "category": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Surat Keterangan Usaha",
      "slug": "surat-keterangan-usaha",
      "description": "Surat keterangan untuk keperluan usaha dan ekonomi",
      "icon": "fa-solid fa-briefcase",
      "order": 9,
      "status": "active",
      "templates_count": 0,
      "created_at": "2025-11-01T12:00:00.000000Z"
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
    "name": ["The name field is required."],
    "status": ["The status field must be either active or inactive."]
  }
}
```

---

### 5. Update Letter Category

**Endpoint:** `PUT /api/v1/letter-categories/{id}`

**Description:** Update an existing letter category

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "name": "Surat Keterangan Usaha Updated",
  "description": "Updated description",
  "icon": "fa-solid fa-store",
  "order": 10,
  "status": "inactive"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Letter category updated successfully",
  "data": {
    "category": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Surat Keterangan Usaha Updated",
      "slug": "surat-keterangan-usaha-updated",
      "description": "Updated description",
      "icon": "fa-solid fa-store",
      "order": 10,
      "status": "inactive",
      "templates_count": 2,
      "updated_at": "2025-11-01T13:00:00.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Letter category not found"
}
```

---

### 6. Delete Letter Category

**Endpoint:** `DELETE /api/v1/letter-categories/{id}`

**Description:** Delete a letter category (only if no templates are associated)

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Accept: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Letter category deleted successfully"
}
```

**Error Response - Has Templates (403):**
```json
{
  "success": false,
  "message": "Cannot delete category. It has 5 associated template(s)."
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Letter category not found"
}
```

---

### 7. Reorder Letter Categories

**Endpoint:** `POST /api/v1/letter-categories/reorder`

**Description:** Batch update the order of multiple categories

**Request Headers:**
```
Authorization: Bearer {your_token_here}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "categories": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "order": 2
    },
    {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "order": 3
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Categories reordered successfully"
}
```

**Error Response - Validation Failed (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "categories": ["The categories field is required."],
    "categories.0.id": ["The selected categories.0.id is invalid."]
  }
}
```

---

## Letter Category Testing Examples

### Complete CRUD Flow:

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Get all categories (paginated)
curl -X GET "http://localhost:8000/api/v1/letter-categories?per_page=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 3. Get all categories (simple list for dropdown)
curl -X GET "http://localhost:8000/api/v1/letter-categories/all" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 4. Create new category
curl -X POST http://localhost:8000/api/v1/letter-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Surat Keterangan Usaha",
    "description": "Surat untuk keperluan usaha",
    "icon": "fa-solid fa-briefcase",
    "status": "active"
  }'

# 5. Get single category
curl -X GET http://localhost:8000/api/v1/letter-categories/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 6. Update category
curl -X PUT http://localhost:8000/api/v1/letter-categories/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Surat Keterangan Usaha Updated",
    "status": "inactive"
  }'

# 7. Reorder categories
curl -X POST http://localhost:8000/api/v1/letter-categories/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [
      {"id": "550e8400-e29b-41d4-a716-446655440000", "order": 2},
      {"id": "650e8400-e29b-41d4-a716-446655440001", "order": 1}
    ]
  }'

# 8. Delete category
curl -X DELETE http://localhost:8000/api/v1/letter-categories/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

## Notes on Letter Categories

- Category IDs are UUIDs, not auto-incrementing integers
- Slugs are automatically generated from the category name
- Slugs are updated automatically when the name changes
- Categories use soft deletes (can be recovered)
- Categories can only be deleted if they have no associated letter templates
- The `order` field determines display order (lower numbers appear first)
- If `order` is not provided when creating, it's automatically set to next available number
- The `templates_count` field shows how many letter templates use this category

---

## Letter Template Endpoints

### 1. Get All Letter Templates

Get paginated list of letter templates with optional filters.

**Endpoint:** `GET /api/v1/letter-templates`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by template name or code
- `status` (optional): Filter by status (`active` or `inactive`)
- `category_id` (optional): Filter by letter category UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Surat Keterangan Tidak Mampu",
        "code": "SKTM-001",
        "fields": [
          {
            "name": "applicant_name",
            "label": "Nama Pemohon",
            "type": "text",
            "placeholder": "Masukkan nama lengkap",
            "required": true,
            "options": []
          },
          {
            "name": "purpose",
            "label": "Tujuan",
            "type": "select",
            "placeholder": "",
            "required": true,
            "options": ["Pendidikan", "Kesehatan", "Lainnya"]
          }
        ],
        "template_html": "<h1>SURAT KETERANGAN TIDAK MAMPU</h1><p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p><p>Nama: {{applicant_name}}</p><p>Tujuan: {{purpose}}</p>",
        "signature_type": "digital",
        "status": "active",
        "letter_category": {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "name": "Surat Keterangan",
          "slug": "surat-keterangan"
        },
        "created_at": "2025-01-15T08:30:00.000000Z",
        "updated_at": "2025-01-15T08:30:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 15,
      "total": 1
    }
  }
}
```

### 2. Get All Templates (Simple List)

Get all active templates without pagination (for dropdown/select lists).

**Endpoint:** `GET /api/v1/letter-templates/all`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Query Parameters:**
- `category_id` (optional): Filter by letter category UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Surat Keterangan Tidak Mampu",
        "code": "SKTM-001",
        "letter_category_id": "650e8400-e29b-41d4-a716-446655440001"
      }
    ],
    "total": 1
  }
}
```

### 3. Get Single Template

Get details of a specific letter template.

**Endpoint:** `GET /api/v1/letter-templates/{id}`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**URL Parameters:**
- `id`: Template UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Surat Keterangan Tidak Mampu",
      "code": "SKTM-001",
      "fields": [
        {
          "name": "applicant_name",
          "label": "Nama Pemohon",
          "type": "text",
          "placeholder": "Masukkan nama lengkap",
          "required": true,
          "options": []
        }
      ],
      "template_html": "<h1>SURAT KETERANGAN TIDAK MAMPU</h1><p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p><p>Nama: {{applicant_name}}</p>",
      "signature_type": "digital",
      "status": "active",
      "letter_category": {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "name": "Surat Keterangan",
        "slug": "surat-keterangan"
      },
      "created_at": "2025-01-15T08:30:00.000000Z",
      "updated_at": "2025-01-15T08:30:00.000000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Letter template not found"
}
```

### 4. Create Letter Template

Create a new letter template.

**Endpoint:** `POST /api/v1/letter-templates`

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `Accept: application/json`

**Request Body:**
```json
{
  "letter_category_id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "Surat Keterangan Tidak Mampu",
  "code": "SKTM-001",
  "fields": [
    {
      "name": "applicant_name",
      "label": "Nama Pemohon",
      "type": "text",
      "placeholder": "Masukkan nama lengkap",
      "required": true,
      "options": []
    },
    {
      "name": "purpose",
      "label": "Tujuan",
      "type": "select",
      "placeholder": "",
      "required": true,
      "options": ["Pendidikan", "Kesehatan", "Lainnya"]
    }
  ],
  "template_html": "<h1>SURAT KETERANGAN TIDAK MAMPU</h1><p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p><p>Nama: {{applicant_name}}</p><p>Tujuan: {{purpose}}</p>",
  "signature_type": "digital",
  "status": "active"
}
```

**Field Types:**
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `number`: Numeric input
- `date`: Date picker
- `select`: Dropdown selection (requires `options` array)
- `checkbox`: Multiple choice checkboxes (requires `options` array)
- `radio`: Single choice radio buttons (requires `options` array)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Letter template created successfully",
  "data": {
    "template": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Surat Keterangan Tidak Mampu",
      "code": "SKTM-001",
      "fields": [...],
      "template_html": "...",
      "signature_type": "digital",
      "status": "active",
      "letter_category": {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "name": "Surat Keterangan",
        "slug": "surat-keterangan"
      },
      "created_at": "2025-01-15T08:30:00.000000Z"
    }
  }
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "code": ["The code has already been taken."],
    "fields": ["The fields field is required."],
    "fields.0.name": ["The fields.0.name field is required."]
  }
}
```

### 5. Update Letter Template

Update an existing letter template.

**Endpoint:** `PUT /api/v1/letter-templates/{id}`

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `Accept: application/json`

**URL Parameters:**
- `id`: Template UUID

**Request Body:** (all fields optional, only include fields to update)
```json
{
  "name": "Surat Keterangan Tidak Mampu Updated",
  "status": "inactive",
  "fields": [
    {
      "name": "applicant_name",
      "label": "Nama Lengkap Pemohon",
      "type": "text",
      "placeholder": "Masukkan nama lengkap",
      "required": true,
      "options": []
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Letter template updated successfully",
  "data": {
    "template": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Surat Keterangan Tidak Mampu Updated",
      "code": "SKTM-001",
      "fields": [...],
      "template_html": "...",
      "signature_type": "digital",
      "status": "inactive",
      "letter_category": {...},
      "updated_at": "2025-01-15T09:00:00.000000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Letter template not found"
}
```

### 6. Delete Letter Template

Delete a letter template (soft delete).

**Endpoint:** `DELETE /api/v1/letter-templates/{id}`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**URL Parameters:**
- `id`: Template UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Letter template deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Letter template not found"
}
```

---

### Letter Template cURL Examples

```bash
# Set your token
TOKEN="your_auth_token_here"

# 1. Get all templates (paginated)
curl -X GET "http://localhost:8000/api/v1/letter-templates?per_page=10&page=1&status=active" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 2. Get all templates by category
curl -X GET "http://localhost:8000/api/v1/letter-templates?category_id=650e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 3. Get simple list (for dropdowns)
curl -X GET http://localhost:8000/api/v1/letter-templates/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 4. Create new template
curl -X POST http://localhost:8000/api/v1/letter-templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "letter_category_id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Surat Keterangan Tidak Mampu",
    "code": "SKTM-001",
    "fields": [
      {
        "name": "applicant_name",
        "label": "Nama Pemohon",
        "type": "text",
        "placeholder": "Masukkan nama lengkap",
        "required": true,
        "options": []
      }
    ],
    "template_html": "<h1>SURAT KETERANGAN TIDAK MAMPU</h1><p>Nama: {{applicant_name}}</p>",
    "signature_type": "digital",
    "status": "active"
  }'

# 5. Get single template
curl -X GET http://localhost:8000/api/v1/letter-templates/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 6. Update template
curl -X PUT http://localhost:8000/api/v1/letter-templates/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Surat Keterangan Tidak Mampu Updated",
    "status": "inactive"
  }'

# 7. Delete template
curl -X DELETE http://localhost:8000/api/v1/letter-templates/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

## Notes on Letter Templates

- Template IDs are UUIDs, not auto-incrementing integers
- The `code` field must be unique across all templates
- Templates use soft deletes (can be recovered)
- The `fields` array defines the form structure for letter requests
- Field names in `fields` array should match placeholders in `template_html` (e.g., `{{applicant_name}}`)
- Supported field types: text, textarea, number, date, select, checkbox, radio
- Fields with type select/checkbox/radio require an `options` array
- The `template_html` supports placeholder syntax: `{{field_name}}`
- Signature types: `digital` (electronic signature) or `manual` (physical signature)
- Templates belong to a letter category and include category details in responses
- When a template's category is deleted, the template is also deleted (cascade)
- Only active categories are returned by the `/all` endpoint

---

## Activity Log Endpoints

### 1. Get All Activity Logs

Get paginated list of activity logs with optional filters.

**Endpoint:** `GET /api/v1/activity-logs`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by description, log name, or event
- `log_name` (optional): Filter by log name
- `event` (optional): Filter by event (e.g., created, updated, deleted)
- `causer_id` (optional): Filter by user ID who caused the action
- `subject_type` (optional): Filter by subject model type
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "log_name": "default",
        "description": "User created a new letter category",
        "event": "created",
        "subject_type": "App\\Models\\LetterCategory",
        "subject_id": "550e8400-e29b-41d4-a716-446655440000",
        "subject": {
          "type": "App\\Models\\LetterCategory",
          "id": "550e8400-e29b-41d4-a716-446655440000"
        },
        "causer_type": "App\\Models\\User",
        "causer_id": 1,
        "causer": {
          "type": "App\\Models\\User",
          "id": 1,
          "name": "Super Admin"
        },
        "properties": {
          "attributes": {
            "name": "Surat Keterangan",
            "status": "active"
          }
        },
        "batch_uuid": null,
        "created_at": "2025-01-15T08:30:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 10,
      "per_page": 15,
      "total": 150
    }
  }
}
```

### 2. Get Single Activity Log

Get details of a specific activity log.

**Endpoint:** `GET /api/v1/activity-logs/{id}`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**URL Parameters:**
- `id`: Activity log ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activity": {
      "id": 1,
      "log_name": "default",
      "description": "User created a new letter category",
      "event": "created",
      "subject_type": "App\\Models\\LetterCategory",
      "subject_id": "550e8400-e29b-41d4-a716-446655440000",
      "subject": {
        "type": "App\\Models\\LetterCategory",
        "id": "550e8400-e29b-41d4-a716-446655440000"
      },
      "causer_type": "App\\Models\\User",
      "causer_id": 1,
      "causer": {
        "type": "App\\Models\\User",
        "id": 1,
        "name": "Super Admin"
      },
      "properties": {
        "attributes": {
          "name": "Surat Keterangan",
          "status": "active"
        }
      },
      "batch_uuid": null,
      "created_at": "2025-01-15T08:30:00.000000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Activity log not found"
}
```

### 3. Get Log Names

Get list of unique log names for filtering.

**Endpoint:** `GET /api/v1/activity-logs/log-names`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "log_names": [
      "default",
      "user",
      "letter_category",
      "letter_template"
    ]
  }
}
```

### 4. Get Events

Get list of unique events for filtering.

**Endpoint:** `GET /api/v1/activity-logs/events`

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: application/json`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "events": [
      "created",
      "updated",
      "deleted",
      "viewed"
    ]
  }
}
```

### 5. Cleanup Old Logs

Delete activity logs older than specified number of days.

**Endpoint:** `POST /api/v1/activity-logs/cleanup`

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `Accept: application/json`

**Request Body:**
```json
{
  "days": 30
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Deleted 245 activity log(s) older than 30 days",
  "data": {
    "deleted_count": 245
  }
}
```

---

### Activity Log cURL Examples

```bash
# Set your token
TOKEN="your_auth_token_here"

# 1. Get all activity logs (paginated)
curl -X GET "http://localhost:8000/api/v1/activity-logs?per_page=15&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 2. Get activity logs filtered by event
curl -X GET "http://localhost:8000/api/v1/activity-logs?event=created" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 3. Get activity logs filtered by date range
curl -X GET "http://localhost:8000/api/v1/activity-logs?date_from=2025-01-01&date_to=2025-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 4. Get activity logs filtered by log name
curl -X GET "http://localhost:8000/api/v1/activity-logs?log_name=user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 5. Search activity logs
curl -X GET "http://localhost:8000/api/v1/activity-logs?search=created" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 6. Get single activity log
curl -X GET http://localhost:8000/api/v1/activity-logs/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 7. Get unique log names
curl -X GET http://localhost:8000/api/v1/activity-logs/log-names \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 8. Get unique events
curl -X GET http://localhost:8000/api/v1/activity-logs/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 9. Cleanup logs older than 30 days
curl -X POST http://localhost:8000/api/v1/activity-logs/cleanup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

---

## Notes on Activity Logs

- Activity logs use auto-incrementing integer IDs (not UUIDs)
- Logs are automatically created by the Spatie Activity Log package
- The `log_name` field categorizes logs (default: "default")
- The `event` field describes what happened (created, updated, deleted, etc.)
- The `causer` is the user who performed the action (can be null for system actions)
- The `subject` is the model that was affected
- The `properties` field stores additional data about the activity (attributes, old values, etc.)
- Logs are read-only through the API (cannot be manually created or updated)
- Use the cleanup endpoint to delete old logs and manage database size
- Filter by multiple parameters to narrow down search results
- Timestamps are stored in UTC and include milliseconds
- The system uses Laravel's polymorphic relationships for causer and subject

---

## Penduduk (Resident) Management Endpoints

All penduduk management endpoints require authentication. Include the Bearer token in the Authorization header.

### 1. Get All Penduduk

**Endpoint:** `GET /api/v1/penduduks`

**Description:** Retrieve a paginated list of all penduduk (residents) with search and filtering

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search by NIK, KK, nama (name), or alamat (address)
- `status_tinggal` (optional): Filter by residence status (Tetap, Sementara, Pindah, Meninggal)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/penduduks?per_page=10&search=john&status_tinggal=Tetap" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "penduduks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nik": "3201234567890001",
        "kk": "1234567890123456",
        "nama": "John Doe",
        "tempat_lahir": "Jakarta",
        "tanggal_lahir": "1990-01-15",
        "jenis_kelamin": "Laki-laki",
        "agama": "Islam",
        "status_perkawinan": "Kawin",
        "pekerjaan": "Pegawai Swasta",
        "pendidikan_terakhir": "S1",
        "kewarganegaraan": "WNI",
        "alamat": "Jl. Merdeka No. 123",
        "rt": "01",
        "rw": "02",
        "dusun": "Manis",
        "kelurahan": "Cijoho",
        "kecamatan": "Kuningan",
        "kabupaten": "Kuningan",
        "provinsi": "Jawa Barat",
        "status_tinggal": "Tetap",
        "tanggal_pindah": null,
        "tanggal_meninggal": null,
        "catatan": null,
        "created_at": "2025-11-03T10:00:00.000000Z",
        "updated_at": "2025-11-03T10:00:00.000000Z",
        "deleted_at": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 10,
      "per_page": 10,
      "total": 100
    }
  }
}
```

---

### 2. Get Single Penduduk

**Endpoint:** `GET /api/v1/penduduks/{id}`

**Description:** Retrieve detailed information about a specific penduduk

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**URL Parameters:**
- `id`: Penduduk UUID

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "penduduk": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nik": "3201234567890001",
      "kk": "1234567890123456",
      "nama": "John Doe",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "1990-01-15",
      "jenis_kelamin": "Laki-laki",
      "agama": "Islam",
      "status_perkawinan": "Kawin",
      "pekerjaan": "Pegawai Swasta",
      "pendidikan_terakhir": "S1",
      "kewarganegaraan": "WNI",
      "alamat": "Jl. Merdeka No. 123",
      "rt": "01",
      "rw": "02",
      "dusun": "Manis",
      "kelurahan": "Cijoho",
      "kecamatan": "Kuningan",
      "kabupaten": "Kuningan",
      "provinsi": "Jawa Barat",
      "status_tinggal": "Tetap",
      "tanggal_pindah": null,
      "tanggal_meninggal": null,
      "catatan": null,
      "created_at": "2025-11-03T10:00:00.000000Z",
      "updated_at": "2025-11-03T10:00:00.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Penduduk not found"
}
```

---

### 3. Create Penduduk

**Endpoint:** `POST /api/v1/penduduks`

**Description:** Create a new penduduk record

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "nik": "3201234567890001",
  "kk": "1234567890123456",
  "nama": "John Doe",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "1990-01-15",
  "jenis_kelamin": "Laki-laki",
  "agama": "Islam",
  "status_perkawinan": "Kawin",
  "pekerjaan": "Pegawai Swasta",
  "pendidikan_terakhir": "S1",
  "kewarganegaraan": "WNI",
  "alamat": "Jl. Merdeka No. 123",
  "rt": "01",
  "rw": "02",
  "dusun": "Manis",
  "kelurahan": "Cijoho",
  "kecamatan": "Kuningan",
  "kabupaten": "Kuningan",
  "provinsi": "Jawa Barat",
  "status_tinggal": "Tetap",
  "tanggal_pindah": null,
  "tanggal_meninggal": null,
  "catatan": "Catatan tambahan"
}
```

**Field Requirements:**
- `nik` (required): National ID number, exactly 16 digits, must be unique
- `kk` (optional): Family card number, exactly 16 digits
- `nama` (required): Full name, max 100 characters
- `tempat_lahir` (required): Place of birth, max 100 characters
- `tanggal_lahir` (required): Date of birth in YYYY-MM-DD format
- `jenis_kelamin` (required): Gender - either "Laki-laki" or "Perempuan"
- `agama` (required): Religion - Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, or Lainnya
- `status_perkawinan` (required): Marital status - Belum Kawin, Kawin, Cerai Hidup, or Cerai Mati
- `pekerjaan` (optional): Occupation, max 100 characters
- `pendidikan_terakhir` (optional): Last education level, max 50 characters
- `kewarganegaraan` (optional): Citizenship, max 50 characters, defaults to "WNI"
- `alamat` (required): Full address
- `rt` (optional): RT number, max 5 characters
- `rw` (optional): RW number, max 5 characters
- `dusun` (optional): Hamlet name, max 100 characters
- `kelurahan` (optional): Village/ward name, max 100 characters
- `kecamatan` (optional): District name, max 100 characters
- `kabupaten` (optional): Regency/city name, max 100 characters
- `provinsi` (optional): Province name, max 100 characters
- `status_tinggal` (optional): Residence status - Tetap, Sementara, Pindah, or Meninggal
- `tanggal_pindah` (optional): Moving date in YYYY-MM-DD format (only if status_tinggal is "Pindah")
- `tanggal_meninggal` (optional): Death date in YYYY-MM-DD format (only if status_tinggal is "Meninggal")
- `catatan` (optional): Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/v1/penduduks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nik": "3201234567890001",
    "kk": "1234567890123456",
    "nama": "John Doe",
    "tempat_lahir": "Jakarta",
    "tanggal_lahir": "1990-01-15",
    "jenis_kelamin": "Laki-laki",
    "agama": "Islam",
    "status_perkawinan": "Kawin",
    "pekerjaan": "Pegawai Swasta",
    "pendidikan_terakhir": "S1",
    "kewarganegaraan": "WNI",
    "alamat": "Jl. Merdeka No. 123",
    "rt": "01",
    "rw": "02",
    "dusun": "Manis",
    "kelurahan": "Cijoho",
    "kecamatan": "Kuningan",
    "kabupaten": "Kuningan",
    "provinsi": "Jawa Barat",
    "status_tinggal": "Tetap"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Penduduk created successfully",
  "data": {
    "penduduk": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nik": "3201234567890001",
      "kk": "1234567890123456",
      "nama": "John Doe",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "1990-01-15",
      "jenis_kelamin": "Laki-laki",
      "agama": "Islam",
      "status_perkawinan": "Kawin",
      "pekerjaan": "Pegawai Swasta",
      "pendidikan_terakhir": "S1",
      "kewarganegaraan": "WNI",
      "alamat": "Jl. Merdeka No. 123",
      "rt": "01",
      "rw": "02",
      "dusun": "Manis",
      "kelurahan": "Cijoho",
      "kecamatan": "Kuningan",
      "kabupaten": "Kuningan",
      "provinsi": "Jawa Barat",
      "status_tinggal": "Tetap",
      "created_at": "2025-11-03T12:30:00.000000Z"
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
    "nik": ["The nik has already been taken."],
    "nama": ["The nama field is required."],
    "jenis_kelamin": ["The selected jenis kelamin is invalid."]
  }
}
```

---

### 4. Update Penduduk

**Endpoint:** `PUT /api/v1/penduduks/{id}` or `PATCH /api/v1/penduduks/{id}`

**Description:** Update an existing penduduk record

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**URL Parameters:**
- `id`: Penduduk UUID

**Request Body:** (all fields optional, only include fields to update)
```json
{
  "nama": "John Doe Updated",
  "pekerjaan": "Wiraswasta",
  "alamat": "Jl. Merdeka No. 456",
  "status_tinggal": "Tetap"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nama": "John Doe Updated",
    "pekerjaan": "Wiraswasta"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Penduduk updated successfully",
  "data": {
    "penduduk": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nik": "3201234567890001",
      "kk": "1234567890123456",
      "nama": "John Doe Updated",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "1990-01-15",
      "jenis_kelamin": "Laki-laki",
      "agama": "Islam",
      "status_perkawinan": "Kawin",
      "pekerjaan": "Wiraswasta",
      "pendidikan_terakhir": "S1",
      "kewarganegaraan": "WNI",
      "alamat": "Jl. Merdeka No. 123",
      "rt": "01",
      "rw": "02",
      "dusun": "Manis",
      "kelurahan": "Cijoho",
      "kecamatan": "Kuningan",
      "kabupaten": "Kuningan",
      "provinsi": "Jawa Barat",
      "status_tinggal": "Tetap",
      "updated_at": "2025-11-03T14:30:00.000000Z"
    }
  }
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Penduduk not found"
}
```

---

### 5. Delete Penduduk

**Endpoint:** `DELETE /api/v1/penduduks/{id}`

**Description:** Delete a penduduk record (soft delete)

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**URL Parameters:**
- `id`: Penduduk UUID

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Penduduk deleted successfully"
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Penduduk not found"
}
```

---

### 6. Get Penduduk Statistics

**Endpoint:** `GET /api/v1/penduduks/statistics`

**Description:** Get statistical summary of penduduk data

**Request Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/v1/penduduks/statistics \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "jenis_kelamin": {
      "laki_laki": 52,
      "perempuan": 48
    },
    "status_tinggal": {
      "tetap": 85,
      "sementara": 10,
      "pindah": 3,
      "meninggal": 2
    }
  }
}
```

---

## Penduduk Testing Examples

### Complete CRUD Flow:

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# 2. Get all penduduk (paginated)
curl -X GET "http://localhost:8000/api/v1/penduduks?per_page=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 3. Search penduduk by name
curl -X GET "http://localhost:8000/api/v1/penduduks?search=john" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 4. Filter by status_tinggal
curl -X GET "http://localhost:8000/api/v1/penduduks?status_tinggal=Tetap" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 5. Create new penduduk
curl -X POST http://localhost:8000/api/v1/penduduks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nik": "3201234567890001",
    "kk": "1234567890123456",
    "nama": "John Doe",
    "tempat_lahir": "Jakarta",
    "tanggal_lahir": "1990-01-15",
    "jenis_kelamin": "Laki-laki",
    "agama": "Islam",
    "status_perkawinan": "Kawin",
    "pekerjaan": "Pegawai Swasta",
    "pendidikan_terakhir": "S1",
    "kewarganegaraan": "WNI",
    "alamat": "Jl. Merdeka No. 123",
    "rt": "01",
    "rw": "02",
    "dusun": "Manis",
    "kelurahan": "Cijoho",
    "kecamatan": "Kuningan",
    "kabupaten": "Kuningan",
    "provinsi": "Jawa Barat",
    "status_tinggal": "Tetap"
  }'

# 6. Get single penduduk
curl -X GET http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 7. Update penduduk
curl -X PUT http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe Updated",
    "pekerjaan": "Wiraswasta"
  }'

# 8. Get statistics
curl -X GET http://localhost:8000/api/v1/penduduks/statistics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# 9. Delete penduduk
curl -X DELETE http://localhost:8000/api/v1/penduduks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

## Notes on Penduduk Management

- Penduduk IDs are UUIDs, not auto-incrementing integers
- NIK (National ID) must be exactly 16 digits and unique across all penduduk
- KK (Family Card) must be exactly 16 digits when provided
- Penduduk records use soft deletes (can be recovered from `deleted_at` column)
- All changes to penduduk data are automatically logged via Spatie Activity Log
- Search functionality searches across NIK, KK, nama (name), and alamat (address) fields
- Status tinggal options:
  - `Tetap` - Permanent resident
  - `Sementara` - Temporary resident
  - `Pindah` - Moved away (requires `tanggal_pindah`)
  - `Meninggal` - Deceased (requires `tanggal_meninggal`)
- Gender options: `Laki-laki` (Male) or `Perempuan` (Female)
- Religion options: Islam, Kristen, Katolik, Hindu, Buddha, Konghucu, Lainnya
- Marital status options: Belum Kawin (Single), Kawin (Married), Cerai Hidup (Divorced), Cerai Mati (Widowed)
- The statistics endpoint provides real-time counts by gender and residence status
- All date fields must be in YYYY-MM-DD format
- Timestamps are stored in UTC ISO 8601 format

