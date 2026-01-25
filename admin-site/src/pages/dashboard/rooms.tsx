import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Card,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { DataTable, FormModal, DeleteConfirmModal, Column, FormField } from "@/components";
import { ActionItem } from "@/components/DataTable";
import ViewDetailsModal from "./ViewDetailsModal";
import ProcessAdmissionModal from "./ProcessAdmissionModal";
import apiService from "@/services/api";
import {
  HomeModernIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/solid";
import { useToast } from "@/context/ToastContext";

// Interfaces
interface RoomType {
  id: number;
  name: string;
  description: string;
  daily_charge: number;
}

interface Room {
  id: number;
  room_number: string;
  room_type_id: number;
  floor: string;
  status: string;
  room_type?: RoomType;
  beds?: any[];
}

interface Bed {
  id: number;
  room_id: number;
  bed_number: string;
  status: string;
  room?: Room;
}

interface Admission {
  id: number;
  patient_id: number;
  doctor_id: number;
  room_id: number;
  bed_id: number;
  admission_date: string;
  status: string;
  notes: string;
  patient?: any;
  doctor?: any;
  room?: any;
  bed?: any;
}

interface DashboardStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export default function Rooms(): JSX.Element {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("room-types");
  const [loading, setLoading] = useState(true);

  // Data States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  // Summary Stats
  const [stats, setStats] = useState<DashboardStat[]>([
    { title: "Total Rooms", value: 0, icon: <HomeModernIcon className="w-6 h-6" />, color: "blue" },
    { title: "Total Beds", value: 0, icon: <ArchiveBoxIcon className="w-6 h-6" />, color: "green" },
    { title: "Active Admissions", value: 0, icon: <UserGroupIcon className="w-6 h-6" />, color: "orange" },
    { title: "Available Beds", value: 0, icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />, color: "teal" },
  ]);

  // Modal States
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openProcessAdmissionModal, setOpenProcessAdmissionModal] = useState<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"room" | "roomType" | "bed" | "admission" | "discharge">("roomType");

  // View Modal States
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [viewType, setViewType] = useState<"room" | "roomType" | "bed" | "admission">("roomType");

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, roomTypesRes, bedsRes, admissionsRes] = await Promise.all([
        apiService.getRooms(),
        apiService.getRoomTypes(),
        apiService.getBeds(),
        apiService.getAdmissions() // Get all admissions
      ]);

      const roomsData = Array.isArray(roomsRes) ? roomsRes : (roomsRes.data || []);
      const roomTypesData = Array.isArray(roomTypesRes) ? roomTypesRes : (roomTypesRes.data || []);
      const bedsData = Array.isArray(bedsRes) ? bedsRes : (bedsRes.data || []);
      const admissionsData = Array.isArray(admissionsRes) ? admissionsRes : (admissionsRes.data || []);

      setRooms(roomsData as Room[]);
      setRoomTypes(roomTypesData as RoomType[]);
      setBeds(bedsData as Bed[]);
      setAdmissions(admissionsData as Admission[]);

      // Calculate Stats
      const totalRooms = roomsData.length;
      const totalBeds = bedsData.length;
      const activeAdmissions = admissionsData.filter((a: any) => a.status === 'admitted').length;
      const availableBeds = bedsData.filter((b: any) => b.status === 'available').length;

      setStats([
        { title: "Total Rooms", value: totalRooms, icon: <HomeModernIcon className="w-6 h-6" />, color: "blue" },
        { title: "Total Beds", value: totalBeds, icon: <ArchiveBoxIcon className="w-6 h-6" />, color: "green" },
        { title: "Active Admissions", value: activeAdmissions, icon: <UserGroupIcon className="w-6 h-6" />, color: "orange" },
        { title: "Available Beds", value: availableBeds, icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />, color: "teal" },
      ]);

    } catch (error) {
      console.error("Failed to fetch data", error);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- Columns Configuration ---

  const roomColumns: Column[] = [
    { key: "room_number", label: "Room Number", render: (val) => <span className="font-bold text-blue-900">{val}</span> },
    { key: "room_type.name", label: "Type", render: (val, row) => <span className="font-medium">{row.room_type?.name || '-'}</span> },
    { key: "floor", label: "Floor" },
    { key: "status", label: "Status", type: "status" },
    { key: "beds", label: "Total Beds", render: (val, row) => <span className="text-gray-600 font-semibold">{row.beds?.length || 0}</span> },
  ];

  const roomTypeColumns: Column[] = [
    { key: "name", label: "Name", render: (val) => <span className="font-bold text-gray-800">{val}</span> },
    { key: "daily_charge", label: "Daily Charge", render: (val) => <span className="text-green-600 font-bold">${val}</span> },
    { key: "description", label: "Description", render: (val) => <span className="text-gray-500 italic">{val || "No description"}</span> },
  ];

  const bedColumns: Column[] = [
    { key: "bed_number", label: "Bed Number", render: (val) => <span className="font-bold text-gray-800">{val}</span> },
    { key: "room.room_number", label: "Room", render: (val, row) => <span className="text-blue-600 font-medium">{row.room?.room_number || '-'}</span> },
    { key: "status", label: "Status", type: "status" },
  ];

  const admissionColumns: Column[] = [
    { key: "patient.name", label: "Patient", render: (val, row) => <span className="font-bold">{row.patient?.name || row.patient?.first_name + ' ' + row.patient?.last_name || '-'}</span> },
    { key: "doctor.name", label: "Doctor", render: (val, row) => <span className="text-blue-500">{row.doctor?.first_name ? row.doctor.first_name + ' ' + row.doctor.last_name : (row.doctor?.name || '-')}</span> },
    {
      key: "room_info", label: "Assigned To", render: (val, row) => (
        row.status === 'admitted'
          ? <><span className="font-semibold text-blue-900">Rm {row.room?.room_number}</span> <span className="text-gray-400">/</span> <span className="font-semibold text-gray-700">Bed {row.bed?.bed_number}</span></>
          : <span className="text-gray-400 italic">Not assigned</span>
      )
    },
    { key: "admission_date", label: "Admit Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "status", label: "Status", type: "status" },
  ];

  // --- Form Fields Configuration ---

  const getFormFields = (): FormField[] => {
    if (modalType === "room") {
      return [
        { name: "room_number", label: "Room Number", type: "text", required: true, placeholder: "e.g. 101" },
        { name: "floor", label: "Floor", type: "text", placeholder: "e.g. 1st Floor" },
        {
          name: "room_type_id",
          label: "Room Type",
          type: "select",
          required: true,
          options: roomTypes.map(rt => ({ value: rt.id.toString(), label: rt.name }))
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
        },
      ];
    } else if (modalType === "roomType") {
      return [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Private Suite" },
        { name: "daily_charge", label: "Daily Charge ($)", type: "number", required: true, placeholder: "0.00" },
        { name: "description", label: "Description", type: "textarea", placeholder: "Details about the room type..." },
      ];
    } else if (modalType === "bed") {
      return [
        { name: "bed_number", label: "Bed Number", type: "text", required: true, placeholder: "e.g. 101-A" },
        {
          name: "room_id",
          label: "Room",
          type: "select",
          required: true,
          options: rooms.map(r => ({ value: r.id.toString(), label: r.room_number }))
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [{ value: 'available', label: 'Available' }, { value: 'occupied', label: 'Occupied' }, { value: 'maintenance', label: 'Maintenance' }]
        },
      ];
    } else if (modalType === "discharge") {
      return [
        { name: "discharge_date", label: "Discharge Date", type: "date", required: true },
      ];
    }
    return [];
  };

  // --- Handlers ---

  const handleAdd = () => {
    setSelectedItem(null);
    if (activeTab === "room-types") setModalType("roomType");
    else if (activeTab === "rooms") setModalType("room");
    else if (activeTab === "beds") setModalType("bed");
    else setModalType("admission"); // Not really used for now as we don't have manual 'add admission' button except via recommendation logic or maybe generic
    setOpenModal(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    if (activeTab === "room-types") setModalType("roomType");
    else if (activeTab === "rooms") setModalType("room");
    else if (activeTab === "beds") setModalType("bed");
    else {
      // Edit admission? Maybe just notes.
      // For now preventing full edit of admission here to avoid conflicts.
      return;
    }
    setOpenModal(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    if (activeTab === "room-types") setModalType("roomType");
    else if (activeTab === "rooms") setModalType("room");
    else if (activeTab === "beds") setModalType("bed");
    else setModalType("admission");
    setOpenDeleteModal(true);
  };

  const handleView = (item: any) => {
    if (activeTab === "room-types") {
      setViewType("roomType");
      setViewItem(item);
    } else if (activeTab === "rooms") {
      setViewType("room");
      setViewItem(item);
    } else if (activeTab === "beds") {
      setViewType("bed");
      setViewItem(item);
    } else {
      setViewType("admission");
      setViewItem(item);
    }
    setOpenViewModal(true);
  };

  // Admission Actions
  const handleAdmit = (item: any) => {
    setSelectedItem(item);
    setOpenProcessAdmissionModal(true);
  };

  const handleDischarge = (item: any) => {
    setSelectedItem(item);
    setModalType("discharge");
    setOpenModal(true); // Re-using FormModal for discharge date input
  };

  const getAdmissionActions = (row: any): ActionItem[] => {
    const actions: ActionItem[] = [];
    if (row.status === 'pending') {
      actions.push({
        label: "Admit",
        icon: <UserPlusIcon className="h-4 w-4" />,
        color: "green",
        onClick: () => handleAdmit(row)
      });
    } else if (row.status === 'admitted') {
      actions.push({
        label: "Discharge",
        icon: <ArrowRightOnRectangleIcon className="h-4 w-4" />,
        color: "red",
        onClick: () => handleDischarge(row)
      });
    }
    return actions;
  };

  const handleSubmit = async (data: any) => {
    try {
      if (modalType === "room") {
        if (selectedItem) await apiService.updateRoom(selectedItem.id, data);
        else await apiService.createRoom(data);
      } else if (modalType === "roomType") {
        if (selectedItem) await apiService.updateRoomType(selectedItem.id, data);
        else await apiService.createRoomType(data);
      } else if (modalType === "bed") {
        if (selectedItem) await apiService.updateBed(selectedItem.id, data);
        else await apiService.createBed(data);
      } else if (modalType === "discharge") {
        if (selectedItem) await apiService.dischargePatient(selectedItem.id, { discharge_date: data.discharge_date });
      }
      setOpenModal(false);
      fetchData();
      showToast(`${modalType === 'discharge' ? 'Patient discharged' : 'Operation completed'} successfully`, "success");
    } catch (error) {
      console.error("Operation failed", error);
      showToast(`Operation failed: ${(error as any).message}`, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      if (!selectedItem) return;
      if (modalType === "room") await apiService.deleteRoom(selectedItem.id);
      else if (modalType === "roomType") await apiService.deleteRoomType(selectedItem.id);
      else if (modalType === "bed") await apiService.deleteBed(selectedItem.id);
      else if (modalType === "admission") await apiService.delete("admissions/" + selectedItem.id);

      setOpenDeleteModal(false);
      fetchData();
      showToast("Deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed", error);
      showToast(`Delete failed: ${(error as any).message}`, "error");
    }
  };

  const tabs = [
    { label: "Room Types", value: "room-types", icon: <Squares2X2Icon className="w-5 h-5" /> },
    { label: "Rooms", value: "rooms", icon: <HomeModernIcon className="w-5 h-5" /> },
    { label: "Beds", value: "beds", icon: <ArchiveBoxIcon className="w-5 h-5" /> },
    { label: "Admissions", value: "admissions", icon: <UserGroupIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Inpatient Department</h2>
          <p className="text-blue-gray-600 text-base">Comprehensive management of hospital rooms, beds, and patient admissions.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className={`shadow-lg border border-gray-100 hover:shadow-xl transition-shadow border-l-4 border-l-${stat.color}-500`}>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <Typography variant="small" className="font-normal text-blue-gray-600 mb-1">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" color="blue-gray" className="font-bold">
                    {stat.value}
                  </Typography>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-50 text-${stat.color}-500`}>
                  {stat.icon}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Card className="shadow-lg border border-gray-100">
        <Tabs value={activeTab}>
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
            <TabsHeader
              className="bg-transparent p-0 border-b-0"
              indicatorProps={{
                className: "bg-blue-500/10 shadow-none text-blue-500 border-b-2 border-blue-500",
              }}
            >
              {tabs.map(({ label, value, icon }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={`${activeTab === value ? "text-blue-600" : "text-gray-600 hover:text-gray-800"} flex items-center gap-2 font-medium py-3 px-6 transition-all duration-200`}
                >
                  {icon}
                  {label}
                </Tab>
              ))}
            </TabsHeader>
          </div>
          <TabsBody className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <TabPanel value="room-types">
                  <DataTable
                    title="Room Categories"
                    data={roomTypes}
                    columns={roomTypeColumns}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchable={true}
                    addButtonLabel="Add Category"
                  />
                </TabPanel>
                <TabPanel value="rooms">
                  <DataTable
                    title="Hospital Rooms"
                    data={rooms}
                    columns={roomColumns}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchable={true}
                    filterable={false}
                    addButtonLabel="Add Room"
                  />
                </TabPanel>
                <TabPanel value="beds">
                  <DataTable
                    title="Bed Management"
                    data={beds}
                    columns={bedColumns}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchable={true}
                    addButtonLabel="Add Bed"
                  />
                </TabPanel>
                <TabPanel value="admissions">
                  <DataTable
                    title="Patient Admissions"
                    data={admissions}
                    columns={admissionColumns}
                    onAdd={undefined} // No direct add, use recommendation flow
                    onDelete={handleDelete}
                    onView={handleView}
                    customActions={getAdmissionActions} // Add custom actions logic
                    searchable={true}
                  />
                </TabPanel>
              </>
            )}
          </TabsBody>
        </Tabs>
      </Card>

      <FormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalType === 'discharge'
            ? "Discharge Patient"
            : (selectedItem ? `Edit ${modalType.replace(/([A-Z])/g, ' $1').trim()}` : `Add ${modalType.replace(/([A-Z])/g, ' $1').trim()}`)
        }
        formFields={getFormFields()}
        initialData={selectedItem || (modalType === 'discharge' ? { discharge_date: new Date().toISOString().split('T')[0] } : {})}
        onSubmit={handleSubmit}
        submitLabel={modalType === 'discharge' ? "Confirm Discharge" : "Save Changes"}
      />

      {/* Process Admission Modal */}
      <ProcessAdmissionModal
        open={openProcessAdmissionModal}
        onClose={() => setOpenProcessAdmissionModal(false)}
        admission={selectedItem}
        onSuccess={fetchData}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? This action from the system cannot be undone."
        itemName={selectedItem?.id}
      />

      <ViewDetailsModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        type={viewType}
        item={viewItem}
      />
    </div>
  );
}
