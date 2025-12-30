import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Typography,
    IconButton,
    Select,
    Option,
    Card,
    Chip,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    BeakerIcon,
    LightBulbIcon,
    CheckCircleIcon,
    SparklesIcon,
    BookOpenIcon
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import "@/styles/meditrust-colors.css";

interface PrescriptionModalProps {
    open: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
}

interface MedicineItem {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface LabTestItem {
    test_name: string;
    priority: string;
}

export function PrescriptionModal({
    open,
    onClose,
    appointment,
    onSuccess,
}: PrescriptionModalProps) {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState("");
    const [advice, setAdvice] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [medicines, setMedicines] = useState<MedicineItem[]>([
        { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
    const [labTests, setLabTests] = useState<LabTestItem[]>([]);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [medicineErrors, setMedicineErrors] = useState<{ [key: number]: { [key: string]: string } }>({});
    const { showToast } = useToast();

    const handleAddMedicine = () => {
        setMedicines([
            ...medicines,
            { medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" },
        ]);
    };

    const handleRemoveMedicine = (index: number) => {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 1);
        setMedicines(newMedicines);
    };

    const handleMedicineChange = (index: number, field: string, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index] = { ...newMedicines[index], [field]: value };
        setMedicines(newMedicines);
    };

    const handleAddLabTest = () => {
        setLabTests([...labTests, { test_name: "", priority: "normal" }]);
    };

    const handleRemoveLabTest = (index: number) => {
        const newTests = [...labTests];
        newTests.splice(index, 1);
        setLabTests(newTests);
    };

    const handleLabTestChange = (index: number, field: string, value: string) => {
        const newTests = [...labTests];
        newTests[index] = { ...newTests[index], [field]: value };
        setLabTests(newTests);
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        const medicineErrors: { [key: number]: { [key: string]: string } } = {};

        // Validate diagnosis
        if (!diagnosis.trim()) {
            errors.diagnosis = "Diagnosis is required";
        }

        // Validate medicines
        medicines.forEach((medicine, index) => {
            if (medicine.medicine_name.trim()) {
                const medErrors: { [key: string]: string } = {};

                if (!medicine.dosage.trim()) {
                    medErrors.dosage = "Dosage is required when medicine name is provided";
                }
                if (!medicine.frequency.trim()) {
                    medErrors.frequency = "Frequency is required when medicine name is provided";
                }
                if (!medicine.duration.trim()) {
                    medErrors.duration = "Duration is required when medicine name is provided";
                }

                if (Object.keys(medErrors).length > 0) {
                    medicineErrors[index] = medErrors;
                }
            }
        });

        setValidationErrors(errors);
        setMedicineErrors(medicineErrors);

        return {
            isValid: Object.keys(errors).length === 0 && Object.keys(medicineErrors).length === 0,
            errors,
            medicineErrors
        };
    };

    const handleSubmit = async () => {
        const validation = validateForm();

        if (!validation.isValid) {
            const errorCount = Object.keys(validation.errors).length + Object.keys(validation.medicineErrors).length;
            showToast(`Please fix ${errorCount} validation error(s) before saving the prescription`, "error");
            return;
        }

        try {
            setLoading(true);

            // Get the correct patient ID from appointment
            const patientId = appointment?.user_id || appointment?.patient_id;

            if (!patientId) {
                showToast("Patient information is missing from the appointment. Please refresh and try again.", "error");
                return;
            }

            const payload = {
                appointment_id: appointment.id,
                patient_id: patientId, // Use user_id from appointment
                doctor_id: appointment.doctor_id,
                diagnosis: diagnosis.trim(),
                advice: advice.trim(),
                follow_up_date: followUpDate || null,
                medicine_items: medicines.filter((m) => m.medicine_name.trim()).map(med => ({
                    medicine_name: med.medicine_name.trim(),
                    dosage: med.dosage.trim(),
                    frequency: med.frequency.trim(),
                    duration: med.duration.trim(),
                    instructions: med.instructions.trim()
                })),
                lab_tests: labTests.filter((t) => t.test_name.trim()).map(test => ({
                    test_name: test.test_name.trim(),
                    priority: test.priority || 'normal'
                })),
            };

            console.log('Prescription payload:', payload);

            const response = await apiService.createPrescription(payload);

            // Create detailed success message
            const medicineCount = payload.medicine_items.length;
            const labTestCount = payload.lab_tests.length;
            const patientName = appointment?.patientName || appointment?.patient_name || 'Patient';

            let successMessage = `Prescription created successfully for ${patientName}`;
            if (medicineCount > 0) {
                successMessage += ` with ${medicineCount} medicine${medicineCount > 1 ? 's' : ''}`;
            }
            if (labTestCount > 0) {
                successMessage += medicineCount > 0 ? ` and ${labTestCount} lab test${labTestCount > 1 ? 's' : ''}` : ` with ${labTestCount} lab test${labTestCount > 1 ? 's' : ''}`;
            }
            successMessage += ". Appointment marked as completed.";

            showToast(successMessage, "success");

            // Reset form
            setDiagnosis("");
            setAdvice("");
            setFollowUpDate("");
            setMedicines([{ medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
            setLabTests([]);
            setValidationErrors({});
            setMedicineErrors({});

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Prescription creation error:', error);

            // Handle different types of errors with specific messages
            let errorMessage = "Failed to create prescription";

            if (error.message) {
                if (error.message.includes('validation') || error.message.includes('422')) {
                    errorMessage = "Validation failed: Please check all required fields and ensure data is valid";
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = "Network error: Please check your internet connection and try again";
                } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
                    errorMessage = "Access denied: Please login again and ensure you have prescription permissions";
                } else if (error.message.includes('500')) {
                    errorMessage = "Server error: Please contact administrator if the problem persists";
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
            }

            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Add custom styles for input fields */}
            <style>{`
                .custom-input-wrapper {
                    position: relative;
                    width: 100%;
                }
                
                .custom-input-label {
                    position: absolute;
                    left: 12px;
                    top: -9px;
                    background-color: white;
                    padding: 0 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--default-color);
                    z-index: 10;
                    pointer-events: none;
                }
                
                .custom-input {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--heading-color);
                    background-color: white;
                    transition: all 0.2s ease;
                    outline: none;
                }
                
                .custom-input:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb, 37, 99, 235), 0.1);
                }
                
                .custom-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--heading-color);
                    background-color: white;
                    min-height: 96px;
                    resize: vertical;
                    transition: all 0.2s ease;
                    outline: none;
                }
                
                .custom-textarea:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb, 37, 99, 235), 0.1);
                }
                
                .custom-select-wrapper {
                    position: relative;
                    width: 100%;
                }
                
                .custom-select-label {
                    position: absolute;
                    left: 12px;
                    top: -9px;
                    background-color: white;
                    padding: 0 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--default-color);
                    z-index: 10;
                    pointer-events: none;
                }
                
                .custom-select {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--heading-color);
                    background-color: white;
                    cursor: pointer;
                    appearance: none;
                    transition: all 0.2s ease;
                    outline: none;
                }
                
                .custom-select:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb, 37, 99, 235), 0.1);
                }
                
                .custom-select-arrow {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    color: var(--default-color);
                }
                
                .input-has-value .custom-input-label,
                .textarea-has-value .custom-input-label,
                .select-has-value .custom-select-label {
                    color: var(--accent-color);
                }
                
                .input-has-value .custom-input,
                .textarea-has-value .custom-textarea,
                .select-has-value .custom-select {
                    border-color: var(--accent-medium);
                }
            `}</style>

            <Dialog open={open} handler={onClose} size="xl" className="flex flex-col h-[95vh] bg-[var(--surface-color)] font-sans">
                {/* Header */}
                <DialogHeader className="flex justify-between items-center border-b px-6 py-4 shrink-0 bg-white z-10" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--accent-light)' }}>
                            <ClipboardDocumentListIcon className="h-6 w-6" style={{ color: 'var(--accent-color)' }} />
                        </div>
                        <div>
                            <Typography variant="h5" className="font-bold tracking-tight" style={{ color: 'var(--heading-color)' }}>
                                New Prescription
                            </Typography>
                            <Typography variant="small" className="font-medium opacity-80" style={{ color: 'var(--default-color)' }}>
                                {appointment?.patientName || 'Patient'} • ID: {appointment?.id || 'N/A'}
                            </Typography>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        onClick={onClose}
                        className="rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" style={{ color: 'var(--default-color)' }} />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="p-0 overflow-y-auto flex-1 bg-[var(--background-light)]">
                    <div className="p-6 space-y-6">
                        {/* Patient Summary & Diagnosis */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="p-5 shadow-sm border lg:col-span-1" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <UserIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                                    <Typography variant="h6" style={{ color: 'var(--heading-color)' }}>Patient Details</Typography>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Typography variant="small" className="uppercase text-xs font-bold opacity-60" style={{ color: 'var(--default-color)' }}>Full Name</Typography>
                                        <Typography className="font-medium" style={{ color: 'var(--heading-color)' }}>
                                            {appointment?.patientName || appointment?.patient_name || 'N/A'}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="uppercase text-xs font-bold opacity-60" style={{ color: 'var(--default-color)' }}>Appointment Date</Typography>
                                        <Typography className="font-medium" style={{ color: 'var(--heading-color)' }}>
                                            {appointment?.date || appointment?.appointment_date || 'N/A'}
                                        </Typography>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5 shadow-sm border lg:col-span-2 overflow-visible" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2 mb-5">
                                    <BookOpenIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                                    <Typography variant="h6" style={{ color: 'var(--heading-color)' }}>Diagnosis</Typography>
                                </div>
                                <div className="mt-2">
                                    <div className={`custom-input-wrapper textarea-has-value ${diagnosis ? 'input-has-value' : ''}`}>
                                        <label className="custom-input-label">Medical Diagnosis *</label>
                                        <textarea
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            className={`custom-textarea ${validationErrors.diagnosis ? 'border-red-500' : ''}`}
                                            placeholder="Enter medical diagnosis"
                                            rows={3}
                                        />
                                        {validationErrors.diagnosis && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.diagnosis}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Medicines Section */}
                        <Card className="shadow-sm border overflow-visible" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="px-5 py-3 border-b flex justify-between items-center bg-white rounded-t-xl" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                                    <Typography variant="h6" style={{ color: 'var(--heading-color)' }}>Medications</Typography>
                                    <Chip
                                        value={medicines.filter(m => m.medicine_name).length}
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-full text-[var(--accent-color)] bg-[var(--accent-light)]"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="text"
                                    className="flex items-center gap-2 normal-case"
                                    style={{ color: 'var(--accent-color)' }}
                                    onClick={handleAddMedicine}
                                >
                                    <PlusIcon className="h-4 w-4" /> Add Medication
                                </Button>
                            </div>

                            <div className="p-5 space-y-4 bg-[var(--surface-color)] rounded-b-xl">
                                {medicines.map((medicine, index) => (
                                    <div key={index} className="p-4 rounded-lg border relative transition-all hover:border-[var(--accent-medium)]"
                                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-light)' }}>
                                        <div className="flex justify-between items-start mb-5">
                                            <Typography variant="small" className="font-bold flex items-center gap-2" style={{ color: 'var(--heading-color)' }}>
                                                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--accent-color)' }}>
                                                    {index + 1}
                                                </span>
                                                Medicine Details
                                            </Typography>
                                            {medicines.length > 1 && (
                                                <IconButton
                                                    variant="text"
                                                    size="sm"
                                                    color="red"
                                                    onClick={() => handleRemoveMedicine(index)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
                                            <div className="md:col-span-1">
                                                <div className={`custom-input-wrapper ${medicine.medicine_name ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Name *</label>
                                                    <input
                                                        type="text"
                                                        value={medicine.medicine_name}
                                                        onChange={(e) => handleMedicineChange(index, "medicine_name", e.target.value)}
                                                        className={`custom-input ${medicineErrors[index]?.medicine_name ? 'border-red-500' : ''}`}
                                                        placeholder="Enter medicine name"
                                                    />
                                                    {medicineErrors[index]?.medicine_name && (
                                                        <p className="text-red-500 text-xs mt-1">{medicineErrors[index].medicine_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`custom-input-wrapper ${medicine.dosage ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Dosage *</label>
                                                    <input
                                                        type="text"
                                                        value={medicine.dosage}
                                                        onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                                                        className={`custom-input ${medicineErrors[index]?.dosage ? 'border-red-500' : ''}`}
                                                        placeholder="e.g., 500mg"
                                                    />
                                                    {medicineErrors[index]?.dosage && (
                                                        <p className="text-red-500 text-xs mt-1">{medicineErrors[index].dosage}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`custom-input-wrapper ${medicine.frequency ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Frequency *</label>
                                                    <input
                                                        type="text"
                                                        value={medicine.frequency}
                                                        onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                                                        className={`custom-input ${medicineErrors[index]?.frequency ? 'border-red-500' : ''}`}
                                                        placeholder="e.g., 3 times daily"
                                                    />
                                                    {medicineErrors[index]?.frequency && (
                                                        <p className="text-red-500 text-xs mt-1">{medicineErrors[index].frequency}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`custom-input-wrapper ${medicine.duration ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Duration *</label>
                                                    <input
                                                        type="text"
                                                        value={medicine.duration}
                                                        onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                                        className={`custom-input ${medicineErrors[index]?.duration ? 'border-red-500' : ''}`}
                                                        placeholder="e.g., 7 days"
                                                    />
                                                    {medicineErrors[index]?.duration && (
                                                        <p className="text-red-500 text-xs mt-1">{medicineErrors[index].duration}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`custom-input-wrapper ${medicine.instructions ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Instructions</label>
                                                    <input
                                                        type="text"
                                                        value={medicine.instructions}
                                                        onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                                                        className="custom-input"
                                                        placeholder="e.g., After meals"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Lab Tests & Notes Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            <Card className="shadow-sm border overflow-visible h-full" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="px-5 py-3 border-b flex justify-between items-center bg-white rounded-t-xl" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                        <BeakerIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                                        <Typography variant="h6" style={{ color: 'var(--heading-color)' }}>Lab Tests</Typography>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="text"
                                        className="flex items-center gap-2 normal-case"
                                        style={{ color: 'var(--accent-color)' }}
                                        onClick={handleAddLabTest}
                                    >
                                        <PlusIcon className="h-4 w-4" /> Add Test
                                    </Button>
                                </div>
                                <div className="p-5 space-y-4 min-h-[150px]">
                                    {labTests.length === 0 && (
                                        <div className="text-center py-6 opacity-60">
                                            <Typography variant="small">No lab tests added.</Typography>
                                        </div>
                                    )}
                                    {labTests.map((test, index) => (
                                        <div key={index} className="flex gap-3 items-start pt-2">
                                            <div className="flex-grow">
                                                <div className={`custom-input-wrapper ${test.test_name ? 'input-has-value' : ''}`}>
                                                    <label className="custom-input-label">Test Name</label>
                                                    <input
                                                        type="text"
                                                        value={test.test_name}
                                                        onChange={(e) => handleLabTestChange(index, "test_name", e.target.value)}
                                                        className="custom-input"
                                                        placeholder="Enter test name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-36">
                                                <div className={`custom-select-wrapper ${test.priority ? 'select-has-value' : ''}`}>
                                                    <label className="custom-select-label">Priority</label>
                                                    <select
                                                        value={test.priority}
                                                        onChange={(e) => handleLabTestChange(index, "priority", e.target.value || "normal")}
                                                        className="custom-select"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="urgent">Urgent</option>
                                                    </select>
                                                    <div className="custom-select-arrow">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <IconButton
                                                    variant="text"
                                                    color="red"
                                                    size="sm"
                                                    onClick={() => handleRemoveLabTest(index)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </IconButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="shadow-sm border overflow-visible h-full" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="px-5 py-3 border-b flex items-center gap-2 bg-white rounded-t-xl" style={{ borderColor: 'var(--border-color)' }}>
                                    <LightBulbIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                                    <Typography variant="h6" style={{ color: 'var(--heading-color)' }}>Advice & Follow-up</Typography>
                                </div>
                                <div className="p-5 space-y-6">
                                    <div className="pt-2">
                                        <div className={`custom-input-wrapper textarea-has-value ${advice ? 'input-has-value' : ''}`}>
                                            <label className="custom-input-label">Clinical Advice / Notes</label>
                                            <textarea
                                                value={advice}
                                                onChange={(e) => setAdvice(e.target.value)}
                                                className="custom-textarea"
                                                placeholder="Enter clinical advice or notes"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <div className={`custom-input-wrapper ${followUpDate ? 'input-has-value' : ''}`}>
                                            <label className="custom-input-label">Next Visit Date</label>
                                            <input
                                                type="date"
                                                value={followUpDate}
                                                onChange={(e) => setFollowUpDate(e.target.value)}
                                                className="custom-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </DialogBody>

                {/* Footer */}
                <DialogFooter className="border-t bg-[var(--surface-color)] px-6 py-4 shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 opacity-80">
                            <CheckCircleIcon className="h-5 w-5" style={{ color: 'var(--accent-color)' }} />
                            <Typography variant="small" style={{ color: 'var(--default-color)' }}>
                                Summary: {medicines.filter(m => m.medicine_name).length} Rx, {labTests.filter(t => t.test_name).length} Tests
                            </Typography>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="text"
                                onClick={onClose}
                                className="normal-case hover:bg-gray-100"
                                style={{ color: 'var(--default-color)' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="filled"
                                onClick={handleSubmit}
                                disabled={loading || !diagnosis}
                                className="normal-case flex items-center gap-2 px-6"
                                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircleIcon className="h-4 w-4" />
                                )}
                                Save Prescription
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </Dialog>
        </>
    );
}