import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  loading = false,
}: DeleteConfirmModalProps): JSX.Element {
  return (
    <Dialog open={open} handler={onClose} size="sm" className="!max-w-md">
      <DialogHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <Typography variant="h5" className="font-bold text-white">
              {title}
            </Typography>
          </div>
          <Button
            variant="text"
            color="white"
            onClick={onClose}
            className="rounded-full hover:bg-white/20 p-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>
      <DialogBody className="pt-6 px-6 bg-blue-gray-50/30">
        <div className="bg-white rounded-lg p-6 border border-blue-gray-100 shadow-sm">
          <Typography variant="paragraph" color="blue-gray" className="mb-3 font-medium text-base">
            {message}
          </Typography>
          {itemName && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Typography variant="small" color="red" className="font-bold text-sm">
                "{itemName}"
              </Typography>
            </div>
          )}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Typography variant="small" color="red" className="font-semibold text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4" />
              This action cannot be undone.
            </Typography>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="bg-white border-t border-blue-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <Button
          variant="text"
          color="blue-gray"
          onClick={onClose}
          className="px-6 py-2.5 font-semibold hover:bg-blue-gray-50"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="gradient"
          color="red"
          onClick={onConfirm}
          disabled={loading}
          className="px-8 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default DeleteConfirmModal;

