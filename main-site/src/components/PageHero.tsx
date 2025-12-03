import React from 'react';
import { Link } from "react-router-dom";

interface PageHeroProps {
    title: string;
    description?: string;
    bgImage?: string; 
    breadcrumbs?: Array<{ label: string; path?: string }>;
}

const PageHero = ({
    title,
    description,
    breadcrumbs,
    // A clean, modern hospital corridor image
    bgImage = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1920&auto=format&fit=crop' 
}: PageHeroProps) => {
    return (
        <section className="modern-hero-section">
            {/* Background Image Wrapper with Parallax */}
            <div 
                className="hero-bg-image" 
                style={{ backgroundImage: `url(${bgImage})` }}
            ></div>
            
            {/* Dark Overlay for contrast */}
            <div className="hero-overlay"></div>

            <div className="container position-relative z-2">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        
                        {/* THE GLASS CARD */}
                        <div className="glass-content-card">
                            
                            {/* Decorative Glow Blob behind text */}
                            <div className="glow-effect"></div>

                            {/* Breadcrumbs */}
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <nav aria-label="breadcrumb" className="hero-breadcrumb-nav">
                                    <ol className="breadcrumb justify-content-center mb-0">
                                        {breadcrumbs.map((crumb, index) => (
                                            <li
                                                key={index}
                                                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? "active" : ""}`}
                                            >
                                                {crumb.path ? (
                                                    <Link to={crumb.path}>
                                                        {index === 0 && <i className="bi bi-house-door-fill me-1"></i>}
                                                        {crumb.label}
                                                    </Link>
                                                ) : (
                                                    <span>{crumb.label}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Main Title */}
                            <h1 className="hero-title">{title}</h1>

                            {/* Divider Line */}
                            <div className="hero-divider"></div>

                            {/* Description */}
                            {description && <p className="hero-description">{description}</p>}
                        </div>

                    </div>
                </div>
            </div>

            {/* Smooth Curve Divider */}
            <div className="hero-curve">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" className="shape-fill"></path>
                </svg>
            </div>

            <style>{`
                /* --- CONTAINER & LAYOUT --- */
                .modern-hero-section {
                    position: relative;
                    width: 100%;
                    min-height: 520px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    padding-top: 80px; /* Navbar offset */
                    padding-bottom: 100px;
                    margin-bottom: 0;
                }

                /* --- BACKGROUND IMAGE --- */
                .hero-bg-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed; /* Parallax effect */
                    z-index: 0;
                    transform: scale(1.05); /* Slight zoom for depth */
                }

                /* --- OVERLAY --- */
                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    /* A gradient from your Heading Color to dark transparency */
                    background: linear-gradient(180deg, 
                        rgba(24, 68, 76, 0.85) 0%, 
                        rgba(4, 158, 187, 0.6) 100%);
                    z-index: 1;
                }

                /* --- THE GLASS CARD (The unique part) --- */
                .glass-content-card {
                    position: relative;
                    background: rgba(255, 255, 255, 0.1); /* Low opacity white */
                    backdrop-filter: blur(16px); /* THE BLUR LIGHT EFFECT */
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
                    overflow: hidden;
                    animation: floatUp 1s ease-out;
                }

                /* The Ambient Glow behind text inside the card */
                .glow-effect {
                    position: absolute;
                    top: -50%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 300px;
                    height: 300px;
                    background: var(--accent-color);
                    filter: blur(90px);
                    opacity: 0.3;
                    border-radius: 50%;
                    z-index: -1;
                    pointer-events: none;
                }

                /* --- BREADCRUMBS --- */
                .hero-breadcrumb-nav {
                    display: inline-block;
                    margin-bottom: 1.5rem;
                }

                .breadcrumb-item {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.6);
                }

                .breadcrumb-item + .breadcrumb-item::before {
                    color: var(--accent-color);
                    content: "•"; /* Bullet instead of slash for modern look */
                    font-size: 1.2rem;
                    line-height: 0.8;
                    vertical-align: middle;
                }

                .breadcrumb-item a {
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    transition: 0.3s;
                    position: relative;
                }

                .breadcrumb-item a:hover {
                    color: #fff;
                    text-shadow: 0 0 10px rgba(255,255,255,0.5);
                }

                .breadcrumb-item.active {
                    color: #ffffff;
                    text-decoration: underline;
                    text-decoration-color: var(--accent-color);
                    text-underline-offset: 4px;
                }

                /* --- TYPOGRAPHY --- */
                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -1px;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.2);
                }

                .hero-divider {
                    width: 60px;
                    height: 4px;
                    background: var(--accent-color);
                    margin: 20px auto;
                    border-radius: 2px;
                }

                .hero-description {
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.9);
                    max-width: 80%;
                    margin: 0 auto;
                    line-height: 1.7;
                    font-weight: 300;
                }

                /* --- BOTTOM CURVE --- */
                .hero-curve {
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    overflow: hidden;
                    line-height: 0;
                    z-index: 3;
                }

                .hero-curve svg {
                    position: relative;
                    display: block;
                    width: calc(100% + 1.3px);
                    height: 80px;
                }

                .hero-curve .shape-fill {
                    fill: var(--background-color);
                }

                /* --- ANIMATION --- */
                @keyframes floatUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                /* --- RESPONSIVE --- */
                @media (max-width: 991px) {
                    .modern-hero-section { min-height: 400px; }
                    .hero-title { font-size: 2.5rem; }
                    .glass-content-card { padding: 2rem 1rem; }
                    .hero-description { max-width: 100%; font-size: 1rem; }
                }
                
                @media (max-width: 576px) {
                    .modern-hero-section { padding-top: 100px; padding-bottom: 60px;}
                    .hero-title { font-size: 2rem; }
                }
            `}</style>
        </section>
    );
};

export default PageHero;