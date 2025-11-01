# Product Requirements Document (PRD)
## Sistem Pembuatan Surat Desa/Kelurahan

---

## 1. Executive Summary

### 1.1 Tujuan Produk
Sistem Pembuatan Surat Desa/Kelurahan adalah aplikasi web yang dirancang untuk mengotomatisasi dan mempermudah proses pembuatan surat-menyurat di kantor desa/kelurahan. Sistem ini memungkinkan masyarakat untuk mengajukan pembuatan surat secara mandiri melalui interface public, sementara petugas desa dapat melakukan verifikasi dan manajemen melalui dashboard admin.

### 1.2 Target Users
- **Masyarakat**: Warga yang membutuhkan surat dari pemerintah desa
- **Petugas Desa**: Staff yang bertugas memverifikasi dan mencetak surat
- **Superadmin**: Administrator sistem yang mengelola konfigurasi dan user

### 1.3 Business Goals
- Mengurangi waktu tunggu pembuatan surat dari rata-rata 30-60 menit menjadi 10-15 menit
- Meningkatkan akurasi data surat dengan validasi otomatis
- Mengurangi penggunaan kertas untuk draft surat
- Meningkatkan transparansi proses administrasi desa
- Menciptakan database terpusat untuk arsip surat

---

## 2. Features & Requirements

### 2.1 Public Interface (Citizen Portal)

#### 2.1.1 NIK Validation & Authentication
**User Story**: Sebagai masyarakat, saya ingin memasukkan NIK saya untuk mengidentifikasi diri saya dalam sistem.

**Acceptance Criteria**:
- Form input NIK dengan validasi format 16 digit
- Sistem melakukan lookup NIK ke database
- Jika NIK tidak ditemukan: tampilkan pesan "Data tidak ditemukan. Silakan mendatangi petugas untuk registrasi"
- Jika NIK ditemukan: tampilkan detail lengkap (Nama, Alamat, Tempat/Tanggal Lahir, dll)
- Tombol konfirmasi "Data Sudah Sesuai" dan "Batal"
- Waktu session 15 menit untuk keamanan

**Technical Requirements**:
- Input validation client-side dan server-side
- Rate limiting untuk prevent brute force
- Logging setiap attempt NIK lookup

#### 2.1.2 Letter Category Selection
**User Story**: Sebagai masyarakat, saya ingin melihat kategori surat yang tersedia sehingga saya dapat menemukan jenis surat yang saya butuhkan.

**Acceptance Criteria**:
- Tampilan grid/list kategori surat dengan icon
- Setiap kategori menampilkan nama dan deskripsi singkat
- Click category menampilkan list surat dalam kategori tersebut
- Tombol "Kembali" ke halaman sebelumnya

**Example Categories**:
- Surat Keterangan
- Surat Pengantar
- Surat Izin
- Surat Domisili
- Surat Kematian
- Surat Kelahiran

#### 2.1.3 Letter Type Selection
**User Story**: Sebagai masyarakat, saya ingin memilih jenis surat spesifik dari kategori yang saya pilih.

**Acceptance Criteria**:
- List surat dengan nama dan deskripsi
- Search functionality untuk mencari surat
- Click letter type membuka form input
- Breadcrumb navigation

#### 2.1.4 Dynamic Form Input
**User Story**: Sebagai masyarakat, saya ingin mengisi form dengan data yang dibutuhkan untuk surat saya.

**Acceptance Criteria**:
- Form fields dinamis berdasarkan konfigurasi surat
- Support berbagai tipe input: text, textarea, date, dropdown, radio, checkbox
- Validasi real-time untuk setiap field
- Pre-fill data dari NIK yang sudah divalidasi
- Field mandatory ditandai dengan asterisk (*)
- Help text/tooltip untuk field yang kompleks
- Auto-save draft setiap 30 detik

**Field Types Support**:
- Text input (nama, alamat, dll)
- Number input (umur, jumlah, dll)
- Date picker
- Dropdown/Select
- Radio button
- Checkbox
- Textarea
- File upload (untuk lampiran jika diperlukan)

