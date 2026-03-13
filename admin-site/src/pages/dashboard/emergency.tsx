import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Input,
  Select,
  Option,
  Switch,
  Typography,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface EmergencyContact {
  id: number;
  icon: string;
  title: string;
  phone: string;
  meta?: string;
  badge?: string;
  badge_type: "blue" | "green";
  urgent: boolean;
  is_active: boolean;
  sort_order: number;
}

interface EmergencyTip {
  id: number;
  tip: string;
  is_active: boolean;
}

interface EmergencySectionData {
  section_heading: string;
  section_description?: string;
  banner_title: string;
  banner_description?: string;
  banner_button_label: string;
  banner_button_phone: string;
  tips_title: string;
  is_active: boolean;
  contacts: EmergencyContact[];
  tips: EmergencyTip[];
}

const emptyContact = {
  icon: "bi-hospital",
  title: "",
  phone: "",
  meta: "",
  badge: "",
  badge_type: "blue" as "blue" | "green",
  urgent: false,
  is_active: true,
  sort_order: 0,
};

export default function Emergency(): JSX.Element {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [savingTips, setSavingTips] = useState(false);
  const [section, setSection] = useState<EmergencySectionData | null>(null);
  const [tips, setTips] = useState<string[]>([""]);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({ ...emptyContact });
  const [savingContact, setSavingContact] = useState(false);

  const fetchEmergencyInfo = async () => {
    setLoading(true);
    try {
      const response = await apiService.getEmergencyInfo();
      if (response.status && response.data) {
        setSection(response.data);
        setTips(response.data.tips?.map((tip: EmergencyTip) => tip.tip) || [""]);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch emergency info", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyInfo();
  }, []);

  const handleSectionSave = async () => {
    if (!section) return;
    setSavingSection(true);
    try {
      const response = await apiService.updateEmergencySection({
        section_heading: section.section_heading,
        section_description: section.section_description || "",
        banner_title: section.banner_title,
        banner_description: section.banner_description || "",
        banner_button_label: section.banner_button_label,
        banner_button_phone: section.banner_button_phone,
        tips_title: section.tips_title,
        is_active: section.is_active,
      });

      if (response.status) {
        showToast("Emergency section updated successfully", "success");
        await fetchEmergencyInfo();
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update section", "error");
    } finally {
      setSavingSection(false);
    }
  };

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({
      ...emptyContact,
      sort_order: (section?.contacts?.length || 0) + 1,
    });
    setContactModalOpen(true);
  };

  const openEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      icon: contact.icon,
      title: contact.title,
      phone: contact.phone,
      meta: contact.meta || "",
      badge: contact.badge || "",
      badge_type: contact.badge_type,
      urgent: contact.urgent,
      is_active: contact.is_active,
      sort_order: contact.sort_order,
    });
    setContactModalOpen(true);
  };

  const handleContactSave = async () => {
    if (!contactForm.title.trim() || !contactForm.phone.trim()) {
      showToast("Title and phone are required", "error");
      return;
    }

    setSavingContact(true);
    try {
      let response;
      if (editingContact) {
        response = await apiService.updateEmergencyContact(editingContact.id, contactForm);
      } else {
        response = await apiService.createEmergencyContact(contactForm);
      }

      if (response.status) {
        showToast(editingContact ? "Contact updated successfully" : "Contact added successfully", "success");
        setContactModalOpen(false);
        setEditingContact(null);
        await fetchEmergencyInfo();
      }
    } catch (error: any) {
      showToast(error.message || "Failed to save contact", "error");
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      const response = await apiService.deleteEmergencyContact(contactId);
      if (response.status) {
        showToast("Contact deleted successfully", "success");
        await fetchEmergencyInfo();
      }
    } catch (error: any) {
      showToast(error.message || "Failed to delete contact", "error");
    }
  };

  const addTipInput = () => {
    setTips((prev) => [...prev, ""]);
  };

  const removeTipInput = (index: number) => {
    setTips((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTip = (index: number, value: string) => {
    setTips((prev) => prev.map((tip, i) => (i === index ? value : tip)));
  };

  const saveTips = async () => {
    const cleanedTips = tips
      .map((tip) => tip.trim())
      .filter((tip) => tip.length > 0)
      .map((tip) => ({ tip, is_active: true }));

    if (cleanedTips.length === 0) {
      showToast("Add at least one emergency care tip", "error");
      return;
    }

    setSavingTips(true);
    try {
      const response = await apiService.updateEmergencyTips(cleanedTips);
      if (response.status) {
        showToast("Emergency care tips updated successfully", "success");
        await fetchEmergencyInfo();
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update tips", "error");
    } finally {
      setSavingTips(false);
    }
  };

  if (loading || !section) {
    return (
      <div className="mt-12 flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-blue-gray-800">Emergency Info Management</h2>
        <p className="text-blue-gray-600">Manage home page emergency content, contacts, and care tips</p>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="m-0 rounded-none border-b border-blue-gray-50 p-4">
          <Typography variant="h6" color="blue-gray">Section Content</Typography>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Section Heading"
              value={section.section_heading}
              onChange={(e) => setSection({ ...section, section_heading: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Section Description"
              value={section.section_description || ""}
              onChange={(e) => setSection({ ...section, section_description: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Banner Title"
              value={section.banner_title}
              onChange={(e) => setSection({ ...section, banner_title: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Banner Description"
              value={section.banner_description || ""}
              onChange={(e) => setSection({ ...section, banner_description: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Banner Button Label"
              value={section.banner_button_label}
              onChange={(e) => setSection({ ...section, banner_button_label: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Banner Button Phone"
              value={section.banner_button_phone}
              onChange={(e) => setSection({ ...section, banner_button_phone: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div>
            <Input
              label="Tips Title"
              value={section.tips_title}
              onChange={(e) => setSection({ ...section, tips_title: e.target.value })}
              crossOrigin={undefined}
            />
          </div>
          <div className="flex items-center">
            <Switch
              crossOrigin={undefined}
              label="Section Active"
              checked={section.is_active}
              onChange={(e) => setSection({ ...section, is_active: e.target.checked })}
            />
          </div>
          <div className="md:col-span-2">
            <Button color="blue" onClick={handleSectionSave} disabled={savingSection}>
              {savingSection ? "Saving..." : "Save Section"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="m-0 flex items-center justify-between rounded-none border-b border-blue-gray-50 p-4">
          <Typography variant="h6" color="blue-gray">Emergency Contact Cards</Typography>
          <Button size="sm" color="blue" className="flex items-center gap-2" onClick={openAddContact}>
            <PlusIcon className="h-4 w-4" />
            Add Contact
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-gray-50/50">
                <th className="p-3">Title</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Badge</th>
                <th className="p-3">Urgent</th>
                <th className="p-3">Active</th>
                <th className="p-3">Order</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {section.contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-blue-gray-400">No emergency contacts available.</td>
                </tr>
              ) : (
                section.contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-blue-gray-50">
                    <td className="p-3 font-semibold">{contact.title}</td>
                    <td className="p-3">{contact.phone}</td>
                    <td className="p-3">{contact.badge || "-"}</td>
                    <td className="p-3">{contact.urgent ? "Yes" : "No"}</td>
                    <td className="p-3">{contact.is_active ? "Yes" : "No"}</td>
                    <td className="p-3">{contact.sort_order}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <IconButton variant="text" color="blue" onClick={() => openEditContact(contact)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => {
                            const confirmed = window.confirm("Delete this emergency contact?");
                            if (confirmed) handleDeleteContact(contact.id);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="m-0 flex items-center justify-between rounded-none border-b border-blue-gray-50 p-4">
          <Typography variant="h6" color="blue-gray">When to Seek Emergency Care</Typography>
          <Button size="sm" color="blue" className="flex items-center gap-2" onClick={addTipInput}>
            <PlusIcon className="h-4 w-4" />
            Add Tip
          </Button>
        </CardHeader>
        <CardBody className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  label={`Tip ${index + 1}`}
                  value={tip}
                  onChange={(e) => updateTip(index, e.target.value)}
                  crossOrigin={undefined}
                />
              </div>
              <IconButton
                variant="text"
                color="red"
                onClick={() => removeTipInput(index)}
                disabled={tips.length === 1}
              >
                <XMarkIcon className="h-5 w-5" />
              </IconButton>
            </div>
          ))}
          <div>
            <Button color="blue" onClick={saveTips} disabled={savingTips}>
              {savingTips ? "Saving..." : "Save Tips"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Dialog open={contactModalOpen} handler={() => setContactModalOpen(false)} size="md">
        <DialogHeader>{editingContact ? "Edit Contact Card" : "Add Contact Card"}</DialogHeader>
        <DialogBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Icon class (Bootstrap icon)"
            value={contactForm.icon}
            onChange={(e) => setContactForm({ ...contactForm, icon: e.target.value })}
            crossOrigin={undefined}
          />
          <Input
            label="Title"
            value={contactForm.title}
            onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
            crossOrigin={undefined}
          />
          <Input
            label="Phone"
            value={contactForm.phone}
            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            crossOrigin={undefined}
          />
          <Input
            label="Meta text"
            value={contactForm.meta}
            onChange={(e) => setContactForm({ ...contactForm, meta: e.target.value })}
            crossOrigin={undefined}
          />
          <Input
            label="Badge text"
            value={contactForm.badge}
            onChange={(e) => setContactForm({ ...contactForm, badge: e.target.value })}
            crossOrigin={undefined}
          />
          <Select
            label="Badge color"
            value={contactForm.badge_type}
            onChange={(value) => setContactForm({ ...contactForm, badge_type: (value as "blue" | "green") || "blue" })}
          >
            <Option value="blue">Blue</Option>
            <Option value="green">Green</Option>
          </Select>
          <Input
            label="Sort order"
            type="number"
            value={String(contactForm.sort_order)}
            onChange={(e) => setContactForm({ ...contactForm, sort_order: Number(e.target.value) || 0 })}
            crossOrigin={undefined}
          />
          <div className="flex items-center gap-6">
            <Switch
              crossOrigin={undefined}
              label="Urgent"
              checked={contactForm.urgent}
              onChange={(e) => setContactForm({ ...contactForm, urgent: e.target.checked })}
            />
            <Switch
              crossOrigin={undefined}
              label="Active"
              checked={contactForm.is_active}
              onChange={(e) => setContactForm({ ...contactForm, is_active: e.target.checked })}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" className="mr-2" onClick={() => setContactModalOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleContactSave} disabled={savingContact}>
            {savingContact ? "Saving..." : editingContact ? "Update Contact" : "Add Contact"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
