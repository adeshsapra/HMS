import AOS from 'aos'
import { useEffect } from 'react'
import PageHero from '../components/PageHero'

const Privacy = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="privacy-page-wrapper">
      <style>{`
        .privacy-page-wrapper {
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

        .privacy-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-top: 30px;
        }

        .info-card {
            padding: 30px;
            background: #fdfdfd;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            transition: all 0.3s ease;
        }

        .info-card:hover {
            border-color: #049ebb;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(4, 158, 187, 0.1);
        }

        .info-card i {
            font-size: 2rem;
            color: #049ebb;
            margin-bottom: 20px;
            display: block;
        }

        .info-card h5 {
            color: #18444c;
            font-weight: 700;
            margin-bottom: 15px;
        }

        .contact-box {
            background: linear-gradient(135deg, #18444c 0%, #049ebb 100%);
            border-radius: 20px;
            padding: 40px;
            color: white;
            text-align: center;
            margin-top: 60px;
        }

        .contact-box h4 {
            font-weight: 800;
            margin-bottom: 15px;
        }

        .btn-contact-legal {
            background: white;
            color: #049ebb;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            transition: all 0.3s ease;
        }

        .btn-contact-legal:hover {
            transform: scale(1.05);
            background: #f8fafc;
            color: #18444c;
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
        title="Privacy Policy"
        description="Your health data is sacred. Learn how MediTrust protects your private medical information."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Privacy Policy' }
        ]}
      />

      <section className="legal-container">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="legal-card">

                {/* Introduction */}
                <div className="legal-section">
                  <span className="section-badge">Compliance Statement</span>
                  <h3 className="legal-title"><i className="bi bi-shield-lock-fill"></i> Data Protection Commitment</h3>
                  <p className="legal-text">
                    At MediTrust, we recognize that your health information is deeply personal. Our Privacy Policy is designed to comply with global healthcare standards (including HIPAA and GDPR) to ensure that your Electronic Health Records (EHR) and personal data are managed with the highest level of security and transparency.
                  </p>
                </div>

                {/* Information We Collect */}
                <div className="legal-section">
                  <span className="section-badge">Data Collection</span>
                  <h3 className="legal-title"><i className="bi bi-database-fill-add"></i> What We Collect</h3>
                  <p className="legal-text">To provide world-class healthcare through our Management System, we collect several categories of information:</p>
                  <div className="privacy-info-grid">
                    <div className="info-card">
                      <i className="bi bi-person-badge"></i>
                      <h5>Identity Information</h5>
                      <p className="small text-muted mb-0">Full name, date of birth, gender, and government-issued identification for accurate patient matching.</p>
                    </div>
                    <div className="info-card">
                      <i className="bi bi-heart-pulse"></i>
                      <h5>Medical Records</h5>
                      <p className="small text-muted mb-0">Clinical history, diagnostic reports, prescriptions, lab results, and immunization records.</p>
                    </div>
                    <div className="info-card">
                      <i className="bi bi-credit-card"></i>
                      <h5>Billing Data</h5>
                      <p className="small text-muted mb-0">Insurance details, transaction history, and payment information for hospital billing services.</p>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Data */}
                <div className="legal-section">
                  <span className="section-badge">Data Usage</span>
                  <h3 className="legal-title"><i className="bi bi-gear-wide-connected"></i> How Data Powers Your Care</h3>
                  <p className="legal-text">Your information is strictly used for clinical and administrative purposes:</p>
                  <ul className="legal-list">
                    <li>Coordination of medical appointments and emergency care services.</li>
                    <li>Analyzing lab results and maintaining your digital clinical timeline.</li>
                    <li>Processing insurance claims and providing transparent billing statements.</li>
                    <li>Sending critical health alerts, vaccination reminders, and follow-up notifications.</li>
                    <li>Internal quality audits to improve hospital safety and clinical outcomes.</li>
                  </ul>
                </div>

                {/* Sharing and Disclosure */}
                <div className="legal-section">
                  <span className="section-badge">Third Parties</span>
                  <h3 className="legal-title"><i className="bi bi-share-fill"></i> Controlled Data Sharing</h3>
                  <p className="legal-text">
                    We never sell your health data. Disclosure only occurs with authorized entities such as:
                  </p>
                  <ul className="legal-list">
                    <li>External laboratories for diagnostic processing.</li>
                    <li>Your insurance provider for claim verification.</li>
                    <li>Legal authorities when mandatory by healthcare regulations or court orders.</li>
                    <li>Referral specialists involved directly in your treatment plan.</li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div className="legal-section">
                  <span className="section-badge">Patient Empowerment</span>
                  <h3 className="legal-title"><i className="bi bi-person-check-fill"></i> Your Privacy Rights</h3>
                  <p className="legal-text">As a patient of MediTrust, you maintain full control over your data:</p>
                  <ul className="legal-list">
                    <li><strong>Right to Access:</strong> Request a digital copy of your entire medical history at any time.</li>
                    <li><strong>Right to Rectification:</strong> Ask us to correct any inaccuracies in your clinical reports.</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of non-essential account data (Subject to medical retention laws).</li>
                    <li><strong>Right to Restrict:</strong> Control which doctors or departments can view specific sections of your history.</li>
                  </ul>
                </div>

                {/* Security Measures */}
                <div className="legal-section">
                  <span className="section-badge">Security Hub</span>
                  <h3 className="legal-title"><i className="bi bi-patch-check-fill"></i> Advanced Security Protocols</h3>
                  <p className="legal-text">
                    MediTrust uses 256-bit AES encryption for all data at rest and TLS 1.3 for data in transit. Our servers are hosted in SOC2-compliant data centers with 24/7 physical and digital monitoring.
                  </p>
                </div>

                {/* Contact Box */}
                <div className="contact-box">
                  <h4>Have Questions About Your Privacy?</h4>
                  <p className="opacity-75">Connect with our Data Protection Officer for any concerns regarding your medical records.</p>
                  <a href="/contact" className="btn-contact-legal">Contact Privacy Team</a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Privacy

