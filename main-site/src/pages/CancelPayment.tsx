import { Link } from 'react-router-dom';

const CancelPayment = () => {
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
                    background: #fff7ed;
                    color: #f97316;
                }
                
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
            `}</style>

            <div className="status-card">
                <div className="status-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>

                <h1 className="status-title">Payment Cancelled</h1>
                <p className="status-message">
                    You have cancelled the payment process. No funds were debited from your account.
                    If you encountered any issues, please contact our support team.
                </p>

                <div className="actions">
                    <Link to="/profile" className="action-btn">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CancelPayment;
