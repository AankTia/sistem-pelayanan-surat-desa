# Static UI Documentation
## Sistem Pembuatan Surat Desa/Kelurahan

---

## 📋 Overview

Folder ini berisi **static HTML prototypes** untuk Sistem Pembuatan Surat Desa/Kelurahan. Semua halaman dibuat menggunakan:
- **HTML5**
- **Tailwind CSS** (via CDN)
- **Alpine.js** (untuk interaktivitas)
- **Font Awesome** (untuk icons)
- **Chart.js** (untuk charts di dashboard)

---

## 📁 File Structure

```
ui/
├── public-nik-validation.html         # Halaman validasi NIK (Public)
├── public-citizen-data.html           # Konfirmasi data penduduk (Public)
├── public-category-selection.html     # Pemilihan kategori surat (Public)
├── admin-login.html                   # Halaman login admin
├── admin-dashboard.html               # Dashboard utama admin
├── admin-letter-requests.html         # Manajemen permohonan surat
└── README_UI.md                       # Dokumentasi ini
```

---

## 🎨 UI Pages

### Public Interface (Untuk Masyarakat)

#### 1. **public-nik-validation.html**
**Fungsi**: Halaman pertama untuk validasi NIK masyarakat

**Fitur**:
- Input NIK 16 digit dengan validasi real-time
- Counter karakter
- Loading state saat validasi
- Error handling
- Demo credentials untuk testing
- Informasi bantuan

**Demo Credentials**:
- NIK: `3201234567890001`

**Screenshot Preview**:
```
┌─────────────────────────────────┐
│   🏛️  Sistem Pembuatan Surat    │
│                                  │
│   📋 Selamat Datang              │
│                                  │
│   NIK: [________________]  0/16  │
│                                  │
│   [   Validasi NIK   ]          │
│                                  │
│   ⏱️ Cepat  🔒 Aman  📄 Mudah   │
└─────────────────────────────────┘
```

**Flow**:
1. User input NIK
2. System validate (client-side format check)
3. Simulate API call
4. If valid → redirect to citizen-data page
5. If invalid → show error message

---

#### 2. **public-citizen-data.html**
**Fungsi**: Konfirmasi data penduduk yang ditemukan

**Fitur**:
- Progress indicator (Step 2/4)
- Display data lengkap penduduk
- 2-column layout (Personal Info & Address)
- Confirmation buttons (Ya/Tidak)
- Back navigation
- Warning notice untuk update data

**Data Displayed**:
- Personal: NIK, Nama, Tempat/Tanggal Lahir, Gender, Agama, Status Kawin, Pekerjaan
- Address: Alamat, RT/RW, Desa, Kecamatan, Kota, Provinsi

**Screenshot Preview**:
```
┌─────────────────────────────────┐
│  ← Kembali      Progress: ●●●○  │
│                                  │
│   ✓ Data Ditemukan              │
│                                  │
│   Informasi Pribadi │  Alamat   │
│   NIK: 320123...    │ Jl. XX    │
│   Nama: BUDI       │ RT/RW: XX  │
│   ...              │ ...        │
│                                  │
│   ❓ Data sudah sesuai?          │
│   [Tidak, Batal] [Ya, Lanjut]  │
└─────────────────────────────────┘
```

---

#### 3. **public-category-selection.html**
**Fungsi**: Pemilihan kategori surat yang dibutuhkan

**Fitur**:
- Progress indicator (Step 3/4)
- Search box untuk filter kategori
- Grid layout 3 columns (responsive)
- Hover effects
- Color-coded categories
- Icon untuk setiap kategori
- Count jumlah surat per kategori
- Help section

**Categories Available**:
1. 🔵 Surat Keterangan (8 jenis)
2. 🟢 Surat Pengantar (6 jenis)
3. 🟠 Surat Izin (5 jenis)
4. 🟣 Surat Domisili (4 jenis)
5. ⚫ Surat Kematian (2 jenis)
6. 🔴 Surat Kelahiran (2 jenis)

