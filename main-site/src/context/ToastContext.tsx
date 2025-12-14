import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="custom-toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`custom-toast custom-toast-${toast.type} show`}>
                        <div className="custom-toast-icon">
                            {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
                            {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
                            {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
                            {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
                        </div>
                        <div className="custom-toast-message">{toast.message}</div>
                        <button className="custom-toast-close" onClick={() => removeToast(toast.id)}>
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
        .custom-toast-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          pointer-events: none; /* Allow clicks to pass through container space */
        }

        .custom-toast {
          pointer-events: auto; /* Re-enable clicks on toasts */
          min-width: 320px;
          max-width: 90vw;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.4);
          animation: slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transition: all 0.3s ease;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .custom-toast-icon {
          margin-right: 14px;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
        }

        .custom-toast-message {
          flex: 1;
          font-family: 'Open Sans', system-ui, -apple-system, sans-serif;
          font-weight: 500;
          color: #2D3748;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .custom-toast-close {
          background: transparent;
          border: none;
          color: #A0AEC0;
          cursor: pointer;
          font-size: 1.4rem;
          padding: 0;
          margin-left: 12px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .custom-toast-close:hover {
          color: #4A5568;
        }

        /* Types */
        .custom-toast-success .custom-toast-icon { color: #10B981; }
        .custom-toast-success { border-left: 4px solid #10B981; }

        .custom-toast-error .custom-toast-icon { color: #EF4444; }
        .custom-toast-error { border-left: 4px solid #EF4444; }

        .custom-toast-warning .custom-toast-icon { color: #F59E0B; }
        .custom-toast-warning { border-left: 4px solid #F59E0B; }

        .custom-toast-info .custom-toast-icon { color: #3B82F6; }
        .custom-toast-info { border-left: 4px solid #3B82F6; }

        /* Dark Mode Support (optional, based on system pref or class) */
        /* You can add @media (prefers-color-scheme: dark) if needed */
      `}</style>
        </ToastContext.Provider>
    );
};
