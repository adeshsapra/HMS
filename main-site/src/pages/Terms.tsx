import AOS from 'aos'
import { useEffect } from 'react'
import PageHero from '../components/PageHero'

const Terms = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="terms-page-wrapper">
      <style>{`
        .terms-page-wrapper {
          background-color: #f8fafc;
        }
        
        .legal-container {
          padding: 80px 0;
        }

        .legal-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(24, 68, 76, 0.05);
          border: 1px solid rgba(4, 158, 187, 0.1);
          overflow: hidden;
          padding: 60px;
        }

        .legal-section {
          margin-bottom: 50px;
        }

        .legal-section:last-child {
          margin-bottom: 0;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(4, 158, 187, 0.1);
          color: #049ebb;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .legal-title {
          color: #18444c;
          font-weight: 800;
          font-size: 1.75rem;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .legal-title i {
            font-size: 1.5rem;
            color: #049ebb;
        }

        .legal-text {
          color: #64748b;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .terms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .term-box {
            background: #f8fbff;
            border-radius: 16px;
            padding: 25px;
            border-left: 4px solid #049ebb;
        }

        .term-box h6 {
            color: #18444c;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .legal-list {
          list-style: none;
          padding: 0;
          margin: 25px 0;
        }

        .legal-list li {
          position: relative;
          padding-left: 30px;
          margin-bottom: 15px;
          color: #475569;
        }

        .legal-list li::before {
          content: "\\F26A";
          font-family: "bootstrap-icons";
          position: absolute;
          left: 0;
          color: #049ebb;
          font-size: 1.1rem;
        }

        .important-note {
            background: #fff9f0;
            border: 1px solid #ffedd5;
            padding: 30px;
            border-radius: 16px;
            margin-top: 40px;
        }

        .important-note h5 {
            color: #9a3412;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .important-note p {
            color: #c2410c;
            margin-bottom: 0;
            font-size: 0.95rem;
        }

        .footer-cta {
          text-align: center;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #eef2f6;
        }

        @media (max-width: 768px) {
            .legal-card {
                padding: 30px 20px;
            }
            .legal-title {
                font-size: 1.4rem;
            }
        }
      `}</style>

      <PageHero
        title="Terms of Service"
        description="Guidelines and agreements for patients using the MediTrust Hospital Management System."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Terms' }
        ]}
      />

      <section className="legal-container">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="legal-card">

                {/* 1. Acceptance */}
                <div className="legal-section">
                  <span className="section-badge">Service Agreement</span>
                  <h3 className="legal-title"><i className="bi bi-file-earmark-check-fill"></i> Acceptance of Terms</h3>
                  <p className="legal-text">
                    By accessing or using the MediTrust platform, you agree to be bound by these Terms of Service. If you are using our services on behalf of a minor or dependent, you represent that you have the legal authority to bind them to these terms.
                  </p>
                </div>

                {/* 2. Appointments */}
                <div className="legal-section">
                  <span className="section-badge">Operational Rules</span>
                  <h3 className="legal-title"><i className="bi bi-calendar-event-fill"></i> Appointments & Consultations</h3>
                  <div className="terms-grid">
                    <div className="term-box">
                      <h6>Booking Policy</h6>
                      <p className="small mb-0">Appointments can be booked via our portal up to 30 days in advance. Emergency walk-ins are handled based on clinical triage.</p>
                    </div>
                    <div className="term-box">
                      <h6>Cancellation</h6>
                      <p className="small mb-0">Please notify us at least 24 hours prior to cancellation. Repeated no-shows may result in a booking fee.</p>
                    </div>
                  </div>
                  <ul className="legal-list">
                    <li>Patients must arrive 15 minutes before their scheduled slot for verification.</li>
                    <li>Telehealth consultations require a stable internet connection and private environment.</li>
                    <li>The hospital reserves the right to reschedule appointments due to emergency operations.</li>
                  </ul>
                </div>

                {/* 3. Medical Disclaimers */}
                <div className="legal-section">
                  <span className="section-badge">Critical Notice</span>
                  <h3 className="legal-title"><i className="bi bi-exclamation-triangle-fill"></i> Medical Disclaimer</h3>
                  <p className="legal-text">
                    The informational content provided on the MediTrust website, including health tips and portal descriptions, is for educational purposes only.
                  </p>
                  <div className="important-note">
                    <h5><i className="bi bi-lightning-charge-fill"></i> EMERGENCY WARNING</h5>
                    <p>THIS PLATFORM IS NOT FOR EMERGENCIES. If you are experiencing a life-threatening medical situation, call your local emergency number (e.g., 911) or visit the nearest emergency room immediately.</p>
                  </div>
                </div>

                {/* 4. Billing and Payments */}
                <div className="legal-section">
                  <span className="section-badge">Financial Terms</span>
                  <h3 className="legal-title"><i className="bi bi-cash-stack"></i> Billing & Insurance</h3>
                  <p className="legal-text">
                    MediTrust provides integrated billing solutions for patient convenience:
                  </p>
                  <ul className="legal-list">
                    <li>Copayments and non-insured portions are due at the time of service.</li>
                    <li>Online payments are processed via secure, PCI-compliant gateways.</li>
                    <li>Patients are responsible for verifying coverage with their insurance provider before booking treatments.</li>
                    <li>Refunds for cancelled lab tests are processed within 7-10 working days.</li>
                  </ul>
                </div>

                {/* 5. User Conduct */}
                <div className="legal-section">
                  <span className="section-badge">Portal Usage</span>
                  <h3 className="legal-title"><i className="bi bi-person-workspace"></i> User Responsibilities</h3>
                  <p className="legal-text">When using the patient portal, you agree not to:</p>
                  <ul className="legal-list">
                    <li>Provide false or misleading medical history information.</li>
                    <li>Attempt to gain unauthorized access to other patient records.</li>
                    <li>Use abusive language toward our medical staff or through the messaging system.</li>
                    <li>Share your portal login credentials with unauthorized individuals.</li>
                  </ul>
                </div>

                {/* 6. Modifications */}
                <div className="legal-section">
                  <span className="section-badge">Updates</span>
                  <h3 className="legal-title"><i className="bi bi-arrow-repeat"></i> Changes to Terms</h3>
                  <p className="legal-text">
                    We may update these terms to reflect changes in healthcare laws or hospital operations. Continued use of the portal after updates constitutes your acceptance of the revised terms.
                  </p>
                </div>

                <div className="footer-cta">
                  <p className="text-muted small">Last Updated: February 01, 2026</p>
                  <p className="fw-bold mb-0" style={{ color: '#18444c' }}>Thank you for choosing MediTrust for your healthcare journey.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terms