#### 2.1.5 Letter Preview
**User Story**: Sebagai masyarakat, saya ingin melihat preview surat sebelum mengajukan untuk memastikan data sudah benar.

**Acceptance Criteria**:
- Preview surat dalam format yang akan dicetak
- Menampilkan kop surat, isi, dan format lengkap
- Tombol "Edit" untuk kembali ke form
- Tombol "Ajukan" untuk submit
- Modal konfirmasi sebelum submit

#### 2.1.6 Submission Confirmation
**User Story**: Sebagai masyarakat, saya ingin mendapatkan konfirmasi bahwa pengajuan surat saya telah berhasil.

**Acceptance Criteria**:
- Tampilkan nomor antrian/tracking number
- Informasi estimasi waktu verifikasi
- Instruksi untuk menunggu atau menghubungi petugas
- Option untuk print bukti pengajuan
- QR code untuk tracking (optional)

### 2.2 Private Interface (Admin Dashboard)

#### 2.2.1 Authentication System
**User Story**: Sebagai petugas/superadmin, saya ingin login ke sistem dengan credentials yang aman.

**Acceptance Criteria**:
- Login page dengan username/email dan password
- "Remember me" checkbox
- Password visibility toggle
- Forgot password functionality
- Session timeout setelah 30 menit inaktif
- Multi-device login prevention (optional)

**Security Requirements**:
- Password hashing dengan bcrypt
- CSRF protection
- Rate limiting login attempts
- Login activity logging

#### 2.2.2 Role-Based Access Control (RBAC) Management
**User Story**: Sebagai superadmin, saya ingin mengonfigurasi roles dan permissions untuk membatasi akses user.

**Acceptance Criteria**:
- CRUD roles (create, read, update, delete)
- Assign permissions ke roles
- Predefined roles: Superadmin, Petugas, Viewer
- Permission granular: create, read, update, delete untuk setiap module

**Permissions Structure**:
```
- users (create, read, update, delete)
- letters (create, read, update, delete, verify, print)
- categories (create, read, update, delete)
- letter_templates (create, read, update, delete)
- settings (read, update)
- rbac (full access - superadmin only)
```

**Access Matrix**:
| Role | Users | Letters | Categories | Templates | Settings | RBAC |
|------|-------|---------|------------|-----------|----------|------|
| Superadmin | Full | Full | Full | Full | Full | Full |
| Petugas | Read | Read, Verify, Print | Read | Read | Read | None |
| Viewer | Read | Read | Read | Read | Read | None |

#### 2.2.3 User Management
**User Story**: Sebagai superadmin, saya ingin mengelola user yang dapat mengakses sistem.

**Acceptance Criteria**:
- List all users dengan pagination
- Search dan filter users (by role, status, name)
- Create new user: nama, email, username, password, role
- Edit user: update info, change role, reset password
- Delete user dengan soft delete
- Deactivate/activate user
- User activity log
- Export user list to Excel

**User Fields**:
- Nama Lengkap
- Email (unique)
- Username (unique)
- Password (hashed)
- Role
- Status (active/inactive)
- Last Login
- Created At
- Updated At

**Permissions**:
- Superadmin: Full CRUD
- Petugas: Read only
- Viewer: Read only

#### 2.2.4 Citizen Data Management
**User Story**: Sebagai petugas, saya ingin mengelola data masyarakat untuk validasi NIK.

**Acceptance Criteria**:
- Import data penduduk dari CSV/Excel
- CRUD data penduduk
- Search penduduk by NIK, nama, alamat
- Bulk update data
- Data validation dan duplicate detection
- Export data to Excel

**Citizen Fields**:
- NIK (unique, 16 digit)
- Nama Lengkap
- Tempat Lahir
- Tanggal Lahir
- Jenis Kelamin
- Alamat Lengkap
- RT/RW
- Desa/Kelurahan
- Kecamatan
- Kabupaten/Kota
- Provinsi
- Agama
- Status Perkawinan
- Pekerjaan
- Kewarganegaraan

