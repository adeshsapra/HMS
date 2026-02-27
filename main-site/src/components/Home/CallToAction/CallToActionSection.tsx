import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import SectionHeading from "../SectionHeading";

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const pulseIconVariant: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.15, 1],
    boxShadow: [
      "0 0 0px rgba(4, 158, 187, 0)",
      "0 0 25px rgba(4, 158, 187, 0.5)",
      "0 0 0px rgba(4, 158, 187, 0)",
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const CallToActionSection = () => {
  const containerRef = useRef<HTMLElement>(null);

  // Scroll-linked Parallax Animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY1 = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <>
      <style>{`
        /* Ultra-Modern Medical CTA Styles */
        .call-to-action {
          position: relative;
          overflow: hidden;
          background-color: #f4f9fb;
          background-image: radial-gradient(#049ebb 0.5px, transparent 0.5px), radial-gradient(#049ebb 0.5px, #f4f9fb 0.5px);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
          background-attachment: fixed;
          padding: 100px 0;
          z-index: 1;
        }

        /* Abstract Modern Background Orbs */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: -1;
          opacity: 0.5;
        }
        
        .bg-orb-1 {
          top: 0;
          right: -10%;
          width: 600px;
          height: 600px;
          background: #049ebb;
        }

        .bg-orb-2 {
          bottom: 0;
          left: -10%;
          width: 500px;
          height: 500px;
          background: #00d2ff;
        }

        /* Gradient Text Animation */
        .text-gradient-animated {
          background: linear-gradient(270deg, #049EBB, #00d2ff, #025b6e, #049EBB);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: GradientFlow 6s ease infinite;
          font-weight: 800;
        }

        @keyframes GradientFlow {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        /* CTA Buttons */
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 40px;
        }

        .btn-premium, .btn-outline-premium {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 40px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.5px;
        }

        .btn-premium {
          background: linear-gradient(135deg, #049EBB 0%, #027187 100%);
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(4, 158, 187, 0.3);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .btn-premium:hover {
          box-shadow: 0 15px 40px rgba(4, 158, 187, 0.5);
          color: #ffffff;
        }

        .btn-outline-premium {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          color: #025b6e;
          border: 2px solid transparent;
          background-clip: padding-box;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .btn-outline-premium:hover {
          border-color: #049EBB;
          color: #049EBB;
        }

        /* Premium Feature Cards */
        .features-row {
          margin-top: 80px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 40px 32px;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        .feature-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(4,158,187,0.5), transparent, transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .feature-card:hover::after {
          opacity: 1;
        }

        .feature-card .icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #e6f6f9 0%, #ffffff 100%);
          box-shadow: 8px 8px 16px rgba(4, 158, 187, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover .icon-wrapper {
          background: #049EBB;
          transform: translateY(-5px) scale(1.05) rotate(5deg);
          box-shadow: 10px 15px 25px rgba(4, 158, 187, 0.3);
        }

        .feature-card .icon-wrapper i {
          font-size: 32px;
          color: #049EBB;
          transition: all 0.3s ease;
        }

        .feature-card:hover .icon-wrapper i {
          color: #ffffff;
        }

        .feature-card h5 {
          font-size: 22px;
          font-weight: 800;
          color: #1a2b3c;
          margin-bottom: 14px;
        }

        .feature-card p {
          font-size: 15px;
          color: #5a6a7a;
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .feature-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #049EBB;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Glassmorphism Emergency Banner */
        .emergency-alert {
          margin-top: 80px;
          background: linear-gradient(135deg, #023642 0%, #049EBB 100%);
          border-radius: 30px;
          padding: 40px 48px;
          box-shadow: 0 30px 60px rgba(4, 158, 187, 0.2);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .emergency-alert::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: pulseGlow 8s infinite linear;
        }

        @keyframes pulseGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .emergency-content {
          display: flex;
          align-items: center;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .emergency-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emergency-icon i {
          font-size: 30px;
          color: #ffffff;
        }

        .emergency-text h4 {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .emergency-text p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          line-height: 1.5;
        }

        .emergency-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: #ffffff;
          color: #023642;
          font-size: 18px;
          font-weight: 800;
          border-radius: 50px;
          text-decoration: none;
          position: relative;
          z-index: 2;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }

        .emergency-btn:hover {
          background: #f0f9fb;
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          color: #049EBB;
        }

        @media (max-width: 991px) {
          .emergency-alert { padding: 32px; text-align: center; }
          .emergency-content { flex-direction: column; margin-bottom: 30px; }
          .emergency-btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 768px) {
          .cta-buttons { flex-direction: column; }
          .cta-buttons > div { width: 100%; display: flex; justify-content: center; }
          .btn-premium, .btn-outline-premium { width: 100%; max-width: 320px; }
          .feature-card { padding: 30px 24px; }
        }
      `}</style>

      <section
        id="call-to-action"
        className="call-to-action section"
        ref={containerRef}
      >
        {/* Scroll-Linked Parallax Background Elements */}
        <motion.div
          className="bg-orb bg-orb-1"
          style={{ y: bgY1, opacity: opacityFade }}
        />
        <motion.div
          className="bg-orb bg-orb-2"
          style={{ y: bgY2, opacity: opacityFade }}
        />

        <motion.div
          className="container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header & Main Buttons */}
          <div className="row justify-content-center">
            <motion.div className="col-lg-9 text-center" variants={fadeUpVariant}>
              <SectionHeading desc="Access world-class healthcare with our state-of-the-art facilities and compassionate medical experts. Your journey to better health and holistic wellness begins with a single step.">
                Excellence in Care is <span className="text-gradient-animated">Our Promise</span>
              </SectionHeading>

              <div className="cta-buttons">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/quickappointment" className="btn-premium">
                    <i className="bi bi-calendar2-check me-2"></i> Schedule Appointment
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/doctors" className="btn-outline-premium">
                    <i className="bi bi-search me-2"></i> Browse Specialists
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feature Cards Grid */}
          <div className="row features-row">
            {[
              {
                icon: "bi-heart-pulse-fill",
                title: "24/7 Trauma Care",
                desc: "Immediate, life-saving medical attention available around the clock with our fully equipped rapid response trauma center.",
                link: "View Facilities",
              },
              {
                icon: "bi-laptop",
                title: "Smart Digital Booking",
                desc: "Skip the waiting room. Schedule, manage, and track your medical appointments effortlessly through our secure patient portal.",
                link: "Book Online",
              },
              {
                icon: "bi-award-fill",
                title: "Top-Tier Specialists",
                desc: "Receive personalized treatments from highly experienced, board-certified doctors, surgeons, and dedicated nursing staff.",
                link: "Meet The Team",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="col-lg-4 col-md-6 mb-4"
                variants={fadeUpVariant}
                whileHover={{ y: -12 }} // Smooth levitation effect
              >
                <div className="feature-card">
                  <div className="icon-wrapper">
                    <i className={feature.icon}></i>
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.desc}</p>
                  <motion.a
                    href="#"
                    className="feature-link"
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span>{feature.link}</span>
                    <i className="bi bi-arrow-right ms-1"></i>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Emergency Alert Banner */}
          <motion.div
            className="emergency-alert"
            variants={fadeUpVariant}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="emergency-content">
                  <motion.div
                    className="emergency-icon"
                    variants={pulseIconVariant}
                    animate="pulse"
                  >
                    <i className="bi bi-telephone-inbound-fill"></i>
                  </motion.div>
                  <div className="emergency-text">
                    <h4>Need Urgent Medical Help?</h4>
                    <p>
                      Our critical care response team is on standby 24/7. Call our priority hotline for immediate ambulance dispatch.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end text-center mt-4 mt-lg-0">
                <motion.a
                  href="tel:911"
                  className="emergency-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="bi bi-telephone-fill"></i>
                  (555) 911-0000
                </motion.a>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>
    </>
  );
};

export default CallToActionSection;