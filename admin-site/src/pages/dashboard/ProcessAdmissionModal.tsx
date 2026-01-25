import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Select,
    Option,
    Input,
    Typography,
    Card,
    CardBody,
    Avatar
} from "@material-tailwind/react";
import {
    HomeModernIcon,
    ArchiveBoxIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import apiService from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface ProcessAdmissionModalProps {
    open: boolean;
    onClose: () => void;
    admission: any;
    onSuccess: () => void;
}

export default function ProcessAdmissionModal({
    open,
    onClose,
    admission,
    onSuccess
}: ProcessAdmissionModalProps): JSX.Element {
    const { showToast } = useToast();
    const [rooms, setRooms] = useState<any[]>([]);
    const [availableBeds, setAvailableBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoomDetails, setSelectedRoomDetails] = useState<any>(null);

    // Form State
    const [selectedRoom, setSelectedRoom] = useState<string>("");
    const [selectedBed, setSelectedBed] = useState<string>("");
    const [admissionDate, setAdmissionDate] = useState<string>("");

    useEffect(() => {
        if (open) {
            fetchRooms();
            setAdmissionDate(new Date().toISOString().split('T')[0]);
            setSelectedRoom("");
            setSelectedBed("");
            setSelectedRoomDetails(null);
        }
    }, [open]);

    useEffect(() => {
        // When room changes, fetch beds for that room and set room details
        if (selectedRoom && rooms.length > 0) {
            const room = rooms.find(r => r.id.toString() === selectedRoom);
            setSelectedRoomDetails(room);
            fetchBeds(Number(selectedRoom));
        } else {
            setSelectedRoomDetails(null);
            setAvailableBeds([]);
        }
    }, [selectedRoom, rooms]);

    const fetchRooms = async () => {
        try {
            const response = await apiService.getRooms({ status: 'active' }); // fetch active rooms
            setRooms(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        }
    };

    const fetchBeds = async (roomId: number) => {
        try {
            // Fetch beds for this room and filter for available ones
            const response = await apiService.getBeds({ room_id: roomId, status: 'available' });
            const beds = Array.isArray(response) ? response : response.data || [];
            setAvailableBeds(beds);
        } catch (error) {
            console.error("Failed to fetch beds", error);
            showToast("Failed to load available beds.", "error");
        }
    };

    const handleSubmit = async () => {
        if (!admission || !selectedBed || !selectedRoom || !admissionDate) {
            showToast("Please fill all fields.", "error");
            return;
        }

        setLoading(true);
        try {
            await apiService.processAdmission(admission.id, {
                room_id: Number(selectedRoom),
                bed_id: Number(selectedBed),
                admission_date: admissionDate
            });
            showToast("Patient successfully admitted.", "success");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to admit patient.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!admission) return null;

    return (
        <Dialog open={open} handler={onClose} size="lg">
            <DialogHeader>
                <Typography variant="h5" color="blue-gray">
                    Admit Patient: {admission.patient?.name}
                </Typography>
            </DialogHeader>
            <DialogBody className="space-y-4">
                {/* Room Selection */}
                <div>
                    <Typography variant="small" className="font-medium mb-2">Select Room</Typography>
                    <Select
                        key={`room-select-${rooms.length}`}
                        label="Choose a room"
                        value={selectedRoom || ""}
                        onChange={(val) => {
                            const value = val || "";
                            setSelectedRoom(value);
                        }}
                        disabled={rooms.length === 0}
                    >
                        {rooms.map((room) => (
                            <Option key={room.id} value={room.id.toString()}>
                                Room {room.room_number} ({room.floor}) - {room.room_type?.name}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Bed Selection */}
                {selectedRoom && (
                    <div>
                        <Typography variant="small" className="font-medium mb-2">Select Bed</Typography>
                        <div className="grid grid-cols-3 gap-2">
                            {availableBeds.length > 0 ? (
                                availableBeds.map((bed) => (
                                    <Button
                                        key={bed.id}
                                        variant={selectedBed === bed.id.toString() ? "filled" : "outlined"}
                                        color={selectedBed === bed.id.toString() ? "blue" : "gray"}
                                        onClick={() => setSelectedBed(bed.id.toString())}
                                        className="p-2"
                                    >
                                        Bed {bed.bed_number}
                                    </Button>
                                ))
                            ) : (
                                <Typography variant="small" color="gray" className="col-span-3 text-center py-4">
                                    No available beds in this room
                                </Typography>
                            )}
                        </div>
                    </div>
                )}

                {/* Date Selection */}
                <div>
                    <Typography variant="small" className="font-medium mb-2">Admission Date</Typography>
                    <Input
                        crossOrigin={undefined}
                        type="date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                    />
                </div>

                {admission.notes && (
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <Typography variant="small" className="font-bold text-amber-900">Doctor's Note:</Typography>
                        <Typography variant="small" className="text-amber-800">{admission.notes}</Typography>
                    </div>
                )}
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="gradient"
                    color="blue"
                    onClick={handleSubmit}
                    disabled={loading || !selectedRoom || !selectedBed}
                >
                    {loading ? "Processing..." : "Confirm Admission"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
