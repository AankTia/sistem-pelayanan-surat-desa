# Implementation Guide
## Sistem Pembuatan Surat Desa/Kelurahan - Step by Step

---

## Phase 1: Project Setup & Configuration (Week 1)

### Step 1: Environment Setup

#### 1.1 Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.3 and extensions
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-mysql php8.3-xml \
  php8.3-mbstring php8.3-curl php8.3-zip php8.3-gd php8.3-bcmath

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Verify installations
php -v
composer -V
node -v
npm -v
mysql --version
```

#### 1.2 Create Database
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE village_letter_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'village_admin'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON village_letter_system.* TO 'village_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Create Laravel Project

#### 2.1 Initialize Project
```bash
# Create Laravel 12 project
composer create-project laravel/laravel village-letter-system

# Navigate to project
cd village-letter-system

# Set permissions
sudo chown -R $USER:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

#### 2.2 Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Edit .env file
nano .env
```

Update `.env` with your configuration:
```env
APP_NAME="Sistem Surat Desa"
APP_ENV=local
APP_KEY=base64:... (generated)
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=village_letter_system
DB_USERNAME=village_admin
DB_PASSWORD=secure_password_here

# Session & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=30
CACHE_DRIVER=file
QUEUE_CONNECTION=database

# File Storage
FILESYSTEM_DISK=public
```

### Step 3: Install Laravel Dependencies

#### 3.1 Install Required Packages
```bash
# Install Laravel Sanctum (API authentication)
composer require laravel/sanctum

# Install Spatie Permission (RBAC)
composer require spatie/laravel-permission

# Install DomPDF (PDF generation)
composer require barryvdh/laravel-dompdf

# Install Excel (Import/Export)
composer require maatwebsite/excel

# Install Image Intervention
composer require intervention/image

# Install Activity Log
composer require spatie/laravel-activitylog

# Development packages
composer require --dev laravel/telescope
composer require --dev laravel/pint
```

#### 3.2 Publish Package Configurations
```bash
# Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Publish Spatie Permission config
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# Publish DomPDF config
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"

# Publish Activity Log config
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider"

# Install Telescope (development only)
php artisan telescope:install
```

### Step 4: Frontend Setup

#### 4.1 Install Vite & React
```bash
# Install React and dependencies
npm install react react-dom

# Install Vite plugins
npm install -D @vitejs/plugin-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install react-router-dom axios react-query
npm install react-hook-form yup
npm install @headlessui/react
npm install react-icons
npm install react-toastify
npm install date-fns
npm install @tanstack/react-table
```

#### 4.2 Configure Vite
Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
```

#### 4.3 Configure Tailwind
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

---

## Phase 2: Database Setup (Week 1-2)

### Step 5: Create Migrations

#### 5.1 Create Users Migration
```bash
php artisan make:migration create_users_table
```

Edit `database/migrations/xxxx_xx_xx_create_users_table.php`:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('username')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('email');
            $table->index('username');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

#### 5.2 Create Citizens Migration
```bash
php artisan make:migration create_citizens_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citizens', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('name');
            $table->string('birthplace');
            $table->date('birthdate');
            $table->enum('gender', ['L', 'P']);
            $table->text('address');
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->string('village')->nullable();
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->enum('religion', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']);
            $table->enum('marital_status', ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']);
            $table->string('occupation')->nullable();
            $table->string('nationality')->default('Indonesia');
            $table->timestamps();
            
            $table->index('nik');
            $table->index('name');
            $table->fullText(['name', 'address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citizens');
    }
};
```

#### 5.3 Create Categories Migration
```bash
php artisan make:migration create_categories_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->index('slug');
            $table->index('status');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
```

#### 5.4 Create Letter Templates Migration
```bash
php artisan make:migration create_letter_templates_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->json('fields');
            $table->text('template_html');
            $table->enum('signature_type', ['digital', 'manual'])->default('digital');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->index('category_id');
            $table->index('code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_templates');
    }
};
```

#### 5.5 Create Letter Requests Migration
```bash
php artisan make:migration create_letter_requests_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 50)->unique();
            $table->foreignId('citizen_id')->constrained()->onDelete('cascade');
            $table->foreignId('letter_template_id')->constrained()->onDelete('cascade');
            $table->json('form_data');
            $table->enum('status', ['pending', 'verified', 'printed', 'rejected', 'cancelled'])
                  ->default('pending');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('printed_at')->nullable();
            $table->foreignId('printed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
            
            $table->index('request_number');
            $table->index('citizen_id');
            $table->index('letter_template_id');
            $table->index('status');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_requests');
    }
};
```