**Screenshot Preview**:
```
┌─────────────────────────────────┐
│  Pilih Kategori Surat           │
│  [🔍 Cari kategori...]          │
│                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐│
│  │🔵 Surat│ │🟢 Surat│ │🟠 Surat││
│  │Keterang│ │Pengantr│ │  Izin ││
│  │8 jenis │ │6 jenis │ │5 jenis││
│  └────────┘ └────────┘ └────────┘│
│                                  │
│  ❓ Tidak menemukan?             │
│     [Hubungi Petugas]           │
└─────────────────────────────────┘
```

---

### Admin Interface (Untuk Petugas/Admin)

#### 4. **admin-login.html**
**Fungsi**: Halaman login untuk admin dan petugas

**Fitur**:
- Username/Email input
- Password input dengan show/hide toggle
- Remember me checkbox
- Forgot password link
- Loading state
- Error message display
- Demo credentials box
- Gradient background
- Responsive design

**Demo Credentials**:
- **Superadmin**: username: `superadmin`, password: `password123`
- **Petugas**: username: `petugas`, password: `password123`

**Screenshot Preview**:
```
┌─────────────────────────────────┐
│      🏛️                          │
│   Sistem Surat Desa             │
│   Portal Administrator          │
│                                  │
│   👤 Username: [________]       │
│   🔒 Password: [________] 👁️   │
│                                  │
│   ☑️ Ingat saya  Lupa password? │
│                                  │
│   [       Login       ]         │
│                                  │
│   💡 Demo: superadmin/password123│
└─────────────────────────────────┘
```

---

#### 5. **admin-dashboard.html**
**Fungsi**: Dashboard utama dengan statistik dan overview

**Fitur**:
- Responsive sidebar navigation
- Top navbar dengan notifications
- 4 statistics cards:
  - Pending requests
  - Verified today
  - Total this month
  - Average processing time
- 2 charts:
  - Doughnut chart (Letters by category)
  - Line chart (7-day trend)
- Recent requests table
- Mobile responsive (hamburger menu)
- User dropdown menu

**Statistics Cards**:
1. 🟠 Pending: 12 requests
2. 🟢 Verified Today: 25 (+8 from yesterday)
3. 🔵 Total This Month: 348
4. 🟣 Avg Processing Time: 8 minutes

**Screenshot Preview**:
```
┌──────────────────────────────────────┐
│ ☰ │ Dashboard              🔔 👤▼  │
├──────────────────────────────────────┤
│     │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ 🏛️  │  │🟠12│ │🟢25│ │🔵348│ │🟣8 │  │
│     │  └────┘ └────┘ └────┘ └────┘  │
│ Nav │                                │
│     │  ┌──────────┐  ┌──────────┐   │
│     │  │ 📊 Chart │  │ 📈 Trend │   │
│     │  └──────────┘  └──────────┘   │
│     │                                │
│     │  📋 Recent Requests Table      │
└──────────────────────────────────────┘
```

**Sidebar Menu**:
- Dashboard (active)
- Permohonan Surat (with badge: 12)
- Data Penduduk
- Kategori Surat
- Template Surat
- Manajemen User
- Pengaturan
- Logout

---

#### 6. **admin-letter-requests.html**
**Fungsi**: Manajemen dan verifikasi permohonan surat

**Fitur**:
- Search functionality (by number, name, NIK)
- Status filter dropdown
- Date filter
- Quick stats (4 cards)
- Data table with actions
- Checkbox for bulk actions
- Status badges (color-coded)
- Action buttons:
  - 👁️ View detail
  - ✅ Verify (for pending)
  - ❌ Reject (for pending)
  - 🖨️ Print (for verified)
  - ⬇️ Download (for printed)
- Pagination
- Detail modal popup
- PDF preview section

**Status Colors**:
- 🟠 Pending (Orange)
- 🟢 Verified (Green)
- 🔵 Printed (Blue)
- 🔴 Rejected (Red)

**Screenshot Preview**:
```
┌──────────────────────────────────────┐
│ Manajemen Permohonan Surat          │
├──────────────────────────────────────┤
│ [🔍 Search] [Status▼] [📅 Date]    │
│                                      │
│ 🟠12  🟢25  🔵18  🔴3               │
│                                      │
│ ☑️ │ No. │ NIK │ Nama │ Status │ ⚙️  │
│ ☐ │ REQ │ 320 │ Budi │ 🟠Pend │👁️✅❌│
│ ☐ │ REQ │ 320 │ Siti │ 🟢Verif│👁️🖨️│
│                                      │
│          [<] 1 2 3 [>]              │
└──────────────────────────────────────┘
```

