import React from 'react';

interface ContentLoaderProps {
    message?: string;
    height?: string;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
    message = "Synchronizing Medical Data...",
    height = "400px"
}) => {
    return (
        <div className="premium-content-loader" style={{ minHeight: height }}>
            <style>{`
                .premium-content-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #ffffff;
                    border-radius: 24px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                .medical-loader-visualization {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin-bottom: 2rem;
                }

                .pulse-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(13, 138, 188, 0.1);
                    animation: circlePulse 2s infinite ease-in-out;
                }

                .pulse-circle:nth-child(2) {
                    animation-delay: 0.5s;
                }

                .heart-icon-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2;
                    color: #0d8abc;
                    font-size: 2.5rem;
                    animation: heartbeat 1.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
                }

                .loader-wave-svg {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 40px;
                    opacity: 0.2;
                }

                .loading-text-premium {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #1a3353;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-top: 10px;
                    position: relative;
                }

                .loading-text-premium::after {
                    content: '...';
                    position: absolute;
                    animation: dots 1.5s steps(5, end) infinite;
                }

                .shimmer-bar {
                    width: 150px;
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    margin-top: 20px;
                    overflow: hidden;
                    position: relative;
                }

                .shimmer-progress {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, #0d8abc, transparent);
                    animation: shimmerMove 1.5s infinite linear;
                }

                @keyframes circlePulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }

                @keyframes heartbeat {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    15% { transform: translate(-50%, -50%) scale(1.3); }
                    30% { transform: translate(-50%, -50%) scale(1); }
                    45% { transform: translate(-50%, -50%) scale(1.15); }
                    60% { transform: translate(-50%, -50%) scale(1); }
                }

                @keyframes shimmerMove {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }

                @keyframes dots {
                    0%, 20% { content: '.'; }
                    40% { content: '..'; }
                    60% { content: '...'; }
                    80%, 100% { content: ''; }
                }
            `}</style>

            <div className="medical-loader-visualization">
                <div className="pulse-circle"></div>
                <div className="pulse-circle"></div>
                <div className="heart-icon-wrapper">
                    <i className="bi bi-heart-pulse-fill"></i>
                </div>
            </div>

            <div className="loading-text-premium">{message}</div>

            <div className="shimmer-bar">
                <div className="shimmer-progress"></div>
            </div>
        </div>
    );
};

export default ContentLoader;