#### 5.6 Create Signatures Migration
```bash
php artisan make:migration create_signatures_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('nip', 50)->nullable();
            $table->string('image_path')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signatures');
    }
};
```

#### 5.7 Create Letterheads Migration
```bash
php artisan make:migration create_letterheads_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letterheads', function (Blueprint $table) {
            $table->id();
            $table->string('logo_path')->nullable();
            $table->string('village_name');
            $table->text('address');
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->integer('logo_width')->default(80);
            $table->integer('logo_height')->default(80);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letterheads');
    }
};
```

#### 5.8 Create Settings Migration
```bash
php artisan make:migration create_settings_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->enum('type', ['string', 'number', 'boolean', 'json'])->default('string');
            $table->timestamps();
            
            $table->index('key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
```

#### 5.9 Run Migrations
```bash
# Run all migrations
php artisan migrate

# Check migration status
php artisan migrate:status
```

### Step 6: Create Models

#### 6.1 Create Citizen Model
```bash
php artisan make:model Citizen
```

Edit `app/Models/Citizen.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Citizen extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nik', 'name', 'birthplace', 'birthdate', 'gender',
        'address', 'rt', 'rw', 'village', 'district', 'city',
        'province', 'religion', 'marital_status', 'occupation', 'nationality'
    ];

    protected $casts = [
        'birthdate' => 'date',
    ];

    public function letterRequests()
    {
        return $this->hasMany(LetterRequest::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nik', 'name', 'address'])
            ->logOnlyDirty();
    }
}
```

#### 6.2 Create Category Model
```bash
php artisan make:model Category
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'icon', 'order', 'status'
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function letterTemplates()
    {
        return $this->hasMany(LetterTemplate::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```

#### 6.3 Create LetterTemplate Model
```bash
php artisan make:model LetterTemplate
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'code', 'fields',
        'template_html', 'signature_type', 'status'
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function letterRequests()
    {
        return $this->hasMany(LetterRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```

#### 6.4 Create LetterRequest Model
```bash
php artisan make:model LetterRequest
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class LetterRequest extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'request_number', 'citizen_id', 'letter_template_id',
        'form_data', 'status', 'submitted_at', 'verified_at',
        'verified_by', 'printed_at', 'printed_by',
        'rejection_reason', 'notes', 'pdf_path'
    ];

    protected $casts = [
        'form_data' => 'array',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'printed_at' => 'datetime',
    ];

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }

    public function letterTemplate()
    {
        return $this->belongsTo(LetterTemplate::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function printer()
    {
        return $this->belongsTo(User::class, 'printed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'verified_by', 'printed_by'])
            ->logOnlyDirty();
    }
}
```

#### 6.5 Create Other Models
```bash
php artisan make:model Signature
php artisan make:model Letterhead
php artisan make:model Setting
```

### Step 7: Create Seeders

#### 7.1 Create Role Seeder
```bash
php artisan make:seeder RoleSeeder
```

Edit `database/seeders/RoleSeeder.php`:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Users
            'users.view', 'users.create', 'users.edit', 'users.delete',
            // Citizens
            'citizens.view', 'citizens.create', 'citizens.edit', 'citizens.delete',
            // Categories
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            // Letter Templates
            'letter-templates.view', 'letter-templates.create', 'letter-templates.edit', 'letter-templates.delete',
            // Letter Requests
            'letter-requests.view', 'letter-requests.verify', 'letter-requests.print', 'letter-requests.reject',
            // Settings
            'settings.view', 'settings.edit',
            // RBAC
            'rbac.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $superadmin = Role::create(['name' => 'Superadmin']);
        $superadmin->givePermissionTo(Permission::all());

        $petugas = Role::create(['name' => 'Petugas']);
        $petugas->givePermissionTo([
            'citizens.view',
            'letter-requests.view',
            'letter-requests.verify',
            'letter-requests.print',
            'letter-requests.reject',
        ]);

        $viewer = Role::create(['name' => 'Viewer']);
        $viewer->givePermissionTo([
            'users.view',
            'citizens.view',
            'categories.view',
            'letter-templates.view',
            'letter-requests.view',
            'settings.view',
        ]);
    }
}
```

#### 7.2 Create User Seeder
```bash
php artisan make:seeder UserSeeder
```

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'admin@village.com',
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $superadmin->assignRole('Superadmin');

        $petugas = User::create([
            'name' => 'Petugas Desa',
            'email' => 'petugas@village.com',
            'username' => 'petugas',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $petugas->assignRole('Petugas');
    }
}
```

