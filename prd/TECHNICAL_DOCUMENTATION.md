# Technical Documentation
## Sistem Pembuatan Surat Desa/Kelurahan

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────────────┬──────────────────────────────────────┤
│  Public Interface    │    Admin Dashboard                   │
│  (React + Tailwind)  │    (React + Tailwind)               │
└──────────────────────┴──────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Laravel)                      │
├─────────────────────────────────────────────────────────────┤
│  • REST API Endpoints                                        │
│  • Authentication & Authorization (Sanctum)                  │
│  • Request Validation                                        │
│  • Business Logic                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  • Controllers                                               │
│  • Services                                                  │
│  • Repositories                                              │
│  • Models (Eloquent ORM)                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (MySQL)                        │
├─────────────────────────────────────────────────────────────┤
│  • Database Tables                                           │
│  • Indexes                                                   │
│  • Relationships                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Storage Layer                              │
├─────────────────────────────────────────────────────────────┤
│  • PDF Files                                                 │
│  • Images (Logos, Signatures)                               │
│  • Uploaded Documents                                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Details

#### Backend
- **Framework**: Laravel 12.x
- **PHP Version**: 8.3+
- **Architecture Pattern**: Repository Pattern + Service Layer
- **Authentication**: Laravel Sanctum (Stateless API tokens)
- **Authorization**: Spatie Laravel Permission (RBAC)
- **API Style**: RESTful

#### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **State Management**: React Query + Context API
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Yup
- **UI Framework**: Tailwind CSS 3.x
- **Component Library**: HeadlessUI + Custom Components

#### Database
- **RDBMS**: MySQL 8.0+
- **Migrations**: Laravel Migrations
- **ORM**: Eloquent
- **Seeding**: Laravel Seeders

#### Development Tools
- **Version Control**: Git
- **Package Manager**: Composer (PHP), npm/yarn (JS)
- **Code Quality**: PHP CS Fixer, ESLint, Prettier
- **Testing**: PHPUnit, Jest/Vitest
- **API Documentation**: Laravel Scribe atau Swagger

---

## 2. Database Design

### 2.1 Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    roles     │       │ permissions  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────┤ id (PK)      │◄──────┤ id (PK)      │
│ name         │       │ name         │       │ name         │
│ email        │       │ guard_name   │       │ guard_name   │
│ username     │       │ created_at   │       │ created_at   │
│ password     │       │ updated_at   │       │ updated_at   │
│ created_at   │       └──────────────┘       └──────────────┘
│ updated_at   │
│ deleted_at   │
└──────────────┘
       │
       │
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  citizens    │       │ categories   │       │letter_templates│
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ nik (UK)     │       │ name         │◄──────┤ category_id  │
│ name         │       │ slug         │       │ name         │
│ birthplace   │       │ description  │       │ code         │
│ birthdate    │       │ icon         │       │ fields (JSON)│
│ gender       │       │ order        │       │ template_html│
│ address      │       │ status       │       │ signature_   │
│ rt           │       │ created_at   │       │   type       │
│ rw           │       │ updated_at   │       │ status       │
│ village      │       └──────────────┘       │ created_at   │
│ district     │                              │ updated_at   │
│ city         │                              └──────────────┘
│ province     │                                     │
│ religion     │                                     │
│ marital_     │       ┌──────────────────────────┐  │
│   status     │       │  letter_requests         │  │
│ occupation   │       ├──────────────────────────┤  │
│ nationality  │◄──────┤ id (PK)                  │  │
│ created_at   │       │ request_number (UK)      │  │
│ updated_at   │       │ citizen_id (FK)          │  │
└──────────────┘       │ letter_template_id (FK)  │◄─┘
                       │ form_data (JSON)         │
                       │ status                   │
                       │ submitted_at             │
                       │ verified_at              │
                       │ verified_by (FK users)   │
                       │ printed_at               │
                       │ printed_by (FK users)    │
                       │ rejection_reason         │
                       │ notes                    │
                       │ pdf_path                 │
                       │ created_at               │
                       │ updated_at               │
                       └──────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ signatures   │       │ letterheads  │       │ settings     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ logo_path    │       │ key (UK)     │
