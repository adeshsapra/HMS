import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { adminSearchableModules, type AdminSearchableModule } from '../data/searchableModules';
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
    const [results, setResults] = useState<AdminSearchableModule[]>([]);
    const [recentSearches, setRecentSearches] = useState<AdminSearchableModule[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { user, permissions } = useAuth();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches and manage body scroll
    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem(`admin_recent_searches_${user?.id || 'admin'}`);
            if (stored) {
                const parsed: string[] = JSON.parse(stored);
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
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, user, permissions]);

    // Handle filtering
    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = adminSearchableModules.filter(mod => {
                const matchesQuery = mod.title.toLowerCase().includes(query.toLowerCase()) ||
                    mod.description.toLowerCase().includes(query.toLowerCase());
                const hasAccess = !mod.permission || (permissions && permissions.includes(mod.permission));
                return matchesQuery && hasAccess;
            });
            setResults(filtered);
            setSelectedIndex(0);
        } else {
            setResults([]);
            setSelectedIndex(0);
        }
    }, [query, permissions]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            const items = query.trim().length === 0 ? recentSearches : results;
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
    }, [isOpen, query, results, recentSearches, selectedIndex]);

    const clearRecentSearches = () => {
        localStorage.removeItem(`admin_recent_searches_${user?.id || 'admin'}`);
        setRecentSearches([]);
    };

    const handleSelect = (module: AdminSearchableModule) => {
        const stored = localStorage.getItem(`admin_recent_searches_${user?.id || 'admin'}`);
        let recentIds: string[] = stored ? JSON.parse(stored) : [];
        recentIds = [module.id, ...recentIds.filter(id => id !== module.id)].slice(0, 5);
        localStorage.setItem(`admin_recent_searches_${user?.id || 'admin'}`, JSON.stringify(recentIds));
        navigate(module.path);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10002] flex items-start justify-center pt-[12vh] px-4 sm:px-0">
                    {/* Backdrop - High contrast dim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-gray-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Main Modal - Solid, Clean, High Contrast */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-gray-100 overflow-hidden flex flex-col max-h-[75vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Header */}
                        <div className="flex items-center px-6 py-5 border-b border-blue-gray-50 gap-4 bg-white sticky top-0 z-10">
                            <MagnifyingGlassIcon className="w-6 h-6 text-blue-500 stroke-[2.5]" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search hospital modules, reports, or settings..."
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
                                                {recentSearches.map((mod, index) => (
                                                    <div
                                                        key={mod.id}
                                                        onClick={() => handleSelect(mod)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={`group flex items-center p-3 rounded-xl cursor-pointer transition-all border ${selectedIndex === index
                                                                ? 'bg-blue-50/80 border-blue-100 shadow-sm'
                                                                : 'bg-transparent border-transparent'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedIndex === index ? 'bg-blue-100' : 'bg-blue-gray-50'
                                                            }`}>
                                                            <ArrowRightCircleIcon className={`w-5 h-5 transition-colors ${selectedIndex === index ? 'text-blue-500' : 'text-blue-gray-400'
                                                                }`} />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <p className={`text-sm font-bold transition-colors ${selectedIndex === index ? 'text-blue-700' : 'text-blue-gray-800'
                                                                }`}>{mod.title}</p>
                                                            <p className="text-[11px] text-blue-gray-400 font-medium">{mod.path}</p>
                                                        </div>
                                                        <ChevronRightIcon className={`w-4 h-4 text-blue-200 transition-all transform ${selectedIndex === index ? 'opacity-100 translate-x-1' : 'opacity-0'
                                                            }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="px-2">
                                        <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest mb-3">Quick Links</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {adminSearchableModules.slice(0, 4).map(mod => (
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
                                    {results.length > 0 ? (
                                        <div className="space-y-1">
                                            <h3 className="text-[11px] font-bold text-blue-gray-400 uppercase tracking-widest mb-3 px-1">Search Results ({results.length})</h3>
                                            {results.map((mod, index) => (
                                                <div
                                                    key={mod.id}
                                                    onClick={() => handleSelect(mod)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all shadow-sm ${selectedIndex === index
                                                            ? 'bg-blue-600 shadow-blue-500/20'
                                                            : 'hover:bg-blue-600 hover:shadow-blue-500/20'
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedIndex === index ? 'bg-white/20' : 'bg-blue-gray-50 group-hover:bg-white/20'
                                                        }`}>
                                                        <MagnifyingGlassIcon className={`w-6 h-6 transition-colors ${selectedIndex === index ? 'text-white' : 'text-blue-gray-400 group-hover:text-white'
                                                            }`} />
                                                    </div>
                                                    <div className="ml-5 flex-1">
                                                        <p className={`text-[15px] font-bold transition-colors ${selectedIndex === index ? 'text-white' : 'text-blue-gray-900 group-hover:text-white'
                                                            }`}>{mod.title}</p>
                                                        <p className={`text-xs font-medium transition-colors ${selectedIndex === index ? 'text-blue-100' : 'text-blue-gray-500 group-hover:text-blue-100'
                                                            } line-clamp-1`}>{mod.description}</p>
                                                    </div>
                                                    <div className={`hidden sm:flex text-[10px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${selectedIndex === index
                                                            ? 'bg-white/10 text-white border-white/20'
                                                            : 'bg-blue-gray-50 text-blue-gray-400 border-blue-gray-100/50 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20'
                                                        }`}>
                                                        Navigate
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-blue-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-gray-100">
                                                <MagnifyingGlassIcon className="w-8 h-8 text-blue-gray-200" />
                                            </div>
                                            <p className="text-blue-gray-900 font-bold text-lg">No Results Found</p>
                                            <p className="text-blue-gray-400 text-sm mt-1">Try searching for keywords like patients, billing or reports.</p>
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
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
        </AnimatePresence>
    );
};

export default AdminSearchModal;