#### 7.3 Create Category Seeder
```bash
php artisan make:seeder CategorySeeder
```

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Surat Keterangan', 'description' => 'Berbagai jenis surat keterangan', 'order' => 1],
            ['name' => 'Surat Pengantar', 'description' => 'Surat pengantar untuk berbagai keperluan', 'order' => 2],
            ['name' => 'Surat Izin', 'description' => 'Surat izin kegiatan', 'order' => 3],
            ['name' => 'Surat Domisili', 'description' => 'Surat keterangan domisili', 'order' => 4],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
```

#### 7.4 Run Seeders
```bash
# Run specific seeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CategorySeeder

# Or run all seeders
php artisan db:seed
```

---

## Phase 3: Backend Development (Week 2-4)

### Step 8: Create Repositories

Create `app/Repositories/BaseRepository.php`:
```php
<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all($columns = ['*'])
    {
        return $this->model->all($columns);
    }

    public function paginate($perPage = 15, $columns = ['*'])
    {
        return $this->model->paginate($perPage, $columns);
    }

    public function find($id, $columns = ['*'])
    {
        return $this->model->find($id, $columns);
    }

    public function findOrFail($id, $columns = ['*'])
    {
        return $this->model->findOrFail($id, $columns);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record;
    }

    public function delete($id)
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }
}
```

Create specific repositories:
```bash
# Create directory
mkdir app/Repositories

# Create repositories
touch app/Repositories/CitizenRepository.php
touch app/Repositories/CategoryRepository.php
touch app/Repositories/LetterTemplateRepository.php
touch app/Repositories/LetterRequestRepository.php
```

Example `app/Repositories/CitizenRepository.php`:
```php
<?php

namespace App\Repositories;

use App\Models\Citizen;

class CitizenRepository extends BaseRepository
{
    public function __construct(Citizen $model)
    {
        parent::__construct($model);
    }

    public function findByNik(string $nik)
    {
        return $this->model->where('nik', $nik)->first();
    }

    public function search($query, $perPage = 15)
    {
        return $this->model
            ->where('name', 'like', "%{$query}%")
            ->orWhere('nik', 'like', "%{$query}%")
            ->orWhere('address', 'like', "%{$query}%")
            ->paginate($perPage);
    }
}
```

### Step 9: Create Services

Create `app/Services` directory and service files:
```bash
mkdir app/Services
touch app/Services/CitizenService.php
touch app/Services/LetterRequestService.php
touch app/Services/PdfGeneratorService.php
```

Example `app/Services/LetterRequestService.php`:
```php
<?php

namespace App\Services;

