# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Village Letter Service System (Sistem Pelayanan Surat Desa) built with Laravel 12 and React 19. The system provides a public-facing wizard for residents to request various types of village letters (surat desa) and an admin panel for managing these requests with role-based access control.

## Development Commands

### Initial Setup
```bash
composer setup  # Installs dependencies, generates key, runs migrations, builds assets
```

### Development Server
```bash
composer dev    # Runs Laravel server, queue worker, logs (pail), and Vite dev server concurrently
# OR run individually:
php artisan serve      # Backend server (port 8000)
npm run dev            # Frontend dev server (Vite)
php artisan queue:listen  # Queue worker
php artisan pail       # Log viewer
```

### Testing
```bash
composer test           # Runs all tests
php artisan test        # Direct artisan test command
php artisan test --filter TestName  # Run specific test
```

### Database
```bash
php artisan migrate            # Run migrations
php artisan migrate:fresh      # Drop all tables and re-run migrations
php artisan db:seed            # Seed the database
php artisan migrate:fresh --seed  # Fresh migration + seed
```

The project uses SQLite by default (`database/database.sqlite`).

### Code Quality
```bash
./vendor/bin/pint      # Laravel Pint code formatter
```

### Building for Production
```bash
npm run build          # Build frontend assets for production
```

## Architecture Overview

### Frontend Architecture

The application has **two separate React applications** that are completely independent:

1. **Public Wizard App** (`resources/js/public-wizard-app.jsx`)
   - Entry point: `resources/js/public-wizard-entry.jsx`
   - Route: `/surat/wizard`
   - Blade view: `resources/views/public/wizard.blade.php`
   - Multi-step wizard for residents to request village letters
   - No authentication required
   - Uses React Router for step navigation

2. **Admin App** (`resources/js/admin-app.jsx`)
   - Route: `/admin/*`
   - Blade view: `resources/views/admin/dashboard.blade.php`
   - Full admin dashboard with role-based access control
   - Requires authentication (Laravel Sanctum)
   - Uses React Router for SPA navigation
   - Components are defined inline within the main app file

### API Architecture

The backend provides a RESTful API at `/api/v1/` with Laravel Sanctum authentication:

- **Authentication**: Token-based via Laravel Sanctum
- **API Base**: `resources/js/api.js` - Axios instance with interceptors for token management
- **Controllers**: `app/Http/Controllers/Api/`
  - `AuthController.php` - Login/logout/me endpoints
  - `UserController.php` - User CRUD operations
  - `RoleController.php` - Role & permission management
  - `PermissionController.php` - Permission listing
- **Routes**: `routes/api.php` - All API endpoints with `auth:sanctum` middleware

### Role-Based Access Control (RBAC)

Uses **Spatie Permission** package (v6.22):
- Roles and permissions are managed through the Admin UI
- Permissions are grouped into categories (Users, Roles, Letter Requests, Reports, Settings, Logs)
- Users can have multiple roles
- Each role has specific permissions
- Seeders: `database/seeders/RolePermissionSeeder.php`, `database/seeders/UserSeeder.php`

**Important**: When querying user counts for roles, use direct database queries on the `model_has_roles` pivot table instead of Eloquent relationships to avoid "Class name must be a valid object or a string" errors:

```php
// ❌ Avoid this - causes errors in map functions
$role->users()->count()

// ✅ Use this approach
$usersCount = \DB::table('model_has_roles')
    ->where('role_id', $role->id)
    ->count();
```

### Letter Management System

The system manages different types of village letters:
- **Letter Categories**: `app/Models/LetterCategory.php` - Categories of letters (e.g., Identity Letters, Business Letters)
- **Letter Templates**: `app/Models/LetterTemplate.php` - Templates with form fields and PDF generation
- **Seeders**:
  - `database/seeders/LetterCategorySeeder.php` - Predefined categories
  - `database/seeders/LetterTemplateSeeder.php` - Templates with field definitions

Templates use dynamic form fields stored as JSON in the database, allowing flexible form generation in the wizard.

### Authentication Flow

1. **Admin Login**:
   - POST `/api/v1/login` with email/password
   - Receives Sanctum token
   - Token stored in localStorage as `auth_token`
   - User data stored as `admin_user`
   - All subsequent requests include `Authorization: Bearer {token}` header

