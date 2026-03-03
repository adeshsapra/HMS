import SectionHeading from "../SectionHeading";

const EmergencyInfoSection = () => {
  return (
    <>
      <style>{`
        .emergency-info {
          background: #f9fbfc;
          font-family: var(--default-font);
        }

        /* ── HERO BANNER ── */
        .ei-banner {
          background: linear-gradient(110deg, #c0192a 0%, #dc3545 55%, #e8566a 100%);
          border-radius: 20px;
          padding: 28px 36px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 12px 40px rgba(220, 53, 69, 0.28);
          position: relative;
          overflow: hidden;
        }

        .ei-banner::before {
          content: '';
          position: absolute;
          right: -30px;
          top: -30px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
        }

        .ei-banner::after {
          content: '';
          position: absolute;
          right: 60px;
          bottom: -50px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }

        .ei-banner-pulse {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          70%  { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }

        .ei-banner-pulse i {
          font-size: 24px;
          color: #fff;
        }

        .ei-banner-text { flex: 1; }

        .ei-banner-text h3 {
          font-family: var(--heading-font);
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }

        .ei-banner-text p {
          font-size: 13.5px;
          color: rgba(255,255,255,0.88);
          margin: 0;
          line-height: 1.5;
        }

        .ei-banner-cta {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 26px;
          background: #fff;
          color: #dc3545;
          font-family: var(--heading-font);
          font-size: 14px;
          font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }

        .ei-banner-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          color: #dc3545;
        }

        /* ── TWO-COLUMN GRID ── */
        .ei-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 20px;
        }

        .ei-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }

        .ei-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-color: #049EBB;
        }

        .ei-card.urgent { border-color: rgba(220,53,69,0.35); }
        .ei-card.urgent:hover { border-color: #dc3545; }

        .ei-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(4,158,187,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ei-card.urgent .ei-card-icon { background: rgba(220,53,69,0.1); }

        .ei-card-icon i { font-size: 18px; color: #049EBB; }
        .ei-card.urgent .ei-card-icon i { color: #dc3545; }

        .ei-card-body { flex: 1; min-width: 0; }

        .ei-card-body h4 {
          font-family: var(--heading-font);
          font-size: 15px;
          font-weight: 700;
          color: #151515;
          margin: 0 0 6px;
        }

        .ei-card-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #049EBB;
          text-decoration: none;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ei-card.urgent .ei-card-phone { color: #dc3545; }

        .ei-card-phone i { font-size: 13px; flex-shrink: 0; }

        .ei-card-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #888;
        }

        .ei-card-meta i { font-size: 11px; color: #aaa; }

        .ei-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          margin-top: 6px;
          letter-spacing: 0.2px;
        }

        .ei-badge-green { background: #e6f9f0; color: #1a9d5f; }
        .ei-badge-blue  { background: #e6f5f8; color: #049EBB; }

        /* ── BOTTOM ROW ── */
        .ei-bottom {
          margin-top: 16px;
        }

        /* When to seek care */
        .ei-tips {
          background: linear-gradient(135deg, #edf8fb 0%, #f4fafc 100%);
          border: 1px solid rgba(4,158,187,0.15);
          border-radius: 16px;
          padding: 28px 30px;
          width: 100%;
          min-height: 210px;
        }

        .ei-tips-title {
          font-family: var(--heading-font);
          font-size: 20px;
          font-weight: 700;
          color: #151515;
          margin: 0 0 18px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .ei-tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 26px;
        }

        .ei-tips-list li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 16px;
          font-weight: 500;
          color: #2f2f2f;
          line-height: 1.5;
        }

        .ei-tips-list li i {
          color: #049EBB;
          font-size: 14px;
          margin-top: 4px;
          flex-shrink: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ei-banner { flex-direction: column; text-align: center; padding: 22px; }
          .ei-banner-cta { width: 100%; justify-content: center; }
          .ei-grid { grid-template-columns: 1fr; }
          .ei-tips { padding: 22px; min-height: 0; }
          .ei-tips-title { font-size: 17px; margin-bottom: 14px; }
          .ei-tips-list { grid-template-columns: 1fr; }
          .ei-tips-list li { font-size: 14px; }
        }
      `}</style>

      <section id="emergency-info" className="emergency-info section">
        <SectionHeading desc="Know when and how to get the right care — fast.">
          Emergency <span className="text-gradient">Info</span>
        </SectionHeading>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">
            <div className="col-lg-9 col-md-11 mx-auto">

              {/* ── Banner ── */}
              <div className="ei-banner" data-aos="zoom-in" data-aos-delay="100">
                <div className="ei-banner-pulse">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="ei-banner-text">
                  <h3>Life-Threatening Emergency?</h3>
                  <p>Call 911 immediately or go to your nearest emergency room. Don't wait.</p>
                </div>
                <a href="tel:911" className="ei-banner-cta">
                  <i className="bi bi-telephone-fill"></i>
                  Call 911
                </a>
              </div>

              {/* ── Contact Cards Grid ── */}
              <div className="ei-grid" data-aos="fade-up" data-aos-delay="200">
                {[
                  {
                    icon: "bi-hospital",
                    title: "Emergency Room",
                    phone: "+1 (555) 123-4567",
                    meta: "1245 Healthcare Blvd, CA",
                    badge: "Open 24/7",
                    badgeType: "green",
                    urgent: true,
                  },
                  {
                    icon: "bi-clock-history",
                    title: "Urgent Care",
                    phone: "+1 (555) 987-6543",
                    meta: "892 Wellness Ave, CA",
                    badge: "7 AM – 10 PM",
                    badgeType: "blue",
                  },
                  {
                    icon: "bi-headset",
                    title: "Nurse Helpline",
                    phone: "+1 (555) 456-7890",
                    meta: "24/7 medical advice & guidance",
                    badge: "Available 24/7",
                    badgeType: "green",
                  },
                  {
                    icon: "bi-heart-pulse",
                    title: "Poison Control",
                    phone: "1-800-222-1222",
                    meta: "National poison control hotline",
                    badge: "Available 24/7",
                    badgeType: "green",
                  },
                ].map((c, i) => (
                  <div key={i} className={`ei-card ${c.urgent ? "urgent" : ""}`}>
                    <div className="ei-card-icon">
                      <i className={`bi ${c.icon}`}></i>
                    </div>
                    <div className="ei-card-body">
                      <h4>{c.title}</h4>
                      <a
                        href={`tel:${c.phone.replace(/\D/g, "")}`}
                        className="ei-card-phone"
                      >
                        <i className="bi bi-telephone-fill"></i>
                        {c.phone}
                      </a>
                      <p className="ei-card-meta">
                        <i className={`bi ${c.urgent ? "bi-geo-alt" : "bi-info-circle"}`}></i>
                        {c.meta}
                      </p>
                      <span className={`ei-badge ei-badge-${c.badgeType}`}>{c.badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Bottom Row ── */}
              <div className="ei-bottom" data-aos="fade-up" data-aos-delay="300">
                {/* When to seek care */}
                <div className="ei-tips">
                  <p className="ei-tips-title">When to Seek Emergency Care</p>
                  <ul className="ei-tips-list">
                    {[
                      "Chest pain or difficulty breathing",
                      "Severe allergic reactions",
                      "Major trauma or injuries",
                      "Signs of stroke or heart attack",
                      "Severe burns or bleeding",
                      "Loss of consciousness",
                      "Severe abdominal pain",
                      "High fever with confusion",
                    ].map((tip, i) => (
                      <li key={i}>
                        <i className="bi bi-check-circle-fill"></i>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EmergencyInfoSection;