use App\Repositories\LetterRequestRepository;
use App\Repositories\CitizenRepository;
use Illuminate\Support\Facades\DB;

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
        return DB::transaction(function () use ($data) {
            // Validate citizen
            $citizen = $this->citizenRepo->findByNik($data['nik']);
            if (!$citizen) {
                throw new \Exception('NIK tidak ditemukan');
            }

            // Generate request number
            $data['request_number'] = $this->generateRequestNumber();
            $data['citizen_id'] = $citizen->id;
            $data['status'] = 'pending';
            $data['submitted_at'] = now();

            // Create request
            $request = $this->requestRepo->create($data);

            // Load relationships
            $request->load(['citizen', 'letterTemplate.category']);

            return $request;
        });
    }

    public function verifyRequest($id, $userId)
    {
        $request = $this->requestRepo->findOrFail($id);
        
        return $this->requestRepo->update($id, [
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $userId,
        ]);
    }

    public function printRequest($id, $userId)
    {
        $request = $this->requestRepo->findOrFail($id);
        
        if ($request->status !== 'verified') {
            throw new \Exception('Surat belum diverifikasi');
        }

        // Generate PDF
        $pdfPath = $this->pdfService->generate($request);

        return $this->requestRepo->update($id, [
            'status' => 'printed',
            'printed_at' => now(),
            'printed_by' => $userId,
            'pdf_path' => $pdfPath,
        ]);
    }

    protected function generateRequestNumber()
    {
        $date = now()->format('Ymd');
        $count = $this->requestRepo->countByDate(now()) + 1;
        return "REQ-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
```

### Step 10: Create API Controllers

```bash
# Create controller directories
mkdir -p app/Http/Controllers/Api/Admin
mkdir -p app/Http/Controllers/Api/Public

# Create controllers
php artisan make:controller Api/Admin/CategoryController --api
php artisan make:controller Api/Admin/CitizenController --api
php artisan make:controller Api/Admin/LetterTemplateController --api
php artisan make:controller Api/Admin/LetterRequestController --api
php artisan make:controller Api/Public/LetterRequestController --api
php artisan make:controller Api/AuthController
```

Example `app/Http/Controllers/Api/Public/LetterRequestController.php`:
```php
<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\LetterRequestService;
use App\Services\CitizenService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class LetterRequestController extends Controller
{
    use ApiResponse;

    protected $letterService;
    protected $citizenService;

    public function __construct(
        LetterRequestService $letterService,
        CitizenService $citizenService
    ) {
        $this->letterService = $letterService;
        $this->citizenService = $citizenService;
    }

    public function validateNik(Request $request)
    {
        $request->validate([
            'nik' => 'required|digits:16',
        ]);

        $citizen = $this->citizenService->findByNik($request->nik);

        if (!$citizen) {
            return $this->errorResponse(
                'Data tidak ditemukan. Silakan mendatangi petugas.',
                [],
                404
            );
        }

        return $this->successResponse($citizen, 'Data ditemukan');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required|digits:16',
            'letter_template_id' => 'required|exists:letter_templates,id',
            'form_data' => 'required|array',
        ]);

        try {
            $letterRequest = $this->letterService->submitRequest($request->all());

            return $this->successResponse([
                'request_number' => $letterRequest->request_number,
                'status' => $letterRequest->status,
                'submitted_at' => $letterRequest->submitted_at,
            ], 'Permohonan surat berhasil diajukan', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
```

### Step 11: Create API Routes

Edit `routes/api.php`:
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Public;
use App\Http\Controllers\Api\Admin;

// Public routes
Route::prefix('v1/public')->group(function () {
    Route::post('/validate-nik', [Public\LetterRequestController::class, 'validateNik']);
    Route::get('/categories', [Public\CategoryController::class, 'index']);
    Route::get('/categories/{category}/templates', [Public\CategoryController::class, 'templates']);
    Route::post('/letter-requests', [Public\LetterRequestController::class, 'store']);
    Route::post('/letter-requests/preview', [Public\LetterRequestController::class, 'preview']);
});

// Auth routes
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Admin routes (protected)
Route::prefix('v1/admin')->middleware(['auth:sanctum'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [Admin\DashboardController::class, 'stats']);

    // Users
    Route::apiResource('users', Admin\UserController::class);
    Route::post('users/{user}/reset-password', [Admin\UserController::class, 'resetPassword']);

    // Citizens
    Route::apiResource('citizens', Admin\CitizenController::class);
    Route::post('citizens/import', [Admin\CitizenController::class, 'import']);
    Route::get('citizens/export', [Admin\CitizenController::class, 'export']);

    // Categories
    Route::apiResource('categories', Admin\CategoryController::class);

    // Letter Templates
    Route::apiResource('letter-templates', Admin\LetterTemplateController::class);

    // Letter Requests
    Route::apiResource('letter-requests', Admin\LetterRequestController::class)
        ->only(['index', 'show']);
    Route::put('letter-requests/{request}/verify', [Admin\LetterRequestController::class, 'verify']);
    Route::put('letter-requests/{request}/reject', [Admin\LetterRequestController::class, 'reject']);
    Route::put('letter-requests/{request}/print', [Admin\LetterRequestController::class, 'print']);
    Route::get('letter-requests/{request}/download', [Admin\LetterRequestController::class, 'download']);

    // Settings
    Route::get('/settings', [Admin\SettingController::class, 'index']);
    Route::put('/settings', [Admin\SettingController::class, 'update']);
});
```

---

## Phase 4: Frontend Development (Week 4-6)

### Step 12: Setup React Structure

Create base React structure:
```bash
# Create directories
mkdir -p resources/js/src/{components,pages,services,hooks,utils,contexts}
mkdir -p resources/js/src/components/{Admin,Public,Common,Layout}
mkdir -p resources/js/src/pages/{Admin,Public,Auth}
```

Create `resources/js/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './src/App';
import '../css/app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
```

### Step 13: Create API Service

Create `resources/js/src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

Create service files:
```javascript
// resources/js/src/services/authService.js
import api from './api';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
};

// resources/js/src/services/citizenService.js
export const citizenService = {
    validateNik: (nik) => api.post('/public/validate-nik', { nik }),
};

// resources/js/src/services/letterService.js
export const letterService = {
    getCategories: () => api.get('/public/categories'),
    getTemplatesByCategory: (categoryId) => 
        api.get(`/public/categories/${categoryId}/templates`),
    submitRequest: (data) => api.post('/public/letter-requests', data),
    preview: (data) => api.post('/public/letter-requests/preview', data),
};
```

### Step 14: Create React Components

Create public interface components:

`resources/js/src/pages/Public/Home.jsx`:
```jsx
import React, { useState } from 'react';
import NikValidation from '../../components/Public/NikValidation';
import CategorySelection from '../../components/Public/CategorySelection';
import LetterSelection from '../../components/Public/LetterSelection';
import DynamicForm from '../../components/Public/DynamicForm';
import LetterPreview from '../../components/Public/LetterPreview';
import Confirmation from '../../components/Public/Confirmation';

const Home = () => {
    const [step, setStep] = useState(1);
    const [citizen, setCitizen] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [requestData, setRequestData] = useState(null);

    const handleNikValidated = (citizenData) => {
        setCitizen(citizenData);
        setStep(2);
    };

    const handleCategorySelected = (category) => {
        setSelectedCategory(category);
        setStep(3);
    };

    const handleTemplateSelected = (template) => {
        setSelectedTemplate(template);
        setStep(4);
    };

    const handleFormSubmitted = (data) => {
        setFormData(data);
        setStep(5);
    };

    const handlePreviewConfirmed = (request) => {
        setRequestData(request);
        setStep(6);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {step === 1 && <NikValidation onValidated={handleNikValidated} />}
                {step === 2 && <CategorySelection onSelect={handleCategorySelected} />}
                {step === 3 && (
                    <LetterSelection 
                        category={selectedCategory} 
                        onSelect={handleTemplateSelected} 
                    />
                )}
                {step === 4 && (
                    <DynamicForm 
                        template={selectedTemplate}
                        citizen={citizen}
                        onSubmit={handleFormSubmitted}
                    />
                )}
                {step === 5 && (
                    <LetterPreview 
                        template={selectedTemplate}
                        citizen={citizen}
                        formData={formData}
                        onConfirm={handlePreviewConfirmed}
                        onEdit={() => setStep(4)}
                    />
                )}
                {step === 6 && <Confirmation request={requestData} />}
            </div>
        </div>
    );
};

export default Home;
```

Create `resources/js/src/components/Public/NikValidation.jsx`:
```jsx
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { citizenService } from '../../services/citizenService';
import Button from '../Common/Button';
import Input from '../Common/Input';

const NikValidation = ({ onValidated }) => {
    const [nik, setNik] = useState('');

    const mutation = useMutation(citizenService.validateNik, {
        onSuccess: (data) => {
            onValidated(data.data);
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nik.length !== 16) {
            alert('NIK harus 16 digit');
            return;
        }
        mutation.mutate(nik);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
                Sistem Pembuatan Surat Desa
            </h1>
            <p className="text-gray-600 text-center mb-8">
                Masukkan NIK Anda untuk memulai
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Nomor Induk Kependudukan (NIK)"
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                    required
                />

                <Button
                    type="submit"
                    loading={mutation.isLoading}
                    className="w-full"
                >
                    Validasi NIK
                </Button>
            </form>
        </div>
    );
};

export default NikValidation;
```

Create common components:

`resources/js/src/components/Common/Button.jsx`:
```jsx
import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary',
    loading = false,
    disabled = false,
    className = '',
    ...props 
}) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </button>
    );
};

