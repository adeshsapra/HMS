import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { roomsData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { HomeModernIcon } from "@heroicons/react/24/outline";

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  bedCount: number;
  occupiedBeds: number;
  floor: number;
  status: string;
}

export default function Rooms(): JSX.Element {
  const [rooms, setRooms] = useState<Room[]>(roomsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const columns: Column[] = [
    { 
      key: "roomNumber", 
      label: "Room Number",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800 text-base">{value}</span>
      ),
    },
    { key: "roomType", label: "Room Type" },
    { 
      key: "bedCount", 
      label: "Total Beds",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    { 
      key: "occupiedBeds", 
      label: "Occupied",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (value: any, row: Room) => {
        const available = row.bedCount - row.occupiedBeds;
        return (
          <span className="font-bold text-green-600">
            {available} beds available
          </span>
        );
      },
    },
    { key: "floor", label: "Floor" },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "roomNumber", label: "Room Number" },
    { key: "roomType", label: "Room Type" },
    { key: "bedCount", label: "Total Beds" },
    { key: "occupiedBeds", label: "Occupied Beds" },
    { key: "floor", label: "Floor" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "roomNumber",
      label: "Room Number",
      type: "text",
      required: true,
      placeholder: "Enter room number",
    },
    {
      name: "roomType",
      label: "Room Type",
      type: "select",
      required: true,
      options: [
        { value: "General Ward", label: "General Ward" },
        { value: "Private Room", label: "Private Room" },
        { value: "ICU", label: "ICU" },
        { value: "Emergency", label: "Emergency" },
        { value: "Surgery", label: "Surgery" },
      ],
    },
    {
      name: "bedCount",
      label: "Total Beds",
      type: "number",
      required: true,
      min: 1,
      placeholder: "Enter total beds",
    },
    {
      name: "floor",
      label: "Floor",
      type: "number",
      required: true,
      min: 1,
      placeholder: "Enter floor number",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "available", label: "Available" },
        { value: "occupied", label: "Occupied" },
        { value: "maintenance", label: "Maintenance" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedRoom(null);
    setOpenModal(true);
  };

  const handleEdit = (room: Room): void => {
    setSelectedRoom(room);
    setOpenModal(true);
  };

  const handleDelete = (room: Room): void => {
    setSelectedRoom(room);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedRoom) {
      setRooms(rooms.filter((r) => r.id !== selectedRoom.id));
      setOpenDeleteModal(false);
      setSelectedRoom(null);
    }
  };

  const handleView = (room: Room): void => {
    setSelectedRoom(room);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedRoom) {
      setRooms(
        rooms.map((r) =>
          r.id === selectedRoom.id
            ? { ...r, ...data, occupiedBeds: r.occupiedBeds }
            : r
        )
      );
    } else {
      const newRoom: Room = {
        id: rooms.length + 1,
        ...data,
        occupiedBeds: 0,
      } as Room;
      setRooms([...rooms, newRoom]);
    }
    setOpenModal(false);
    setSelectedRoom(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Rooms & Beds</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital rooms and bed allocation</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <HomeModernIcon className="h-5 w-5" />
          Add Room
        </Button>
      </div>

      <DataTable
        title="Room Management"
        data={rooms}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Room"
        searchPlaceholder="Search rooms..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRoom(null);
        }}
        title={selectedRoom ? "Edit Room" : "Add New Room"}
        formFields={formFields}
        initialData={selectedRoom || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedRoom ? "Update Room" : "Add Room"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedRoom(null);
        }}
        title="Room Details"
        data={selectedRoom || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedRoom(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room?"
        itemName={selectedRoom?.roomNumber}
      />
    </div>
  );
}

