import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, type Variants } from "framer-motion";

// --- Interfaces ---
interface HomeCareService {
    title: string;
    description: string;
    icon?: string;
    is_24_7?: boolean;
}

interface HomeCareSettings {
    home_care_desc?: string;
    home_care_cta?: string;
    home_care_image?: string;
}

interface HospitalAtHomeSectionProps {
    homeCareServices: HomeCareService[];
    homeCareSettings: HomeCareSettings;
    SectionHeading: React.FC<{
        children: React.ReactNode;
        desc?: string;
        align?: "left" | "center";
    }>;
}

// --- Helper for Random Numbers ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// --- The Swimming Card Component ---
// (Using the exact design and physics you requested)
const SwimmingCard: React.FC<{
    service: HomeCareService;
    constraintsRef: React.RefObject<HTMLDivElement | null>;
    index: number;
}> = ({ service, constraintsRef, index }) => {
    const controls = useAnimation();

    // Random starting position scattered around the section
    // Avoiding the exact center initially so they don't block text immediately
    const startTop = randomInt(5, 80);
    const startLeft = randomInt(5, 80);

    // Swim Logic
    const swimVariants: Variants = {
        swimming: {
            x: [0, randomInt(-80, 80), randomInt(-40, 40), 0],
            y: [0, randomInt(-40, 40), randomInt(-80, 80), 0],
            rotate: [0, randomInt(-5, 5), randomInt(5, -5), 0],
            transition: {
                duration: randomInt(15, 25), // Slow, calm movement
                ease: "easeInOut" as const,
                repeat: Infinity,
                repeatType: "mirror" as const,
            },
        },
    };

    useEffect(() => {
        controls.start("swimming");
    }, [controls]);

    return (
        <motion.div
            drag
            dragConstraints={constraintsRef}
            dragMomentum={true}
            dragTransition={{ power: 0.8, timeConstant: 300, bounceStiffness: 200, bounceDamping: 10 }}
            dragElastic={0.5}

            variants={swimVariants}
            animate={controls}
            onDragStart={() => controls.stop()} // Stop swimming when grabbed

            style={{
                position: "absolute",
                top: `${startTop}%`,
                left: `${startLeft}%`,
                zIndex: 20, // Sit ABOVE the text and image
                cursor: "grab",
            }}
            whileHover={{ scale: 1.1, zIndex: 100, cursor: "grab" }}
            whileDrag={{ scale: 1.15, zIndex: 100, cursor: "grabbing" }}

            className="swimming-card-wrapper"
        >
            <div className="card-glass">
                {service.is_24_7 && (
                    <div className="badge-alert">
                        <span className="blink-dot"></span> 24/7
                    </div>
                )}
                <div className="icon-bubble">
                    <i className={`bi ${service.icon || "bi-activity"}`}></i>
                </div>
                <div className="text-content">
                    <h5 className="fw-bold mb-1" style={{ color: "var(--heading-color)" }}>{service.title}</h5>
                    <p className="m-0 small text-muted card-desc">{service.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Section ---
const HospitalAtHomeSection: React.FC<HospitalAtHomeSectionProps> = ({
    homeCareServices,
    homeCareSettings,
    SectionHeading,
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    return (
        <section
            id="home-care"
            ref={sectionRef}
            className="home-care-tank position-relative overflow-hidden"
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .home-care-tank {
            background-color: var(--background-color);
            min-height: 100vh; /* Full height for swimming space */
            padding: 100px 0;
            position: relative;
        }

        /* --- Bubbles Background --- */
        .bubble {
            position: absolute;
            background: var(--accent-color);
            border-radius: 50%;
            opacity: 0.1;
            animation: rise 15s infinite ease-in;
            bottom: -50px;
            z-index: 0;
        }
        .b1 { width: 40px; height: 40px; left: 10%; animation-duration: 8s; }
        .b2 { width: 80px; height: 80px; left: 30%; animation-duration: 12s; }
        .b3 { width: 30px; height: 30px; left: 70%; animation-duration: 15s; }
        .b4 { width: 60px; height: 60px; left: 90%; animation-duration: 10s; }

        @keyframes rise {
            0% { transform: translateY(0) scale(1); opacity: 0.1; }
            100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }

        /* --- The Swimming Card Design (From your code) --- */
        .swimming-card-wrapper {
            width: 260px;
            touch-action: none; 
        }

        .card-glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
            transition: border-color 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            user-select: none;
        }

        .swimming-card-wrapper:hover .card-glass {
            border-color: var(--accent-color);
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 15px 40px rgba(4, 158, 187, 0.2);
        }

        .icon-bubble {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--accent-color), var(--heading-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.25rem;
            margin-bottom: 1rem;
            box-shadow: 0 4px 15px rgba(4, 158, 187, 0.3);
        }

        .card-desc {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.85rem;
        }

        .badge-alert {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 0.7rem;
            font-weight: bold;
            color: var(--accent-color);
            background: rgba(255,255,255,0.9);
            padding: 2px 8px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .blink-dot {
            width: 6px;
            height: 6px;
            background: red;
            border-radius: 50%;
            animation: blink 1s infinite;
        }

        @keyframes blink { 50% { opacity: 0; } }

        /* --- Layout & Image Styling --- */
        .layout-content {
            position: relative;
            z-index: 5; /* Lower than cards (20), but higher than bg (0) */
            pointer-events: none; /* Let clicks pass through empty spaces to draggable cards */
        }
        
        .interactive-element {
            pointer-events: auto; /* Re-enable clicks for text/buttons */
        }

        .hero-img {
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            width: 100%;
            height: auto;
            min-height: 500px;
            object-fit: cover;
        }

        .cta-btn {
            background: var(--heading-color);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .cta-btn:hover {
            transform: scale(1.05);
            color: white;
            background: var(--accent-color);
        }
      `,
                }}
            />

            {/* Background Bubbles */}
            <div className="bubble b1"></div>
            <div className="bubble b2"></div>
            <div className="bubble b3"></div>
            <div className="bubble b4"></div>

            {/* 
        LAYER 1: The Physics Cards 
        Mapped independently so they float over the entire section 
      */}
            {homeCareServices.length > 0 &&
                homeCareServices.map((service, idx) => (
                    <SwimmingCard
                        key={idx}
                        index={idx}
                        service={service}
                        constraintsRef={sectionRef}
                    />
                ))
            }

            {/* 
        LAYER 2: The Structured Layout (Left Text, Right Image) 
      */}
            <div className="container h-100 layout-content">
                <div className="row align-items-center gy-5 h-100">

                    {/* Left Side: Content */}
                    <div className="col-lg-6 interactive-element">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <SectionHeading align="left">
                                Hospital <span style={{ color: "var(--accent-color)" }}>at Home</span>
                            </SectionHeading>

                            <p className="lead mb-4 text-muted" style={{ maxWidth: '90%' }}>
                                {homeCareSettings.home_care_desc ||
                                    "Professional medical care delivered to your doorstep. Our certified staff brings the hospital experience to the comfort of your home."}
                            </p>

                            <div className="d-flex align-items-center gap-4">
                                <Link to="/home-care" className="cta-btn fw-bold shadow">
                                    {homeCareSettings.home_care_cta || "Book Appointment"}
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Image */}
                    <div className="col-lg-6 interactive-element">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="ps-lg-5"
                        >
                            <img
                                src={
                                    homeCareSettings.home_care_image ||
                                    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop"
                                }
                                alt="Medical professional"
                                className="img-fluid hero-img"
                            />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HospitalAtHomeSection;