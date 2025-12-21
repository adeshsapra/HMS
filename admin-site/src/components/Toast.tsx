import React, { useEffect } from 'react';
import { Toast } from '@/context/ToastContext';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100000] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    // Animation classes
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        // Trigger animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        error: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
        warning: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
        info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    };

    return (
        <div
            className={`
        flex items-center p-4 rounded-lg shadow-lg border backdrop-blur-sm
        transition-all duration-300 ease-in-out transform pointer-events-auto
        ${styles[toast.type]}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
            role="alert"
        >
            <div className="flex-shrink-0 mr-3">
                {icons[toast.type]}
            </div>
            <div className="flex-1 text-sm font-medium">
                {toast.message}
            </div>
            <button
                onClick={onRemove}
                className="ml-4 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center hover:bg-black/5 focus:outline-none transition-colors"
                aria-label="Close"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