export default Button;
```

`resources/js/src/components/Common/Input.jsx`:
```jsx
import React from 'react';

const Input = ({ 
    label, 
    error, 
    helperText,
    type = 'text',
    required = false,
    ...props 
}) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default Input;
```

### Step 15: Build and Test

Create `resources/views/app.blade.php`:
```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Village Letter System') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

Update `routes/web.php`:
```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
```

Build and run:
```bash
# Install dependencies
npm install

# Build frontend
npm run dev

# In another terminal, run Laravel
php artisan serve
```

---

## Phase 5: Testing & Deployment (Week 7-8)

### Step 16: Write Tests

Create test files:
```bash
php artisan make:test Api/Public/LetterRequestTest
php artisan make:test Api/Admin/CategoryTest
```

### Step 17: Production Preparation

```bash
# Optimize application
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build production assets
npm run build

# Set proper permissions
chmod -R 755 storage bootstrap/cache
```

### Step 18: Deploy to Server

Follow deployment checklist in Technical Documentation.

---

## Troubleshooting

### Common Issues

1. **CORS errors**: Add CORS middleware in `app/Http/Kernel.php`
2. **Storage link not working**: Run `php artisan storage:link`
3. **Migration errors**: Check database credentials in `.env`
4. **Permission denied**: Fix file permissions with `chmod`

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-30