#### 2.2.5 Letter Category Management
**User Story**: Sebagai superadmin, saya ingin mengelola kategori surat yang tersedia.

**Acceptance Criteria**:
- CRUD categories
- Upload icon untuk category
- Set urutan tampilan category
- Active/inactive status
- Assign multiple letters to category

**Category Fields**:
- Nama Kategori
- Slug (auto-generated)
- Deskripsi
- Icon (image upload)
- Status (active/inactive)
- Order/Sequence
- Created At
- Updated At

#### 2.2.6 Letter Template Management
**User Story**: Sebagai superadmin, saya ingin membuat dan mengelola template surat dengan field dinamis.

**Acceptance Criteria**:
- CRUD letter templates
- Assign template ke category
- Visual template editor dengan placeholder variables
- Define required fields untuk setiap template
- Field configuration: type, label, validation rules, default value
- Preview template with sample data
- Version control untuk template changes
- Clone template untuk membuat variant

**Template Configuration**:
```json
{
  "id": 1,
  "name": "Surat Keterangan Domisili",
  "category_id": 1,
  "code": "SKD",
  "fields": [
    {
      "name": "keperluan",
      "label": "Keperluan",
      "type": "textarea",
      "required": true,
      "validation": "min:10|max:500"
    },
    {
      "name": "alamat_tujuan",
      "label": "Alamat Tujuan",
      "type": "text",
      "required": true,
      "validation": "min:5|max:200"
    }
  ],
  "template_content": "Yang bertanda tangan di bawah ini...",
  "signature_type": "digital",
  "status": "active"
}
```

**Field Types**:
- text
- textarea
- number
- date
- select (dropdown)
- radio
- checkbox
- file

**Validation Rules**:
- required
- min/max length
- numeric
- date format
- custom regex

#### 2.2.7 Letter Request Management
**User Story**: Sebagai petugas, saya ingin melihat dan memverifikasi pengajuan surat dari masyarakat.

**Acceptance Criteria**:
- Dashboard dengan summary statistics:
  - Total pending requests
  - Verified today
  - Rejected today
  - Average verification time
- List all letter requests dengan filter:
  - Status (pending, verified, rejected, printed)
  - Date range
  - Letter type
  - Citizen name/NIK
- View detail request dengan preview surat
- Verify request: approve atau reject dengan catatan
- Print verified letter
- Bulk actions untuk multiple requests
- Real-time notifications untuk new requests
- Export requests to Excel

**Request Status Flow**:
1. **Pending**: Baru diajukan, menunggu verifikasi
2. **Verified**: Diverifikasi oleh petugas, siap cetak
3. **Printed**: Sudah dicetak
4. **Rejected**: Ditolak dengan alasan
5. **Cancelled**: Dibatalkan oleh system/admin

**Request Fields**:
- Request Number (auto-generated)
- NIK
- Citizen Name (from NIK)
- Letter Template
- Form Data (JSON)
- Status
- Submitted At
- Verified At
- Verified By (user_id)
- Printed At
- Printed By (user_id)
- Rejection Reason
- Notes

#### 2.2.8 Digital Signature Settings
**User Story**: Sebagai superadmin, saya ingin mengatur apakah surat menggunakan tanda tangan digital atau manual.

**Acceptance Criteria**:
- Toggle per letter template: digital atau manual
- Upload digital signature image untuk pejabat
- Set nama dan jabatan penandatangan
- Multiple signature support (untuk surat yang butuh 2+ tanda tangan)
- Signature position configuration pada template

**Signature Configuration**:
- Nama Penandatangan
- Jabatan
- NIP (opsional)
- Digital Signature Image (PNG with transparent background)
- Signature Type: digital/manual
- Active/Inactive status

#### 2.2.9 Letterhead Settings
**User Story**: Sebagai superadmin, saya ingin mengatur kop surat yang akan digunakan pada semua surat.

**Acceptance Criteria**:
- Upload logo desa (support PNG, JPG)
- Input nama desa/kelurahan
- Input alamat lengkap kantor
- Input kontak (telp, email, website)
- Preview kop surat
- Multiple letterhead support untuk surat berbeda (opsional)

