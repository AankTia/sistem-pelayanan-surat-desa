# Quick Reference Guide
## Command Cheatsheet untuk Sistem Pembuatan Surat Desa

---

## 🚀 Initial Setup Commands

### Create Laravel Project
```bash
composer create-project laravel/laravel village-letter-system
cd village-letter-system
```

### Generate Application Key
```bash
php artisan key:generate
```

### Install Backend Dependencies
```bash
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require barryvdh/laravel-dompdf
composer require maatwebsite/excel
composer require intervention/image
composer require spatie/laravel-activitylog
composer require --dev laravel/telescope
```

### Install Frontend Dependencies
```bash
npm install react react-dom
npm install -D @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios react-query
npm install react-hook-form yup
npm install @headlessui/react react-icons react-toastify date-fns
```

---

## 🗄️ Database Commands

### Create Database (MySQL)
```sql
CREATE DATABASE village_letter_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'village_admin'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON village_letter_system.* TO 'village_admin'@'localhost';
FLUSH PRIVILEGES;
```

### Migration Commands
```bash
# Create migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Rollback all and re-run
php artisan migrate:fresh

# Check migration status
php artisan migrate:status
```

### Seeder Commands
```bash
# Create seeder
php artisan make:seeder NameSeeder

# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=RoleSeeder

# Fresh migrate with seed
php artisan migrate:fresh --seed
```

---

## 🏗️ Code Generation Commands

### Create Model
```bash
# Model only
php artisan make:model ModelName

# Model with migration
php artisan make:model ModelName -m

# Model with migration, factory, seeder
php artisan make:model ModelName -mfs

# Model with migration and controller
php artisan make:model ModelName -mc
```

### Create Controller
```bash
# Regular controller
php artisan make:controller ControllerName

# API controller (RESTful)
php artisan make:controller Api/ControllerName --api

# Resource controller
php artisan make:controller ControllerName --resource
```

### Create Request Validator
```bash
php artisan make:request StoreUserRequest
php artisan make:request UpdateUserRequest
```

### Create Middleware
```bash
php artisan make:middleware MiddlewareName
```

### Create Service/Repository (Manual)
```bash
# Create directory
mkdir app/Services
mkdir app/Repositories

# Create files manually
touch app/Services/UserService.php
touch app/Repositories/UserRepository.php
```

---

## 🔐 Authentication & Permission

### Publish Sanctum
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Publish Spatie Permission
```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

### Clear Permission Cache
```bash
php artisan permission:cache-reset
```

---

## 🎨 Frontend Commands

### Initialize Tailwind
```bash
npx tailwindcss init -p
```

### Development Server
```bash
# Run Vite dev server
npm run dev

# Run Laravel dev server (separate terminal)
php artisan serve
```

### Build for Production
```bash
npm run build
```

---

## 🧪 Testing Commands

### Create Test
```bash
# Feature test
php artisan make:test UserTest

# Unit test
php artisan make:test UserTest --unit
```

### Run Tests
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter UserTest

# Run with coverage
php artisan test --coverage

# Run parallel
php artisan test --parallel
```

---

## 📦 Cache & Optimization

### Clear All Caches
```bash
php artisan optimize:clear
```

### Individual Cache Commands
```bash
# Clear application cache
php artisan cache:clear

# Clear config cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Clear compiled classes
php artisan clear-compiled
```

### Optimization Commands (Production)
```bash
# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev

# All optimization at once
php artisan optimize
```

---

## 🗂️ Storage Commands

### Create Storage Link
```bash
php artisan storage:link
```

### Create Custom Storage Disk
Edit `config/filesystems.php` then run:
```bash
php artisan config:clear
```

---

## 📊 Database Query & Debug

### Tinker (Laravel REPL)
```bash
php artisan tinker

# Example usage in tinker:
>>> User::count()
>>> User::first()
>>> Citizen::where('nik', '3201234567890001')->first()
```

### Database Console
```bash
# MySQL
php artisan db

# Show tables
php artisan db:show

# Show specific table
php artisan db:table users
```

---

## 🔧 Maintenance Commands

### Put Application in Maintenance Mode
```bash
# Enable maintenance mode
php artisan down

# Enable with secret to bypass
php artisan down --secret="bypass-key"

# Disable maintenance mode
php artisan up
```

### Generate IDE Helper (Development)
```bash
composer require --dev barryvdh/laravel-ide-helper
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

---

## 📝 Logging & Debugging

### View Logs
```bash
# Tail log file
tail -f storage/logs/laravel.log

