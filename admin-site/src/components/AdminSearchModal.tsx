import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { adminSearchableModules, type AdminSearchableModule } from '../data/searchableModules';
import { apiService } from '@/services/api';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ClockIcon,
    ChevronRightIcon,
    ArrowRightCircleIcon
} from "@heroicons/react/24/outline";

interface AdminSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminSearchModal: React.FC<AdminSearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [moduleResults, setModuleResults] = useState<AdminSearchableModule[]>([]);
    const [dynamicResults, setDynamicResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<AdminSearchableModule[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { user, permissions, hasPermission } = useAuth();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches and manage body scroll
    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem(`admin_recent_searches_${user?.id || 'admin'}`);
            if (stored) {
                const parsed: string[] = JSON.parse(stored);
                // For now, recent searches only include static modules as they are predictable
                const filteredRecent = adminSearchableModules
                    .filter(mod => parsed.includes(mod.id))
                    .filter(mod => !mod.permission || (permissions && permissions.includes(mod.permission)));

                const orderedRecent = parsed
                    .map(id => filteredRecent.find(m => m.id === id))
                    .filter(Boolean) as AdminSearchableModule[];

                setRecentSearches(orderedRecent.slice(0, 5));
            }

            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setModuleResults([]);
            setDynamicResults([]);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, user, permissions]);

    // Async multi-module search with debounce
    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length === 0) {
                setModuleResults([]);
                setDynamicResults([]);
                return;
            }

            setLoading(true);
            try {
                // Perform local module filter first (fast)
                const filteredModules = adminSearchableModules.filter(mod => {
                    const matchesQuery = mod.title.toLowerCase().includes(query.toLowerCase()) ||
                        mod.description.toLowerCase().includes(query.toLowerCase());
                    const hasAccess = !mod.permission || (permissions && permissions.includes(mod.permission));
                    return matchesQuery && hasAccess;
                });
                setModuleResults(filteredModules);

                // Fetch from APIs in parallel, but only if user has permission
                const fetchPromises = [
                    hasPermission('view-departments') ? apiService.getDepartments(1, 5, { keyword: query }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-doctors') ? apiService.getDoctors(1, 5, { keyword: query }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-services') ? apiService.getServices(1, 5, { keyword: query }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-services') ? apiService.getHomeCareServices().then(res => ({
                        ...res,
                        data: res.data?.filter((s: any) => s.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5) || []
                    })).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-patients') ? apiService.getPatients(1, 5, query).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-appointments') ? apiService.getAppointments(1, { keyword: query, per_page: 5 }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-bills') ? apiService.getBills({ keyword: query, per_page: 5 }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-staff') ? apiService.getStaff(1, 5, { keyword: query }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
                    hasPermission('view-medicines') ? apiService.getMedicines({ search: query, per_page: 5 }).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] })
                ];

                const [deptRes, docRes, serviceRes, homeCareRes, patientRes, appointmentRes, billRes, staffRes, medicineRes] = await Promise.all(fetchPromises);

                const combinedDynamics: any[] = [];

                if (deptRes.success && deptRes.data) {
                    deptRes.data.forEach((d: any) => combinedDynamics.push({
                        id: d.id,
                        title: d.name,
                        description: d.category || 'Department',
                        path: `/dashboard/departments?view=${d.id}`,
                        type: 'Department',
                        icon: 'bi-building'
                    }));
                }

                if (docRes.success && docRes.data) {
                    docRes.data.forEach((d: any) => combinedDynamics.push({
                        id: d.id,
                        title: `Dr. ${d.first_name} ${d.last_name}`,
                        description: d.specialization || 'Medical Specialist',
                        path: `/dashboard/doctors?view=${d.id}`,
                        type: 'Doctor',
                        icon: 'bi-person-vcard'
                    }));
                }

                if (serviceRes.success && serviceRes.data) {
                    serviceRes.data.forEach((s: any) => combinedDynamics.push({
                        id: s.id,
                        title: s.name,
                        description: s.category || 'Hospital Service',
                        path: `/dashboard/services?view=${s.id}`,
                        type: 'Service',
                        icon: 'bi-clipboard2-pulse'
                    }));
                }

                if (homeCareRes.success && homeCareRes.data) {
                    homeCareRes.data.forEach((s: any) => combinedDynamics.push({
                        id: s.id,
                        title: s.title,
                        description: s.category || 'Home Care Service',
                        path: `/dashboard/home-care?tab=services&view=${s.id}`,
                        type: 'Home Care',
                        icon: 'bi-house-heart'
                    }));
                }

                if (patientRes.success && patientRes.data) {
                    const patients = Array.isArray(patientRes.data) ? patientRes.data : patientRes.data.data || [];
                    patients.slice(0, 5).forEach((p: any) => combinedDynamics.push({
                        id: p.id,
                        title: p.name,
                        description: p.phone || p.email || 'Patient Record',
                        path: `/dashboard/patients?view=${p.id}`,
                        type: 'Patient',
                        icon: 'bi-person-circle'
                    }));
                }

                if (appointmentRes.success && appointmentRes.data) {
                    const appointments = Array.isArray(appointmentRes.data) ? appointmentRes.data : appointmentRes.data.data || [];
                    appointments.slice(0, 5).forEach((a: any) => combinedDynamics.push({
                        id: a.id,
                        title: `Appt #${a.id} - ${a.patient?.name || 'Unknown'}`,
                        description: `${a.appointment_date} at ${a.appointment_time}`,
                        path: `/dashboard/appointments?view=${a.id}`,
                        type: 'Appointment',
                        icon: 'bi-calendar-check'
                    }));
                }

                if (billRes.success && billRes.data) {
                    const bills = Array.isArray(billRes.data) ? billRes.data : billRes.data.data || [];
                    bills.slice(0, 5).forEach((b: any) => combinedDynamics.push({
                        id: b.id,
                        title: `Bill #${b.id} - ${b.patient?.name || 'Unknown'}`,
                        description: `Status: ${b.status} | Total: ${b.total_amount}`,
                        path: `/dashboard/billing?view=${b.id}`,
                        type: 'Bill',
                        icon: 'bi-receipt'
                    }));
                }

                if (staffRes.success && staffRes.data) {
                    const staffMembers = Array.isArray(staffRes.data) ? staffRes.data : staffRes.data.data || [];
                    staffMembers.slice(0, 5).forEach((s: any) => combinedDynamics.push({
                        id: s.id,
                        title: s.name,
                        description: s.role_name || 'Staff Member',
                        path: `/dashboard/staff?view=${s.id}`,
                        type: 'Staff',
                        icon: 'bi-people'
                    }));
                }

                if (medicineRes.success && medicineRes.data) {
                    const medicines = Array.isArray(medicineRes.data) ? medicineRes.data : medicineRes.data.data || [];
                    medicines.slice(0, 5).forEach((m: any) => combinedDynamics.push({
                        id: m.id,
                        title: m.name,
                        description: `${m.category} | Stock: ${m.current_stock}`,
                        path: `/dashboard/inventory?view=${m.id}`,
                        type: 'Medicine',
                        icon: 'bi-capsule'
                    }));
                }

                setDynamicResults(combinedDynamics);
                setSelectedIndex(0);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeout);
    }, [query, permissions]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            const allResults = [...moduleResults, ...dynamicResults];
            const items = query.trim().length === 0 ? recentSearches : allResults;
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % items.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[selectedIndex]) {
                    handleSelect(items[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, query, moduleResults, dynamicResults, recentSearches, selectedIndex]);

    const clearRecentSearches = () => {
        localStorage.removeItem(`admin_recent_searches_${user?.id || 'admin'}`);
        setRecentSearches([]);
    };

    const handleSelect = (module: any) => {
        // Only save static modules to recent searches for now
        if (module.id && !module.type) {
            const stored = localStorage.getItem(`admin_recent_searches_${user?.id || 'admin'}`);
            let recentIds: string[] = stored ? JSON.parse(stored) : [];
            recentIds = [module.id, ...recentIds.filter(id => id !== module.id)].slice(0, 5);
            localStorage.setItem(`admin_recent_searches_${user?.id || 'admin'}`, JSON.stringify(recentIds));
        }

        // If it's a dynamic result (has 'type'), append the current search query to the path
        // This helps the destination page filter to only relevant results, ensuring the record is visible.
        let targetPath = module.path;
        if (module.type && query.trim()) {
            const separator = targetPath.includes('?') ? '&' : '?';
            targetPath = `${targetPath}${separator}keyword=${encodeURIComponent(query.trim())}`;
        }

        navigate(targetPath);
        onClose();
    };

    const renderResultItem = (item: any, index: number, isGlobalOffset = 0) => {
        const currentIndex = index + isGlobalOffset;
        return (
            <div
                key={item.id + (item.type || 'mod')}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(currentIndex)}
                className={`group flex items-center p-3.5 rounded-xl cursor-pointer transition-all ${selectedIndex === currentIndex
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/20'
                    : 'hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20'
                    }`}
            >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selectedIndex === currentIndex ? 'bg-white/20' : 'bg-blue-gray-50 group-hover:bg-white/20'
                    }`}>
                    <i className={`bi ${item.icon || 'bi-dot'} text-xl transition-colors ${selectedIndex === currentIndex ? 'text-white' : 'text-blue-gray-400 group-hover:text-white'
                        }`} />
                </div>
                <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`text-[14px] font-bold transition-colors ${selectedIndex === currentIndex ? 'text-white' : 'text-blue-gray-900 group-hover:text-white'
                            }`}>{item.title}</p>
                        {item.type && (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none tracking-tighter ${selectedIndex === currentIndex ? 'bg-white/20 text-white' : 'bg-blue-gray-100 text-blue-gray-500 group-hover:bg-white/20 group-hover:text-white'
                                }`}>{item.type}</span>
                        )}
                    </div>
                    <p className={`text-xs font-medium transition-colors ${selectedIndex === currentIndex ? 'text-blue-100' : 'text-blue-gray-500 group-hover:text-blue-100'
                        } line-clamp-1`}>{item.description}</p>
                </div>
                <div className={`hidden sm:flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${selectedIndex === currentIndex
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-blue-gray-50 text-blue-gray-400 border-blue-gray-100/50 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20'
                    }`}>
                    Open <ChevronRightIcon className="w-2.5 h-2.5" />
                </div>
            </div>
        );
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[10002] flex items-start justify-center pt-[12vh] px-4 sm:px-0">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-gray-900/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        {/* Main Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-gray-100 overflow-hidden flex flex-col max-h-[75vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Header */}
                            <div className="flex items-center px-6 py-5 border-b border-blue-gray-50 gap-4 bg-white sticky top-0 z-10">
                                <div className="relative">
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <MagnifyingGlassIcon className="w-6 h-6 text-blue-500 stroke-[2.5]" />
                                    )}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search patients, appointments, medicines, or modules..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-blue-gray-900 placeholder:text-blue-gray-300"
                                />
                                <div className="flex items-center gap-2">
                                    <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold bg-blue-gray-50 text-blue-gray-400 border border-blue-gray-100 rounded-md">ESC</kbd>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-blue-gray-50 text-blue-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 stroke-[2]" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
                                {query.trim().length === 0 ? (
                                    <div className="space-y-6">
                                        {recentSearches.length > 0 && (
                                            <div className="px-2">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        Recent Searches
                                                    </h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearRecentSearches();
                                                        }}
                                                        className="text-[10px] font-bold text-blue-gray-400 hover:text-red-500 uppercase tracking-tighter transition-colors"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>
                                                <div className="space-y-1">
                                                    {recentSearches.map((mod, index) => renderResultItem(mod, index))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="px-2">
                                            <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest mb-3">Quick Links</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {adminSearchableModules
                                                    .filter(mod => !mod.permission || hasPermission(mod.permission))
                                                    .slice(0, 4)
                                                    .map(mod => (
                                                        <div
                                                            key={mod.id}
                                                            onClick={() => handleSelect(mod)}
                                                            className="p-4 rounded-xl border border-blue-gray-50 bg-blue-gray-50/30 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group cursor-pointer"
                                                        >
                                                            <span className="text-sm font-bold text-blue-gray-800 group-hover:text-blue-600 block">{mod.title}</span>
                                                            <span className="text-[11px] text-blue-gray-500 font-medium mt-1 line-clamp-1">{mod.description}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-2">
                                        {(moduleResults.length > 0 || dynamicResults.length > 0) ? (
                                            <div className="space-y-6">
                                                {moduleResults.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest mb-3 px-1">Modules</h3>
                                                        <div className="space-y-1">
                                                            {moduleResults.map((mod, index) => renderResultItem(mod, index))}
                                                        </div>
                                                    </div>
                                                )}

                                                {dynamicResults.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest mb-3 px-1">Detailed Findings</h3>
                                                        <div className="space-y-1">
                                                            {dynamicResults.map((item, index) => renderResultItem(item, index, moduleResults.length))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : !loading && (
                                            <div className="py-20 text-center">
                                                <div className="w-16 h-16 bg-blue-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-gray-100">
                                                    <MagnifyingGlassIcon className="w-8 h-8 text-blue-gray-200" />
                                                </div>
                                                <p className="text-blue-gray-900 font-bold text-lg">No Results Found</p>
                                                <p className="text-blue-gray-400 text-sm mt-1">Try searching for keywords like patients, billing or specific doctors.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-blue-gray-50/50 border-t border-blue-gray-100 flex justify-between items-center text-blue-gray-400">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest">MediTrust Search</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight">
                                    <span>↑↓ to navigate</span>
                                    <span className="w-1 h-1 bg-blue-gray-200 rounded-full"></span>
                                    <span>Enter to select</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
        </>
    );
};

export default AdminSearchModal;
