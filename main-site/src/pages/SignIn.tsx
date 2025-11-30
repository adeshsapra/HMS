
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
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
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
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
    <>
      <div className="auth-page-wrapper">
        {/* Decorative Background Elements */}
        <div className="auth-bg-shape shape-1"></div>
        <div className="auth-bg-shape shape-2"></div>

        <div className="auth-container">
          <div className="auth-center-wrapper">
            {/* Logo Section */}
            <div className="auth-brand" data-aos="fade-down" data-aos-delay="100">
              <Link to="/" className="auth-brand-link">
                <div className="auth-brand-icon">
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>
                <h1 className="auth-brand-name">MediTrust</h1>
              </Link>
            </div>

            {/* Form Card */}
            <div
              className="auth-form-card"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome Back</h2>
                <p className="auth-form-subtitle">
                  Sign in to access your patient portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {errors.general && (
                  <div className="auth-alert error" data-aos="fade-in">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{errors.general}</span>
                  </div>
                )}

                <div className="auth-form-group">
                  <label htmlFor="email" className="auth-form-label">
                    Email Address
                  </label>
                  <div className={`auth-input-wrapper ${errors.email ? 'error' : ''}`}>
                    <i className="bi bi-envelope auth-input-icon"></i>
                    <input
                      type="email"
                      className="auth-form-input"
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <div className="auth-field-error">{errors.email}</div>}
                </div>

                <div className="auth-form-group">
                  <label htmlFor="password" className="auth-form-label">
                    Password
                  </label>
                  <div className={`auth-input-wrapper ${errors.password ? 'error' : ''}`}>
                    <i className="bi bi-lock auth-input-icon"></i>
                    <input
                      type="password"
                      className="auth-form-input"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && <div className="auth-field-error">{errors.password}</div>}
                </div>

                <div className="auth-form-options">
                  <label className="auth-checkbox-container">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((prev) => !prev)}
                    />
                    <span className="checkmark"></span>
                    <span className="label-text">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="auth-link">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>

                <div className="auth-divider">
                  <span>Or continue with</span>
                </div>

                <div className="auth-social-buttons">
                  <button type="button" className="auth-social-btn google">
                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                      <path d="M17.3442 9.18429C17.3442 8.64047 17.3001 8.09371 17.206 7.55872H9.66016V10.6394H13.9813C13.802 11.6329 13.2258 12.5119 12.3822 13.0704V15.0693H14.9602C16.4741 13.6759 17.3442 11.6182 17.3442 9.18429Z" fill="#4285F4" />
                      <path d="M9.65974 17.0006C11.8174 17.0006 13.637 16.2922 14.9627 15.0693L12.3847 13.0704C11.6675 13.5584 10.7415 13.8347 9.66268 13.8347C7.5756 13.8347 5.80598 12.4266 5.17104 10.5336H2.51074V12.5942C3.86882 15.2956 6.63494 17.0006 9.65974 17.0006Z" fill="#34A853" />
                      <path d="M5.16852 10.5336C4.83341 9.53999 4.83341 8.46411 5.16852 7.47054V5.40991H2.51116C1.37649 7.67043 1.37649 10.3337 2.51116 12.5942L5.16852 10.5336Z" fill="#FBBC04" />
                      <path d="M9.65974 4.16644C10.8003 4.1488 11.9026 4.57798 12.7286 5.36578L15.0127 3.08174C13.5664 1.72367 11.6469 0.0229773 9.65974 0.000539111C6.63494 0.000539111 3.86882 1.70548 2.51074 4.40987L5.1681 6.4705C5.8001 4.57449 7.57266 3.16644 9.65974 3.16644Z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                  <button type="button" className="auth-social-btn microsoft">
                    <i className="bi bi-microsoft"></i>
                    Microsoft
                  </button>
                </div>

                <div className="auth-form-footer">
                  <p>
                    Don't have an account? <Link to="/sign-up" className="auth-link-primary">Create Account</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        :root {
          --primary-color: #049ebb;
          --primary-dark: #038a9e;
          --primary-light: #e0f7fa;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border-color: #e2e8f0;
          --bg-gradient: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --input-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .auth-page-wrapper {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: var(--bg-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
        }

        /* Decorative Background Shapes */
        .auth-bg-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.6;
        }
        .shape-1 {
          top: -10%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: rgba(4, 158, 187, 0.15);
        }
        .shape-2 {
          bottom: -10%;
          right: -5%;
          width: 400px;
          height: 400px;
          background: rgba(6, 182, 212, 0.15);
        }

        .auth-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .auth-center-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .auth-brand {
          margin-bottom: 2rem;
          text-align: center;
        }

        .auth-brand-link {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s ease;
        }
        .auth-brand-link:hover {
          transform: translateY(-2px);
        }

        .auth-brand-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary-color) 0%, #06b6d4 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(4, 158, 187, 0.2);
          margin-bottom: 0.75rem;
          transform: rotate(-5deg);
        }

        .auth-brand-icon i {
          font-size: 1.75rem;
          color: white;
        }

        .auth-brand-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-dark);
          margin: 0;
          letter-spacing: -0.025em;
        }

        .auth-form-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: var(--card-shadow);
          padding: 3rem 2.5rem;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .auth-form-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-form-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .auth-form-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
        }

        .auth-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .auth-alert.error {
          background-color: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }
        .auth-alert i {
          font-size: 1.1rem;
        }

        .auth-form-group {
          margin-bottom: 1.5rem;
        }

        .auth-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          font-size: 1.1rem;
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .auth-form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 0.95rem;
          color: var(--text-dark);
          background: #f8fafc;
          transition: all 0.2s ease;
          box-shadow: var(--input-shadow);
        }

        .auth-form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background: white;
          box-shadow: 0 0 0 4px rgba(4, 158, 187, 0.1);
        }
        
        .auth-input-wrapper:focus-within .auth-input-icon {
          color: var(--primary-color);
        }

        .auth-input-wrapper.error .auth-form-input {
          border-color: #ef4444;
          background-color: #fef2f2;
        }
        .auth-input-wrapper.error .auth-input-icon {
          color: #ef4444;
        }

        .auth-field-error {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .auth-field-error::before {
          content: "•";
          font-size: 1.2rem;
          line-height: 0;
        }

        .auth-form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .auth-checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        .auth-checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          height: 20px;
          width: 20px;
          background-color: #f1f5f9;
          border: 1.5px solid var(--border-color);
          border-radius: 6px;
          margin-right: 0.75rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .auth-checkbox-container:hover input ~ .checkmark {
          background-color: #e2e8f0;
        }

        .auth-checkbox-container input:checked ~ .checkmark {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .auth-checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .label-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .auth-link {
          font-size: 0.9rem;
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .auth-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary-color) 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(4, 158, 187, 0.25);
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(4, 158, 187, 0.35);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .auth-divider {
          position: relative;
          text-align: center;
          margin: 2rem 0;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: var(--border-color);
        }
        .auth-divider span {
          position: relative;
          background: white;
          padding: 0 1rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .auth-social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .auth-social-btn {
          padding: 0.875rem;
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          background: white;
          color: var(--text-dark);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .auth-social-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .auth-social-btn.google:hover {
          border-color: #4285F4;
          background: #f0f7ff;
        }
        .auth-social-btn.microsoft:hover {
          border-color: #00a4ef;
          background: #f0f9ff;
        }

        .auth-form-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .auth-form-footer p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .auth-link-primary {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 700;
          margin-left: 0.25rem;
          transition: color 0.2s;
        }
        .auth-link-primary:hover {
          color: var(--primary-dark);
        }

        @media (max-width: 640px) {
          .auth-form-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          .auth-brand-name {
            font-size: 1.5rem;
          }
          .auth-form-title {
            font-size: 1.5rem;
          }
          .auth-social-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default SignIn;
