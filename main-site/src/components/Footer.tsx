import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="footer-wrapper">

      {/* ===== 1. PRE-FOOTER CTA SECTION ===== */}
      <section className="cta-full-section">
        <div className="container">
          <div className="cta-row">
            {/* Text Side */}
            <div className="cta-text-content">
              <div className="icon-badge">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <div className="text-block">
                <h2 className="cta-title">Ready to Start Your Journey?</h2>
                <p className="cta-desc">
                  Experience world-class healthcare with a personal touch.
                  We are here to listen and heal.
                </p>
              </div>
            </div>

            {/* Action Side */}
            <div className="cta-actions">
              <Link to="/quickappointment" className="btn-shine">
                Book Consultation <i className="bi bi-arrow-right-short"></i>
              </Link>
              <a href="tel:+1558955488" className="phone-link">
                <div className="phone-icon-circle">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <span>+1 5589 55488</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. ANIMATED WAVE ===== */}
      <div className="wave-separator">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(0, 45, 90, 0.3)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(0, 45, 90, 0.5)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(0, 45, 90, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#002D5A" />
          </g>
        </svg>
      </div>


      <footer className="footer-section">
        <div className="container">
          <div className="row g-4 justify-content-between">
            {/* Brand column */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-brand">
                <Link to="/" className="brand-link">
                  <img src="/assets/img/arovis-logo.png" alt="Arovis" className="footer-brand-logo-img" />
                </Link>
                <p className="brand-text">
                  Delivering compassionate, world-class healthcare services. Our medical experts utilize cutting-edge technology to ensure the best patient outcomes.
                </p>
                <div className="social-links mt-4">
                  {[
                    { icon: 'facebook', path: '#' },
                    { icon: 'twitter-x', path: '#' },
                    { icon: 'linkedin', path: '#' },
                    { icon: 'instagram', path: '#' },
                    { icon: 'youtube', path: '#' }
                  ].map((social) => (
                    <a href={social.path} key={social.icon} className="social-btn">
                      <i className={`bi bi-${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Services column */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-header">Medical Services</h5>
              <ul className="footer-list">
                {[
                  { name: 'Cardiology', path: '/services' },
                  { name: 'Neurology', path: '/services' },
                  { name: 'Orthopedics', path: '/services' },
                  { name: 'Pediatrics', path: '/services' },
                  { name: 'Surgery Dept', path: '/services' },
                  { name: 'Home Care', path: '/home-care' }
                ].map(item => (
                  <li key={item.name}><Link to={item.path}>{item.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Useful Links column */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-header">Company Info</h5>
              <ul className="footer-list">
                {[
                  { name: 'About Arovis', path: '/about' },
                  { name: 'Medical Experts', path: '/doctors' },
                  { name: 'Departments', path: '/departments' },
                  { name: 'Patient Reviews', path: '/testimonials' },
                  { name: 'Image Gallery', path: '/gallery' },
                  { name: 'Contact Us', path: '/contact' }
                ].map(item => (
                  <li key={item.name}><Link to={item.path}>{item.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Important Links column */}
            <div className="col-lg-2 col-md-6">
              <h5 className="footer-header">Resources</h5>
              <ul className="footer-list">
                {[
                  { name: 'Quick Appointment', path: '/quickappointment' },
                  { name: 'Home Care Wizard', path: '/home-care' },
                  { name: 'Help & FAQ', path: '/faq' },
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Terms of Service', path: '/terms' },
                ].map(item => (
                  <li key={item.name}><Link to={item.path}>{item.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact column */}
            <div className="col-lg-3 col-md-12">
              <h5 className="footer-header">Get In Touch</h5>
              <div className="contact-details mb-4">
                <div className="icon-info-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>123 Medical Plaza, New York, NY 10001</span>
                </div>
                <div className="icon-info-item">
                  <i className="bi bi-envelope-fill"></i>
                  <a href="mailto:support@arovis.com">support@arovis.com</a>
                </div>
                <div className="icon-info-item">
                  <i className="bi bi-headset"></i>
                  <span>Emergency: +1 (555) 911-4567</span>
                </div>
              </div>

              <div className="newsletter-box mt-4">
                <h6 className="newsletter-title">Subscribe to Health Tips</h6>
                <div className="subscribe-form">
                  <input type="email" placeholder="Your email..." />
                  <button type="button"><i className="bi bi-send-fill"></i></button>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                &copy; {new Date().getFullYear()} <span className="fw-bold">Arovis</span> Healthcare Group. All Rights Reserved.
              </div>
              <div className="col-md-6 text-center text-md-end footer-legal">
                <Link to="/privacy">Privacy Policy</Link>
                <span className="sep">•</span>
                <Link to="/terms">Terms of Use</Link>
                <span className="sep">•</span>
                <Link to="/faq">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        :root {
          /* PROVIDED COLOR PALETTE */
          --default-color: #2c3031;
          --heading-color: #002D5A; /* Navy */
          --accent-color: #0070C0;
          --accent-highlight: #00D2FF;
          --accent-dark: #001f3f; 

          /* DERIVED COLORS */
          --cta-bg-gradient: linear-gradient(180deg, #ffffff 0%, #f2f9fb 100%);
          --footer-text: #e6f0f2;
          --white: #ffffff;
        }

        .footer-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-top: 2rem;
          font-family: inherit; /* Ensure font matches site */
        }

        /* ===== 1. CTA FULL SECTION STYLES ===== */
        .cta-full-section {
          background: var(--cta-bg-gradient);
          padding: 80px 0 60px 0; 
          position: relative;
          z-index: 1;
        }

        .cta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 30px;
        }

        .cta-text-content {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 300px;
        }

        .icon-badge {
          width: 64px;
          height: 64px;
          background: rgba(0, 112, 192, 0.1);
          color: var(--accent-color);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          flex-shrink: 0;
        }

        .text-block .cta-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--heading-color);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .text-block .cta-desc {
          color: var(--default-color);
          margin: 0;
          font-size: 1.05rem;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .btn-shine {
          position: relative;
          padding: 14px 32px;
          background: var(--accent-color);
          color: white;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 20px rgba(0, 112, 192, 0.25);
        }

        .btn-shine:hover {
          transform: translateY(-2px);
          color: white;
          background: #002D5A;
        }

        .btn-shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: 0.5s;
        }

        .btn-shine:hover::before {
          left: 100%;
        }

        .phone-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--heading-color);
          font-weight: 600;
          font-size: 1.05rem;
          transition: color 0.3s ease;
        }
        
        .phone-link:hover {
          color: var(--accent-color);
        }

        .phone-icon-circle {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(0, 112, 192, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          transition: all 0.3s;
        }

        .phone-link:hover .phone-icon-circle {
          border-color: var(--accent-color);
          background: var(--accent-color);
          color: white;
        }

        /* ===== 2. WAVE STYLES ===== */
        .wave-separator {
          width: 100%;
          line-height: 0;
          background-color: transparent; 
          margin-top: -2px; 
          margin-bottom: -1px; /* Prevents 1px line gap on some screens */
        }

        .waves {
          width: 100%;
          height: 80px; 
          display: block;
        }

        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
        .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
        .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
        .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }

        @keyframes move-forever {
          0% { transform: translate3d(-90px,0,0); }
          100% { transform: translate3d(85px,0,0); }
        }

        /* ===== 3. FOOTER STYLES ===== */
        .footer-section {
          background: linear-gradient(180deg, var(--heading-color) 0%, var(--accent-dark) 100%);
          color: var(--footer-text);
          padding: 50px 0 20px;
          position: relative;
        }

        /* Brand — premium ambient glow (layered blur) + balanced lift for dark-on-dark PNG */
        .brand-link {
          position: relative;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          margin-bottom: 20px;
          isolation: isolate;
          overflow: visible;
          border-radius: 4px;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brand-link:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--accent-highlight), transparent 35%);
          outline-offset: 6px;
          border-radius: 6px;
        }
        .brand-link:hover {
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-link {
            transition: none;
          }
          .brand-link:hover {
            transform: none;
          }
        }
        /* Layer 1: broad moonlight — very soft falloff, matches footer navy */
        .brand-link::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(100% + 140px, 380px);
          height: calc(100% + 64px);
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 105% 100% at 44% 48%,
            rgba(255, 255, 255, 0.32) 0%,
            rgba(230, 248, 255, 0.18) 22%,
            rgba(0, 200, 255, 0.09) 48%,
            rgba(0, 45, 90, 0.06) 68%,
            transparent 88%
          );
          filter: blur(26px);
          opacity: 0.82;
          transition: opacity 0.4s ease, filter 0.4s ease;
        }
        /* Layer 2: accent toward wordmark — teal highlight aligned with palette */
        .brand-link::after {
          content: "";
          position: absolute;
          right: -6%;
          top: 50%;
          transform: translateY(-50%);
          width: 56%;
          min-width: 112px;
          height: 155%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 95% 88% at 62% 50%,
            rgba(255, 255, 255, 0.26) 0%,
            color-mix(in srgb, var(--accent-highlight), transparent 78%) 40%,
            color-mix(in srgb, var(--accent-color), transparent 85%) 55%,
            transparent 76%
          );
          filter: blur(18px);
          opacity: 0.72;
          transition: opacity 0.4s ease;
        }
        .brand-link:hover::before {
          opacity: 0.92;
        }
        .brand-link:hover::after {
          opacity: 0.85;
        }
        .footer-brand-logo-img {
          position: relative;
          z-index: 1;
          height: auto;
          width: auto;
          max-height: 56px;
          max-width: min(280px, 88vw);
          display: block;
          object-fit: contain;
          object-position: left center;
          transition: filter 0.4s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          filter:
            brightness(1.18)
            contrast(1.07)
            saturate(1.05)
            drop-shadow(0 0 0.75px rgba(255, 255, 255, 0.65))
            drop-shadow(0 0 10px rgba(255, 255, 255, 0.18))
            drop-shadow(0 0 28px rgba(0, 210, 255, 0.16))
            drop-shadow(0 0 42px rgba(0, 112, 192, 0.12))
            drop-shadow(0 5px 14px rgba(0, 0, 0, 0.38));
        }
        .brand-link:hover .footer-brand-logo-img {
          filter:
            brightness(1.24)
            contrast(1.08)
            saturate(1.06)
            drop-shadow(0 0 0.75px rgba(255, 255, 255, 0.75))
            drop-shadow(0 0 14px rgba(255, 255, 255, 0.22))
            drop-shadow(0 0 36px rgba(0, 210, 255, 0.2))
            drop-shadow(0 0 48px rgba(0, 112, 192, 0.14))
            drop-shadow(0 6px 16px rgba(0, 0, 0, 0.35));
        }
        @media (max-width: 575px) {
          .brand-link::before {
            filter: blur(20px);
            width: min(100% + 100px, 100vw);
          }
          .brand-link::after {
            filter: blur(14px);
            opacity: 0.65;
          }
          .footer-brand-logo-img {
            max-height: 48px;
            max-width: min(240px, 90vw);
            filter:
              brightness(1.16)
              contrast(1.06)
              saturate(1.04)
              drop-shadow(0 0 0.75px rgba(255, 255, 255, 0.6))
              drop-shadow(0 0 8px rgba(255, 255, 255, 0.16))
              drop-shadow(0 0 24px rgba(0, 210, 255, 0.14))
              drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
          }
        }
        .brand-text {
          line-height: 1.6;
          font-size: 0.95rem;
          margin-bottom: 24px;
          opacity: 0.9;
          color: rgba(255,255,255,0.85);
        }

        /* Social Icons */
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-btn {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08); /* Better visibility */
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .social-btn:hover {
          background: var(--white);
          color: var(--heading-color);
          border-color: var(--white);
          transform: translateY(-3px);
        }

        /* Links Columns */
        .footer-header {
          color: var(--white);
          font-weight: 700;
          margin-bottom: 1.25rem;
          font-size: 1.15rem;
        }
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-list li {
          margin-bottom: 12px;
        }
        .footer-list a {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: 0.3s;
          display: inline-flex;
          align-items: center;
          font-size: 0.95rem;
        }
        .footer-list a:hover {
          color: var(--white);
          transform: translateX(4px);
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        /* Newsletter & Contact */
        .newsletter-text {
          font-size: 0.95rem;
          margin-bottom: 15px;
          color: rgba(255,255,255,0.85);
        }
        .subscribe-form {
          position: relative;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          padding: 5px;
          display: flex;
          transition: 0.3s;
        }
        .subscribe-form:focus-within {
           background: rgba(255,255,255,0.12);
           border-color: rgba(255,255,255,0.5);
        }
        .subscribe-form input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 10px 15px;
          color: white;
          outline: none;
          font-size: 0.95rem;
        }
        .subscribe-form input::placeholder {
          color: rgba(255,255,255,0.6);
        }
        .subscribe-form button {
          background: var(--white);
          color: var(--heading-color);
          border: none;
          width: 45px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .subscribe-form button:hover {
          background: #f0f0f0;
          color: var(--accent-color);
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--white);
          margin-top: 20px;
        }
        .contact-item a {
          color: var(--white);
          text-decoration: none;
          transition: 0.2s;
          font-weight: 500;
        }
        .contact-item a:hover { color: rgba(255,255,255,0.8); }
        .text-accent { color: var(--white); opacity: 0.8; }

        /* Icon Info Items */
        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .icon-info-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
        }
        .icon-info-item i {
          color: var(--white);
          font-size: 1.1rem;
          margin-top: 2px;
          opacity: 0.9;
        }
        .icon-info-item a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          transition: 0.3s;
        }
        .icon-info-item a:hover {
          color: var(--white);
        }

        .newsletter-box {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 20px;
        }
        .newsletter-title {
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          border-top: 1px solid rgba(255,255,255,0.15);
          margin-top: 50px;
          padding-top: 25px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
        }
        .footer-legal a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .footer-legal a:hover { color: var(--white); }
        .sep { margin: 0 10px; color: rgba(255,255,255,0.3); }

        @media (max-width: 991px) {
          .cta-row {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
          .cta-text-content {
            flex-direction: column;
            text-align: center;
          }
          .cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-shine { width: 100%; justify-content: center; }
          .footer-brand { margin-bottom: 20px; }
          .footer-header { margin-top: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Footer;