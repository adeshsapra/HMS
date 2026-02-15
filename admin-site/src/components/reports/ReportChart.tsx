import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '@material-tailwind/react';
import Chart from 'react-apexcharts';

interface ReportChartProps {
    type: 'bar' | 'line' | 'pie' | 'donut' | 'area';
    series: any[];
    options?: any;
    title?: string;
    description?: string;
    height?: number;
    color?: string;
    noCard?: boolean;
}

const defaultColors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function ReportChart({
    type,
    series,
    options = {},
    title,
    description,
    height = 350,
    color = 'blue',
    noCard = false,
}: ReportChartProps) {
    const defaultOptions: any = {
        chart: {
            type,
            toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent',
        },
        colors: defaultColors,
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '55%',
                distributed: type === 'bar' && series.length === 1,
            },
        },
        dataLabels: {
            enabled: type === 'pie' || type === 'donut',
            style: { fontSize: '12px', fontWeight: 600 },
        },
        stroke: {
            curve: 'smooth',
            width: type === 'line' || type === 'area' ? 3 : 0,
        },
        fill: {
            type: type === 'area' ? 'gradient' : 'solid',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [50, 100],
            },
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
            padding: { top: 0, right: 10, bottom: 0, left: 10 },
        },
        xaxis: {
            labels: {
                style: { colors: '#6b7280', fontSize: '12px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#6b7280', fontSize: '12px' },
                formatter: (val: number) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
                    return val?.toFixed?.(0) || val;
                },
            },
        },
        tooltip: {
            theme: 'light',
            y: {
                formatter: (val: number) =>
                    typeof val === 'number' ? val.toLocaleString() : val,
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            markers: { radius: 12 },
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: { height: 280 },
                    legend: { position: 'bottom' },
                },
            },
        ],
        ...options,
    };

    // Merge options properly 
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        chart: { ...defaultOptions.chart, ...(options.chart || {}) },
        xaxis: { ...defaultOptions.xaxis, ...(options.xaxis || {}) },
        yaxis: { ...defaultOptions.yaxis, ...(options.yaxis || {}) },
        plotOptions: { ...defaultOptions.plotOptions, ...(options.plotOptions || {}) },
    };

    const chartElement = (
        <Chart
            type={type}
            series={series}
            options={mergedOptions}
            height={height}
            width="100%"
        />
    );

    if (noCard) {
        return chartElement;
    }

    return (
        <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
            {(title || description) && (
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="m-0 p-4 pb-0 bg-transparent"
                >
                    {title && (
                        <Typography variant="h6" color="blue-gray" className="font-bold">
                            {title}
                        </Typography>
                    )}
                    {description && (
                        <Typography variant="small" className="text-blue-gray-500 font-normal">
                            {description}
                        </Typography>
                    )}
                </CardHeader>
            )}
            <CardBody className="p-4 pt-2">
                {chartElement}
            </CardBody>
        </Card>
    );
}

export default ReportChart;
