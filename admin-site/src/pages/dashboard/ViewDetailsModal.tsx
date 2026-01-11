import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Card,
    CardBody,
    Chip,
    Spinner,
    Avatar,
    Tooltip,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    HomeModernIcon,
    ArchiveBoxIcon,
    UserCircleIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    NoSymbolIcon,
} from "@heroicons/react/24/outline";
import apiService from "@/services/api";

interface ViewDetailsModalProps {
    open: boolean;
    onClose: () => void;
    type: "room" | "bed" | "roomType" | "admission";
    itemId: number | null;
}

// Helper component for consistent label/value alignment
const InfoItem = ({ icon: Icon, label, value, className = "" }: any) => (
    <div className={`flex items-start gap-3 ${className}`}>
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <Typography variant="small" className="font-medium text-blue-gray-500 mb-0.5">
                {label}
            </Typography>
            <Typography variant="h6" color="blue-gray" className="font-semibold leading-tight">
                {value || "N/A"}
            </Typography>
        </div>
    </div>
);

export default function ViewDetailsModal({
    open,
    onClose,
    type,
    itemId,
}: ViewDetailsModalProps): JSX.Element {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && itemId) {
            fetchDetails();
        } else {
            setData(null);
        }
    }, [open, itemId, type]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (type === "room") response = await apiService.getRoom(itemId!);
            else if (type === "bed") response = await apiService.getBed(itemId!);
            else if (type === "roomType") response = await apiService.getRoomType(itemId!);
            else if (type === "admission") response = await apiService.getAdmission(itemId!);

            let itemData = response;
            if (response && typeof response === "object" && "data" in response) {
                itemData = response.data;
            }
            setData(itemData);
        } catch (err: any) {
            console.error("Failed to fetch details", err);
            setError(err.message || "Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (["available", "active"].includes(s)) return { color: "green", icon: CheckCircleIcon };
        if (["occupied"].includes(s)) return { color: "red", icon: NoSymbolIcon };
        if (["maintenance", "inactive"].includes(s)) return { color: "orange", icon: ExclamationCircleIcon };
        return { color: "blue-gray", icon: InformationCircleIcon };
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const config = getStatusConfig(status);
        return (
            <Chip
                variant="ghost"
                color={config.color as any}
                value={status}
                icon={<config.icon className="h-4 w-4" />}
                className="rounded-full px-4 py-2 font-bold uppercase tracking-wider border-none"
            />
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col justify-center items-center py-20 h-full">
                    <Spinner className="h-12 w-12 text-blue-500 mb-4" />
                    <Typography color="gray" className="font-medium animate-pulse">Loading details...</Typography>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center py-12 text-red-500 bg-red-50 rounded-lg">
                    <ExclamationCircleIcon className="h-12 w-12 mb-2" />
                    <Typography variant="h6">{error}</Typography>
                </div>
            );
        }

        if (!data) return null;

        /* -------------------------------------------------------------------------- */
        /*                                ROOM VIEW                                   */
        /* -------------------------------------------------------------------------- */
        if (type === "room") {
            return (
                <div className="space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-blue-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <HomeModernIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <Typography variant="h4" color="blue-gray" className="font-bold">
                                    Room {data.room_number}
                                </Typography>
                                <Typography color="gray" className="font-medium flex items-center gap-2">
                                    <span className="opacity-70">Floor:</span> {data.floor || "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <StatusBadge status={data.status} />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border border-blue-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-blue-gray-50 flex items-center gap-2">
                                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                                <Typography variant="small" className="font-bold text-blue-gray-700 uppercase">
                                    Room Specifics
                                </Typography>
                            </div>
                            <CardBody className="p-6 grid gap-6">
                                <InfoItem
                                    icon={BuildingOfficeIcon}
                                    label="Room Type"
                                    value={data.room_type?.name}
                                />
                                <InfoItem
                                    icon={CurrencyDollarIcon}
                                    label="Daily Charge"
                                    value={data.room_type?.daily_charge ? `$${data.room_type.daily_charge}` : null}
                                />
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm border border-blue-gray-100 overflow-hidden flex flex-col">
                            <div className="bg-gray-50 px-4 py-3 border-b border-blue-gray-50 flex items-center gap-2">
                                <ArchiveBoxIcon className="h-5 w-5 text-blue-500" />
                                <Typography variant="small" className="font-bold text-blue-gray-700 uppercase">
                                    Bed Availability
                                </Typography>
                            </div>
                            <CardBody className="p-0 flex-1 overflow-y-auto max-h-[200px]">
                                {data.beds && data.beds.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {data.beds.map((bed: any) => {
                                            const bedConfig = getStatusConfig(bed.status);
                                            return (
                                                <li key={bed.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: bedConfig.color === 'blue-gray' ? 'gray' : `var(--color-${bedConfig.color}-500, ${bedConfig.color})` }}></div>
                                                        <Typography className="font-medium text-blue-gray-800">
                                                            {bed.bed_number}
                                                        </Typography>
                                                    </div>
                                                    <Chip
                                                        size="sm"
                                                        variant="ghost"
                                                        value={bed.status}
                                                        color={bedConfig.color as any}
                                                        className="capitalize"
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                        <NoSymbolIcon className="h-8 w-8 mb-2" />
                                        <Typography variant="small">No beds assigned yet.</Typography>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            );
        }

        /* -------------------------------------------------------------------------- */
        /*                                 BED VIEW                                   */
        /* -------------------------------------------------------------------------- */
        else if (type === "bed") {
            return (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-blue-gray-100 p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <ArchiveBoxIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <Typography variant="small" className="text-gray-500 font-medium">Bed Number</Typography>
                                <Typography variant="h3" color="blue-gray" className="font-bold">{data.bed_number}</Typography>
                            </div>
                        </div>
                        <StatusBadge status={data.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Location Info */}
                        <Card className="md:col-span-1 shadow-sm border border-blue-gray-100">
                            <CardBody className="p-5 flex flex-col gap-5">
                                <Typography variant="h6" color="blue-gray" className="border-b pb-2 mb-1">
                                    Location
                                </Typography>
                                <InfoItem icon={HomeModernIcon} label="Room Number" value={data.room?.room_number} />
                                <InfoItem icon={MapPinIcon} label="Floor" value={data.room?.floor} />
                                <InfoItem icon={BuildingOfficeIcon} label="Category" value={data.room?.room_type?.name} />
                            </CardBody>
                        </Card>

                        {/* Occupancy Info */}
                        <Card className="md:col-span-2 shadow-sm border border-blue-gray-100">
                            <CardBody className="p-0 h-full flex flex-col">
                                <div className="p-5 border-b border-gray-100">
                                    <Typography variant="h6" color="blue-gray">Current Occupancy</Typography>
                                </div>

                                {data.activeAdmission ? (
                                    <div className="p-6 flex flex-col gap-6">
                                        <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <Avatar
                                                variant="circular"
                                                size="lg"
                                                alt="patient"
                                                src="/api/placeholder/150/150" // Placeholder or actual image
                                                className="border-2 border-white shadow-sm"
                                                withBorder={true}
                                                color="blue"
                                            />
                                            <div>
                                                <Typography variant="h5" color="blue-gray" className="font-bold">
                                                    {data.activeAdmission.patient?.name || "Unknown Patient"}
                                                </Typography>
                                                <Typography variant="small" className="text-blue-gray-500 font-medium">
                                                    Patient ID: #{data.activeAdmission.patient?.id}
                                                </Typography>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InfoItem
                                                icon={CalendarDaysIcon}
                                                label="Admitted On"
                                                value={new Date(data.activeAdmission.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            />
                                            <div className="col-span-1 sm:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <Typography variant="small" className="font-bold text-gray-500 mb-1">Notes</Typography>
                                                <Typography className="text-gray-700 text-sm italic">
                                                    "{data.activeAdmission.notes || 'No admission notes provided.'}"
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                                        <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                                        </div>
                                        <Typography variant="h6" color="blue-gray">Available for Admission</Typography>
                                        <Typography color="gray" className="max-w-xs mt-1 text-sm">
                                            This bed is currently unoccupied and ready to be assigned to a patient.
                                        </Typography>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            );
        }

        /* -------------------------------------------------------------------------- */
        /*                            ADMISSION VIEW                                  */
        /* -------------------------------------------------------------------------- */
        else if (type === "admission") {
            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-blue-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Avatar
                                variant="rounded"
                                size="lg"
                                alt="patient"
                                src="/api/placeholder/150/150"
                                className="bg-blue-50 text-blue-500 p-2"
                                withBorder={false}
                            />
                            <div>
                                <Typography variant="h4" color="blue-gray" className="font-bold">
                                    {data.patient?.name || "Unknown Patient"}
                                </Typography>
                                <Typography color="gray" className="font-medium opacity-70">
                                    Patient ID: #{data.patient_id}
                                </Typography>
                            </div>
                        </div>
                        <StatusBadge status={data.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border border-blue-gray-100">
                            <div className="bg-gray-50 px-4 py-3 border-b border-blue-gray-50 flex items-center gap-2">
                                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                                <Typography variant="small" className="font-bold text-blue-gray-700 uppercase">
                                    Admission Details
                                </Typography>
                            </div>
                            <CardBody className="p-6 grid gap-6">
                                <InfoItem icon={CalendarDaysIcon} label="Admission Date" value={data.admission_date} />
                                <InfoItem icon={UserCircleIcon} label="Doctor" value={data.doctor?.name || data.doctor?.first_name + ' ' + data.doctor?.last_name} />
                                <InfoItem icon={HomeModernIcon} label="Room" value={data.room ? `Room ${data.room.room_number}` : 'Not assigned'} />
                                <InfoItem icon={ArchiveBoxIcon} label="Bed" value={data.bed ? `Bed ${data.bed.bed_number}` : 'Not assigned'} />
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm border border-blue-gray-100">
                            <div className="bg-gray-50 px-4 py-3 border-b border-blue-gray-50 flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                <Typography variant="small" className="font-bold text-blue-gray-700 uppercase">
                                    Clinical Notes
                                </Typography>
                            </div>
                            <CardBody className="p-6">
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-900">
                                    <Typography className="text-sm italic">
                                        "{data.notes || 'No notes provided.'}"
                                    </Typography>
                                </div>
                                {data.discharge_date && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <InfoItem icon={CalendarDaysIcon} label="Discharged On" value={data.discharge_date} />
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            );
        }

        /* -------------------------------------------------------------------------- */
        /*                              ROOM TYPE VIEW                                */
        /* -------------------------------------------------------------------------- */
        else if (type === "roomType") {
            return (
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <Typography variant="small" className="text-blue-200 font-bold uppercase tracking-widest mb-1">Category</Typography>
                                <Typography variant="h2" className="font-bold">{data.name}</Typography>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                                <Typography variant="small" className="text-blue-100 mb-1">Price Per Day</Typography>
                                <Typography variant="h3" className="font-bold flex items-start">
                                    <span className="text-lg mt-1 mr-1">$</span>
                                    {data.daily_charge}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <Card className="shadow-sm border border-blue-gray-100">
                        <CardBody className="p-8">
                            <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                                <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                                Description & Features
                            </Typography>
                            <Typography className="text-gray-600 leading-relaxed text-lg">
                                {data.description || "No detailed description available for this room category."}
                            </Typography>

                            {/* 
                   Example of features list if your API returns them later. 
                   Currently static to show layout potential 
                */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Typography variant="small" className="font-bold text-gray-500 uppercase tracking-wide mb-4">Included Amenities (Example)</Typography>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Adjustable Bed', 'Nurse Call System', 'Oxygen Supply', 'Guest Chair'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            );
        }
    };

    const getTitle = () => {
        switch (type) {
            case "room": return "Room Details";
            case "bed": return "Bed Information";
            case "roomType": return "Category Details";
            case "admission": return "Admission Record";
            default: return "Details";
        }
    }

    return (
        <Dialog
            open={open}
            handler={onClose}
            size="lg" // 'lg' is good for details
            className="bg-transparent shadow-none" // Use custom card inside to control styling better
        >
            <Card className="mx-auto w-full max-w-[900px] h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                <DialogHeader className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                    <Typography variant="h5" color="blue-gray" className="font-bold flex items-center gap-2">
                        {type === "room" && <HomeModernIcon className="h-6 w-6 text-blue-500" />}
                        {type === "bed" && <ArchiveBoxIcon className="h-6 w-6 text-blue-500" />}
                        {type === "roomType" && <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />}
                        {type === "admission" && <UserCircleIcon className="h-6 w-6 text-blue-500" />}
                        {getTitle()}
                    </Typography>
                    <div className="flex gap-2">
                        <Tooltip content="Close Modal">
                            <Button
                                variant="text"
                                color="blue-gray"
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </Button>
                        </Tooltip>
                    </div>
                </DialogHeader>

                <DialogBody className="p-6 md:p-8 overflow-y-auto bg-gray-50/50 flex-1">
                    {renderContent()}
                </DialogBody>

                <DialogFooter className="bg-white border-t border-gray-100 px-6 py-4 shrink-0 flex justify-end gap-3">
                    <Button variant="outlined" color="blue-gray" onClick={onClose} className="border-gray-300">
                        Close
                    </Button>
                    {/* Action buttons could go here, e.g., 'Edit Room', 'Admit Patient' */}
                </DialogFooter>
            </Card>
        </Dialog>
    );
}