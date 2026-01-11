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
    Typography
} from "@material-tailwind/react";
import apiService from "@/services/api";
import { toast } from "react-toastify";

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
    const [rooms, setRooms] = useState<any[]>([]);
    const [availableBeds, setAvailableBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
        }
    }, [open]);

    useEffect(() => {
        // When room changes, fetch beds for that room
        if (selectedRoom) {
            fetchBeds(Number(selectedRoom));
        } else {
            setAvailableBeds([]);
        }
    }, [selectedRoom]);

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
            toast.error("Failed to load available beds.");
        }
    };

    const handleSubmit = async () => {
        if (!admission || !selectedBed || !selectedRoom || !admissionDate) {
            toast.error("Please fill all fields.");
            return;
        }

        setLoading(true);
        try {
            await apiService.processAdmission(admission.id, {
                room_id: Number(selectedRoom),
                bed_id: Number(selectedBed),
                admission_date: admissionDate
            });
            toast.success("Patient successfully admitted.");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to admit patient.");
        } finally {
            setLoading(false);
        }
    };

    if (!admission) return null;

    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader className="flex flex-col items-start gap-1">
                <Typography variant="h5" color="blue-gray">
                    Admit Patient
                </Typography>
                <Typography variant="small" className="font-normal text-gray-600">
                    Admitting: <span className="font-bold text-blue-600">{admission.patient?.name}</span>
                </Typography>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
                {/* Room Selection */}
                <div>
                    <Select
                        label="Select Room"
                        value={selectedRoom}
                        onChange={(val) => setSelectedRoom(val || "")}
                        containerProps={{ className: "min-w-[100px]" }}
                    >
                        {rooms.map((room) => (
                            <Option key={room.id} value={room.id.toString()}>
                                {room.room_number} ({room.floor}) - {room.room_type?.name}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Bed Selection */}
                <div>
                    <Select
                        label="Select Bed"
                        value={selectedBed}
                        onChange={(val) => setSelectedBed(val || "")}
                        disabled={!selectedRoom}
                        containerProps={{ className: "min-w-[100px]" }}
                    >
                        {availableBeds.length > 0 ? (
                            availableBeds.map((bed) => (
                                <Option key={bed.id} value={bed.id.toString()}>
                                    Bed {bed.bed_number}
                                </Option>
                            ))
                        ) : (
                            <Option value="" disabled>No available beds in this room</Option>
                        )}
                    </Select>
                </div>

                {/* Date Selection */}
                <div>
                    <Input
                        crossOrigin={undefined}
                        type="date"
                        label="Admission Date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                    />
                </div>

                {admission.notes && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <Typography variant="small" className="font-bold text-amber-900">Doctor's Recommendation:</Typography>
                        <Typography variant="small" className="text-amber-800 italic">{admission.notes}</Typography>
                    </div>
                )}

            </DialogBody>
            <DialogFooter>
                <Button
                    variant="text"
                    color="red"
                    onClick={onClose}
                    className="mr-1"
                >
                    Cancel
                </Button>
                <Button variant="gradient" color="blue" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Processing..." : "Confirm Admission"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
