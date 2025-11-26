import React, { useState } from "react";
import { DataTable, ViewModal, Column, ViewField } from "@/components";
import { patientReportsData, PatientReport } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

export default function PatientReports(): JSX.Element {
    const [reports] = useState<PatientReport[]>(patientReportsData);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);

    const columns: Column[] = [
        {
            key: "patientName",
            label: "Patient",
            render: (value: any) => (
                <span className="font-semibold text-blue-gray-700">{value}</span>
            ),
        },
        {
            key: "reportType",
            label: "Report Type",
            render: (value: any) => (
                <span className="font-medium text-blue-gray-600">{value}</span>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (value: any) => (
                <span className="text-sm font-medium text-blue-gray-700">
                    {new Date(value).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "doctorName",
            label: "Doctor",
        },
        { key: "status", label: "Status", type: "status" },
        {
            key: "fileUrl",
            label: "Action",
            render: (value: any) => (
                <Button variant="text" size="sm" className="flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" /> Download
                </Button>
            ),
        },
    ];

    const viewFields: ViewField[] = [
        { key: "patientName", label: "Patient Name" },
        { key: "reportType", label: "Report Type" },
        { key: "date", label: "Date", type: "date" },
        { key: "doctorName", label: "Doctor Name" },
        { key: "status", label: "Status", type: "status" },
    ];

    const handleView = (report: PatientReport): void => {
        setSelectedReport(report);
        setOpenViewModal(true);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Patient Reports</h2>
                    <p className="text-blue-gray-600 text-base">View and download patient medical reports</p>
                </div>
            </div>

            <DataTable
                title="Reports List"
                data={reports}
                columns={columns}
                onView={handleView}
                searchable={true}
                filterable={true}
                exportable={true}
                searchPlaceholder="Search reports..."
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedReport(null);
                }}
                title="Report Details"
                data={selectedReport || {}}
                fields={viewFields}
            />
        </div>
    );
}
