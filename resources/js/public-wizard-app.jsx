import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useReactToPrint } from 'react-to-print';

// Dummy data
const DUMMY_CITIZEN_DATA = {
    nik: '3201234567890001',
    name: 'BUDI SANTOSO',
    birthPlace: 'Jakarta',
    birthDate: '15 Januari 1990',
    gender: 'Laki-laki',
    religion: 'Islam',
    maritalStatus: 'Kawin',
    occupation: 'Karyawan Swasta',
    nationality: 'Indonesia',
    address: 'Jl. Merdeka No. 123',
    rt: '001',
    rw: '002',
    village: 'Kelurahan Sejahtera',
    district: 'Kecamatan Makmur',
    city: 'Kota Jakarta Pusat',
    province: 'DKI Jakarta'
};

const CATEGORIES = [
    {
        id: 1,
        name: 'Surat Keterangan',
        slug: 'surat-keterangan',
        description: 'Berbagai jenis surat keterangan',
        icon: 'fas fa-certificate',
        iconColor: '#3B82F6',
        colorClass: 'from-blue-500 to-blue-600',
        count: 8
    },
    {
        id: 2,
        name: 'Surat Pengantar',
        slug: 'surat-pengantar',
        description: 'Surat pengantar untuk berbagai keperluan',
        icon: 'fas fa-file-alt',
        iconColor: '#10B981',
        colorClass: 'from-green-500 to-green-600',
        count: 6
    },
    {
        id: 3,
        name: 'Surat Izin',
        slug: 'surat-izin',
        description: 'Surat izin kegiatan dan usaha',
        icon: 'fas fa-stamp',
        iconColor: '#F59E0B',
        colorClass: 'from-amber-500 to-amber-600',
        count: 5
    },
    {
        id: 4,
        name: 'Surat Domisili',
        slug: 'surat-domisili',
        description: 'Surat keterangan domisili',
        icon: 'fas fa-home',
        iconColor: '#8B5CF6',
        colorClass: 'from-purple-500 to-purple-600',
        count: 4
    },
    {
        id: 5,
        name: 'Surat Kematian',
        slug: 'surat-kematian',
        description: 'Surat keterangan kematian',
        icon: 'fas fa-cross',
        iconColor: '#6B7280',
        colorClass: 'from-gray-500 to-gray-600',
        count: 2
    },
    {
        id: 6,
        name: 'Surat Kelahiran',
        slug: 'surat-kelahiran',
        description: 'Surat keterangan kelahiran',
        icon: 'fas fa-baby',
        iconColor: '#EC4899',
        colorClass: 'from-pink-500 to-pink-600',
        count: 2
    }
];

const LETTERS = {
    'surat-keterangan': [
        { id: 1, name: 'Surat Keterangan Usaha', slug: 'sku', description: 'Keterangan untuk usaha' },
        { id: 2, name: 'Surat Keterangan Tidak Mampu', slug: 'sktm', description: 'Keterangan ekonomi tidak mampu' },
        { id: 3, name: 'Surat Keterangan Domisili', slug: 'skd', description: 'Keterangan tempat tinggal' },
        { id: 4, name: 'Surat Keterangan Belum Menikah', slug: 'skbm', description: 'Keterangan status belum menikah' }
    ],
    'surat-pengantar': [
        { id: 5, name: 'Surat Pengantar KTP', slug: 'sp-ktp', description: 'Pengantar pembuatan KTP' },
        { id: 6, name: 'Surat Pengantar KK', slug: 'sp-kk', description: 'Pengantar pembuatan KK' },
        { id: 7, name: 'Surat Pengantar SKCK', slug: 'sp-skck', description: 'Pengantar pembuatan SKCK' }
    ],
    'surat-izin': [
        { id: 8, name: 'Surat Izin Keramaian', slug: 'sik', description: 'Izin mengadakan acara' },
        { id: 9, name: 'Surat Izin Usaha', slug: 'siu', description: 'Izin membuka usaha' }
    ],
    'surat-domisili': [
        { id: 10, name: 'Surat Keterangan Domisili Perusahaan', slug: 'skdp', description: 'Domisili untuk perusahaan' }
    ],
    'surat-kematian': [
        { id: 11, name: 'Surat Keterangan Kematian', slug: 'skk', description: 'Keterangan kematian penduduk' }
    ],
    'surat-kelahiran': [
        { id: 12, name: 'Surat Keterangan Kelahiran', slug: 'skkel', description: 'Keterangan kelahiran bayi' }
    ]
};

function PublicLetterWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [nik, setNik] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [citizenData, setCitizenData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const printRef = useRef();

    // Step 1: NIK Validation
    const validateNik = (e) => {
        e.preventDefault();
        setError('');

        if (nik.length !== 16) {
            setError('NIK harus terdiri dari 16 digit');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            if (nik === '3201234567890001') {
                setCitizenData(DUMMY_CITIZEN_DATA);
                setCurrentStep(2);
            } else {
                setError('Data tidak ditemukan. Silakan mendatangi petugas untuk registrasi.');
            }
        }, 1500);
    };

    // Step 2: Confirm Citizen Data
    const confirmData = () => {
        setCurrentStep(3);
    };

    // Step 3: Select Category
    const selectCategory = (category) => {
        setSelectedCategory(category);
        setCurrentStep(4);
    };

    // Step 4: Select Letter
    const selectLetter = (letter) => {
        setSelectedLetter(letter);
        setCurrentStep(5);
    };

    // Step 5: Submit Form
    const submitForm = (e) => {
        e.preventDefault();
        setCurrentStep(6);
    };

    // Step 6: Go to Print
    const goToPrint = () => {
        setCurrentStep(7);
    };

    // Step 7: Print
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const filteredCategories = searchQuery
        ? CATEGORIES.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : CATEGORIES;

    const availableLetters = selectedCategory ? LETTERS[selectedCategory.slug] || [] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {currentStep > 1 && (
                            <button onClick={handleBack} className="text-gray-600 hover:text-gray-800">
                                <i className="fas fa-arrow-left mr-2"></i>
                                Kembali
                            </button>
                        )}
                        <div className={`flex items-center space-x-4 ${currentStep === 1 ? 'mx-auto' : ''}`}>
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <i className="fas fa-landmark text-white text-xl"></i>
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-gray-800">Sistem Pembuatan Surat</h1>
                                {citizenData && currentStep > 1 && (
                                    <p className="text-xs text-gray-600">Halo, {citizenData.name}</p>
                                )}
                            </div>
                        </div>
                        {currentStep > 1 && <div className="w-20"></div>}
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            {currentStep > 1 && currentStep < 7 && (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center space-x-2 md:space-x-4 overflow-x-auto">
                        {[
                            { num: 1, label: 'Validasi NIK', completed: currentStep > 1 },
                            { num: 2, label: 'Konfirmasi', completed: currentStep > 2 },
                            { num: 3, label: 'Pilih Kategori', completed: currentStep > 3 },
                            { num: 4, label: 'Pilih Surat', completed: currentStep > 4 },
                            { num: 5, label: 'Isi Form', completed: currentStep > 5 },
                            { num: 6, label: 'Preview', completed: currentStep > 6 }
                        ].map((step, index) => (
                            <React.Fragment key={step.num}>
                                {index > 0 && (
                                    <div className={`w-8 md:w-16 h-1 ${step.completed || currentStep >= step.num ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                )}
                                <div className="flex items-center flex-shrink-0">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm md:text-base ${
                                        step.completed ? 'bg-green-500' : currentStep === step.num ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}>
                                        {step.completed ? <i className="fas fa-check"></i> : step.num}
                                    </div>
                                    <span className={`ml-1 md:ml-2 text-xs md:text-sm font-medium hidden sm:inline ${
                                        step.completed ? 'text-green-600' : currentStep === step.num ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                {/* Step 1: NIK Validation */}
                {currentStep === 1 && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                                <i className="fas fa-id-card text-blue-600 text-4xl"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
                            <p className="text-gray-600">Masukkan NIK Anda untuk memulai pembuatan surat</p>
                        </div>

                        <form onSubmit={validateNik} className="space-y-6">
                            <div>
                                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nomor Induk Kependudukan (NIK)
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="nik"
                                        value={nik}
                                        onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        maxLength="16"
                                        placeholder="Masukkan 16 digit NIK"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                            error ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    <div className="absolute right-3 top-3 text-gray-400">
                                        {nik.length}/16
                                    </div>
                                </div>
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                                <p className="mt-2 text-sm text-gray-500">
                                    <i className="fas fa-info-circle"></i> NIK terdapat pada Kartu Tanda Penduduk (KTP) Anda
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || nik.length !== 16}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Memvalidasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle"></i>
                                        <span>Validasi NIK</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <i className="fas fa-clock text-blue-600 text-2xl mb-2"></i>
                                <p className="text-sm text-gray-600">Proses Cepat</p>
                                <p className="text-xs text-gray-500">~10 menit</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <i className="fas fa-shield-alt text-green-600 text-2xl mb-2"></i>
                                <p className="text-sm text-gray-600">Data Aman</p>
                                <p className="text-xs text-gray-500">Terenkripsi</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <i className="fas fa-file-alt text-purple-600 text-2xl mb-2"></i>
                                <p className="text-sm text-gray-600">Mudah Digunakan</p>
                                <p className="text-xs text-gray-500">Self-service</p>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-800">Butuh Bantuan?</p>
                                    <p className="text-sm text-yellow-700">
                                        Jika NIK Anda tidak ditemukan, silakan hubungi petugas desa untuk registrasi data.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
                            <p className="text-sm text-gray-600">
                                <i className="fas fa-flask"></i> Demo Mode: Gunakan NIK <strong>3201234567890001</strong> untuk testing
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Citizen Data Confirmation */}
                {currentStep === 2 && citizenData && (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                                <i className="fas fa-user-check text-green-600 text-4xl"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Data Ditemukan</h2>
                            <p className="text-gray-600">Pastikan data di bawah ini sesuai dengan identitas Anda</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    <i className="fas fa-user mr-2 text-blue-600"></i>
                                    Informasi Pribadi
                                </h3>

                                {[
                                    { label: 'NIK', value: citizenData.nik },
                                    { label: 'Nama Lengkap', value: citizenData.name },
                                    { label: 'Tempat, Tanggal Lahir', value: `${citizenData.birthPlace}, ${citizenData.birthDate}` },
                                    { label: 'Jenis Kelamin', value: citizenData.gender },
                                    { label: 'Agama', value: citizenData.religion },
                                    { label: 'Status Perkawinan', value: citizenData.maritalStatus },
                                    { label: 'Pekerjaan', value: citizenData.occupation },
                                    { label: 'Kewarganegaraan', value: citizenData.nationality }
                                ].map((item, idx) => (
                                    <div key={idx}>
                                        <label className="text-sm text-gray-500">{item.label}</label>
                                        <p className="font-medium text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    <i className="fas fa-map-marker-alt mr-2 text-blue-600"></i>
                                    Alamat
                                </h3>

                                <div>
                                    <label className="text-sm text-gray-500">Alamat Lengkap</label>
                                    <p className="font-medium text-gray-800">{citizenData.address}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500">RT</label>
                                        <p className="font-medium text-gray-800">{citizenData.rt}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">RW</label>
                                        <p className="font-medium text-gray-800">{citizenData.rw}</p>
                                    </div>
                                </div>

                                {[
                                    { label: 'Desa/Kelurahan', value: citizenData.village },
                                    { label: 'Kecamatan', value: citizenData.district },
                                    { label: 'Kabupaten/Kota', value: citizenData.city },
                                    { label: 'Provinsi', value: citizenData.province }
                                ].map((item, idx) => (
                                    <div key={idx}>
                                        <label className="text-sm text-gray-500">{item.label}</label>
                                        <p className="font-medium text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <div className="flex items-center">
                                <i className="fas fa-question-circle text-blue-600 text-xl mr-3"></i>
                                <p className="font-medium text-gray-800">
                                    Apakah data di atas sudah sesuai dengan identitas Anda?
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Tidak, Batal
                            </button>
                            <button
                                onClick={confirmData}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                            >
                                <i className="fas fa-check mr-2"></i>
                                Ya, Lanjutkan
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <i className="fas fa-info-circle text-yellow-600 mt-1"></i>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-800">Perhatian</p>
                                    <p className="text-sm text-yellow-700">
                                        Jika ada data yang tidak sesuai atau perlu diperbarui, silakan hubungi petugas desa.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Category Selection */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pilih Kategori Surat</h2>
                            <p className="text-gray-600">Silakan pilih kategori surat yang Anda butuhkan</p>
                        </div>

                        <div className="max-w-md mx-auto mb-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kategori atau jenis surat..."
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCategories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => selectCategory(category)}
                                    className={`group cursor-pointer bg-gradient-to-br ${category.colorClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <i className={`${category.icon} text-4xl`} style={{ color: category.iconColor }}></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                                        <p className="text-white text-opacity-90 text-sm mb-4">{category.description}</p>
                                        <div className="bg-white bg-opacity-20 px-4 py-1 rounded-full">
                                            <span className="text-white text-xs">{category.count} jenis surat</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredCategories.length === 0 && (
                            <div className="text-center py-12">
                                <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
                                <p className="text-gray-500 text-lg">Kategori tidak ditemukan</p>
                                <p className="text-gray-400 text-sm">Coba kata kunci lain</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Letter Selection */}
                {currentStep === 4 && selectedCategory && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pilih Jenis Surat</h2>
                            <p className="text-gray-600">Kategori: {selectedCategory.name}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableLetters.map((letter) => (
                                <div
                                    key={letter.id}
                                    onClick={() => selectLetter(letter)}
                                    className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 transition-all hover:shadow-lg"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i className="fas fa-file-alt text-blue-600 text-xl"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{letter.name}</h3>
                                            <p className="text-sm text-gray-600">{letter.description}</p>
                                        </div>
                                        <i className="fas fa-chevron-right text-gray-400"></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Form Input */}
                {currentStep === 5 && selectedLetter && (
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Isi Data Surat</h2>
                            <p className="text-gray-600">{selectedLetter.name}</p>
                        </div>

                        <form onSubmit={submitForm} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keperluan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.purpose || ''}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    placeholder="Contoh: Melamar pekerjaan"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keterangan Tambahan
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Tambahkan keterangan jika diperlukan"
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                <div className="flex items-start space-x-3">
                                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                                    <p className="text-sm text-blue-800">
                                        Pastikan data yang Anda masukkan sudah benar sebelum melanjutkan.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                            >
                                <i className="fas fa-arrow-right mr-2"></i>
                                Lanjut ke Preview
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 6: Preview */}
                {currentStep === 6 && (
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Preview Data</h2>
                            <p className="text-gray-600">Periksa kembali data Anda sebelum mencetak</p>
                        </div>

                        <div className="border-2 border-gray-200 rounded-lg p-6 mb-6">
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Jenis Surat:</span>
                                    <span className="text-gray-900">{selectedLetter.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Nama:</span>
                                    <span className="text-gray-900">{citizenData.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">NIK:</span>
                                    <span className="text-gray-900">{citizenData.nik}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Alamat:</span>
                                    <span className="text-gray-900">{citizenData.address}, RT {citizenData.rt}/RW {citizenData.rw}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">Keperluan:</span>
                                    <span className="text-gray-900">{formData.purpose}</span>
                                </div>
                                {formData.notes && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="font-medium text-gray-700">Keterangan:</span>
                                        <span className="text-gray-900">{formData.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setCurrentStep(5)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                            >
                                <i className="fas fa-edit mr-2"></i>
                                Edit Data
                            </button>
                            <button
                                onClick={goToPrint}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                            >
                                <i className="fas fa-print mr-2"></i>
                                Cetak PDF
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 7: Print */}
                {currentStep === 7 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Siap Dicetak</h2>
                                <p className="text-gray-600">Klik tombol di bawah untuk mencetak surat Anda</p>
                            </div>

                            <button
                                onClick={handlePrint}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
                            >
                                <i className="fas fa-print mr-2"></i>
                                Cetak Sekarang
                            </button>
                        </div>

                        {/* Printable Content */}
                        <div ref={printRef} className="bg-white p-12 shadow-xl">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">PEMERINTAH DESA SEJAHTERA</h1>
                                <h2 className="text-xl font-bold mb-1">KECAMATAN MAKMUR</h2>
                                <h3 className="text-lg font-bold mb-4">KABUPATEN/KOTA JAKARTA PUSAT</h3>
                                <div className="border-t-4 border-black w-full mb-2"></div>
                                <div className="border-t border-black w-full"></div>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold underline mb-2">{selectedLetter.name.toUpperCase()}</h2>
                                <p className="text-sm">Nomor: 001/SKT/DS/2025</p>
                            </div>

                            <div className="mb-8 text-justify leading-relaxed">
                                <p className="mb-4 indent-8">Yang bertanda tangan di bawah ini Kepala Desa Sejahtera, Kecamatan Makmur, Kabupaten/Kota Jakarta Pusat, Provinsi DKI Jakarta, menerangkan bahwa:</p>

                                <div className="ml-8 mb-4 space-y-2">
                                    <div className="flex">
                                        <span className="w-40">Nama</span>
                                        <span className="mr-4">:</span>
                                        <span className="font-semibold">{citizenData.name}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-40">NIK</span>
                                        <span className="mr-4">:</span>
                                        <span>{citizenData.nik}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-40">Tempat/Tgl Lahir</span>
                                        <span className="mr-4">:</span>
                                        <span>{citizenData.birthPlace}, {citizenData.birthDate}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-40">Jenis Kelamin</span>
                                        <span className="mr-4">:</span>
                                        <span>{citizenData.gender}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-40">Pekerjaan</span>
                                        <span className="mr-4">:</span>
                                        <span>{citizenData.occupation}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-40">Alamat</span>
                                        <span className="mr-4">:</span>
                                        <span>{citizenData.address}, RT {citizenData.rt}/RW {citizenData.rw}, {citizenData.village}</span>
                                    </div>
                                </div>

                                <p className="mb-4 indent-8">
                                    Adalah benar penduduk Desa Sejahtera dan surat ini dibuat untuk keperluan <strong>{formData.purpose}</strong>.
                                </p>

                                {formData.notes && (
                                    <p className="mb-4 indent-8">
                                        Keterangan: {formData.notes}
                                    </p>
                                )}

                                <p className="indent-8">
                                    Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                                </p>
                            </div>

                            <div className="flex justify-end mt-12">
                                <div className="text-center" style={{ minWidth: '250px' }}>
                                    <p className="mb-1">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="mb-16">Kepala Desa Sejahtera</p>
                                    <p className="font-bold underline">H. ABDUL RAHMAN, S.Sos</p>
                                    <p className="text-sm">NIP. 197001011990031001</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
                <p className="text-sm">&copy; 2025 Desa/Kelurahan Sejahtera. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Mount when ready
if (typeof window !== 'undefined') {
    const mountApp = () => {
        const rootElement = document.getElementById('public-wizard-root');
        if (rootElement) {
            const root = createRoot(rootElement);
            root.render(<PublicLetterWizard />);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountApp);
    } else {
        mountApp();
    }
}