│ position     │       │ village_name │       │ value        │
│ nip          │       │ address      │       │ type         │
│ image_path   │       │ postal_code  │       │ created_at   │
│ status       │       │ phone        │       │ updated_at   │
│ created_at   │       │ email        │       └──────────────┘
│ updated_at   │       │ website      │
└──────────────┘       │ logo_width   │
                       │ logo_height  │
                       │ created_at   │
                       │ updated_at   │
                       └──────────────┘

┌──────────────────────┐
│  activity_log        │
├──────────────────────┤
│ id (PK)              │
│ log_name             │
│ description          │
│ subject_type         │
│ subject_id           │
│ causer_type          │
│ causer_id            │
│ properties (JSON)    │
│ created_at           │
└──────────────────────┘
```

### 2.2 Database Tables Schema

#### users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### citizens
```sql
CREATE TABLE citizens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    birthplace VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    address TEXT NOT NULL,
    rt VARCHAR(10),
    rw VARCHAR(10),
    village VARCHAR(255),
    district VARCHAR(255),
    city VARCHAR(255),
    province VARCHAR(255),
    religion ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu') NOT NULL,
    marital_status ENUM('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL,
    occupation VARCHAR(255),
    nationality VARCHAR(100) DEFAULT 'Indonesia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nik (nik),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### categories
```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_order (order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### letter_templates
```sql
CREATE TABLE letter_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    fields JSON NOT NULL,
    template_html TEXT NOT NULL,
    signature_type ENUM('digital', 'manual') DEFAULT 'digital',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### letter_requests
```sql
CREATE TABLE letter_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    citizen_id BIGINT UNSIGNED NOT NULL,
    letter_template_id BIGINT UNSIGNED NOT NULL,
    form_data JSON NOT NULL,
    status ENUM('pending', 'verified', 'printed', 'rejected', 'cancelled') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT UNSIGNED NULL,
    printed_at TIMESTAMP NULL,
    printed_by BIGINT UNSIGNED NULL,
    rejection_reason TEXT NULL,
    notes TEXT NULL,
    pdf_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE,
    FOREIGN KEY (letter_template_id) REFERENCES letter_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (printed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request_number (request_number),
    INDEX idx_citizen_id (citizen_id),
    INDEX idx_letter_template_id (letter_template_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### signatures
```sql
CREATE TABLE signatures (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    nip VARCHAR(50) NULL,
    image_path VARCHAR(255) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### letterheads
```sql
CREATE TABLE letterheads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    logo_path VARCHAR(255),
    village_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(10),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_width INT DEFAULT 80,
    logo_height INT DEFAULT 80,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### settings
```sql
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Spatie Permission Tables (Auto-generated by package)
- `roles`
- `permissions`
- `model_has_permissions`
- `model_has_roles`
- `role_has_permissions`

---

## 3. API Design

### 3.1 API Structure

Base URL: `/api/v1`

Authentication: Bearer Token (Sanctum)

Response Format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "errors": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100
  }
}
```

### 3.2 Public API Endpoints

#### Citizen Validation
```
POST /api/v1/public/validate-nik
```
**Request:**
```json
{
  "nik": "3201234567890001"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "nik": "3201234567890001",
    "name": "John Doe",
    "birthplace": "Jakarta",
    "birthdate": "1990-01-01",
    "gender": "L",
    "address": "Jl. Merdeka No. 10",
    "rt": "001",
    "rw": "002",
    "village": "Kelurahan Sejahtera"
  }
}
```

#### Get Categories
```
GET /api/v1/public/categories
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Surat Keterangan",
      "slug": "surat-keterangan",
      "description": "Berbagai jenis surat keterangan",
      "icon": "/storage/icons/surat-keterangan.png",
      "order": 1
    }
  ]
}
```

#### Get Letter Templates by Category
```
GET /api/v1/public/categories/{categoryId}/templates
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Surat Keterangan Domisili",
      "code": "SKD",
      "fields": [
        {
          "name": "keperluan",
          "label": "Keperluan",
          "type": "textarea",
          "required": true,
          "validation": "min:10|max:500"
        }
      ]
    }
  ]
}
```

#### Submit Letter Request
```
POST /api/v1/public/letter-requests
```
**Request:**
```json
{
  "nik": "3201234567890001",
  "letter_template_id": 1,
  "form_data": {
    "keperluan": "Membuat KTP baru",
    "alamat_tujuan": "Kelurahan Sejahtera"
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Permohonan surat berhasil diajukan",
  "data": {
    "request_number": "REQ-20251030-0001",
    "status": "pending",
    "submitted_at": "2025-10-30 10:30:00",
    "estimated_completion": "2025-10-30 11:00:00"
  }
}
```

#### Preview Letter
```
POST /api/v1/public/letter-requests/preview
```
**Request:**
```json
{
  "nik": "3201234567890001",
  "letter_template_id": 1,
  "form_data": {
    "keperluan": "Membuat KTP baru"
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<html>...</html>"
  }
}
```

### 3.3 Admin API Endpoints

#### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

#### Dashboard Statistics
```
GET /api/v1/admin/dashboard/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total_requests_today": 25,
    "pending_requests": 10,
    "verified_today": 12,
    "rejected_today": 2,
    "avg_verification_time": "8 minutes",
    "recent_requests": [],
    "popular_letters": []
  }
}
```

#### Users Management
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/users/{id}
PUT    /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
POST   /api/v1/admin/users/{id}/reset-password
```

