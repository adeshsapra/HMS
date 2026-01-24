import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { ApiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const SuccessPayment = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { showToast } = useToast();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Verifying your payment...');

    // Support both URL param and navigation state
    const token = searchParams.get('token') || location.state?.token;

    useEffect(() => {
        const capturePayment = async () => {
            console.log('🔍 [DEBUG] SuccessPage: Token for capture:', token);

            if (!token) {
                setStatus('error');
                setMessage('Invalid payment token. Technical details: token missing from URL and state.');
                return;
            }

            try {
                const response = await ApiService.capturePayPalPayment(token);
                console.log('🔍 [DEBUG] SuccessPage: Capture API Response:', response.data);

                if (response.data.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your bill has been updated.');
                    showToast('Payment completed successfully!', 'success');
                } else {
                    console.error('❌ [DEBUG] SuccessPage: API returned success=false:', response.data);
                    setStatus('error');
                    setMessage(response.data.message || 'Payment verification failed.');
                }
            } catch (error: any) {
                console.error('❌ [DEBUG] SuccessPage: Capture Error:', error);

                // If it was already captured, we might get an error but the payment is actually done
                // Let's assume if it fails it's an error for now
                setStatus('error');
                setMessage(error.response?.data?.message || 'An error occurred while verifying payment.');
            }
        };

        capturePayment();
    }, [token, showToast]);

    return (
        <div className="payment-status-wrapper">
            <style>{`
                .payment-status-wrapper {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: #f8fafc;
                }
                .status-card {
                    background: white;
                    padding: 3rem;
                    border-radius: 24px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .status-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .status-icon.processing { background: #e0f2fe; color: #0ea5e9; }
                .status-icon.success { background: #dcfce7; color: #22c55e; }
                .status-icon.error { background: #fee2e2; color: #ef4444; }
                
                .status-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }
                .status-message {
                    color: #64748b;
                    margin-bottom: 2rem;
                    line-height: 1.5;
                }
                .action-btn {
                    display: inline-block;
                    background: var(--accent-color, #049ebb);
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #0ea5e9;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>

            <div className="status-card">
                <div className={`status-icon ${status}`}>
                    {status === 'processing' && <div className="spinner"></div>}
                    {status === 'success' && (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    )}
                    {status === 'error' && (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                </div>

                <h1 className="status-title">
                    {status === 'processing' ? 'Verifying Payment' : status === 'success' ? 'Payment Successful' : 'Payment Failed'}
                </h1>
                <p className="status-message">{message}</p>

                <div className="actions">
                    <Link to="/profile" className="action-btn">
                        Go to Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SuccessPayment;
