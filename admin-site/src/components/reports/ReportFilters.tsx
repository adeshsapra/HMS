import React, { useState } from 'react';
import {
    Card,
    CardBody,
    Button,
    Typography,
    Select,
    Option,
    Input,
} from '@material-tailwind/react';
import {
    CalendarDaysIcon,
    FunnelIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DatePreset {
    label: string;
    value: string;
    getRange: () => { start: string; end: string };
}

const datePresets: DatePreset[] = [
    {
        label: 'Today',
        value: 'today',
        getRange: () => {
            const today = new Date().toISOString().split('T')[0];
            return { start: today, end: today };
        },
    },
    {
        label: 'This Week',
        value: 'this_week',
        getRange: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now);
            start.setDate(now.getDate() - dayOfWeek);
            return {
                start: start.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'This Month',
        value: 'this_month',
        getRange: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                start: start.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'Last 30 Days',
        value: 'last_30',
        getRange: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 30);
            return {
                start: start.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'Last 3 Months',
        value: 'last_90',
        getRange: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 90);
            return {
                start: start.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'This Year',
        value: 'this_year',
        getRange: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            return {
                start: start.toISOString().split('T')[0],
                end: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'Custom',
        value: 'custom',
        getRange: () => ({ start: '', end: '' }),
    },
];

interface ReportFiltersProps {
    onFilterChange: (filters: { start_date: string; end_date: string;[key: string]: any }) => void;
    onRefresh?: () => void;
    loading?: boolean;
    showDepartmentFilter?: boolean;
    showDoctorFilter?: boolean;
    departments?: any[];
    doctors?: any[];
}

export function ReportFilters({
    onFilterChange,
    onRefresh,
    loading = false,
    showDepartmentFilter = false,
    showDoctorFilter = false,
    departments = [],
    doctors = [],
}: ReportFiltersProps) {
    const [selectedPreset, setSelectedPreset] = useState('this_month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [departmentId, setDepartmentId] = useState<string>('');
    const [doctorId, setDoctorId] = useState<string>('');

    const handlePresetChange = (value: string) => {
        setSelectedPreset(value);
        const preset = datePresets.find((p) => p.value === value);
        if (preset && value !== 'custom') {
            const range = preset.getRange();
            setCustomStart(range.start);
            setCustomEnd(range.end);
            applyFilters(range.start, range.end);
        }
    };

    const applyFilters = (start?: string, end?: string) => {
        const filters: any = {
            start_date: start || customStart,
            end_date: end || customEnd,
        };
        if (departmentId) filters.department_id = parseInt(departmentId);
        if (doctorId) filters.doctor_id = parseInt(doctorId);
        onFilterChange(filters);
    };

    const handleApplyCustom = () => {
        if (customStart && customEnd) {
            applyFilters();
        }
    };

    return (
        <Card className="border border-blue-gray-100 shadow-sm mb-6">
            <CardBody className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Preset Buttons */}
                    <div className="flex items-center gap-2 mr-2">
                        <CalendarDaysIcon className="h-5 w-5 text-blue-gray-500" />
                        <Typography variant="small" className="font-semibold text-blue-gray-700">
                            Period:
                        </Typography>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {datePresets.filter(p => p.value !== 'custom').map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetChange(preset.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedPreset === preset.value
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                                        : 'bg-blue-gray-50 text-blue-gray-700 hover:bg-blue-gray-100'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedPreset('custom')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedPreset === 'custom'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                                    : 'bg-blue-gray-50 text-blue-gray-700 hover:bg-blue-gray-100'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Refresh Button */}
                    {onRefresh && (
                        <Button
                            size="sm"
                            variant="text"
                            className="ml-auto flex items-center gap-1 text-blue-gray-600"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    )}
                </div>

                {/* Custom Date Range */}
                {selectedPreset === 'custom' && (
                    <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-blue-gray-50">
                        <div className="w-44">
                            <Input
                                type="date"
                                label="Start Date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                crossOrigin=""
                            />
                        </div>
                        <div className="w-44">
                            <Input
                                type="date"
                                label="End Date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                crossOrigin=""
                            />
                        </div>

                        {showDepartmentFilter && departments.length > 0 && (
                            <div className="w-48">
                                <Select
                                    label="Department"
                                    value={departmentId}
                                    onChange={(val) => setDepartmentId(val || '')}
                                >
                                    <Option value="">All Departments</Option>
                                    {departments.map((dept: any) => (
                                        <Option key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        {showDoctorFilter && doctors.length > 0 && (
                            <div className="w-48">
                                <Select
                                    label="Doctor"
                                    value={doctorId}
                                    onChange={(val) => setDoctorId(val || '')}
                                >
                                    <Option value="">All Doctors</Option>
                                    {doctors.map((doc: any) => (
                                        <Option key={doc.id} value={doc.id.toString()}>
                                            Dr. {doc.first_name} {doc.last_name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        <Button
                            size="sm"
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                            onClick={handleApplyCustom}
                            disabled={!customStart || !customEnd}
                        >
                            <FunnelIcon className="h-4 w-4" />
                            Apply
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

export default ReportFilters;