#### Citizens Management
```
GET    /api/v1/admin/citizens
POST   /api/v1/admin/citizens
GET    /api/v1/admin/citizens/{id}
PUT    /api/v1/admin/citizens/{id}
DELETE /api/v1/admin/citizens/{id}
POST   /api/v1/admin/citizens/import
GET    /api/v1/admin/citizens/export
```

#### Categories Management
```
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
GET    /api/v1/admin/categories/{id}
PUT    /api/v1/admin/categories/{id}
DELETE /api/v1/admin/categories/{id}
POST   /api/v1/admin/categories/{id}/reorder
```

#### Letter Templates Management
```
GET    /api/v1/admin/letter-templates
POST   /api/v1/admin/letter-templates
GET    /api/v1/admin/letter-templates/{id}
PUT    /api/v1/admin/letter-templates/{id}
DELETE /api/v1/admin/letter-templates/{id}
POST   /api/v1/admin/letter-templates/{id}/clone
```

#### Letter Requests Management
```
GET    /api/v1/admin/letter-requests
GET    /api/v1/admin/letter-requests/{id}
PUT    /api/v1/admin/letter-requests/{id}/verify
PUT    /api/v1/admin/letter-requests/{id}/reject
PUT    /api/v1/admin/letter-requests/{id}/print
GET    /api/v1/admin/letter-requests/{id}/download
POST   /api/v1/admin/letter-requests/bulk-verify
```

#### Roles & Permissions (RBAC)
```
GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
GET    /api/v1/admin/roles/{id}
PUT    /api/v1/admin/roles/{id}
DELETE /api/v1/admin/roles/{id}
GET    /api/v1/admin/permissions
POST   /api/v1/admin/roles/{id}/permissions
```

#### Signatures Management
```
GET    /api/v1/admin/signatures
POST   /api/v1/admin/signatures
GET    /api/v1/admin/signatures/{id}
PUT    /api/v1/admin/signatures/{id}
DELETE /api/v1/admin/signatures/{id}
```

#### Letterhead Settings
```
GET    /api/v1/admin/letterheads
POST   /api/v1/admin/letterheads
GET    /api/v1/admin/letterheads/{id}
PUT    /api/v1/admin/letterheads/{id}
DELETE /api/v1/admin/letterheads/{id}
```

#### System Settings
```
GET /api/v1/admin/settings
PUT /api/v1/admin/settings
```

#### Reports
```
GET /api/v1/admin/reports/statistics
GET /api/v1/admin/reports/letters
GET /api/v1/admin/reports/activity-log
POST /api/v1/admin/reports/export
```

---

## 4. Application Architecture

### 4.1 Directory Structure