2. **Auto-redirect on 401**:
   - Axios interceptor in `resources/js/api.js` handles unauthorized responses
   - Clears localStorage and redirects to `/admin/login`

### Frontend State Management

Both React apps use **local component state** with React hooks (useState, useEffect). No global state management library is used. API calls are made directly from components using the axios instance from `resources/js/api.js`.

### Toast Notification System

A custom toast notification system is implemented using React Context:

**Location**: `resources/js/admin-app.jsx` (lines ~187-258)

**Usage**:
```javascript
// Import the hook in your component
const { showToast } = useToast();

// Show success message
showToast('Operation completed successfully!', 'success');

// Show error message
showToast('Something went wrong', 'error');

// Show info message
showToast('Please note...', 'info');
```

**Features**:
- Three types: `success` (green), `error` (red), `info` (blue)
- Auto-dismissal after 3 seconds
- Manual close button on each toast
- Slide-in animation from top-right
- Multiple toasts stack vertically
- No external dependencies (custom implementation)

**Implementation Notes**:
- The `ToastProvider` wraps the entire app in `AdminApp` component
- Use for user feedback on CRUD operations (create, update, delete)
- Use for API error messages instead of inline error displays when appropriate
- Toasts appear at fixed position: top-right corner (z-index: 50)

### Styling

- **Tailwind CSS v4** with Vite plugin
- Inline utility classes throughout components
- No separate CSS files for components

## File Structure Notes

### Models
- User model (`app/Models/User.php`) uses Spatie traits: `HasRoles`, `HasPermissions`
- Activity logging with Spatie ActivityLog package

### Migrations
Located in `database/migrations/` - includes Spatie permission tables and custom tables for letter management

### Blade Views
- `resources/views/admin/` - Admin dashboard entry point
- `resources/views/public/` - Public wizard entry point
- Views are minimal - just load React apps via Vite

### Vite Configuration
- Entry points: `resources/js/admin-app.jsx`, `resources/js/public-wizard-app.jsx`
- Uses `@vitejs/plugin-react-swc` for fast refresh
- Configured for JSX in `resources/js/` directory

## Testing Notes

- PHPUnit configured with SQLite in-memory database for tests
- Test environment uses: `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`
- Tests located in `tests/Feature/` and `tests/Unit/`

## API Documentation

Detailed API documentation is available in `API_DOCUMENTATION.md` with all endpoints, request/response examples, and cURL commands.

## Development Workflow

1. When adding new API endpoints:
   - Create controller method in `app/Http/Controllers/Api/`
   - Register route in `routes/api.php`
   - Add API method to `resources/js/admin-app.jsx` in the appropriate API object (e.g., `roleAPI`, `userAPI`)
   - Update `API_DOCUMENTATION.md`

2. When adding new frontend features:
   - Add component inline in the appropriate app file (`admin-app.jsx` or `public-wizard-app.jsx`)
   - Add route to the React Router configuration
   - For admin features, add to the sidebar navigation in `AdminLayout` component
   - Import and use `useToast()` hook for user feedback on actions:
     ```javascript
     const { showToast } = useToast();
     // On success: showToast('Success message', 'success');
     // On error: showToast('Error message', 'error');
     ```

3. When modifying permissions:
   - Update `database/seeders/RolePermissionSeeder.php`
   - Run `php artisan migrate:fresh --seed` to refresh database
   - Update the permission categories in `PermissionController.php` if needed

## Environment Configuration

Default configuration uses SQLite (`DB_CONNECTION=sqlite`). For MySQL/PostgreSQL, update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Important Packages

- **Laravel Sanctum**: API authentication
- **Spatie Permission**: Role-based access control
- **Spatie ActivityLog**: Activity logging
- **Laravel DomPDF**: PDF generation for letters
- **Maatwebsite Excel**: Excel export functionality
- **Intervention Image**: Image processing
- **React Router DOM**: Client-side routing
- **Recharts**: Charts and data visualization
- **React-to-print**: Print functionality

## Queue System

The system uses database queues (`QUEUE_CONNECTION=database`). Run the queue worker during development:

```bash
php artisan queue:listen --tries=1
```

For production, use a process manager like Supervisor to keep the queue worker running.
