import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
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
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
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
        navigate('/');
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
    <>
      <div className="auth-page-wrapper">
        <div className="auth-container">
          {/* Centered Content */}
          <div className="auth-center-wrapper">
            {/* Logo Section */}
            <div className="auth-brand" data-aos="fade-up" data-aos-delay="100">
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
                <div className="auth-form-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h2 className="auth-form-title">Create Account</h2>
                <p className="auth-form-subtitle">
                  Register to access our patient portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error-message">{error}</div>}

                {sent && (
                  <div className="auth-success-message">
                    Your account has been created successfully! Please check
                    your email to verify your account.
                  </div>
                )}

                <div className="auth-form-row">
                  <div className="auth-form-group">
                    <label htmlFor="firstName" className="auth-form-label">
                      <i className="bi bi-person me-2"></i>
                      First Name
                    </label>
                    <input
                      type="text"
                      className="auth-form-input"
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label htmlFor="lastName" className="auth-form-label">
                      <i className="bi bi-person me-2"></i>
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="auth-form-input"
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label htmlFor="email" className="auth-form-label">
                    <i className="bi bi-envelope me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="auth-form-input"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="phone" className="auth-form-label">
                    <i className="bi bi-telephone me-2"></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="auth-form-input"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-form-row">
                  <div className="auth-form-group">
                    <label htmlFor="password" className="auth-form-label">
                      <i className="bi bi-lock-fill me-2"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      className="auth-form-input"
                      id="password"
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label
                      htmlFor="confirmPassword"
                      className="auth-form-label"
                    >
                      <i className="bi bi-lock-fill me-2"></i>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="auth-form-input"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-check-full">
                  <input
                    type="checkbox"
                    id="terms"
                    className="auth-checkbox"
                    required
                  />
                  <label htmlFor="terms" className="auth-checkbox-label">
                    I agree to the{" "}
                    <Link to="/terms" className="auth-link">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="auth-link">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner"></span>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>

                <div className="auth-divider">
                  <span>Or sign up with</span>
                </div>

                <div className="auth-social-buttons">
                  <button type="button" className="auth-social-btn">
                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M17.3442 9.18429C17.3442 8.64047 17.3001 8.09371 17.206 7.55872H9.66016V10.6394H13.9813C13.802 11.6329 13.2258 12.5119 12.3822 13.0704V15.0693H14.9602C16.4741 13.6759 17.3442 11.6182 17.3442 9.18429Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M9.65974 17.0006C11.8174 17.0006 13.637 16.2922 14.9627 15.0693L12.3847 13.0704C11.6675 13.5584 10.7415 13.8347 9.66268 13.8347C7.5756 13.8347 5.80598 12.4266 5.17104 10.5336H2.51074V12.5942C3.86882 15.2956 6.63494 17.0006 9.65974 17.0006Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.16852 10.5336C4.83341 9.53999 4.83341 8.46411 5.16852 7.47054V5.40991H2.51116C1.37649 7.67043 1.37649 10.3337 2.51116 12.5942L5.16852 10.5336Z"
                        fill="#FBBC04"
                      />
                      <path
                        d="M9.65974 4.16644C10.8003 4.1488 11.9026 4.57798 12.7286 5.36578L15.0127 3.08174C13.5664 1.72367 11.6469 0.0229773 9.65974 0.000539111C6.63494 0.000539111 3.86882 1.70548 2.51074 4.40987L5.1681 6.4705C5.8001 4.57449 7.57266 3.16644 9.65974 3.16644Z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                  <button type="button" className="auth-social-btn">
                    <i className="bi bi-microsoft"></i>
                    Microsoft
                  </button>
                </div>

                <div className="auth-form-footer">
                  <p>
                    Already have an account?{" "}
                    <Link to="/sign-in" className="auth-link-primary">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <style>{`
        .auth-page-wrapper {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .auth-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .auth-center-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .auth-brand {
          margin-bottom: 2.5rem;
          text-align: center;
        }

        .auth-brand-link {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }

        .auth-brand-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #049ebb 0%, #06b6d4 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(4, 158, 187, 0.25);
          margin-bottom: 1rem;
        }

        .auth-brand-icon i {
          font-size: 2rem;
          color: white;
        }

        .auth-brand-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--heading-color);
          margin: 0;
          font-family: var(--heading-font);
        }

        .auth-form-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          padding: 2.5rem;
          width: 100%;
          max-width: 500px;
        }

        .auth-form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-form-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #049ebb 0%, #06b6d4 100%);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(4, 158, 187, 0.25);
          margin-bottom: 1.25rem;
        }

        .auth-form-icon i {
          font-size: 1.75rem;
          color: white;
        }

        .auth-form-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 0.5rem;
          font-family: var(--heading-font);
        }

        .auth-form-subtitle {
          color: #6b7280;
          font-size: 0.9375rem;
          margin: 0;
        }

        .auth-form {
          width: 100%;
        }

        .auth-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .auth-form-group {
          margin-bottom: 1.5rem;
        }

        .auth-form-row .auth-form-group {
          margin-bottom: 0;
        }

        .auth-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--default-color);
          margin-bottom: 0.5rem;
        }

        .auth-form-label i {
          color: var(--accent-color);
        }

        .auth-form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.9375rem;
          transition: all 0.3s;
          background: #fafafa;
        }

        .auth-form-input:focus {
          outline: none;
          border-color: var(--accent-color);
          background: white;
          box-shadow: 0 0 0 4px rgba(4, 158, 187, 0.1);
        }

        .auth-form-check-full {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .auth-form-check-full .auth-checkbox {
          margin-top: 0.25rem;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }

        .auth-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--accent-color);
        }

        .auth-checkbox-label {
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
          margin: 0;
          line-height: 1.5;
        }

        .auth-link {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .auth-link:hover {
          color: #038a9e;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #049ebb 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(4, 158, 187, 0.3);
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(4, 158, 187, 0.4);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-divider {
          position: relative;
          text-align: center;
          margin: 1.5rem 0;
        }

        .auth-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: #e5e7eb;
        }

        .auth-divider span {
          position: relative;
          background: white;
          padding: 0 1rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .auth-social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .auth-social-btn {
          padding: 0.75rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: var(--default-color);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .auth-social-btn:hover {
          border-color: var(--accent-color);
          background: #f8fbfc;
        }

        .auth-social-btn i {
          font-size: 1.125rem;
          color: var(--accent-color);
        }

        .auth-form-footer {
          text-align: center;
          margin-top: 1.5rem;
        }

        .auth-form-footer p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .auth-link-primary {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .auth-link-primary:hover {
          color: #038a9e;
        }

        .auth-error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border: 1px solid #fecaca;
        }

        .auth-success-message {
          background: #d1fae5;
          color: #059669;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border: 1px solid #a7f3d0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-page-wrapper {
            padding: 1.5rem 1rem;
          }

          .auth-form-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .auth-brand {
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 768px) {
          .auth-form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .auth-form-row .auth-form-group {
            margin-bottom: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .auth-left-column {
            padding: 1.5rem 1rem;
          }

          .auth-form-card {
            padding: 1.5rem 1rem;
            border-radius: 20px;
          }

          .auth-form-title {
            font-size: 1.5rem;
          }

          .auth-brand-icon,
          .auth-form-icon {
            width: 56px;
            height: 56px;
          }

          .auth-brand-icon i,
          .auth-form-icon i {
            font-size: 1.5rem;
          }

          .auth-social-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default SignUp;