```
project-root/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── CitizenController.php
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── LetterRequestController.php
│   │   │   │   │   ├── LetterTemplateController.php
│   │   │   │   │   ├── LetterheadController.php
│   │   │   │   │   ├── RoleController.php
│   │   │   │   │   ├── SettingController.php
│   │   │   │   │   ├── SignatureController.php
│   │   │   │   │   └── UserController.php
│   │   │   │   ├── Public/
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── CitizenController.php
│   │   │   │   │   └── LetterRequestController.php
│   │   │   │   └── AuthController.php
│   │   ├── Middleware/
│   │   │   ├── CheckPermission.php
│   │   │   ├── CheckRole.php
│   │   │   └── RateLimitMiddleware.php
│   │   └── Requests/
│   │       ├── Admin/
│   │       │   ├── StoreCategoryRequest.php
│   │       │   ├── UpdateCategoryRequest.php
│   │       │   └── ...
│   │       └── Public/
│   │           ├── SubmitLetterRequest.php
│   │           └── ValidateNikRequest.php
│   ├── Models/
│   │   ├── Category.php
│   │   ├── Citizen.php
│   │   ├── LetterRequest.php
│   │   ├── LetterTemplate.php
│   │   ├── Letterhead.php
│   │   ├── Signature.php
│   │   ├── Setting.php
│   │   └── User.php
│   ├── Repositories/
│   │   ├── CategoryRepository.php
│   │   ├── CitizenRepository.php
│   │   ├── LetterRequestRepository.php
│   │   ├── LetterTemplateRepository.php
│   │   └── UserRepository.php
│   ├── Services/
│   │   ├── CategoryService.php
│   │   ├── CitizenService.php
│   │   ├── LetterRequestService.php
│   │   ├── LetterTemplateService.php
│   │   ├── PdfGeneratorService.php
│   │   └── UserService.php
│   └── Traits/
│       ├── ApiResponse.php
│       └── FileUpload.php
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_citizens_table.php
│   │   ├── 2024_01_01_000003_create_categories_table.php
│   │   ├── 2024_01_01_000004_create_letter_templates_table.php
│   │   ├── 2024_01_01_000005_create_letter_requests_table.php
│   │   ├── 2024_01_01_000006_create_signatures_table.php
│   │   ├── 2024_01_01_000007_create_letterheads_table.php
│   │   └── 2024_01_01_000008_create_settings_table.php
│   └── seeders/
│       ├── RoleSeeder.php
│       ├── UserSeeder.php
│       ├── CategorySeeder.php
│       └── SettingSeeder.php
├── public/
│   └── index.php
├── resources/
│   ├── js/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── Users/
│   │   │   │   │   ├── Citizens/
│   │   │   │   │   ├── Categories/
│   │   │   │   │   ├── LetterTemplates/
│   │   │   │   │   ├── LetterRequests/
│   │   │   │   │   └── Settings/
│   │   │   │   ├── Public/
│   │   │   │   │   ├── NikValidation.jsx
│   │   │   │   │   ├── CategorySelection.jsx
│   │   │   │   │   ├── LetterSelection.jsx
│   │   │   │   │   ├── DynamicForm.jsx
│   │   │   │   │   ├── LetterPreview.jsx
│   │   │   │   │   └── Confirmation.jsx
│   │   │   │   ├── Common/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Select.jsx
│   │   │   │   │   ├── Table.jsx
│   │   │   │   │   ├── Modal.jsx
│   │   │   │   │   └── Pagination.jsx
│   │   │   │   └── Layout/
│   │   │   │       ├── AdminLayout.jsx
│   │   │   │       ├── PublicLayout.jsx
│   │   │   │       └── AuthLayout.jsx
│   │   │   ├── pages/
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── Users/
│   │   │   │   │   ├── Categories/
│   │   │   │   │   └── ...
│   │   │   │   ├── Public/
│   │   │   │   │   └── Home.jsx
│   │   │   │   └── Auth/
│   │   │   │       ├── Login.jsx
│   │   │   │       └── ForgotPassword.jsx
│   │   │   ├── services/
│   │   │   │   ├── api.js
│   │   │   │   ├── authService.js
│   │   │   │   ├── citizenService.js
│   │   │   │   └── letterService.js
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.js
│   │   │   │   ├── usePermission.js
│   │   │   │   └── useLocalStorage.js
│   │   │   ├── utils/
│   │   │   │   ├── formatters.js
│   │   │   │   ├── validators.js
│   │   │   │   └── constants.js
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── css/
│   │   │   └── app.css
│   │   └── views/ (if using Blade for fallback)
│   └── lang/
├── routes/
│   ├── api.php
│   ├── web.php
│   └── channels.php
├── storage/
│   ├── app/
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   ├── logos/
│   │   │   ├── signatures/
│   │   │   └── letters/
│   │   └── private/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   │   ├── Admin/
│   │   └── Public/
│   └── Unit/
├── .env.example
├── composer.json
├── package.json
├── vite.config.js
├── tailwind.config.js
├── phpunit.xml
└── README.md
```

