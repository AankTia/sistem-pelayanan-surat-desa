import React, { useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// ==================== API SETUP ====================
// Create axios instance with default config
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses and errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If unauthorized, clear token and redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('admin_user');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/admin/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// API endpoints
const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/me');
        return response.data;
    },
};

const userAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    update: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('admin_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);

            if (response.success) {
                const userData = response.data.user;
                const token = response.data.token;

                // Store user and token
                setUser(userData);
                localStorage.setItem('admin_user', JSON.stringify(userData));
                localStorage.setItem('auth_token', token);

                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Continue with local logout even if API call fails
            console.error('Logout API error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('admin_user');
            localStorage.removeItem('auth_token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

// ==================== DUMMY DATA ====================
const STATS_DATA = {
    today: 12,
    week: 45,
    month: 167,
    total: 1234
};

const CHART_DATA = [
    { name: 'Jan', surat: 65 },
    { name: 'Feb', surat: 78 },
    { name: 'Mar', surat: 90 },
    { name: 'Apr', surat: 81 },
    { name: 'Mei', surat: 95 },
    { name: 'Jun', surat: 87 }
];

const LETTER_TYPES_DATA = [
    { name: 'Domisili', value: 45 },
    { name: 'Usaha', value: 30 },
    { name: 'Tidak Mampu', value: 25 },
    { name: 'Pengantar', value: 20 },
    { name: 'Lainnya', value: 15 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const RECENT_REQUESTS = [
    { id: 1, nik: '3201234567890001', name: 'Budi Santoso', type: 'Surat Domisili', status: 'pending', date: '2025-11-01 09:30' },
    { id: 2, nik: '3201234567890002', name: 'Siti Nurhaliza', type: 'Surat Usaha', status: 'approved', date: '2025-11-01 08:15' },
    { id: 3, nik: '3201234567890003', name: 'Ahmad Yani', type: 'Surat Tidak Mampu', status: 'pending', date: '2025-10-31 16:45' },
    { id: 4, nik: '3201234567890004', name: 'Dewi Lestari', type: 'Surat Pengantar KTP', status: 'rejected', date: '2025-10-31 14:20' },
    { id: 5, nik: '3201234567890005', name: 'Joko Widodo', type: 'Surat Domisili', status: 'approved', date: '2025-10-31 11:00' }
];

const USERS_DATA = [
    { id: 1, nik: '3201234567890001', name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin', status: 'active' },
    { id: 2, nik: '3201234567890002', name: 'Siti Nurhaliza', email: 'siti@example.com', role: 'Staff', status: 'active' },
    { id: 3, nik: '3201234567890003', name: 'Ahmad Yani', email: 'ahmad@example.com', role: 'Staff', status: 'inactive' }
];

const RESIDENTS_DATA = [
    { id: 1, nik: '3201234567890001', name: 'Budi Santoso', address: 'Jl. Merdeka No. 123', rt: '001', rw: '002', phone: '08123456789' },
    { id: 2, nik: '3201234567890002', name: 'Siti Nurhaliza', address: 'Jl. Sudirman No. 45', rt: '002', rw: '003', phone: '08234567890' },
    { id: 3, nik: '3201234567890003', name: 'Ahmad Yani', address: 'Jl. Gatot Subroto No. 67', rt: '003', rw: '001', phone: '08345678901' }
];

const LOG_ACTIVITY = [
    { id: 1, user: 'Admin', action: 'Login', details: 'Login successful', timestamp: '2025-11-01 10:30:00', ip: '192.168.1.1' },
    { id: 2, user: 'Staff', action: 'Approve Letter', details: 'Approved Surat Domisili #123', timestamp: '2025-11-01 10:25:00', ip: '192.168.1.2' },
    { id: 3, user: 'Admin', action: 'Create User', details: 'Created new staff account', timestamp: '2025-11-01 10:15:00', ip: '192.168.1.1' }
];

// ==================== LAYOUT COMPONENTS ====================
function Header() {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Sistem Pelayanan Surat Desa</h1>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <i className="fas fa-bell text-xl"></i>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold">Notifikasi</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-4 hover:bg-gray-50 border-b">
                                        <p className="text-sm font-medium">Permohonan surat baru</p>
                                        <p className="text-xs text-gray-500">Budi Santoso mengajukan surat domisili</p>
                                        <p className="text-xs text-gray-400 mt-1">5 menit lalu</p>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 border-b">
                                        <p className="text-sm font-medium">Surat disetujui</p>
                                        <p className="text-xs text-gray-500">Surat usaha telah disetujui</p>
                                        <p className="text-xs text-gray-400 mt-1">1 jam lalu</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: 'fa-home', label: 'Dashboard' },
        // { path: '/admin/charts', icon: 'fa-chart-line', label: 'Grafik Aktivitas' },
        // { path: '/admin/requests', icon: 'fa-file-alt', label: 'Permohonan Surat', badge: 5 },
        { path: '/admin/users', icon: 'fa-users-cog', label: 'User Management' },
        // { path: '/admin/residents', icon: 'fa-users', label: 'Penduduk' },
        // { path: '/admin/reports', icon: 'fa-chart-bar', label: 'Reports' },
        { path: '/admin/access', icon: 'fa-shield-alt', label: 'Role Access Management' },
        // { path: '/admin/settings', icon: 'fa-cog', label: 'Settings' },
        // { path: '/admin/logs', icon: 'fa-history', label: 'Log Activity' }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-0 lg:w-20'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-4 border-b border-blue-700">
                        {isOpen ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <i className="fas fa-landmark text-2xl"></i>
                                        <span className="text-lg font-bold">Desa App</span>
                                    </div>
                                    <button onClick={toggleSidebar} className="lg:hidden">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                {/* User Info */}
                                <div className="flex items-center space-x-3 p-3 bg-blue-700 bg-opacity-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                        <span className="text-blue-800 font-bold text-lg">{user?.name?.[0] || 'A'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{user?.roles?.[0] || 'User'}</p>
                                        <p className="text-xs text-blue-200 truncate">{user?.email || 'admin@example.com'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex justify-center">
                                <i className="fas fa-landmark text-2xl"></i>
                            </div>
                        )}
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 transition-colors ${
                                    location.pathname === item.path
                                        ? 'bg-blue-700 text-white'
                                        : 'text-blue-100 hover:bg-blue-700'
                                }`}
                            >
                                <i className={`fas ${item.icon} ${isOpen ? 'mr-3' : 'mx-auto'} text-lg`}></i>
                                {isOpen && (
                                    <div className="flex items-center justify-between flex-1">
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    {isOpen && (
                        <div className="border-t border-blue-700 p-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                <i className="fas fa-sign-out-alt mr-3 text-lg"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

function Breadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/admin/dashboard" className="hover:text-blue-600">
                <i className="fas fa-home"></i>
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                return (
                    <React.Fragment key={name}>
                        <i className="fas fa-chevron-right text-xs"></i>
                        {isLast ? (
                            <span className="text-gray-800 font-medium capitalize">{name}</span>
                        ) : (
                            <Link to={routeTo} className="hover:text-blue-600 capitalize">
                                {name}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-8">
            <div className="text-center text-sm text-gray-600">
                <p>&copy; 2025 Sistem Surat Desa. All rights reserved.</p>
            </div>
        </footer>
    );
}

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                <Header />

                <main className="flex-1 p-6">
                    {/* Toggle Button for Desktop */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:block mb-4 p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                    >
                        <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mb-4 p-2 bg-white rounded-lg shadow"
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    <Breadcrumb />
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}

// ==================== PAGES ====================
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                        <i className="fas fa-lock text-blue-600 text-4xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-gray-600 mt-2">Sistem Surat Desa</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Demo credentials:</strong><br />
                        Email: superadmin@example.com<br />
                        Password: password
                    </p>
                </div>
            </div>
        </div>
    );
}

function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hari Ini</p>
                            <p className="text-3xl font-bold text-blue-600">{STATS_DATA.today}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <i className="fas fa-calendar-day text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Minggu Ini</p>
                            <p className="text-3xl font-bold text-green-600">{STATS_DATA.week}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <i className="fas fa-calendar-week text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Bulan Ini</p>
                            <p className="text-3xl font-bold text-amber-600">{STATS_DATA.month}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <i className="fas fa-calendar-alt text-amber-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Surat</p>
                            <p className="text-3xl font-bold text-purple-600">{STATS_DATA.total}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <i className="fas fa-file-alt text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Tren Pengajuan Surat</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={CHART_DATA}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="surat" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Surat per Jenis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={LETTER_TYPES_DATA}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {LETTER_TYPES_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Permohonan Terbaru</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Surat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {RECENT_REQUESTS.slice(0, 5).map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{request.name}</td>
                                    <td className="px-6 py-4">{request.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{request.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ChartsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Grafik Aktivitas Surat</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Pengajuan per Bulan</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={CHART_DATA}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="surat" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Distribusi Jenis Surat</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={LETTER_TYPES_DATA}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {LETTER_TYPES_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function RequestsPage() {
    const [filter, setFilter] = useState('all');

    const filteredRequests = filter === 'all'
        ? RECENT_REQUESTS
        : RECENT_REQUESTS.filter(r => r.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Permohonan Surat</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    <i className="fas fa-plus mr-2"></i> Tambah Surat
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
                <span className="text-sm font-medium">Filter:</span>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                    Semua
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                >
                    Rejected
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Surat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{request.nik}</td>
                                <td className="px-6 py-4 font-medium">{request.name}</td>
                                <td className="px-6 py-4">{request.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{request.date}</td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 mr-3">
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="text-red-600 hover:text-red-800">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UsersPage() {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [pagination, setPagination] = React.useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });
    const [search, setSearch] = React.useState('');
    const [showModal, setShowModal] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        roles: []
    });
    const [formErrors, setFormErrors] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);

    const fetchUsers = async (page = 1, searchQuery = search) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userAPI.getAll({
                per_page: pagination.per_page,
                page: page,
                search: searchQuery
            });

            if (response.success) {
                setUsers(response.data.users);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1, search);
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            username: '',
            password: '',
            password_confirmation: '',
            roles: []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditUser = async (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            username: user.username,
            password: '',
            password_confirmation: '',
            roles: user.roles || []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setSubmitting(true);
            const response = await userAPI.delete(selectedUser.id);

            if (response.success) {
                setShowDeleteConfirm(false);
                setSelectedUser(null);
                fetchUsers(pagination.current_page);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setSubmitting(true);

        try {
            let response;
            if (selectedUser) {
                // Update existing user
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                    delete updateData.password_confirmation;
                }
                response = await userAPI.update(selectedUser.id, updateData);
            } else {
                // Create new user
                response = await userAPI.create(formData);
            }

            if (response.success) {
                setShowModal(false);
                setSelectedUser(null);
                fetchUsers(pagination.current_page);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                alert(err.response?.data?.message || 'Failed to save user');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRoleChange = (roleName) => {
        setFormData(prev => {
            const roles = prev.roles.includes(roleName)
                ? prev.roles.filter(r => r !== roleName)
                : [...prev.roles, roleName];
            return { ...prev, roles };
        });
    };

    const availableRoles = ['Super Admin', 'Admin', 'Staff', 'Operator'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button
                    onClick={handleCreateUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i> Tambah User
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        <i className="fas fa-search mr-2"></i> Search
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                        <p className="mt-4 text-gray-600">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-users text-4xl text-gray-400"></i>
                        <p className="mt-4 text-gray-600">No users found</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No role</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                                                title="Edit user"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete user"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                                <div className="text-sm text-gray-700">
                                    Showing {users.length} of {pagination.total} users
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span className="px-4 py-2 text-gray-700">
                                        Page {pagination.current_page} of {pagination.last_page}
                                    </span>
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {selectedUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.name[0]}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {formErrors.username && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.username[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!selectedUser && <span className="text-red-500">*</span>}
                                    {selectedUser && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required={!selectedUser}
                                />
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password[0]}</p>
                                )}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password {!selectedUser && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={!selectedUser || formData.password}
                                />
                            </div>

                            {/* Roles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Roles
                                </label>
                                <div className="space-y-2">
                                    {availableRoles.map(role => (
                                        <label key={role} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(role)}
                                                onChange={() => handleRoleChange(role)}
                                                className="mr-2 rounded"
                                            />
                                            <span className="text-sm text-gray-700">{role}</span>
                                        </label>
                                    ))}
                                </div>
                                {formErrors.roles && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.roles[0]}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        selectedUser ? 'Update User' : 'Create User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete user <strong>{selectedUser.name}</strong>?
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete User'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResidentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Data Penduduk</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    <i className="fas fa-plus mr-2"></i> Tambah Penduduk
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT/RW</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {RESIDENTS_DATA.map((resident) => (
                            <tr key={resident.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{resident.nik}</td>
                                <td className="px-6 py-4 font-medium">{resident.name}</td>
                                <td className="px-6 py-4">{resident.address}</td>
                                <td className="px-6 py-4">{resident.rt}/{resident.rw}</td>
                                <td className="px-6 py-4">{resident.phone}</td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 mr-3">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="text-red-600 hover:text-red-800">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <i className="fas fa-file-pdf text-blue-600 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold">Laporan Bulanan</h3>
                            <p className="text-sm text-gray-600">Download PDF</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <i className="fas fa-file-excel text-green-600 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold">Export Data</h3>
                            <p className="text-sm text-gray-600">Download Excel</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <i className="fas fa-chart-pie text-purple-600 text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="font-semibold">Statistik</h3>
                            <p className="text-sm text-gray-600">View Analytics</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Generate Custom Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Dari Tanggal</label>
                        <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Sampai Tanggal</label>
                        <input type="date" className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Jenis Surat</label>
                        <select className="w-full px-4 py-2 border rounded-lg">
                            <option>Semua</option>
                            <option>Domisili</option>
                            <option>Usaha</option>
                            <option>Tidak Mampu</option>
                        </select>
                    </div>
                </div>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                    Generate Report
                </button>
            </div>
        </div>
    );
}

function AccessManagementPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Access Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Roles</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Administrator</p>
                                <p className="text-sm text-gray-600">Full access</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                                <i className="fas fa-edit"></i>
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Staff</p>
                                <p className="text-sm text-gray-600">Limited access</p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                                <i className="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" checked readOnly />
                            <span>View Letters</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" checked readOnly />
                            <span>Approve Letters</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span>Delete Letters</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" checked readOnly />
                            <span>Manage Users</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nama Desa</label>
                            <input
                                type="text"
                                defaultValue="Desa Sejahtera"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Kode Desa</label>
                            <input
                                type="text"
                                defaultValue="32.01.01.2001"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Alamat</label>
                            <textarea
                                className="w-full px-4 py-2 border rounded-lg"
                                rows="3"
                                defaultValue="Jl. Raya Desa No. 1, Kecamatan Makmur"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">SMTP Host</label>
                            <input
                                type="text"
                                defaultValue="smtp.gmail.com"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">SMTP Port</label>
                            <input
                                type="text"
                                defaultValue="587"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email From</label>
                            <input
                                type="email"
                                defaultValue="admin@desasejahtera.id"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                    Simpan Perubahan
                </button>
            </div>
        </div>
    );
}

function LogsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Log Activity</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {LOG_ACTIVITY.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{log.user}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">{log.details}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.ip}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==================== PROTECTED ROUTE ====================
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/admin/login" replace />;
}

// ==================== MAIN APP ====================
function AdminApp() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route path="/admin/*" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Routes>
                                    <Route path="dashboard" element={<DashboardPage />} />
                                    <Route path="charts" element={<ChartsPage />} />
                                    <Route path="requests" element={<RequestsPage />} />
                                    <Route path="users" element={<UsersPage />} />
                                    <Route path="residents" element={<ResidentsPage />} />
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="access" element={<AccessManagementPage />} />
                                    <Route path="settings" element={<SettingsPage />} />
                                    <Route path="logs" element={<LogsPage />} />
                                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/admin/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

// Mount when ready
if (typeof window !== 'undefined') {
    const mountApp = () => {
        const rootElement = document.getElementById('admin-root');
        if (rootElement) {
            const root = createRoot(rootElement);
            root.render(<AdminApp />);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountApp);
    } else {
        mountApp();
    }
}
