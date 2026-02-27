import React from 'react';
import { Button, Tooltip } from '@material-tailwind/react';
import {
    DocumentArrowDownIcon,
    TableCellsIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';

interface ReportExportProps {
    data: any[];
    columns: { key: string; label: string }[];
    filename?: string;
    title?: string;
}

export function ReportExport({ data, columns, filename = 'report', title = 'Report' }: ReportExportProps) {

    const handleExportCSV = () => {
        if (!data || data.length === 0) return;

        const headers = columns.map(c => c.label).join(',');
        const rows = data.map(row =>
            columns.map(col => {
                const val = row[col.key];
                // Wrap in quotes if contains comma
                const strVal = val !== null && val !== undefined ? String(val) : '';
                return strVal.includes(',') ? `"${strVal}"` : strVal;
            }).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleExportExcel = async () => {
        if (!data || data.length === 0) return;

        try {
            const XLSX = await import('xlsx');
            const wsData = [
                columns.map(c => c.label),
                ...data.map(row => columns.map(col => row[col.key] ?? ''))
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, title);
            XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            console.error('Excel export failed:', err);
            // Fallback to CSV
            handleExportCSV();
        }
    };

    const handlePrint = () => {
        if (!data || data.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                    <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 20px; color: #333; }
                            h1 { font-size: 20px; margin-bottom: 5px; color: #1e3a5f; }
                            p.subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; font-size: 13px; }
                            th { background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
                            td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
                            tr:hover { background-color: #f8fafc; }
                            .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 11px; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <table>
                            <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
                            <tbody>${data.map(row => `<tr>${columns.map(col => `<td>${row[col.key] ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
                        </table>
                        <div class="footer">HMS Reports • ${new Date().toLocaleDateString()}</div>
                    </body>
                    </html>
                `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const isDisabled = !data || data.length === 0;

    return (
        <div className="flex items-center gap-2">
            <Tooltip content="Export as CSV">
                <Button
                    size="sm"
                    variant="outlined"
                    className="flex items-center gap-1.5 border-blue-gray-200 text-blue-gray-700 hover:bg-blue-gray-50"
                    onClick={handleExportCSV}
                    disabled={isDisabled}
                >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">CSV</span>
                </Button>
            </Tooltip>
            <Tooltip content="Export as Excel">
                <Button
                    size="sm"
                    variant="outlined"
                    className="flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={handleExportExcel}
                    disabled={isDisabled}
                >
                    <TableCellsIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel</span>
                </Button>
            </Tooltip>
            <Tooltip content="Print Report">
                <Button
                    size="sm"
                    variant="outlined"
                    className="flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={handlePrint}
                    disabled={isDisabled}
                >
                    <PrinterIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                </Button>
            </Tooltip>
        </div>
    );
}

export default ReportExport;