### 4.2 Design Patterns

#### Repository Pattern
```php
// app/Repositories/CitizenRepository.php
namespace App\Repositories;

use App\Models\Citizen;

class CitizenRepository
{
    protected $model;

    public function __construct(Citizen $model)
    {
        $this->model = $model;
    }

    public function findByNik(string $nik)
    {
        return $this->model->where('nik', $nik)->first();
    }

    public function all(array $filters = [], int $perPage = 15)
    {
        $query = $this->model->query();

        if (isset($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('nik', 'like', "%{$filters['search']}%");
        }

        return $query->paginate($perPage);
    }

    // ... more methods
}
```

#### Service Layer
```php
// app/Services/LetterRequestService.php
namespace App\Services;

use App\Repositories\LetterRequestRepository;
use App\Repositories\CitizenRepository;
use App\Services\PdfGeneratorService;

class LetterRequestService
{
    protected $requestRepo;
    protected $citizenRepo;
    protected $pdfService;

    public function __construct(
        LetterRequestRepository $requestRepo,
        CitizenRepository $citizenRepo,
        PdfGeneratorService $pdfService
    ) {
        $this->requestRepo = $requestRepo;
        $this->citizenRepo = $citizenRepo;
        $this->pdfService = $pdfService;
    }

    public function submitRequest(array $data)
    {
        // Validate citizen
        $citizen = $this->citizenRepo->findByNik($data['nik']);
        if (!$citizen) {
            throw new \Exception('Citizen not found');
        }

        // Generate request number
        $data['request_number'] = $this->generateRequestNumber();
        $data['citizen_id'] = $citizen->id;

        // Create request
        $request = $this->requestRepo->create($data);

        // Generate PDF preview
        $this->pdfService->generatePreview($request);

        return $request;
    }

    private function generateRequestNumber()
    {
        $date = now()->format('Ymd');
        $count = $this->requestRepo->countToday() + 1;
        return "REQ-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    // ... more methods
}
```

#### API Response Trait
```php
// app/Traits/ApiResponse.php
namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function errorResponse($message, $errors = [], $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }

    protected function paginatedResponse($data, $message = 'Success')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage()
            ]
        ]);
    }
}
```

---

## 5. Security Considerations

### 5.1 Authentication & Authorization
- Use Laravel Sanctum for API authentication
- Implement RBAC with Spatie Laravel Permission
- Password requirements: min 8 characters, 1 uppercase, 1 lowercase, 1 number
- Session timeout: 30 minutes
- Failed login attempts limit: 5 attempts in 5 minutes

### 5.2 Data Protection
- Hash all passwords with bcrypt (cost: 12)
- Encrypt sensitive data in database
- Use HTTPS only
- Implement CSRF protection
- SQL injection prevention via Eloquent ORM
- XSS protection via output escaping

### 5.3 Rate Limiting
```php
// config/rate-limiting.php
'public_nik_validation' => [
    'max_attempts' => 5,
    'decay_minutes' => 1
],
'public_letter_submission' => [
    'max_attempts' => 3,
    'decay_minutes' => 5
],
'api_general' => [
    'max_attempts' => 60,
    'decay_minutes' => 1
]
```

### 5.4 Input Validation
- Server-side validation for all inputs
- Client-side validation for UX
- Sanitize all user inputs
- File upload restrictions:
  - Max size: 2MB
  - Allowed types: jpg, png, pdf
  - Scan for malware

### 5.5 Audit Trail
- Log all critical actions:
  - User login/logout
  - Data creation/update/deletion
  - Permission changes
  - Letter verification/printing
- Store logs for minimum 1 year
- Implement log rotation

---

## 6. Performance Optimization

### 6.1 Database Optimization
- Index frequently queried columns (NIK, email, request_number)
- Use eager loading to prevent N+1 queries
- Implement database connection pooling
- Regular ANALYZE TABLE and OPTIMIZE TABLE

### 6.2 Caching Strategy
```php
// Cache frequently accessed data
Cache::remember('categories_active', 3600, function () {
    return Category::where('status', 'active')->get();
});

// Cache letterhead settings
Cache::remember('letterhead_default', 86400, function () {
    return Letterhead::where('is_default', true)->first();
});
```

