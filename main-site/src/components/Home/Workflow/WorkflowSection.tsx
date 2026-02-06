import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';

// --- Data ---
const workflowSteps = [
    {
        id: 1,
        step: "01",
        title: "Find Doctor",
        desc: "Search by name, specialty, or condition.",
        icon: "bi-search-heart",
    },
    {
        id: 2,
        step: "02",
        title: "Book Slot",
        desc: "Choose a time that fits your schedule.",
        icon: "bi-calendar-date",
    },
    {
        id: 3,
        step: "03",
        title: "Instant Confirm",
        desc: "Receive booking details via SMS/Email.",
        icon: "bi-patch-check",
    },
    {
        id: 4,
        step: "04",
        title: "Visit Hospital",
        desc: "Skip the queue and get treated.",
        icon: "bi-hospital",
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
            {/* --- Background Ambient Glows --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-color)] opacity-10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--heading-color)] opacity-10 rounded-full blur-[120px]" />
            </div>

            <div className="container relative z-10">
                {/* --- Header --- */}
                <motion.div
                    style={{ scale, opacity }}
                    className="text-center mb-24"
                >
                    <span className="d-inline-block py-1 px-3 rounded-pill mb-3 text-sm font-bold tracking-wider uppercase bg-[rgba(4,158,187,0.1)] text-[var(--accent-color)]">
                        Simple Process
                    </span>
                    <h2 className="display-4 fw-bold" style={{ color: 'var(--heading-color)' }}>
                        Your Journey to <span className="text-gradient">Better Health</span>
                    </h2>
                </motion.div>

                {/* --- The Zig-Zag Flow --- */}
                <div className="relative">

                    {/* Desktop Connector Snake Line (SVG) */}
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
                                                <i className={`bi ${item.icon} text-3xl relative z-10 text-white`}></i>
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
                }

                .icon-bg {
                    position: absolute;
                    inset: 0;
                    background: var(--accent-color);
                    border-radius: 24px;
                    transform: rotate(45deg);
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 20px rgba(4, 158, 187, 0.3);
                }

                .glass-card:hover .icon-bg {
                    transform: rotate(90deg) scale(1.1);
                    border-radius: 50%;
                }

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