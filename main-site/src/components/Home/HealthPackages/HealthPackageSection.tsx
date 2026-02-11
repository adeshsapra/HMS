import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useTransform, LayoutGroup, useScroll } from 'framer-motion';

// --- Types ---
export interface HealthPackage {
    id: number;
    title: string;
    subtitle: string;
    price_monthly: number;
    price_yearly: number;
    features_monthly: string[];
    features_yearly: string[];
    featured: boolean;
    ctaText?: string;
    icon?: React.ReactNode;
}

interface Props {
    healthPackages: HealthPackage[];
}

// --- Animated Number Component ---
const HomeHealthPackAnimatedNumber = ({ value }: { value: number }) => {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
};

// --- Single Card Component ---
const HomeHealthPackCard: React.FC<{
    pkg: HealthPackage;
    billingCycle: "monthly" | "yearly";
    index: number;
}> = ({ pkg, billingCycle, index }) => {

    const isYearly = billingCycle === 'yearly';
    const price = isYearly ? pkg.price_yearly : pkg.price_monthly;
    const features = isYearly ? pkg.features_yearly : pkg.features_monthly;

    // Directional entrance animation logic
    const getInitialState = () => {
        if (index % 3 === 0) return { opacity: 0, x: -80 };
        if (index % 3 === 1) return { opacity: 0, y: 80 };
        return { opacity: 0, x: 80 };
    };

    return (
        <motion.div
            className="col-lg-4 col-md-6 d-flex align-items-stretch" // Ensure equal height in grid
            initial={getInitialState()}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 40,
                damping: 15,
                delay: (index % 3) * 0.1
            }}
        >
            <motion.div
                className={`home-health-pack-card ${pkg.featured ? 'home-health-pack-featured' : ''}`}
                layout
                transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
            >
                {pkg.featured && (
                    <div className="home-health-pack-ribbon">
                        <span>Best Value</span>
                    </div>
                )}

                <div className="home-health-pack-card-body">
                    {/* Header */}
                    <div className="home-health-pack-header">
                        <div className={`home-health-pack-icon ${pkg.featured ? 'active' : ''}`}>
                            {pkg.icon ? pkg.icon : <i className={`bi ${pkg.featured ? 'bi-shield-check' : 'bi-heart-pulse'}`}></i>}
                        </div>
                        <div>
                            <h3 className="home-health-pack-title">{pkg.title}</h3>
                            <p className="home-health-pack-subtitle">{pkg.subtitle}</p>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="home-health-pack-price-wrapper">
                        <div className="d-flex align-items-start justify-content-center">
                            <span className="home-health-pack-currency">$</span>
                            <span className="home-health-pack-amount">
                                <HomeHealthPackAnimatedNumber value={price} />
                            </span>
                        </div>
                        <span className="home-health-pack-period">
                            per user / {billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                    </div>

                    <div className="home-health-pack-divider"></div>

                    {/* Features List */}
                    <div className="home-health-pack-features">
                        <AnimatePresence mode='wait'>
                            <motion.ul
                                key={billingCycle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {features.map((feature, i) => (
                                    <li key={i}>
                                        <i className="bi bi-check-circle-fill home-health-pack-check"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </motion.ul>
                        </AnimatePresence>
                    </div>

                    {/* CTA Button */}
                    <div className="home-health-pack-action">
                        <Link
                            to={`/health-plans/${pkg.id}?type=${billingCycle}`}
                            className={`home-health-pack-btn ${pkg.featured ? 'btn-filled' : 'btn-outline'}`}
                        >
                            {pkg.ctaText || "Get Started"}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Main Section Component ---
const HealthPackageSection: React.FC<Props> = ({ healthPackages }) => {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const targetRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <section className="home-health-pack-section" ref={targetRef}>
            <div className="container relative z-10 mb-5">
                <motion.div
                    style={{ scale, opacity }}
                    className="text-center"
                >
                    <h2 className="display-6 fw-bold" style={{ color: 'var(--heading-color)' }}>
                        Choose Your <span className="text-gradient">Health Package</span>
                    </h2>
                </motion.div>
            </div>

            <div className="container">
                {/* Toggle Switch - Positioned Below Header */}
                <div className="row justify-content-center mb-5 mt-n4">
                    <div className="col-lg-8 text-center">
                        <div className="d-flex justify-content-center">
                            <div className="home-health-pack-toggle-container">
                                <motion.div
                                    className="home-health-pack-toggle-bg"
                                    layout
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    style={{
                                        left: billingCycle === 'monthly' ? '4px' : 'calc(50% - 4px)'
                                    }}
                                />
                                <button
                                    className={`home-health-pack-toggle-item ${billingCycle === 'monthly' ? 'active' : ''}`}
                                    onClick={() => setBillingCycle('monthly')}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`home-health-pack-toggle-item ${billingCycle === 'yearly' ? 'active' : ''}`}
                                    onClick={() => setBillingCycle('yearly')}
                                >
                                    Yearly
                                    <span className="home-health-pack-save-tag">-20%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Packages Grid */}
                <LayoutGroup>
                    <div className="row gy-4 justify-content-center">
                        {healthPackages.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted" style={{ color: 'var(--default-color)' }}>No health packages available.</p>
                            </div>
                        ) : (
                            healthPackages.map((pkg, index) => (
                                <HomeHealthPackCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    billingCycle={billingCycle}
                                    index={index}
                                />
                            ))
                        )}
                    </div>
                </LayoutGroup>
            </div>

            <style>{`
                .home-health-pack-section {
                    /* Using a slight mix to differentiate section bg from card bg */
                    background-color: color-mix(in srgb, var(--background-color), #f8f9fa 50%); 
                    padding: 90px 0;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .text-gradient {
                    background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .text-sm { font-size: 0.875rem; }

                /* --- Typography & Badges --- */
                .home-health-pack-badge {
                    /* Auto-generates a light version of your accent color */
                    background: color-mix(in srgb, var(--accent-color), transparent 90%);
                    color: var(--accent-color);
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 6px 16px;
                    border-radius: 50px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 16px;
                    display: inline-block;
                }

                /* --- Toggle Switch --- */
                .home-health-pack-toggle-container {
                    background: var(--surface-color);
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 85%);
                    padding: 4px;
                    border-radius: 100px;
                    display: flex;
                    position: relative;
                    width: 260px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }

                .home-health-pack-toggle-bg {
                    position: absolute;
                    top: 4px;
                    bottom: 4px;
                    width: 50%;
                    background: var(--heading-color);
                    border-radius: 100px;
                    z-index: 1;
                }

                .home-health-pack-toggle-item {
                    flex: 1;
                    position: relative;
                    z-index: 2;
                    border: none;
                    background: transparent;
                    padding: 8px 0;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--default-color);
                    transition: color 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    opacity: 0.7;
                }

                .home-health-pack-toggle-item.active {
                    color: var(--contrast-color);
                    opacity: 1;
                }

                .home-health-pack-save-tag {
                    font-size: 0.65rem;
                    background: #fbbf24; /* Keep gold for warnings/savings */
                    color: #92400e;
                    padding: 1px 6px;
                    border-radius: 6px;
                    font-weight: 800;
                }

                /* --- Cards --- */
                .home-health-pack-card {
                    background: var(--surface-color);
                    border-radius: 20px;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                    position: relative;
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .home-health-pack-card:hover {
                    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
                    border-color: color-mix(in srgb, var(--accent-color), transparent 60%);
                    z-index: 2;
                }

                .home-health-pack-featured {
                    border: 2px solid var(--accent-color);
                    /* Subtle gradient using accent color */
                    background: linear-gradient(to bottom, var(--surface-color), color-mix(in srgb, var(--accent-color), white 95%) 120%);
                    transform: scale(1.02);
                }
                
                @media (max-width: 991px) {
                     .home-health-pack-featured { transform: none; }
                }

                .home-health-pack-ribbon {
                    position: absolute;
                    top: 20px;
                    right: -32px;
                    background: var(--accent-color);
                    color: var(--contrast-color);
                    transform: rotate(45deg);
                    width: 120px;
                    text-align: center;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 6px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-transform: uppercase;
                    z-index: 10;
                }

                .home-health-pack-card-body {
                    padding: 30px 25px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                /* --- Card Content --- */
                .home-health-pack-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 25px;
                }

                .home-health-pack-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: color-mix(in srgb, var(--default-color), transparent 95%);
                    color: var(--default-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    flex-shrink: 0;
                    transition: 0.3s;
                }

                .home-health-pack-icon.active {
                    background: var(--accent-color);
                    color: var(--contrast-color);
                    box-shadow: 0 6px 15px color-mix(in srgb, var(--accent-color), transparent 70%);
                }

                .home-health-pack-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    margin: 0;
                    color: var(--heading-color);
                    line-height: 1.2;
                }

                .home-health-pack-subtitle {
                    font-size: 0.8rem;
                    color: var(--default-color);
                    opacity: 0.7;
                    margin: 2px 0 0 0;
                }

                /* --- Price --- */
                .home-health-pack-price-wrapper {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .home-health-pack-currency {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--heading-color);
                    margin-top: 6px;
                }

                .home-health-pack-amount {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: var(--heading-color);
                    line-height: 1;
                    letter-spacing: -1.5px;
                }

                .home-health-pack-period {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--default-color);
                    opacity: 0.6;
                    margin-top: 5px;
                    font-weight: 500;
                }

                .home-health-pack-divider {
                    height: 1px;
                    background: color-mix(in srgb, var(--default-color), transparent 90%);
                    margin: 0 -25px 25px -25px;
                }

                /* --- Features --- */
                .home-health-pack-features {
                    flex-grow: 1;
                    margin-bottom: 30px;
                }

                .home-health-pack-features ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .home-health-pack-features li {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                    color: var(--default-color);
                    line-height: 1.4;
                }

                .home-health-pack-check {
                    color: var(--accent-color);
                    font-size: 1rem;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                /* --- Buttons --- */
                .home-health-pack-action {
                    margin-top: auto;
                }

                .home-health-pack-btn {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    text-decoration: none;
                    transition: all 0.25s ease;
                }

                .home-health-pack-btn.btn-filled {
                    background: var(--accent-color);
                    color: var(--contrast-color);
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-color), transparent 70%);
                }

                .home-health-pack-btn.btn-filled:hover {
                    /* Darkens accent color by 10% on hover without a new variable */
                    filter: brightness(0.9); 
                    transform: translateY(-2px);
                    color: var(--contrast-color);
                }

                .home-health-pack-btn.btn-outline {
                    background: transparent;
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 70%);
                    color: var(--heading-color);
                }

                .home-health-pack-btn.btn-outline:hover {
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                    background: color-mix(in srgb, var(--accent-color), transparent 95%);
                }
            `}</style>
        </section>
    );
};

export default HealthPackageSection;