### 6.3 API Response Optimization
- Implement pagination (default: 15 per page)
- Use API resources for consistent output
- Lazy load relationships when not needed
- Compress responses with gzip

### 6.4 Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Minimize bundle size
- Implement service worker for offline capability (PWA)

---

## 7. Testing Strategy

### 7.1 Backend Testing

#### Unit Tests
```php
// tests/Unit/Services/LetterRequestServiceTest.php
class LetterRequestServiceTest extends TestCase
{
    public function test_can_generate_unique_request_number()
    {
        $service = app(LetterRequestService::class);
        $number = $service->generateRequestNumber();
        
        $this->assertMatchesRegularExpression('/^REQ-\d{8}-\d{4}$/', $number);
    }
}
```

#### Feature Tests
```php
// tests/Feature/Api/Public/LetterRequestTest.php
class LetterRequestTest extends TestCase
{
    public function test_can_submit_letter_request()
    {
        $citizen = Citizen::factory()->create();
        $template = LetterTemplate::factory()->create();

        $response = $this->postJson('/api/v1/public/letter-requests', [
            'nik' => $citizen->nik,
            'letter_template_id' => $template->id,
            'form_data' => ['keperluan' => 'Test']
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['success', 'data']);
    }
}
```

### 7.2 Frontend Testing

#### Component Tests
```javascript
// src/components/Public/__tests__/NikValidation.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import NikValidation from '../NikValidation';

test('validates NIK format', async () => {
  render(<NikValidation />);
  
  const input = screen.getByLabelText('NIK');
  fireEvent.change(input, { target: { value: '123' } });
  
  expect(screen.getByText('NIK harus 16 digit')).toBeInTheDocument();
});
```

### 7.3 Test Coverage Goals
- Backend: Minimum 80% code coverage
- Frontend: Minimum 70% code coverage
- Critical paths: 100% coverage

---

## 8. Deployment

### 8.1 Server Requirements
- **OS**: Ubuntu 22.04 LTS or later
- **Web Server**: Nginx 1.20+ or Apache 2.4+
- **PHP**: 8.3+
- **MySQL**: 8.0+
- **Node.js**: 18+ (for build)
- **Composer**: 2.x
- **SSL**: Let's Encrypt or commercial certificate

### 8.2 Deployment Checklist
- [ ] Set environment to production
- [ ] Enable HTTPS only
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Configure database backup schedule
- [ ] Set up monitoring (uptime, errors)
- [ ] Configure log rotation
- [ ] Disable debug mode
- [ ] Optimize autoloader
- [ ] Cache configuration and routes
- [ ] Set up firewall rules
- [ ] Configure email for notifications
- [ ] Test all critical paths

### 8.3 Continuous Deployment
```yaml
# .github/workflows/deploy.yml (example)
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader
      - name: Run tests
        run: php artisan test
      - name: Build frontend
        run: |
          npm install
          npm run build
      - name: Deploy to server
        run: |
          # Your deployment script here
```

---

## 9. Monitoring & Maintenance

### 9.1 Application Monitoring
- Use Laravel Telescope for development debugging
- Implement application performance monitoring (APM)
- Set up error tracking (Sentry, Bugsnag)
- Monitor database performance
- Track API response times

### 9.2 Backup Strategy
- **Database**: Daily automated backup at 2 AM
- **Files**: Weekly backup of storage directory
- **Retention**: Keep last 30 daily backups, 12 monthly backups
- **Testing**: Monthly restore test

### 9.3 Maintenance Tasks
- **Daily**: Monitor logs for errors
- **Weekly**: Review system performance metrics
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Full system audit, load testing

---

## 10. Documentation

### 10.1 Code Documentation
- PHPDoc for all classes and methods
- JSDoc for complex JavaScript functions
- README files for each major module
- Inline comments for complex logic

### 10.2 API Documentation
- Use Laravel Scribe or Swagger for auto-generation
- Include request/response examples
- Document authentication requirements
- Provide example code in multiple languages

### 10.3 User Documentation
- Admin user manual
- Public interface guide
- FAQ section
- Video tutorials for common tasks
- Troubleshooting guide

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-30  
**Author**: Technical Team