# View last 50 lines
tail -n 50 storage/logs/laravel.log
```

### Telescope (Development)
```bash
# Install Telescope
composer require --dev laravel/telescope
php artisan telescope:install
php artisan migrate

# Access: http://localhost:8000/telescope
```

---

## 🚀 Deployment Commands

### Production Deployment Sequence
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# 3. Run migrations
php artisan migrate --force

# 4. Clear and cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Set permissions
chmod -R 755 storage bootstrap/cache

# 6. Restart services (if using queue)
php artisan queue:restart
```

---

## 🔄 Git Commands (Common)

### Basic Workflow
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Add feature: user management"

# Push to remote
git push origin develop

# Pull latest
git pull origin develop
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature/letter-templates

# Switch to existing branch
git checkout develop

# List all branches
git branch -a

# Delete branch
git branch -d feature/letter-templates
```

### Merge Strategy
```bash
# Merge feature branch to develop
git checkout develop
git merge feature/letter-templates

# Merge develop to main (for release)
git checkout main
git merge develop
```

---

## 🐛 Troubleshooting Commands

### Permission Issues
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Or for development
sudo chown -R $USER:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Composer Issues
```bash
# Clear Composer cache
composer clear-cache

# Update Composer itself
composer self-update

# Install with verbose output
composer install -vvv
```

### NPM Issues
```bash
# Clear NPM cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
```bash
# Test database connection
php artisan db:show

# Check .env configuration
cat .env | grep DB_
```

---

## 📊 Useful Artisan Commands

### List All Commands
```bash
php artisan list
```

### Get Help for Specific Command
```bash
php artisan help migrate
```

### Queue Management
```bash
# Run queue worker
php artisan queue:work

# Run queue worker (process once)
php artisan queue:work --once

# Clear failed jobs
php artisan queue:flush

# Retry failed jobs
php artisan queue:retry all
```

### Schedule Management
```bash
# List scheduled tasks
php artisan schedule:list

# Run scheduled tasks manually
php artisan schedule:run
```

---

## 🔒 Security Commands

### Generate New APP_KEY
```bash
php artisan key:generate
```

### Clear Sensitive Cached Data
```bash
php artisan config:clear
php artisan cache:clear
```

---

## 📦 Backup Commands (Manual)

### Database Backup
```bash
# Export database
mysqldump -u village_admin -p village_letter_system > backup_$(date +%Y%m%d).sql

# Import database
mysql -u village_admin -p village_letter_system < backup_20251030.sql
```

### File Backup
```bash
# Backup storage directory
tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/

# Restore
tar -xzf storage_backup_20251030.tar.gz
```

---

## 🎯 Development Workflow Cheatsheet

### Start Development Session
```bash
# Terminal 1: Laravel
cd village-letter-system
php artisan serve

# Terminal 2: Vite
npm run dev

# Terminal 3: Queue Worker (if needed)
php artisan queue:work
```

### Before Committing
```bash
# Run tests
php artisan test

# Check code style
./vendor/bin/pint

# Clear caches
php artisan optimize:clear
```

### End of Day
```bash
# Commit work
git add .
git commit -m "Progress: [describe what you did]"
git push origin feature/[feature-name]
```

---

## 💡 Pro Tips

### Create Alias (Optional)
Add to `~/.bashrc` or `~/.zshrc`:
```bash
alias art='php artisan'
alias tinker='php artisan tinker'
alias migrate='php artisan migrate'
alias fresh='php artisan migrate:fresh --seed'
```

Then reload:
```bash
source ~/.bashrc
# or
source ~/.zshrc
```

Now you can use:
```bash
art make:model User
art migrate
fresh
```

---

## 📋 Project Specific Commands

### Import Citizens Data
```bash
# Via artisan command (create this)
php artisan citizens:import storage/app/citizens.xlsx
```

### Generate Letter Request Number
```bash
# Via tinker
php artisan tinker
>>> app(App\Services\LetterRequestService::class)->generateRequestNumber()
```

### Clear Old Letter PDFs (Cleanup)
```bash
# Via artisan command (create this)
php artisan letters:cleanup --days=30
```

---

## 🎓 Learning Resources

### Official Documentation
- Laravel: https://laravel.com/docs
- React: https://react.dev
- Tailwind: https://tailwindcss.com

### Laravel Packages
- Sanctum: https://laravel.com/docs/sanctum
- Spatie Permission: https://spatie.be/docs/laravel-permission
- DomPDF: https://github.com/barryvdh/laravel-dompdf
- Excel: https://docs.laravel-excel.com

---

**Last Updated**: 2025-10-30  
**Keep this file handy during development!** 📌
