import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: typeof errors = {};
    // Simple email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password, rememberMe);
      navigate("/");
    } catch (err: any) {
      const newErrors: typeof errors = {};

      if (err.response?.status === 422) {
        if (err.response.data.errors?.email) newErrors.email = err.response.data.errors.email[0];
        if (err.response.data.errors?.password) newErrors.password = err.response.data.errors.password[0];
      } else if (err.response?.status === 401) {
        newErrors.general = err.response.data.message || "Invalid email or password";
      } else {
        newErrors.general = err.response?.data?.message || "An error occurred. Please try again.";
      }

      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* Left Side: Form Section */}
        <div className="login-form-side" data-aos="fade-up" data-aos-delay="100">
          <div className="login-content-max">

            {/* Logo */}
            <div className="brand-logo" data-aos="fade-down">
              <div className="brand-icon">
                <i className="bi bi-hospital-fill"></i>
              </div>
              <span className="brand-text">MediTrust<span className="brand-dot">.</span></span>
            </div>

            <div className="form-header">
              <h1>Welcome Back</h1>
              <p>Please enter your credentials to access the hospital admin panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
              {errors.general && (
                <div className="error-alert">
                  <i className="bi bi-exclamation-circle"></i> 
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <span className="input-icon">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="doctor@meditrust.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              {/* Password Input */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <span className="input-icon">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
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
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="form-actions">
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={() => setRememberMe((prev) => !prev)}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="loader"></span> : "Access Portal"}
              </button>
            </form>

            <div className="form-footer">
              <p>New staff member? <Link to="/sign-up">Create an account</Link></p>

              <div className="social-login">
                <span>Or sign in with</span>
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

        {/* Right Side: Visual Section */}
        <div className="login-visual-side">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <div className="glass-card" data-aos="zoom-in" data-aos-delay="400">
              <div className="glass-icon">
                <i className="bi bi-heart-pulse"></i>
              </div>
              <h3>Advanced Care</h3>
              <p>Streamlining hospital operations for better patient outcomes.</p>
              <div className="stats-row">
                <div className="stat">
                  <span className="stat-num">24/7</span>
                  <span className="stat-desc">Support</span>
                </div>
                <div className="stat">
                  <span className="stat-num">99%</span>
                  <span className="stat-desc">Uptime</span>
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
          --error-color: #ef4444;
          --error-bg: #fee2e2;
          --error-border: #fecaca;
        }

        * {
            box-sizing: border-box;
        }

        .login-wrapper {
          min-height: 100vh;
          width: 100%;
          background: var(--bg-color);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .login-container {
          display: flex;
          min-height: 100vh;
          background: white;
        }

        /* --- LEFT SIDE: FORM --- */
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

        .login-content-max {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        /* Logo & Header */
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .brand-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
        }

        .brand-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
        }

        .form-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .form-header p {
          color: var(--text-muted);
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 32px;
        }

        /* --- FORM STYLING --- */
        .modern-form {
          width: 100%;
        }

        .error-alert {
          background: var(--error-bg);
          color: var(--error-color);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--error-border);
        }

        .input-group {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
          display: block;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .input-wrapper.error .form-input {
          border-color: var(--error-color);
          background-color: var(--error-bg);
        }

        .input-wrapper.error .input-icon {
          color: var(--error-color);
        }

        .form-input {
          width: 100%;
          height: 52px;
          padding: 0 16px 0 48px;
          background: var(--input-bg);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 16px;
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
          display: flex;
          align-items: center;
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
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: var(--text-main);
        }

        .field-error {
          color: var(--error-color);
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .field-error::before {
          content: "•";
          font-size: 16px;
          line-height: 0;
        }

        /* --- FORM ACTIONS --- */
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .custom-checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .custom-checkbox input {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          margin-right: 8px;
          position: relative;
          transition: all 0.2s;
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
          font-size: 14px;
          color: var(--text-muted);
        }

        .forgot-link {
          font-size: 14px;
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        /* --- BUTTONS --- */
        .submit-btn {
          width: 100%;
          height: 52px;
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

        /* --- FOOTER & SOCIAL --- */
        .form-footer {
          margin-top: 40px;
          text-align: center;
        }

        .form-footer p {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 24px;
        }

        .form-footer a {
          color: var(--primary-color);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .form-footer a:hover {
          color: var(--primary-hover);
        }

        .social-login {
          position: relative;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
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
          width: 48px;
          height: 48px;
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

        /* --- RIGHT SIDE: VISUAL --- */
        .login-visual-side {
          flex: 1.2;
          background-image: url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop');
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

        @media (max-width: 992px) {
          .login-visual-side { display: none; }
        }
      `}</style>
    </div>
  );
};

export default SignIn;