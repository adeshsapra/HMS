import React, { useEffect, useState } from "react";
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

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        break;
      case "email":
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!value) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Please enter a valid email address";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (value.length !== 10) error = "Phone number must be exactly 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Enforce digits only and max length 10 for phone
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation if touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error || "" }));

      // Special case: if password changes, re-validate confirmPassword if it's touched
      if (name === "password" && touched.confirmPassword) {
        const confirmError = value !== formData.confirmPassword ? "Passwords do not match" : "";
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSent(false);

    const newErrors: typeof errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all as touched to show errors
      const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setTouched(allTouched as any);
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
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
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
        <div className="login-form-side" data-aos="fade-left" data-aos-delay="100">
          <div className="login-content-max">

            {/* Logo */}
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

            <form onSubmit={handleSubmit} className="modern-form" noValidate>
              {errors.general && (
                <div className="error-alert" data-aos="fade-in">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{errors.general}</span>
                </div>
              )}

              {sent && (
                <div className="success-alert" data-aos="fade-in">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Account created successfully! Redirecting...</span>
                </div>
              )}

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className={`input-wrapper ${errors.firstName ? 'error' : ''} ${!errors.firstName && formData.firstName && touched.firstName ? 'success' : ''}`}>
                    <span className="input-icon"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className={`input-wrapper ${errors.lastName ? 'error' : ''} ${!errors.lastName && formData.lastName && touched.lastName ? 'success' : ''}`}>
                    <span className="input-icon"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''} ${!errors.email && formData.email && touched.email ? 'success' : ''}`}>
                  <span className="input-icon"><i className="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {!errors.email && formData.email && touched.email && <span className="status-icon success"><i className="bi bi-check-circle-fill"></i></span>}
                  {errors.email && <span className="status-icon error"><i className="bi bi-exclamation-circle-fill"></i></span>}
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <div className={`input-wrapper ${errors.phone ? 'error' : ''} ${!errors.phone && formData.phone && touched.phone ? 'success' : ''}`}>
                  <span className="input-icon"><i className="bi bi-telephone"></i></span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={10}
                    required
                  />
                  {!errors.phone && formData.phone && touched.phone && <span className="status-icon success"><i className="bi bi-check-circle-fill"></i></span>}
                  {errors.phone && <span className="status-icon error"><i className="bi bi-exclamation-circle-fill"></i></span>}
                </div>
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>

              {/* Password Row */}
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <div className={`input-wrapper ${errors.password ? 'error' : ''} ${!errors.password && formData.password && touched.password ? 'success' : ''}`}>
                    <span className="input-icon"><i className="bi bi-shield-lock"></i></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-input"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
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
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm</label>
                  <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''} ${!errors.confirmPassword && formData.confirmPassword && touched.confirmPassword ? 'success' : ''}`}>
                    <span className="input-icon"><i className="bi bi-shield-check"></i></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
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
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>
              </div>

              {/* Terms */}
              <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
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
          --success-color: #10b981;
          --success-bg: #d1fae5;
          --success-border: #a7f3d0;
          --error-color: #ef4444;
          --error-bg: #fee2e2;
          --error-border: #fecaca;
          --focus-ring: rgba(6, 182, 212, 0.2);
        }

        * { box-sizing: border-box; }

        .login-wrapper {
          height: 100vh;
          width: 100%;
          background: var(--bg-color);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
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
          background: linear-gradient(135deg, rgba(14, 116, 144, 0.9), rgba(6, 182, 212, 0.8));
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
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .glass-card h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
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
          margin-bottom: 24px;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 8px 16px rgba(14, 116, 144, 0.2);
        }

        .brand-text {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }
        
        .brand-dot { color: var(--accent-color); }

        .form-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .form-header p {
          color: var(--text-muted);
          font-size: 15px;
          margin-bottom: 24px;
        }

        .modern-form { width: 100%; }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .input-group { flex: 1; }

        .input-group {
          margin-bottom: 16px;
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
        
        .input-wrapper.error .form-input {
          border-color: var(--error-color);
          background-color: #fffafa;
        }
        .input-wrapper.error .input-icon { color: var(--error-color); }
        
        .input-wrapper.success .form-input {
            border-color: var(--success-color);
        }

        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 40px 0 48px;
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
          box-shadow: 0 0 0 4px var(--focus-ring);
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 18px;
          pointer-events: none;
          transition: color 0.2s;
        }
        
        .status-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            display: flex;
            align-items: center;
            pointer-events: none;
        }
        
        .status-icon.success { color: var(--success-color); }
        .status-icon.error { color: var(--error-color); }

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
          z-index: 2;
        }
        
        .password-toggle:hover { color: var(--text-main); }
        
        .field-error {
          color: var(--error-color);
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .field-error::before {
          content: "•";
          font-size: 16px;
          line-height: 0;
        }

        .form-actions {
          display: flex;
          margin-bottom: 24px;
        }

        .custom-checkbox {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          user-select: none;
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
          background: white;
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
        
        .custom-checkbox:hover .checkmark {
            border-color: var(--primary-color);
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
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
        }
        
        .submit-btn:active:not(:disabled) {
            transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-alert {
          background: var(--error-bg);
          color: var(--error-color);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--error-border);
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
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
          animation: slideDown 0.3s ease-out;
        }

        .form-footer {
          margin-top: 24px;
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
          background: #f8fafc;
          border-color: var(--text-muted);
          transform: translateY(-2px);
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