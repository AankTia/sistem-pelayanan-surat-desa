import React, { useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Underline, Strikethrough, Alignment, Link as CKLink, Image, ImageUpload, BlockQuote, FontColor, FontBackgroundColor, Table, TableToolbar, TableProperties, TableCellProperties, Indent, IndentBlock } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
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

const roleAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/roles', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    create: async (roleData) => {
        const response = await api.post('/roles', roleData);
        return response.data;
    },

    update: async (id, roleData) => {
        const response = await api.put(`/roles/${id}`, roleData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    },

    assignPermissions: async (id, permissions) => {
        const response = await api.post(`/roles/${id}/permissions`, { permissions });
        return response.data;
    },
};

const permissionAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/permissions', { params });
        return response.data;
    },

    getAllSimple: async () => {
        const response = await api.get('/permissions/all');
        return response.data;
    },

    getGrouped: async () => {
        const response = await api.get('/permissions', { params: { grouped: true } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/permissions/${id}`);
        return response.data;
    },
};

const letterCategoryAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/letter-categories', { params });
        return response.data;
    },

    getAllSimple: async () => {
        const response = await api.get('/letter-categories/all');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/letter-categories/${id}`);
        return response.data;
    },

    create: async (categoryData) => {
        const response = await api.post('/letter-categories', categoryData);
        return response.data;
    },

    update: async (id, categoryData) => {
        const response = await api.put(`/letter-categories/${id}`, categoryData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/letter-categories/${id}`);
        return response.data;
    },

    reorder: async (categories) => {
        const response = await api.post('/letter-categories/reorder', { categories });
        return response.data;
    },
};

const letterTemplateAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/letter-templates', { params });
        return response.data;
    },

    getAllSimple: async (params = {}) => {
        const response = await api.get('/letter-templates/all', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/letter-templates/${id}`);
        return response.data;
    },

    create: async (templateData) => {
        const response = await api.post('/letter-templates', templateData);
        return response.data;
    },

    update: async (id, templateData) => {
        const response = await api.put(`/letter-templates/${id}`, templateData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/letter-templates/${id}`);
        return response.data;
    },
};

const activityLogAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/activity-logs', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/activity-logs/${id}`);
        return response.data;
    },

    getLogNames: async () => {
        const response = await api.get('/activity-logs/log-names');
        return response.data;
    },

    getEvents: async () => {
        const response = await api.get('/activity-logs/events');
        return response.data;
    },

    cleanup: async (days) => {
        const response = await api.post('/activity-logs/cleanup', { days });
        return response.data;
    },
};