**Detail Modal** shows:
- Request number and status
- Citizen data (NIK, Name)
- Letter type
- PDF preview placeholder
- Action buttons (Verify/Reject/Close)

---

## 🚀 How to Use

### 1. **Local Development**

Semua file bisa dibuka langsung di browser tanpa server karena menggunakan CDN:

```bash
# Cara 1: Buka langsung di browser
# Double-click file HTML atau drag & drop ke browser

# Cara 2: Gunakan local server (recommended)
# Menggunakan Python
python -m http.server 8000

# Menggunakan PHP
php -S localhost:8000

# Menggunakan Node.js (http-server)
npx http-server -p 8000

# Kemudian buka: http://localhost:8000
```

### 2. **Testing Flow**

#### Public Interface Flow:
```
1. Buka public-nik-validation.html
   → Input NIK: 3201234567890001
   → Click "Validasi NIK"

2. Akan redirect ke public-citizen-data.html
   → Review data
   → Click "Ya, Lanjutkan"

3. Akan redirect ke public-category-selection.html
   → Pilih kategori (misalnya "Surat Keterangan")
   → Click category card

4. [Lanjut ke form dan preview - belum dibuat di set ini]
```

#### Admin Interface Flow:
```
1. Buka admin-login.html
   → Username: superadmin
   → Password: password123
   → Click "Login"

2. Akan redirect ke admin-dashboard.html
   → Lihat statistics dan charts
   → Click menu "Permohonan Surat"

3. Akan redirect ke admin-letter-requests.html
   → Filter dan search requests
   → Click "👁️" untuk view detail
   → Click "✅" untuk verify request
```

---

## 🎨 Design System

### Color Palette
```css
Primary Blue:     #3B82F6 (bg-blue-600)
Success Green:    #10B981 (bg-green-600)
Warning Orange:   #F59E0B (bg-amber-600)
Danger Red:       #EF4444 (bg-red-600)
Purple:           #8B5CF6 (bg-purple-600)
Gray Background:  #F3F4F6 (bg-gray-100)
White:            #FFFFFF (bg-white)
```

### Typography
```
Headers:     font-bold text-2xl/3xl
Body:        text-sm/base
Small:       text-xs
Colors:      text-gray-600/700/800
```

### Spacing
```
Card Padding:  p-6/p-8
Gaps:          space-y-4, gap-6
Borders:       rounded-lg/rounded-xl
Shadows:       shadow-lg/shadow-xl
```

### Components
- **Buttons**: `bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg`
- **Inputs**: `border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Cards**: `bg-white rounded-lg shadow-xl p-8`
- **Badges**: `px-2 py-1 text-xs rounded-full bg-{color}-100 text-{color}-800`

---

## 📱 Responsive Design

Semua halaman responsive dengan breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile Features:
- Hamburger menu untuk sidebar (admin)
- Stacked layout untuk cards
- Horizontal scroll untuk tables
- Simplified navigation

---

## 🔧 Customization Guide

### Mengubah Warna Brand:

Cari dan replace di file HTML:
```html
<!-- Dari: -->
bg-blue-600  →  bg-[your-color]-600
text-blue-600  →  text-[your-color]-600

<!-- Contoh untuk hijau: -->
bg-blue-600  →  bg-green-600
```

### Menambah Menu Sidebar:

Edit di section `<nav>` pada admin pages:
```html
<li>
    <a href="new-page.html" class="flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition">
        <i class="fas fa-new-icon w-5"></i>
        <span>Menu Baru</span>
    </a>
</li>
```

### Mengubah Logo:

Replace di header section:
```html
<!-- Dari icon font awesome: -->
<i class="fas fa-landmark text-blue-600"></i>

<!-- Ke image: -->
<img src="path/to/logo.png" alt="Logo" class="w-10 h-10">
```

---

## 🔌 Integration dengan Backend

Untuk menghubungkan dengan Laravel backend:

### 1. **Update API Endpoints**

Ganti mock API calls di Alpine.js dengan real API:

```javascript
// Sebelum (Mock):
setTimeout(() => {
    // Mock response
}, 1500);

