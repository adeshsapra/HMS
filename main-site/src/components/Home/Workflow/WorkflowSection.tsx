import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';

const workflowSteps = [
    {
        id: 1,
        step: "01",
        title: "Find Doctor",
        desc: "Search by name, specialty, or condition.",
        icon: (
            <svg className="workflow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
        ),
    },
    {
        id: 2,
        step: "02",
        title: "Book Slot",
        desc: "Choose a time that fits your schedule.",
        icon: (
            <svg className="workflow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
        ),
    },
    {
        id: 3,
        step: "03",
        title: "Instant Confirm",
        desc: "Receive booking details via SMS/Email.",
        icon: (
            <svg className="workflow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
    {
        id: 4,
        step: "04",
        title: "Visit Hospital",
        desc: "Skip the queue and get treated.",
        icon: (
            <svg className="workflow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M9 22V12h6v10" />
                <path d="M12 2v5" />
                <path d="M15 4.5L12 7 9 4.5" />
            </svg>
        ),
    }
];

// --- Animations ---
const cardVariants: Variants = {
    offscreen: { y: 100, opacity: 0, rotate: -5 },
    onscreen: (index: number) => ({
        y: 0,
        opacity: 1,
        rotate: 0,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 0.8,
            delay: index * 0.2
        }
    })
};

const WorkflowSection: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <section
            id="workflow"
            ref={targetRef}
            className="workflow-section relative py-24 overflow-hidden"
            style={{ backgroundColor: 'var(--background-color)' }}
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-color)] opacity-10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--heading-color)] opacity-10 rounded-full blur-[120px]" />
            </div>

            <div className="container relative z-10">
                <motion.div
                    style={{ scale, opacity }}
                    className="text-center mb-24"
                >
                    <h2 className="display-6 fw-bold" style={{ color: 'var(--heading-color)' }}>
                        Your Journey to <span className="text-gradient">Better Health</span>
                    </h2>
                </motion.div>


                <div className="relative">
                    <div className="absolute top-[50%] left-0 w-full -translate-y-1/2 d-none d-lg-block z-0">
                        <svg className="w-full h-[200px]" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
                            <motion.path
                                d="M0,100 C150,100 150,20 300,20 C450,20 450,180 600,180 C750,180 750,20 900,20 C1050,20 1050,100 1200,100"
                                stroke="var(--accent-color)"
                                strokeWidth="2"
                                strokeDasharray="10 10"
                                strokeOpacity="0.2"
                                fill="none"
                            />
                            {/* The Animated Beam that travels the path */}
                            <motion.path
                                d="M0,100 C150,100 150,20 300,20 C450,20 450,180 600,180 C750,180 750,20 900,20 C1050,20 1050,100 1200,100"
                                stroke="var(--accent-color)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {workflowSteps.map((item, index) => {
                            // Calculate staggered alignment: Even items go down, Odd items go up
                            const isEven = index % 2 === 0;
                            const marginTop = isEven ? '0px' : '80px';

                            return (
                                <div className="col-lg-3 col-md-6 relative perspective-container" key={item.id}>
                                    <motion.div
                                        className="h-100"
                                        initial="offscreen"
                                        whileInView="onscreen"
                                        viewport={{ once: true, amount: 0.3 }}
                                        custom={index}
                                        variants={cardVariants}
                                        style={{ marginTop: window.innerWidth > 991 ? marginTop : '0px' }}
                                    >
                                        {/* --- DRAGGABLE CARD --- */}
                                        <motion.div
                                            className="glass-card p-4 rounded-5 text-center relative"
                                            drag
                                            dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
                                            whileHover={{ scale: 1.05, rotate: isEven ? 2 : -2, cursor: "grab" }}
                                            whileTap={{ cursor: "grabbing", scale: 0.95 }}
                                        >
                                            {/* Glowing Step Number */}
                                            <div className="step-badge">
                                                {item.step}
                                            </div>

                                            {/* Floating Icon */}
                                            <div className="icon-float-wrapper mb-4 mx-auto">
                                                <div className="icon-bg" />
                                                <div className="relative z-10 text-white d-flex align-items-center justify-content-center h-100">
                                                    {item.icon}
                                                </div>
                                            </div>

                                            <h4 className="fw-bold mb-2 text-xl" style={{ color: 'var(--heading-color)' }}>
                                                {item.title}
                                            </h4>
                                            <p className="text-muted text-sm mb-0">
                                                {item.desc}
                                            </p>

                                            {/* Shine effect on hover */}
                                            <div className="shine-effect" />
                                        </motion.div>

                                        {/* Connection Dot (Visual Anchor) */}
                                        <div className={`connection-dot d-none d-lg-block ${!isEven ? 'top-anchor' : 'bottom-anchor'}`} />

                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                /* Typography & Gradient */
                .text-gradient {
                    background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* 3D Glass Card */
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 
                        0 10px 30px -5px rgba(0, 0, 0, 0.05),
                        0 4px 6px -2px rgba(0, 0, 0, 0.01),
                        inset 0 0 20px rgba(255, 255, 255, 0.8);
                    transition: box-shadow 0.3s ease, border-color 0.3s ease;
                    z-index: 2;
                    overflow: hidden;
                    min-height: 280px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .glass-card:hover {
                    box-shadow: 
                        0 20px 40px -5px rgba(4, 158, 187, 0.15),
                        0 0 15px rgba(4, 158, 187, 0.1);
                    border-color: var(--accent-color);
                }

                /* Draggable Feel */
                .glass-card:active {
                    cursor: grabbing;
                }

                /* Step Badge */
                .step-badge {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 3rem;
                    font-weight: 900;
                    color: var(--accent-color);
                    opacity: 0.1;
                    line-height: 1;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }
                
                .glass-card:hover .step-badge {
                    opacity: 0.2;
                    transform: scale(1.1);
                }

                /* Icon Styling */
                .icon-float-wrapper {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }

                .icon-bg {
                    position: absolute;
                    inset: 0;
                    background: var(--accent-color);
                    border-radius: 20px;
                    transform: rotate(45deg);
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 20px rgba(4, 158, 187, 0.3);
                }

                .glass-card:hover .icon-bg {
                    transform: rotate(90deg) scale(1.1);
                    border-radius: 50%;
                    background: var(--heading-color);
                }

                .workflow-svg {
                    width: 32px;
                    height: 32px;
                    color: white;
                    position: relative;
                    z-index: 12;
                }

                /* Utility fallbacks */
                .text-sm { font-size: 0.875rem; }
                .text-xl { font-size: 1.25rem; }
                .text-3xl { font-size: 1.875rem; }


                /* Shine Effect */
                .shine-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        to right,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.6) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    transform: skewX(-25deg);
                    transition: all 0.75s;
                    pointer-events: none;
                }

                .glass-card:hover .shine-effect {
                    left: 200%;
                    transition: 0.7s ease-in-out;
                }

                /* Connection Dots on the Line */
                .connection-dot {
                    position: absolute;
                    left: 50%;
                    width: 12px;
                    height: 12px;
                    background: var(--surface-color);
                    border: 3px solid var(--accent-color);
                    border-radius: 50%;
                    transform: translateX(-50%);
                    z-index: 1;
                    box-shadow: 0 0 0 4px rgba(4, 158, 187, 0.2);
                }

                .top-anchor { top: -40px; } /* Adjust based on SVG curve */
                .bottom-anchor { bottom: -40px; }

                /* Mobile Reset */
                @media (max-width: 991px) {
                    .perspective-container {
                        margin-top: 0 !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default WorkflowSection;