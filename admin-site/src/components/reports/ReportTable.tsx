import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '@material-tailwind/react';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

interface ReportTableProps {
    title?: string;
    description?: string;
    columns: Column[];
    data: any[];
    emptyMessage?: string;
}

export function ReportTable({
    title,
    description,
    columns,
    data,
    emptyMessage = 'No data available',
}: ReportTableProps) {
    return (
        <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
            {title && (
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="m-0 p-4 pb-0 bg-transparent"
                >
                    <Typography variant="h6" color="blue-gray" className="font-bold">
                        {title}
                    </Typography>
                    {description && (
                        <Typography variant="small" className="text-blue-gray-500 font-normal">
                            {description}
                        </Typography>
                    )}
                </CardHeader>
            )}
            <CardBody className="p-0 overflow-x-auto">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.key}
                                    className={`border-b border-blue-gray-100 bg-blue-gray-50/50 p-4 ${idx === 0 ? 'pl-6' : ''
                                        }`}
                                >
                                    <Typography
                                        variant="small"
                                        className="font-semibold text-blue-gray-600 uppercase text-xs tracking-wider"
                                        style={{ textAlign: col.align || 'left' }}
                                    >
                                        {col.label}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-8 text-center"
                                >
                                    <Typography
                                        variant="small"
                                        className="text-blue-gray-400 font-normal"
                                    >
                                        {emptyMessage}
                                    </Typography>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => {
                                const isLast = rowIdx === data.length - 1;
                                const classes = isLast
                                    ? 'p-4'
                                    : 'p-4 border-b border-blue-gray-50';

                                return (
                                    <tr
                                        key={rowIdx}
                                        className="hover:bg-blue-gray-50/30 transition-colors"
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={col.key}
                                                className={`${classes} ${colIdx === 0 ? 'pl-6' : ''}`}
                                                style={{ textAlign: col.align || 'left' }}
                                            >
                                                {col.render ? (
                                                    col.render(row[col.key], row)
                                                ) : (
                                                    <Typography
                                                        variant="small"
                                                        className="font-normal text-blue-gray-700"
                                                    >
                                                        {row[col.key] ?? '—'}
                                                    </Typography>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </CardBody>
        </Card>
    );
}

export default ReportTable;
