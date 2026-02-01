import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ChevronDownIcon,
    CalendarDaysIcon,
    FunnelIcon,
    CheckIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export interface FilterField {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'daterange' | 'multiselect' | 'number';
    options?: Array<{ label: string; value: string | number }>;
    placeholder?: string;
    defaultValue?: any;
}

export interface FilterConfig {
    fields: FilterField[];
    onApplyFilters: (filters: Record<string, any>) => void;
    onResetFilters: () => void;
    initialValues?: Record<string, any>;
}

interface AdvancedFilterProps {
    config: FilterConfig;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

// Check if value exists
const hasValue = (value: any): boolean => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
};

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
    config,
    isOpen: controlledIsOpen,
    onToggle,
}) => {
    const [filters, setFilters] = useState<Record<string, any>>(config.initialValues || {});
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Categorize fields
    const searchField = config.fields.find(f => f.name === 'keyword' || f.name.includes('search'));
    const selectFields = config.fields.filter(f => f.type === 'select' && f.name !== 'keyword');
    const dateFields = config.fields.filter(f => f.type === 'date' || f.type === 'daterange');
    const multiselectFields = config.fields.filter(f => f.type === 'multiselect');
    const inputFields = config.fields.filter(f => (f.type === 'text' || f.type === 'number') && f !== searchField);

    // Show select filters inline, rest managed by More toggle
    const inlineFilters = selectFields.slice(0, 6);
    const moreFilters = [...selectFields.slice(6), ...inputFields];

    // Count active filters (excluding keyword)
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'keyword' || key.includes('search')) return false;
        if (key.endsWith('_start') || key.endsWith('_end')) {
            return hasValue(value);
        }
        return hasValue(value);
    }).length;

    // Sync with initialValues
    useEffect(() => {
        if (config.initialValues) {
            setFilters(prev => ({ ...prev, ...config.initialValues }));
        }
    }, [config.initialValues]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleFilterChange = useCallback((fieldName: string, value: any) => {
        setFilters(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    const handleApply = () => {
        config.onApplyFilters(filters);
        setActiveDropdown(null);
        setShowMoreFilters(false);
    };

    const handleReset = () => {
        const resetFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            if (field.type === 'multiselect') {
                resetFilters[field.name] = [];
            } else if (field.type === 'daterange') {
                resetFilters[`${field.name}_start`] = '';
                resetFilters[`${field.name}_end`] = '';
            } else {
                resetFilters[field.name] = '';
            }
        });
        setFilters(resetFilters);
        setShowMoreFilters(false);
        setActiveDropdown(null);
        config.onResetFilters();
    };

    const clearSingleFilter = (fieldName: string) => {
        const field = config.fields.find(f => f.name === fieldName);
        let newFilters = { ...filters };

        if (field?.type === 'multiselect') {
            newFilters[fieldName] = [];
        } else if (field?.type === 'daterange') {
            newFilters[`${fieldName}_start`] = '';
            newFilters[`${fieldName}_end`] = '';
        } else {
            newFilters[fieldName] = '';
        }

        setFilters(newFilters);
        config.onApplyFilters(newFilters);
    };

    // Dropdown Component
    const FilterDropdown: React.FC<{
        field: FilterField;
        compact?: boolean;
    }> = ({ field, compact = false }) => {
        const value = filters[field.name];
        const isOpen = activeDropdown === field.name;
        const selectedOption = field.options?.find(o => String(o.value) === String(value));
        const hasSelection = hasValue(value) && value !== '';

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : field.name)}
                    className={`
                        group flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium
                        transition-all duration-200 border whitespace-nowrap
                        ${hasSelection
                            ? 'bg-[#0299BE]/10 text-[#0299BE] border-[#0299BE]/30'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                    `}
                >
                    <span className={compact ? 'max-w-[120px] truncate' : ''}>
                        {hasSelection ? selectedOption?.label : field.label}
                    </span>
                    <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${hasSelection ? 'text-[#0299BE]' : 'text-gray-400'}`}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 min-w-[220px] max-h-[300px] overflow-auto bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50"
                        >
                            {field.options?.map(option => {
                                const isSelected = String(value) === String(option.value);
                                return (
                                    <button
                                        key={String(option.value)}
                                        onClick={() => {
                                            handleFilterChange(field.name, option.value);
                                            setActiveDropdown(null);
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2 text-sm
                                            transition-colors duration-100
                                            ${isSelected
                                                ? 'bg-[#0299BE]/10 text-[#0299BE] font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <CheckIcon className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Text/Number Input Component
    const InputField: React.FC<{
        field: FilterField;
    }> = ({ field }) => {
        const value = filters[field.name] || '';
        return (
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[#0299BE]/30 group min-w-[200px]">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{field.label}:</span>
                <input
                    type={field.type}
                    value={value}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                    placeholder={field.placeholder || "..."}
                    className="w-full bg-transparent border-0 p-0 text-sm text-gray-900 focus:ring-0 placeholder:text-gray-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
                {value && (
                    <button
                        onClick={() => handleFilterChange(field.name, '')}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 opacity-0 group-hover:opacity-100"
                    >
                        <XMarkIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    };

    // Date Range Dropdown
    const DateRangeDropdown: React.FC = () => {
        const dateField = dateFields[0];
        if (!dateField) return null;

        const isOpen = activeDropdown === 'daterange';
        const startKey = dateField.type === 'daterange' ? `${dateField.name}_start` : dateField.name;
        const endKey = dateField.type === 'daterange' ? `${dateField.name}_end` : '';
        const startValue = filters[startKey] || '';
        const endValue = endKey ? filters[endKey] || '' : '';
        const hasSelection = hasValue(startValue) || hasValue(endValue);

        const formatDisplayDate = (dateStr: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        let displayText = 'Date Range';
        if (hasSelection) {
            if (startValue && endValue) {
                displayText = `${formatDisplayDate(startValue)} - ${formatDisplayDate(endValue)}`;
            } else if (startValue) {
                displayText = `From ${formatDisplayDate(startValue)}`;
            } else if (endValue) {
                displayText = `Until ${formatDisplayDate(endValue)}`;
            }
        }

        return (
            <div className="relative">
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : 'daterange')}
                    className={`
                        flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium
                        transition-all duration-200 border whitespace-nowrap
                        ${hasSelection
                            ? 'bg-[#0299BE]/10 text-[#0299BE] border-[#0299BE]/30'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                    `}
                >
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{displayText}</span>
                    <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-1 w-[280px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50"
                        >
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">From</label>
                                    <input
                                        type="date"
                                        value={startValue}
                                        onChange={(e) => handleFilterChange(startKey, e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0299BE] focus:ring-1 focus:ring-[#0299BE]/20"
                                    />
                                </div>
                                {dateField.type === 'daterange' && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">To</label>
                                        <input
                                            type="date"
                                            value={endValue}
                                            onChange={(e) => handleFilterChange(endKey, e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0299BE] focus:ring-1 focus:ring-[#0299BE]/20"
                                        />
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            handleFilterChange(startKey, '');
                                            if (endKey) handleFilterChange(endKey, '');
                                        }}
                                        className="flex-1 h-9 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => setActiveDropdown(null)}
                                        className="flex-1 h-9 rounded-lg text-sm font-medium text-white bg-[#0299BE] hover:bg-[#027a99] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Render active filter tags
    const renderActiveTags = () => {
        const tags: React.ReactNode[] = [];

        config.fields.forEach(field => {
            if (field.name === 'keyword' || field.name.includes('search')) return;

            if (field.type === 'daterange') {
                const start = filters[`${field.name}_start`];
                const end = filters[`${field.name}_end`];
                if (hasValue(start) || hasValue(end)) {
                    tags.push(
                        <div key={field.name} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs border border-gray-200">
                            <span className="font-semibold">{field.label}:</span>
                            <span>
                                {start ? new Date(start).toLocaleDateString() : '...'} - {end ? new Date(end).toLocaleDateString() : '...'}
                            </span>
                            <button onClick={() => clearSingleFilter(field.name)} className="ml-1 hover:text-red-500 transition-colors">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    );
                }
            } else if (hasValue(filters[field.name])) {
                const value = filters[field.name];
                const label = field.options?.find(o => String(o.value) === String(value))?.label || value;
                tags.push(
                    <div key={field.name} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs border border-gray-200">
                        <span className="font-semibold">{field.label}:</span>
                        <span className="max-w-[150px] truncate">{label}</span>
                        <button onClick={() => clearSingleFilter(field.name)} className="ml-1 hover:text-red-500 transition-colors">
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </div>
                );
            }
        });

        return tags;
    };

    return (
        <div ref={containerRef} className="space-y-3 mb-8">
            {/* Main Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-3">
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        {searchField && (
                            <div className="flex-1 relative min-w-0">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={searchField.placeholder || 'Search...'}
                                    value={filters[searchField.name] || ''}
                                    onChange={(e) => handleFilterChange(searchField.name, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleApply();
                                        }
                                    }}
                                    className="w-full h-10 pl-9 pr-20 rounded-lg bg-gray-50 border-0 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0299BE]/20 focus:bg-white transition-all duration-300"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {filters[searchField.name] && (
                                        <button
                                            onClick={() => {
                                                handleFilterChange(searchField.name, '');
                                                const newFilters = { ...filters, [searchField.name]: '' };
                                                config.onApplyFilters(newFilters);
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 mr-1"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-0.5 pointer-events-none">
                                        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100/80 rounded border border-gray-200">⌘</kbd>
                                        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100/80 rounded border border-gray-200">K</kbd>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 hidden lg:block" />

                        {/* Inline Filter Dropdowns */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {inlineFilters.map(field => (
                                <FilterDropdown key={field.name} field={field} compact />
                            ))}

                            {/* Date Range */}
                            {dateFields.length > 0 && <DateRangeDropdown />}

                            {/* More Filters Toggle */}
                            {(moreFilters.length > 0 || multiselectFields.length > 0) && (
                                <button
                                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                                    className={`
                                        flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium
                                        transition-all duration-200 border
                                        ${showMoreFilters
                                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">More</span>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
                                </button>
                            )}

                            {/* Apply Button */}
                            <button
                                onClick={handleApply}
                                className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white bg-[#0299BE] hover:bg-[#027a99] transition-all shadow-sm hover:shadow-md"
                            >
                                Apply
                            </button>

                            {/* Quick Reset Button (only if count > 0) */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Clear all filters"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expandable More Filters Section */}
                <AnimatePresence>
                    {showMoreFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-3 pb-3 pt-0">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Additional Select Filters */}
                                        {moreFilters.map(field => (
                                            field.type === 'select' ? (
                                                <FilterDropdown key={field.name} field={field} />
                                            ) : (
                                                <InputField key={field.name} field={field} />
                                            )
                                        ))}

                                        {/* Multiselect Fields */}
                                        {multiselectFields.map(field => {
                                            const selectedValues = Array.isArray(filters[field.name]) ? filters[field.name] : [];
                                            return (
                                                <div key={field.name} className="flex items-center gap-4 py-2 px-4 bg-white rounded-lg border border-gray-100 w-full lg:w-auto">
                                                    <span className="text-sm font-semibold text-gray-700">{field.label}:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {field.options?.map(option => {
                                                            const isSelected = selectedValues.includes(option.value);
                                                            return (
                                                                <button
                                                                    key={String(option.value)}
                                                                    onClick={() => {
                                                                        const newValues = isSelected
                                                                            ? selectedValues.filter((v: any) => v !== option.value)
                                                                            : [...selectedValues, option.value];
                                                                        handleFilterChange(field.label, newValues);
                                                                    }}
                                                                    className={`
                                                                        px-3 py-1 rounded-full text-xs font-medium transition-all
                                                                        ${isSelected
                                                                            ? 'bg-[#0299BE] text-white shadow-sm'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                                                    `}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Active Filters Summary (Detailed) */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <FunnelIcon className="w-3.5 h-3.5" />
                        Active Filters:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {renderActiveTags()}
                        <button
                            onClick={handleReset}
                            className="text-xs text-red-500 font-semibold hover:underline px-1"
                        >
                            Clear and Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilter;
