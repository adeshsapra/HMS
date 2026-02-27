import SectionHeading from "../SectionHeading";

const EmergencyInfoSection = () => {
    return (
        <>
            <style>{`
        /* Emergency Info Section Styles */
        .emergency-info {
          background-color: #ffffff;
        }

        .emergency-info .emergency-alert {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-shadow: 0 8px 30px rgba(220, 53, 69, 0.25);
        }

        .emergency-info .alert-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emergency-info .alert-icon i {
          font-size: 32px;
          color: #ffffff;
        }

        .emergency-info .alert-content {
          flex: 1;
        }

        .emergency-info .alert-content h3 {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .emergency-info .alert-content p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.6;
        }

        .emergency-info .alert-action {
          flex-shrink: 0;
        }

        .emergency-info .btn-emergency {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: #ffffff;
          color: #dc3545;
          font-size: 16px;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .emergency-info .btn-emergency:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .emergency-contacts {
          margin-top: 40px;
        }

        .emergency-info .contact-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          border: 1px solid #eee;
        }

        .emergency-info .contact-card.urgent {
          border-color: #dc3545;
          background: linear-gradient(135deg, rgba(220, 53, 69, 0.03) 0%, rgba(220, 53, 69, 0.01) 100%);
        }

        .emergency-info .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .emergency-info .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(4, 158, 187, 0.1) 0%, rgba(4, 158, 187, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .emergency-info .card-icon i {
          font-size: 22px;
          color: #049EBB;
        }

        .emergency-info .contact-card.urgent .card-icon {
          background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
        }

        .emergency-info .contact-card.urgent .card-icon i {
          color: #dc3545;
        }

        .emergency-info .card-content h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .emergency-info .contact-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #555;
          margin-bottom: 8px;
        }

        .emergency-info .contact-info i {
          color: #049EBB;
        }

        .emergency-info .address {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .emergency-info .address i {
          color: #049EBB;
          margin-top: 3px;
        }

        .emergency-info .description {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .emergency-info .hours {
          font-size: 13px;
          color: #049EBB;
          font-weight: 500;
        }

        .emergency-info .card-action {
          margin-top: auto;
          padding-top: 16px;
        }

        .emergency-info .btn-contact {
          display: inline-block;
          width: 100%;
          padding: 10px 20px;
          background: transparent;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .emergency-info .btn-contact:hover {
          background: #049EBB;
          border-color: #049EBB;
          color: #ffffff;
        }

        .quick-actions {
          margin-top: 40px;
          padding: 24px;
          background: #f8fbfd;
          border-radius: 16px;
        }

        .quick-actions h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
          text-align: center;
        }

        .quick-actions .action-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #ffffff;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid #eee;
        }

        .quick-actions .action-link:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(4, 158, 187, 0.15);
          border-color: #049EBB;
        }

        .quick-actions .action-link i {
          font-size: 24px;
          color: #049EBB;
          margin-bottom: 8px;
        }

        .quick-actions .action-link span {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-align: center;
        }

        .emergency-tips {
          margin-top: 40px;
          padding: 24px;
          background: linear-gradient(135deg, #f8fbfd 0%, #f0f7fa 100%);
          border-radius: 16px;
        }

        .emergency-tips h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .emergency-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .emergency-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #555;
          margin-bottom: 12px;
        }

        .emergency-list li i {
          color: #049EBB;
          font-size: 16px;
          margin-top: 2px;
        }

        @media (max-width: 992px) {
          .emergency-info .emergency-alert {
            flex-direction: column;
            text-align: center;
          }

          .emergency-info .alert-action {
            width: 100%;
          }

          .emergency-info .btn-emergency {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .emergency-info .emergency-alert {
            padding: 24px;
          }

          .emergency-info .alert-icon {
            width: 56px;
            height: 56px;
          }

          .emergency-info .alert-icon i {
            font-size: 24px;
          }

          .emergency-info .alert-content h3 {
            font-size: 20px;
          }
        }
      `}</style>

            {/* Emergency Info Section */}
            <section id="emergency-info" className="emergency-info section">
                <SectionHeading desc="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit">
                    Emergency <span className="text-gradient">Info</span>
                </SectionHeading>

                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row">
                        <div className="col-lg-8 col-md-10 mx-auto">
                            <div
                                className="emergency-alert"
                                data-aos="zoom-in"
                                data-aos-delay="100"
                            >
                                <div className="alert-icon">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                </div>
                                <div className="alert-content">
                                    <h3>Medical Emergency?</h3>
                                    <p>
                                        If you are experiencing a life-threatening emergency, call
                                        911 immediately or go to your nearest emergency room.
                                    </p>
                                </div>
                                <div className="alert-action">
                                    <a href="tel:911" className="btn btn-emergency">
                                        <i className="bi bi-telephone-fill"></i>
                                        Call 911
                                    </a>
                                </div>
                            </div>

                            <div
                                className="row emergency-contacts"
                                data-aos="fade-up"
                                data-aos-delay="200"
                            >
                                {[
                                    {
                                        icon: "bi-hospital",
                                        title: "Emergency Room",
                                        phone: "+1 (555) 123-4567",
                                        address: "1245 Healthcare Blvd, Medical City, CA 90210",
                                        hours: "Open 24/7",
                                        urgent: true,
                                    },
                                    {
                                        icon: "bi-clock",
                                        title: "Urgent Care",
                                        phone: "+1 (555) 987-6543",
                                        address: "892 Wellness Ave, Health District, CA 90211",
                                        hours: "Mon-Sun: 7:00 AM - 10:00 PM",
                                    },
                                    {
                                        icon: "bi-headset",
                                        title: "Nurse Helpline",
                                        phone: "+1 (555) 456-7890",
                                        desc: "24/7 medical advice and guidance",
                                        hours: "Available 24/7",
                                    },
                                    {
                                        icon: "bi-heart-pulse",
                                        title: "Poison Control",
                                        phone: "1-800-222-1222",
                                        desc: "National poison control hotline",
                                        hours: "Available 24/7",
                                    },
                                ].map((contact, idx) => (
                                    <div key={idx} className="col-md-6 mb-4">
                                        <div
                                            className={`contact-card ${contact.urgent ? "urgent" : ""
                                                }`}
                                        >
                                            <div className="card-icon">
                                                <i className={contact.icon}></i>
                                            </div>
                                            <div className="card-content">
                                                <h4>{contact.title}</h4>
                                                <p className="contact-info">
                                                    <i className="bi bi-telephone"></i>
                                                    <span>{contact.phone}</span>
                                                </p>
                                                {contact.address && (
                                                    <p className="address">
                                                        <i className="bi bi-geo-alt"></i>
                                                        {contact.address}
                                                    </p>
                                                )}
                                                {contact.desc && (
                                                    <p className="description">{contact.desc}</p>
                                                )}
                                                <p className="hours">{contact.hours}</p>
                                            </div>
                                            <div className="card-action">
                                                <a
                                                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                                                    className="btn btn-contact"
                                                >
                                                    Call Now
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="quick-actions"
                                data-aos="fade-up"
                                data-aos-delay="300"
                            >
                                <h4>Quick Actions</h4>
                                <div className="row">
                                    {[
                                        { icon: "bi-geo-alt-fill", text: "Get Directions" },
                                        { icon: "bi-calendar-check", text: "Book Appointment" },
                                        { icon: "bi-person-badge", text: "Find a Doctor" },
                                        { icon: "bi-chat-dots", text: "Live Chat" },
                                    ].map((action, idx) => (
                                        <div key={idx} className="col-sm-6 col-lg-3">
                                            <a href="#" className="action-link">
                                                <i className={action.icon}></i>
                                                <span>{action.text}</span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                className="emergency-tips"
                                data-aos="fade-up"
                                data-aos-delay="400"
                            >
                                <h4>When to Seek Emergency Care</h4>
                                <div className="row">
                                    <div className="col-md-6">
                                        <ul className="emergency-list">
                                            <li>
                                                <i className="bi bi-check-circle"></i> Chest pain or
                                                difficulty breathing
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> Severe allergic
                                                reactions
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> Major trauma or
                                                injuries
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> Signs of stroke
                                                or heart attack
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="emergency-list">
                                            <li>
                                                <i className="bi bi-check-circle"></i> Severe burns or
                                                bleeding
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> Loss of
                                                consciousness
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> Severe abdominal
                                                pain
                                            </li>
                                            <li>
                                                <i className="bi bi-check-circle"></i> High fever with
                                                confusion
                                            </li>
                                        </ul>
                                    </div>
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