**Letterhead Fields**:
- Logo (image upload, max 2MB)
- Nama Desa/Kelurahan
- Alamat Lengkap
- Kode Pos
- Telepon
- Email
- Website
- Logo Width/Height
- Header Background Color
- Header Text Color

#### 2.2.10 System Settings
**User Story**: Sebagai superadmin, saya ingin mengatur konfigurasi sistem secara umum.

**Acceptance Criteria**:
- Application name
- Timezone
- Date format
- Session timeout duration
- Max file upload size
- Allowed file extensions
- Email SMTP configuration (untuk notifications)
- Backup schedule configuration

### 2.3 Report & Analytics

#### 2.3.1 Letter Statistics
**Acceptance Criteria**:
- Total surat per kategori (chart)
- Total surat per bulan (line chart)
- Most requested letters (top 10)
- Average verification time
- Peak hours untuk request
- Export report to PDF/Excel

#### 2.3.2 User Activity Log
**Acceptance Criteria**:
- Log all user actions (login, create, update, delete)
- Filter by user, action type, date range
- Export log to Excel
- Auto cleanup old logs (>6 months)

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Page load time: < 2 seconds
- API response time: < 500ms untuk 95% requests
- Support concurrent users: minimum 50 users
- Database query optimization dengan indexing
- Implement caching untuk frequently accessed data

### 3.2 Security
- HTTPS only (SSL/TLS)
- SQL injection prevention (Laravel ORM)
- XSS protection
- CSRF protection
- Password hashing (bcrypt, cost: 12)
- Session security (httponly, secure cookies)
- Rate limiting untuk API endpoints
- Input validation dan sanitization
- Audit trail untuk sensitive actions
- Regular security updates

### 3.3 Scalability
- Database: Support up to 100,000 citizen records
- File storage: Implement file storage service (local/cloud)
- API: RESTful design untuk future mobile app
- Modular architecture untuk easy feature addition

### 3.4 Usability
- Responsive design (mobile, tablet, desktop)
- Accessible untuk pengguna dengan disabilities (WCAG 2.1 Level AA)
- Multi-language support (Bahasa Indonesia prioritas)
- Intuitive navigation
- Consistent UI/UX patterns
- Help documentation dan tooltips

### 3.5 Reliability
- System uptime: 99.5% (maksimal downtime 3.65 hari per tahun)
- Data backup: Daily automated backup
- Error handling dan logging
- Graceful degradation
- Database transaction untuk data integrity

### 3.6 Maintainability
- Clean code dengan proper documentation
- Consistent coding standards (PSR-12 untuk PHP)
- Version control (Git)
- Automated testing (Unit, Feature, Integration)
- CI/CD pipeline
- Environment configuration (.env)

### 3.7 Compliance
- Data privacy sesuai regulasi lokal
- Retain logs untuk audit (minimum 1 tahun)
- Data retention policy
- GDPR-like principles untuk data handling

---

## 4. Technical Constraints

### 4.1 Technology Stack
- **Backend**: Laravel 12 (PHP 8.3+)
- **Frontend**: React 18+ dengan Vite
- **UI Framework**: Tailwind CSS 3+
- **Database**: MySQL 8.0+
- **Web Server**: Apache/Nginx
- **PHP Extension Requirements**:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
  - Fileinfo
  - GD (untuk image processing)

### 4.2 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers: Chrome, Safari

### 4.3 Device Support
- Desktop: 1366x768 minimum resolution
- Tablet: 768x1024 minimum resolution
- Mobile: 375x667 minimum resolution

---

## 5. Dependencies & Integrations

### 5.1 Laravel Packages (Recommended)
- **spatie/laravel-permission**: RBAC implementation
- **barryvdh/laravel-dompdf**: PDF generation
- **maatwebsite/excel**: Excel import/export
- **laravel/sanctum**: API authentication
- **spatie/laravel-activitylog**: User activity logging
- **intervention/image**: Image manipulation
- **laravel/telescope**: Debug dan monitoring (development only)

