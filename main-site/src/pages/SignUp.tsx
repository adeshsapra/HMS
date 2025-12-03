import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);

    // Email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Phone validation (10-15 digits)
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Please enter a valid phone number (10-15 digits).");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      setSent(true);
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.phone?.[0] ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        {/* Left Side: Visual Section */}
        <div className="login-visual-side">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <div className="glass-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="glass-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3>Join Our Network</h3>
              <p>Connect with top healthcare professionals and streamline your medical management.</p>
              <div className="stats-row">
                <div className="stat">
                  <span className="stat-num">10k+</span>
                  <span className="stat-desc">Doctors</span>
                </div>
                <div className="stat">
                  <span className="stat-num">50+</span>
                  <span className="stat-desc">Hospitals</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="login-form-side" data-aos="fade-up" data-aos-delay="100">
          <div className="login-content-max">
            
            {/* Logo - Kept AOS here as it is at the top */}
            <div className="brand-logo" data-aos="fade-down">
              <div className="brand-icon">
                <i className="bi bi-hospital-fill"></i>
              </div>
              <span className="brand-text">MediTrust<span className="brand-dot">.</span></span>
            </div>

            <div className="form-header">
              <h1>Create Account</h1>
              <p>Join us today to access the full portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
              {error && <div className="error-alert"><i className="bi bi-exclamation-circle"></i> {error}</div>}
              
              {sent && (
                <div className="success-alert">
                  <i className="bi bi-check-circle"></i> 
                  Your account has been created successfully! Please check your email to verify your account.
                </div>
              )}

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><i className="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon"><i className="bi bi-telephone"></i></span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Row */}
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="bi bi-shield-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-input"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><i className="bi bi-shield-check"></i></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="form-actions" style={{justifyContent: 'flex-start'}}>
                <label className="custom-checkbox">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="label-text">
                    I agree to the <Link to="/terms" className="link-highlight">Terms</Link> & <Link to="/privacy" className="link-highlight">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : "Create Account"}
              </button>
            </form>

            {/* REMOVED AOS from Footer to ensure it's always visible when scrolled */}
            <div className="form-footer">
              <p>Already have an account? <Link to="/sign-in">Sign In</Link></p>
              
              <div className="social-login">
                <span>Or register with</span>
                <div className="social-icons">
                  <button type="button" className="social-btn google">
                    <i className="bi bi-google"></i>
                  </button>
                  <button type="button" className="social-btn microsoft">
                    <i className="bi bi-microsoft"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* --- RESET & VARIABLES --- */
        :root {
          --primary-color: #0e7490;
          --primary-hover: #155e75;
          --accent-color: #06b6d4;
          --bg-color: #f8fafc;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border-color: #cbd5e1;
          --input-bg: #ffffff;
          --success-color: #059669;
          --success-bg: #d1fae5;
          --success-border: #a7f3d0;
        }

        * { box-sizing: border-box; }

        .login-wrapper {
          height: 100vh;
          width: 100%;
          background: var(--bg-color);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden; /* Prevent body scroll */
        }

        .login-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        /* --- LEFT SIDE (VISUAL) --- */
        .login-visual-side {
          flex: 1.2;
          height: 100%;
          background-image: url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(14, 116, 144, 0.9), rgba(6, 182, 212, 0.7));
        }

        .visual-content {
          position: relative;
          z-index: 2;
          width: 90%;
          max-width: 480px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          color: white;
        }

        .glass-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 24px;
        }

        .glass-card h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .glass-card p {
          font-size: 18px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 32px;
        }

        .stats-row {
          display: flex;
          gap: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 24px;
        }

        .stat-num {
          font-size: 24px;
          font-weight: 700;
          display: block;
        }

        .stat-desc {
          font-size: 14px;
          opacity: 0.8;
        }

        /* --- RIGHT SIDE (SCROLLABLE FORM) --- */
         .login-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          position: relative;
          max-width: 700px;
          margin: 0 auto;
        }

        /* Custom Scrollbar */
        .login-form-side::-webkit-scrollbar { width: 6px; }
        .login-form-side::-webkit-scrollbar-track { background: #f1f1f1; }
        .login-form-side::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .login-form-side::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .login-content-max {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center; 
          padding-bottom: 40px; /* Ensure space at bottom for scrolling */
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px; /* Reduced from 32px */
        }

        .brand-icon {
          width: 40px; /* Slightly smaller */
          height: 40px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .brand-text {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
        }

        .form-header h1 {
          font-size: 28px; /* Slightly smaller */
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .form-header p {
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 24px; /* Reduced from 32px */
        }

        .modern-form { width: 100%; }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .input-group { flex: 1; }

        .input-group {
          margin-bottom: 16px; /* Reduced from 20px */
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          height: 48px; /* Reduced from 50px */
          padding: 0 16px 0 48px;
          background: var(--input-bg);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 15px;
          color: var(--text-main);
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 18px;
          pointer-events: none;
        }

        .form-input:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: var(--primary-color);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        
        .password-toggle:hover { color: var(--text-main); }

        .form-actions {
          display: flex;
          margin-bottom: 24px;
        }

        .custom-checkbox {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
        }

        .custom-checkbox input { display: none; }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          margin-right: 10px;
          flex-shrink: 0;
          position: relative;
          transition: all 0.2s;
          margin-top: 2px;
        }

        .custom-checkbox input:checked + .checkmark {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }

        .custom-checkbox input:checked + .checkmark:after {
          content: "";
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .label-text {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .link-highlight {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-alert {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #fecaca;
        }

        .success-alert {
          background: var(--success-bg);
          color: var(--success-color);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--success-border);
        }

        .form-footer {
          margin-top: 24px; /* Reduced from 32px */
          text-align: center;
        }

        .form-footer p {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 20px;
        }

        .form-footer a {
          color: var(--primary-color);
          font-weight: 600;
          text-decoration: none;
        }

        .social-login {
          position: relative;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }

        .social-login span {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 10px;
          color: var(--text-muted);
          font-size: 12px;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .social-btn {
          width: 44px;
          height: 44px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-btn:hover {
          background: #f1f5f9;
          border-color: var(--text-muted);
        }

        .social-btn.google { color: #EA4335; }
        .social-btn.microsoft { color: #00A4EF; }

        .loader {
          width: 24px;
          height: 24px;
          border: 3px solid #FFF;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 992px) {
          .login-wrapper { height: auto; overflow: auto; }
          .login-container { height: auto; min-height: 100vh; }
          .login-visual-side { display: none; }
          .login-form-side { height: auto; min-height: 100vh; overflow-y: visible; }
        }

        @media (max-width: 576px) {
          .login-form-side { padding: 24px; }
          .form-row { flex-direction: column; gap: 0; }
        }
      `}</style>
    </div>
  );
};

export default SignUp;