// Sesudah (Real API):
fetch('/api/v1/public/validate-nik', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nik: this.nik })
})
.then(response => response.json())
.then(data => {
    // Handle response
})
.catch(error => {
    // Handle error
});
```

### 2. **Authentication**

Update login function untuk real auth:

```javascript
login() {
    fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form)
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('token', data.token);
        window.location.href = 'admin-dashboard.html';
    });
}
```

### 3. **Dynamic Data**

Replace hardcoded data dengan fetch dari API:

```javascript
// Alpine.js component
init() {
    fetch('/api/v1/admin/letter-requests')
        .then(response => response.json())
        .then(data => {
            this.requests = data.data;
        });
}
```

---

## ✅ Checklist Integrasi

Saat menggabungkan dengan Laravel/React:

- [ ] Convert HTML ke React Components
- [ ] Replace mock data dengan API calls
- [ ] Implement real authentication
- [ ] Add error handling
- [ ] Add loading states
- [ ] Implement real-time updates (optional)
- [ ] Add form validation
- [ ] Connect to actual database
- [ ] Implement file upload (logos, signatures)
- [ ] Add PDF generation
- [ ] Implement printing functionality
- [ ] Add notifications system
- [ ] Implement search with backend
- [ ] Add pagination with backend
- [ ] Connect charts to real data

---

## 🐛 Known Limitations

1. **No Real Data**: Semua data hardcoded untuk demo
2. **No Persistence**: Perubahan hilang saat refresh
3. **No Authentication**: Login hanya simulasi
4. **No Validation**: Validasi minimal, hanya client-side
5. **No Error Handling**: Error handling sangat basic
6. **Static Routing**: Navigation menggunakan href langsung
7. **No PDF Generation**: PDF preview hanya placeholder
8. **No File Upload**: Upload feature belum implemented

---

## 📚 Additional Pages Needed

Halaman yang perlu dibuat untuk sistem lengkap:

### Public Interface:
- [ ] Letter selection (per category)
- [ ] Dynamic form (untuk input data surat)
- [ ] Letter preview (sebelum submit)
- [ ] Confirmation page (setelah submit)

### Admin Interface:
- [ ] Citizens management (CRUD)
- [ ] Categories management (CRUD)
- [ ] Letter templates management (CRUD + editor)
- [ ] Users management (CRUD)
- [ ] Roles & permissions
- [ ] Settings (letterhead, signatures)
- [ ] Reports & analytics
- [ ] Activity logs

---

## 🎯 Best Practices

### Saat Development:
1. **Keep CDN**: Jangan hapus CDN links sampai siap production
2. **Test Responsiveness**: Cek di berbagai ukuran layar
3. **Browser Compatibility**: Test di Chrome, Firefox, Safari
4. **Console Errors**: Check browser console untuk errors
5. **Use DevTools**: Inspect elements untuk debugging

### Saat Integrasi:
1. **Component-Based**: Pecah menjadi reusable components
2. **API First**: Design API contract dulu
3. **State Management**: Gunakan proper state management
4. **Error Boundaries**: Implement error handling
5. **Loading States**: Tambahkan loading indicators
6. **Validation**: Implement both client & server validation

---

## 📖 Reference Links

### Technologies Used:
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Alpine.js**: https://alpinejs.dev/start-here
- **Font Awesome**: https://fontawesome.com/icons
- **Chart.js**: https://www.chartjs.org/docs

### Learning Resources:
- Tailwind UI Components: https://tailwindui.com
- Alpine.js Examples: https://alpinejs.dev/examples
- HTML Best Practices: https://developer.mozilla.org/en-US/docs/Web/HTML

---

## 🤝 Support

Untuk pertanyaan atau issues:
1. Check dokumentasi Tailwind/Alpine
2. Review code comments di HTML files
3. Test di browser console
4. Check network tab untuk API calls (setelah integrasi)

---

## 📝 Notes

- **Version**: Static Prototypes v1.0
- **Last Updated**: 2025-10-30
- **Purpose**: Design reference & development guide
- **Status**: ✅ Ready for development reference

---

**Happy Coding! 🚀**

Gunakan UI ini sebagai referensi untuk development React components!