### 5.2 React Packages (Recommended)
- **react-router-dom**: Routing
- **axios**: HTTP client
- **react-query** atau **swr**: Data fetching dan caching
- **react-hook-form**: Form handling
- **yup** atau **zod**: Form validation
- **react-table**: Data tables
- **recharts** atau **chart.js**: Charts
- **react-icons**: Icon library
- **react-toastify**: Notifications
- **date-fns**: Date manipulation
- **headlessui**: Unstyled accessible components

### 5.3 Development Tools
- **Composer**: PHP dependency management
- **npm/yarn**: JavaScript dependency management
- **Vite**: Frontend build tool
- **PHPUnit**: PHP testing
- **Jest/Vitest**: JavaScript testing
- **React Testing Library**: React component testing
- **PHP CS Fixer**: Code formatting
- **ESLint & Prettier**: JavaScript linting dan formatting

---

## 6. Success Metrics (KPIs)

### 6.1 Adoption Metrics
- Number of citizens using self-service system per month
- Percentage of letters created via public interface vs manual
- User satisfaction score (survey)

### 6.2 Efficiency Metrics
- Average time from submission to verification: < 10 minutes
- Average time from verification to printing: < 5 minutes
- Reduction in paper usage for drafts: > 80%

### 6.3 System Metrics
- System uptime: > 99.5%
- Average response time: < 500ms
- Error rate: < 0.1%
- User satisfaction with system usability: > 80% (good/excellent)

### 6.4 Business Metrics
- Cost savings from reduced paper and staff time
- Increase in citizen satisfaction (survey)
- Reduction in queue time at office

---

## 7. Project Risks & Mitigation

### 7.1 Data Quality Risk
**Risk**: Data penduduk yang tidak akurat atau tidak lengkap.
**Mitigation**: 
- Implement data validation saat import
- Provide tools untuk petugas update data
- Regular data audit dan cleanup

### 7.2 Adoption Risk
**Risk**: Masyarakat tidak familiar dengan teknologi.
**Mitigation**:
- Provide petugas untuk assist di lokasi
- Simple dan intuitive UI
- Tutorial video dan poster instruksi
- Gradual rollout dengan training

### 7.3 Security Risk
**Risk**: Unauthorized access atau data breach.
**Mitigation**:
- Follow security best practices
- Regular security audit
- Implement rate limiting
- Strong password policy
- Regular backup

### 7.4 Performance Risk
**Risk**: System lambat saat banyak user concurrent.
**Mitigation**:
- Load testing sebelum deployment
- Implement caching strategy
- Database optimization
- Scalable infrastructure

### 7.5 Technical Risk
**Risk**: Technology stack compatibility issues.
**Mitigation**:
- Use stable versions
- Comprehensive testing
- Development/staging/production environments
- Technical documentation

---

## 8. Future Enhancements (Post-MVP)

### Phase 2 Features
- Mobile app untuk citizen
- SMS/Email notification untuk status update
- Online payment untuk biaya administrasi
- QR code verification untuk authenticity
- Dashboard analytics lebih advanced
- Integration dengan sistem e-KTP nasional

### Phase 3 Features
- AI-powered document verification
- Chatbot untuk citizen assistance
- Multi-language support (Jawa, Sunda, dll)
- Blockchain untuk document authenticity
- Advanced reporting dan business intelligence

---

## 9. Glossary

- **NIK**: Nomor Induk Kependudukan (National Identity Number)
- **RBAC**: Role-Based Access Control
- **CRUD**: Create, Read, Update, Delete
- **KTP**: Kartu Tanda Penduduk (Indonesian Identity Card)
- **Kop Surat**: Letterhead
- **Perangkat**: Staff/Officials
- **Petugas**: Officer/Staff
- **Desa**: Village
- **Kelurahan**: Urban Village
- **RT/RW**: Neighborhood Association Units

---

## 10. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-30 | System Analyst | Initial PRD |

**Approval**:
- Product Owner: __________________
- Technical Lead: __________________
- Stakeholder: __________________

---

**Document Status**: DRAFT
**Next Review Date**: [To be determined]