// ==================== TOAST NOTIFICATION SYSTEM ====================
const ToastContext = createContext();

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in ${
                            toast.type === 'success'
                                ? 'bg-green-500 text-white'
                                : toast.type === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                        }`}
                    >
                        <i className={`fas ${
                            toast.type === 'success' ? 'fa-check-circle' :
                            toast.type === 'error' ? 'fa-exclamation-circle' :
                            'fa-info-circle'
                        } mr-3 text-xl`}></i>
                        <span className="flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
}

function useToast() {
    return useContext(ToastContext);
}

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
    const [expandedMenus, setExpandedMenus] = useState(['letter-management']);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev =>
            prev.includes(menuKey)
                ? prev.filter(k => k !== menuKey)
                : [...prev, menuKey]
        );
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: 'fa-home', label: 'Dashboard' },
        // { path: '/admin/charts', icon: 'fa-chart-line', label: 'Grafik Aktivitas' },
        // { path: '/admin/requests', icon: 'fa-file-alt', label: 'Permohonan Surat', badge: 5 },
        {
            key: 'letter-management',
            icon: 'fa-file-alt',
            label: 'Letter Management',
            children: [
                { path: '/admin/letter-categories', icon: 'fa-folder', label: 'Categories' },
                { path: '/admin/letter-templates', icon: 'fa-file-text', label: 'Templates' },
            ]
        },
        { path: '/admin/users', icon: 'fa-users-cog', label: 'User Management' },
        // { path: '/admin/residents', icon: 'fa-users', label: 'Penduduk' },
        // { path: '/admin/reports', icon: 'fa-chart-bar', label: 'Reports' },
        { path: '/admin/access', icon: 'fa-shield-alt', label: 'Role Access Management' },
        { path: '/admin/activity-logs', icon: 'fa-history', label: 'Activity Logs' },
        // { path: '/admin/settings', icon: 'fa-cog', label: 'Settings' }
    ];

    const renderMenuItem = (item) => {
        // Collapsable menu item
        if (item.children) {
            const isExpanded = expandedMenus.includes(item.key);
            const hasActiveChild = item.children.some(child => location.pathname === child.path);

            return (
                <div key={item.key}>
                    <button
                        onClick={() => isOpen && toggleMenu(item.key)}
                        className={`w-full flex items-center px-4 py-3 transition-colors ${
                            hasActiveChild
                                ? 'bg-blue-700 text-white'
                                : 'text-blue-100 hover:bg-blue-700'
                        }`}
                    >
                        <i className={`fas ${item.icon} ${isOpen ? 'mr-3' : 'mx-auto'} text-lg`}></i>
                        {isOpen && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>
                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-sm`}></i>
                            </>
                        )}
                    </button>
                    {isOpen && isExpanded && (
                        <div className="bg-blue-900 bg-opacity-50">
                            {item.children.map(child => (
                                <Link
                                    key={child.path}
                                    to={child.path}
                                    className={`flex items-center px-4 py-2 pl-12 transition-colors ${
                                        location.pathname === child.path
                                            ? 'bg-blue-600 text-white'
                                            : 'text-blue-100 hover:bg-blue-700'
                                    }`}
                                >
                                    <i className={`fas ${child.icon} mr-3 text-sm`}></i>
                                    <span className="text-sm">{child.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Regular menu item
        return (
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
        );
    };

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
                        {menuItems.map(item => renderMenuItem(item))}
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

function LetterCategoryPage() {
    const { showToast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'fa-solid fa-file',
        order: '',
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const iconOptions = [
        'fa-solid fa-file',
        'fa-solid fa-id-card',
        'fa-solid fa-ring',
        'fa-solid fa-briefcase',
        'fa-solid fa-landmark',
        'fa-solid fa-scale-balanced',
        'fa-solid fa-envelope-open-text',
        'fa-solid fa-seedling',
        'fa-solid fa-home',
        'fa-solid fa-users',
        'fa-solid fa-graduation-cap',
        'fa-solid fa-hospital',
        'fa-solid fa-building',
        'fa-solid fa-car',
        'fa-solid fa-heart',
        'fa-solid fa-flag',
    ];

    const fetchCategories = async (page = 1, searchQuery = search, status = statusFilter) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                per_page: pagination.per_page,
                page: page,
            };
            if (searchQuery) params.search = searchQuery;
            if (status) params.status = status;

            const response = await letterCategoryAPI.getAll(params);

            if (response.success) {
                setCategories(response.data.categories);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load categories';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCategories(1, search, statusFilter);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        fetchCategories(1, search, status);
    };

    const handleCreateClick = () => {
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: 'fa-solid fa-file',
            order: '',
            status: 'active'
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || 'fa-solid fa-file',
            order: category.order || '',
            status: category.status
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setShowDeleteConfirm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setSubmitting(true);

        try {
            const dataToSubmit = { ...formData };
            if (dataToSubmit.order === '') {
                delete dataToSubmit.order;
            }

            if (selectedCategory) {
                const response = await letterCategoryAPI.update(selectedCategory.id, dataToSubmit);
                if (response.success) {
                    setShowModal(false);
                    fetchCategories(pagination.current_page);
                    showToast('Category updated successfully!', 'success');
                }
            } else {
                const response = await letterCategoryAPI.create(dataToSubmit);
                if (response.success) {
                    setShowModal(false);
                    fetchCategories(1);
                    showToast('Category created successfully!', 'success');
                }
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showToast('Please fix the validation errors', 'error');
            } else {
                const errorMessage = err.response?.data?.message || 'Failed to save category';
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const response = await letterCategoryAPI.delete(selectedCategory.id);
            if (response.success) {
                setShowDeleteConfirm(false);
                fetchCategories(pagination.current_page);
                showToast('Category deleted successfully!', 'success');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete category';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setShowDeleteConfirm(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Letter Categories</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage letter categories and their templates</p>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Add Category</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search categories..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                <i className="fas fa-search"></i>
                            </button>
                        </form>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleStatusFilter('')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleStatusFilter('active')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleStatusFilter('inactive')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">No categories found</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Templates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{category.order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <i className={`${category.icon} text-blue-600 text-lg mr-3`}></i>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                    <div className="text-xs text-gray-500">{category.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                                            <p className="line-clamp-2">{category.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {category.templates_count} templates
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                category.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {category.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(category)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                            {pagination.total} categories
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => fetchCategories(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchCategories(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">
                                {selectedCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formErrors.description && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.description[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                            className={`p-3 border rounded-lg hover:bg-gray-50 ${
                                                formData.icon === icon
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <i className={`${icon} text-xl`}></i>
                                        </button>
                                    ))}
                                </div>
                                {formErrors.icon && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.icon[0]}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleFormChange}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {formErrors.order && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.order[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {formErrors.status && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.status[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Category</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete "{selectedCategory.name}"?
                                {selectedCategory.templates_count > 0 && (
                                    <span className="block mt-2 text-red-600 text-sm">
                                        This category has {selectedCategory.templates_count} template(s) and cannot be deleted.
                                    </span>
                                )}
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting || selectedCategory.templates_count > 0}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// CKEditor Component
function CKEditorComponent({ value, onChange }) {
    const [isPreview, setIsPreview] = React.useState(false);

    return (
        <div className="border border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 p-2 border-b border-gray-300 bg-gray-50">
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        type="button"
                        onClick={() => setIsPreview(false)}
                        className={`px-3 py-1 text-sm rounded ${!isPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        <i className="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPreview(true)}
                        className={`px-3 py-1 text-sm rounded ${isPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        <i className="fas fa-eye mr-1"></i> Preview
                    </button>
                </div>
            </div>

            {!isPreview && (
                <div className="p-4 ckeditor-wrapper">
                    <CKEditor
                        editor={ClassicEditor}
                        data={value || ''}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            onChange(data);
                        }}
                        config={{
                            licenseKey: 'GPL',
                            plugins: [
                                Essentials,
                                Bold,
                                Italic,
                                Underline,
                                Strikethrough,
                                Paragraph,
                                Heading,
                                List,
                                Alignment,
                                CKLink,
                                BlockQuote,
                                FontColor,
                                FontBackgroundColor,
                                Undo,
                                Table,
                                TableToolbar,
                                TableProperties,
                                TableCellProperties,
                                Indent,
                                IndentBlock,
                            ],
                            toolbar: [
                                'undo', 'redo',
                                '|',
                                'heading',
                                '|',
                                'bold', 'italic', 'underline', 'strikethrough',
                                '|',
                                'fontColor', 'fontBackgroundColor',
                                '|',
                                'bulletedList', 'numberedList',
                                '|',
                                'outdent', 'indent',
                                '|',
                                'alignment',
                                '|',
                                'link', 'blockQuote',
                                '|',
                                'insertTable',
                            ],
                            heading: {
                                options: [
                                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                                ]
                            },
                            table: {
                                contentToolbar: [
                                    'tableColumn', 'tableRow', 'mergeTableCells',
                                    'tableProperties', 'tableCellProperties'
                                ]
                            },
                            placeholder: 'Enter the HTML template with placeholders like {{field_name}}',
                        }}
                    />
                    <style>{`
                        .ckeditor-wrapper .ck-editor__editable {
                            min-height: 300px;
                        }
                    `}</style>
                </div>
            )}

            {isPreview && (
                <div className="p-4 min-h-[300px] bg-white">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">No content to preview</p>' }} />
                </div>
            )}
        </div>
    );
}

function LetterTemplatePage() {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        letter_category_id: '',
        name: '',
        code: '',
        fields: [],
        template_html: '',
        signature_type: 'digital',
        status: 'active'
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fieldTypes = ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio'];

    const fetchTemplates = async (page = 1, searchQuery = search, status = statusFilter, categoryId = categoryFilter) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                per_page: pagination.per_page,
                page: page,
            };
            if (searchQuery) params.search = searchQuery;
            if (status) params.status = status;
            if (categoryId) params.category_id = categoryId;

            const response = await letterTemplateAPI.getAll(params);

            if (response.success) {
                setTemplates(response.data.templates);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load templates';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await letterCategoryAPI.getAllSimple();
            if (response.success) {
                setCategories(response.data.categories);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    React.useEffect(() => {
        fetchCategories();
        fetchTemplates();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTemplates(1, search, statusFilter, categoryFilter);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        fetchTemplates(1, search, status, categoryFilter);
    };

    const handleCategoryFilter = (categoryId) => {
        setCategoryFilter(categoryId);
        fetchTemplates(1, search, statusFilter, categoryId);
    };

    const handleCreateClick = () => {
        setSelectedTemplate(null);
        setFormData({
            letter_category_id: '',
            name: '',
            code: '',
            fields: [],
            template_html: '',
            signature_type: 'digital',
            status: 'active'
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditClick = (template) => {
        setSelectedTemplate(template);

        // Parse fields if it's a JSON string
        let parsedFields = [];
        if (template.fields) {
            if (typeof template.fields === 'string') {
                try {
                    parsedFields = JSON.parse(template.fields);
                } catch (e) {
                    console.error('Failed to parse fields:', e);
                    parsedFields = [];
                }
            } else if (Array.isArray(template.fields)) {
                parsedFields = template.fields;
            }
        }

        setFormData({
            letter_category_id: template.letter_category?.id || '',
            name: template.name,
            code: template.code,
            fields: parsedFields,
            template_html: template.template_html || '',
            signature_type: template.signature_type,
            status: template.status
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (template) => {
        setSelectedTemplate(template);
        setShowDeleteConfirm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({
            ...prev,
            template_html: content
        }));
        if (formErrors.template_html) {
            setFormErrors(prev => ({
                ...prev,
                template_html: null
            }));
        }
    };

    const handleAddField = () => {
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, {
                name: '',
                label: '',
                type: 'text',
                placeholder: '',
                required: false,
                options: []
            }]
        }));
    };

    const handleRemoveField = (index) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleFieldChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const handleFieldOptionChange = (fieldIndex, optionIndex, value) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => {
                if (i === fieldIndex) {
                    const options = [...(f.options || [])];
                    options[optionIndex] = value;
                    return { ...f, options };
                }
                return f;
            })
        }));
    };

    const handleAddFieldOption = (fieldIndex) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => {
                if (i === fieldIndex) {
                    return { ...f, options: [...(f.options || []), ''] };
                }
                return f;
            })
        }));
    };

    const handleRemoveFieldOption = (fieldIndex, optionIndex) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => {
                if (i === fieldIndex) {
                    return { ...f, options: f.options.filter((_, oi) => oi !== optionIndex) };
                }
                return f;
            })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setSubmitting(true);

        try {
            const dataToSubmit = { ...formData };

            if (selectedTemplate) {
                const response = await letterTemplateAPI.update(selectedTemplate.id, dataToSubmit);
                if (response.success) {
                    setShowModal(false);
                    fetchTemplates(pagination.current_page);
                    showToast('Template updated successfully!', 'success');
                }
            } else {
                const response = await letterTemplateAPI.create(dataToSubmit);
                if (response.success) {
                    setShowModal(false);
                    fetchTemplates(1);
                    showToast('Template created successfully!', 'success');
                }
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
                showToast('Please fix the validation errors', 'error');
            } else {
                const errorMessage = err.response?.data?.message || 'Failed to save template';
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const response = await letterTemplateAPI.delete(selectedTemplate.id);
            if (response.success) {
                setShowDeleteConfirm(false);
                fetchTemplates(pagination.current_page);
                showToast('Template deleted successfully!', 'success');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete template';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setShowDeleteConfirm(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Letter Templates</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage letter templates and their form fields</p>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Add Template</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col space-y-4">
                        <form onSubmit={handleSearch} className="flex space-x-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search templates..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                <i className="fas fa-search"></i>
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`px-4 py-2 rounded-lg ${statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('active')}
                                    className={`px-4 py-2 rounded-lg ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('inactive')}
                                    className={`px-4 py-2 rounded-lg ${statusFilter === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-file-alt text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">No templates found</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fields</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signature</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                                <div className="text-xs text-gray-500">{template.code}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {template.letter_category ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                    {template.letter_category.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No category</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                {template.fields?.length || 0} fields
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                template.signature_type === 'digital'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {template.signature_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                template.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(template)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(template)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                            {pagination.total} templates
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => fetchTemplates(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchTemplates(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">
                                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="letter_category_id"
                                        value={formData.letter_category_id}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.letter_category_id && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.letter_category_id[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleFormChange}
                                        placeholder="e.g., SKTM-001"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {formErrors.code && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.code[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {formErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Form Fields <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddField}
                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        <i className="fas fa-plus mr-1"></i> Add Field
                                    </button>
                                </div>

                                {formData.fields.length === 0 ? (
                                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                                        No fields added yet. Click "Add Field" to create form fields.
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4">
                                        {formData.fields.map((field, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-700">Field #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveField(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                            placeholder="e.g., applicant_name"
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                                            placeholder="e.g., Applicant Name"
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {fieldTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                                                        <input
                                                            type="text"
                                                            value={field.placeholder}
                                                            onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="flex items-center space-x-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                                                className="rounded border-gray-300"
                                                            />
                                                            <span className="text-xs font-medium text-gray-600">Required</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {['select', 'checkbox', 'radio'].includes(field.type) && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-xs font-medium text-gray-600">Options</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddFieldOption(index)}
                                                                className="text-xs text-blue-600 hover:text-blue-700"
                                                            >
                                                                <i className="fas fa-plus mr-1"></i> Add Option
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(field.options || []).map((option, optIndex) => (
                                                                <div key={optIndex} className="flex space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => handleFieldOptionChange(index, optIndex, e.target.value)}
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFieldOption(index, optIndex)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {formErrors.fields && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.fields[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template HTML <span className="text-red-500">*</span>
                                </label>
                                <CKEditorComponent
                                    value={formData.template_html}
                                    onChange={handleEditorChange}
                                />
                                {formErrors.template_html && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.template_html[0]}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Signature Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="signature_type"
                                        value={formData.signature_type}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="digital">Digital</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                    {formErrors.signature_type && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.signature_type[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {formErrors.status && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.status[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : selectedTemplate ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Template</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete "{selectedTemplate.name}"? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActivityLogPage() {
    const { showToast } = useToast();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });
    const [search, setSearch] = useState('');
    const [logNameFilter, setLogNameFilter] = useState('');
    const [eventFilter, setEventFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [logNames, setLogNames] = useState([]);
    const [events, setEvents] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [cleanupDays, setCleanupDays] = useState(30);
    const [cleaning, setCleaning] = useState(false);

    const fetchActivities = async (page = 1, searchQuery = search, logName = logNameFilter, event = eventFilter, dateFrom = dateFromFilter, dateTo = dateToFilter) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                per_page: pagination.per_page,
                page: page,
            };
            if (searchQuery) params.search = searchQuery;
            if (logName) params.log_name = logName;
            if (event) params.event = event;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const response = await activityLogAPI.getAll(params);

            if (response.success) {
                setActivities(response.data.activities);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load activity logs';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilters = async () => {
        try {
            const [logNamesRes, eventsRes] = await Promise.all([
                activityLogAPI.getLogNames(),
                activityLogAPI.getEvents()
            ]);

            if (logNamesRes.success) {
                setLogNames(logNamesRes.data.log_names);
            }
            if (eventsRes.success) {
                setEvents(eventsRes.data.events);
            }
        } catch (err) {
            console.error('Error fetching filters:', err);
        }
    };

    React.useEffect(() => {
        fetchFilters();
        fetchActivities();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchActivities(1, search, logNameFilter, eventFilter, dateFromFilter, dateToFilter);
    };

    const handleFilterChange = () => {
        fetchActivities(1, search, logNameFilter, eventFilter, dateFromFilter, dateToFilter);
    };

    const handleClearFilters = () => {
        setSearch('');
        setLogNameFilter('');
        setEventFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        fetchActivities(1, '', '', '', '', '');
    };

    const handleViewDetail = (activity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    const handleCleanup = async () => {
        setCleaning(true);
        try {
            const response = await activityLogAPI.cleanup(cleanupDays);
            if (response.success) {
                setShowCleanupModal(false);
                fetchActivities(pagination.current_page);
                showToast(response.message, 'success');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to cleanup logs';
            showToast(errorMessage, 'error');
        } finally {
            setCleaning(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getEventBadgeColor = (event) => {
        switch (event) {
            case 'created':
                return 'bg-green-100 text-green-800';
            case 'updated':
                return 'bg-blue-100 text-blue-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>
                            <p className="text-sm text-gray-600 mt-1">View system activity and user actions</p>
                        </div>
                        <button
                            onClick={() => setShowCleanupModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                            <i className="fas fa-trash-alt"></i>
                            <span>Cleanup Old Logs</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="mt-6 space-y-4">
                        <form onSubmit={handleSearch} className="flex space-x-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search logs..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                <i className="fas fa-search"></i>
                            </button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Log Name</label>
                                <select
                                    value={logNameFilter}
                                    onChange={(e) => { setLogNameFilter(e.target.value); handleFilterChange(); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Logs</option>
                                    {logNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                                <select
                                    value={eventFilter}
                                    onChange={(e) => { setEventFilter(e.target.value); handleFilterChange(); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Events</option>
                                    {events.map(event => (
                                        <option key={event} value={event}>{event}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateFromFilter}
                                    onChange={(e) => { setDateFromFilter(e.target.value); handleFilterChange(); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateToFilter}
                                    onChange={(e) => { setDateToFilter(e.target.value); handleFilterChange(); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {(search || logNameFilter || eventFilter || dateFromFilter || dateToFilter) && (
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                <i className="fas fa-times mr-1"></i> Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-history text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">No activity logs found</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Log Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Causer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activities.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(activity.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                {activity.log_name || 'default'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getEventBadgeColor(activity.event)}`}>
                                                {activity.event || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                            <p className="line-clamp-2">{activity.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {activity.causer ? activity.causer.name : 'System'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetail(activity)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                            {pagination.total} logs
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => fetchActivities(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchActivities(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">Activity Log Details</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                                <p className="text-sm text-gray-900">{selectedActivity.id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Log Name</label>
                                <p className="text-sm text-gray-900">{selectedActivity.log_name || 'default'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getEventBadgeColor(selectedActivity.event)}`}>
                                    {selectedActivity.event || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-sm text-gray-900">{selectedActivity.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Causer</label>
                                <p className="text-sm text-gray-900">
                                    {selectedActivity.causer ? `${selectedActivity.causer.name} (${selectedActivity.causer.type})` : 'System'}
                                </p>
                            </div>

                            {selectedActivity.subject && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedActivity.subject.type} (ID: {selectedActivity.subject.id})
                                    </p>
                                </div>
                            )}

                            {selectedActivity.properties && Object.keys(selectedActivity.properties).length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
                                    <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                                        {JSON.stringify(selectedActivity.properties, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                                <p className="text-sm text-gray-900">{formatDate(selectedActivity.created_at)}</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cleanup Modal */}
            {showCleanupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <i className="fas fa-trash-alt text-red-600 text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Cleanup Old Activity Logs</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Delete activity logs older than the specified number of days. This action cannot be undone.
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delete logs older than (days)</label>
                                <input
                                    type="number"
                                    value={cleanupDays}
                                    onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCleanupModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={cleaning}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCleanup}
                                    disabled={cleaning}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cleaning ? 'Cleaning...' : 'Cleanup'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AccessManagementPage() {
    const [roles, setRoles] = React.useState([]);
    const [groupedPermissions, setGroupedPermissions] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [selectedRole, setSelectedRole] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        permissions: []
    });
    const [formErrors, setFormErrors] = React.useState({});
    const [submitting, setSubmitting] = React.useState(false);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await roleAPI.getAll({ per_page: 100 });

            if (response.success) {
                setRoles(response.data.roles);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load roles');
            console.error('Error fetching roles:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await permissionAPI.getGrouped();
            if (response.success) {
                setGroupedPermissions(response.data.permissions);
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
        }
    };

    React.useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleCreateRole = () => {
        setSelectedRole(null);
        setFormData({
            name: '',
            permissions: []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            permissions: role.permissions || []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (role) => {
        setSelectedRole(role);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setSubmitting(true);
            const response = await roleAPI.delete(selectedRole.id);

            if (response.success) {
                setShowDeleteConfirm(false);
                setSelectedRole(null);
                fetchRoles();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete role');
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
            if (selectedRole) {
                response = await roleAPI.update(selectedRole.id, formData);
            } else {
                response = await roleAPI.create(formData);
            }

            if (response.success) {
                setShowModal(false);
                setSelectedRole(null);
                fetchRoles();
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                alert(err.response?.data?.message || 'Failed to save role');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePermissionChange = (permissionName) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permissionName)
                ? prev.permissions.filter(p => p !== permissionName)
                : [...prev.permissions, permissionName];
            return { ...prev, permissions };
        });
    };

    const toggleCategoryPermissions = (categoryPermissions) => {
        const categoryPermissionNames = categoryPermissions.map(p => p.name);
        const allSelected = categoryPermissionNames.every(p => formData.permissions.includes(p));

        setFormData(prev => {
            if (allSelected) {
                return {
                    ...prev,
                    permissions: prev.permissions.filter(p => !categoryPermissionNames.includes(p))
                };
            } else {
                const newPermissions = [...new Set([...prev.permissions, ...categoryPermissionNames])];
                return { ...prev, permissions: newPermissions };
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Role Access Management</h1>
                <button
                    onClick={handleCreateRole}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i> Create Role
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                    <p className="mt-4 text-gray-600">Loading roles...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">{role.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Edit role"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(role)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Delete role"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Permissions:</span>
                                        <span className="font-semibold text-blue-600">
                                            {role.permissions_count}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Users:</span>
                                        <span className="font-semibold text-green-600">
                                            {role.users_count}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Assigned Permissions:</p>
                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {role.permissions && role.permissions.length > 0 ? (
                                            role.permissions.slice(0, 8).map((permission, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                                >
                                                    {permission}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs">No permissions assigned</span>
                                        )}
                                        {role.permissions && role.permissions.length > 8 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                +{role.permissions.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Role Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {selectedRole ? 'Edit Role' : 'Create New Role'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Role Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role Name <span className="text-red-500">*</span>
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

                            {/* Permissions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Permissions
                                </label>
                                <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                                        <div key={category} className="border-b border-gray-100 pb-4 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-800">{category}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategoryPermissions(permissions)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    {permissions.every(p => formData.permissions.includes(p.name))
                                                        ? 'Deselect All'
                                                        : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {permissions.map((permission) => (
                                                    <label
                                                        key={permission.id}
                                                        className="flex items-center space-x-2 text-sm hover:bg-gray-50 p-2 rounded cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(permission.name)}
                                                            onChange={() => handlePermissionChange(permission.name)}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700">{permission.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {formErrors.permissions && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.permissions[0]}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-600">
                                    Selected: {formData.permissions.length} permissions
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
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
                                        selectedRole ? 'Update Role' : 'Create Role'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete role <strong>{selectedRole.name}</strong>?
                            </p>
                            {selectedRole.users_count > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        This role is assigned to {selectedRole.users_count} user(s) and cannot be deleted.
                                    </p>
                                </div>
                            )}
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
                                disabled={submitting || selectedRole.users_count > 0}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Role'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
        <ToastProvider>
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
                                        <Route path="letter-categories" element={<LetterCategoryPage />} />
                                        <Route path="letter-templates" element={<LetterTemplatePage />} />
                                        <Route path="users" element={<UsersPage />} />
                                        <Route path="residents" element={<ResidentsPage />} />
                                        <Route path="reports" element={<ReportsPage />} />
                                        <Route path="access" element={<AccessManagementPage />} />
                                        <Route path="activity-logs" element={<ActivityLogPage />} />
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
        </ToastProvider>
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
