import { useState, useCallback } from 'react';
import apiService from '@/services/api';

export interface ReportFilters {
    start_date?: string;
    end_date?: string;
    department_id?: number;
    doctor_id?: number;
}

export interface UseReportDataReturn {
    data: any;
    loading: boolean;
    error: string | null;
    fetchReport: (reportType: string, filters?: ReportFilters) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useReportData(): UseReportDataReturn {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastReportType, setLastReportType] = useState<string>('');
    const [lastFilters, setLastFilters] = useState<ReportFilters>({});

    const fetchReport = useCallback(async (reportType: string, filters?: ReportFilters) => {
        setLoading(true);
        setError(null);
        setLastReportType(reportType);
        setLastFilters(filters || {});

        try {
            let response: any;
            const params = filters || {};

            switch (reportType) {
                case 'revenue':
                    response = await apiService.getRevenueSummary(params);
                    break;
                case 'appointments':
                    response = await apiService.getAppointmentsSummary(params);
                    break;
                case 'payments':
                    response = await apiService.getPaymentsSummary(params);
                    break;
                case 'patients':
                    response = await apiService.getPatientsSummary(params);
                    break;
                case 'staff':
                    response = await apiService.getStaffSummary(params);
                    break;
                case 'inventory-stock-in':
                    response = await apiService.getInventoryReport('stock-in', params);
                    break;
                case 'inventory-stock-out':
                    response = await apiService.getInventoryReport('stock-out', params);
                    break;
                case 'inventory-department-usage':
                    response = await apiService.getInventoryReport('department-usage', params);
                    break;
                case 'inventory-low-stock':
                    response = await apiService.getInventoryReport('low-stock', params);
                    break;
                case 'inventory-expiry':
                    response = await apiService.getInventoryReport('expiry', params);
                    break;
                case 'inventory-vendor-summary':
                    response = await apiService.getInventoryReport('vendor-summary', params);
                    break;
                default:
                    throw new Error(`Unknown report type: ${reportType}`);
            }

            if (response?.success === false) {
                throw new Error(response.message || 'Failed to fetch report');
            }

            setData(response?.data || response);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching report data');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        if (lastReportType) {
            await fetchReport(lastReportType, lastFilters);
        }
    }, [lastReportType, lastFilters, fetchReport]);

    return { data, loading, error, fetchReport, refresh };
}

export default useReportData;
