import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeMobileNav();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Cleanup: remove mobile nav class on unmount
      document.body.classList.remove("mobile-nav-active");
      document.body.style.overflow = "";
    };
  }, []);

  const toggleMobileNav = () => {
    const newState = !isMobileNavActive;
    setIsMobileNavActive(newState);

    // Add/remove class on body for CSS styling
    if (newState) {
      document.body.classList.add("mobile-nav-active");
    } else {
      document.body.classList.remove("mobile-nav-active");
      setActiveDropdown(null); // Close all dropdowns when closing menu
    }
  };

  const closeMobileNav = () => {
    setIsMobileNavActive(false);
    document.body.classList.remove("mobile-nav-active");
    setActiveDropdown(null); // Close all dropdowns
  };

  // Close mobile nav when clicking outside and manage body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const navmenu = document.getElementById("navmenu");
      const toggle = document.querySelector(".mobile-nav-toggle");

      if (
        isMobileNavActive &&
        navmenu &&
        toggle &&
        !navmenu.contains(target) &&
        !toggle.contains(target)
      ) {
        setIsMobileNavActive(false);
        document.body.classList.remove("mobile-nav-active");
        setActiveDropdown(null);
      }
    };

    if (isMobileNavActive) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileNavActive]);

  const toggleDropdown = (e: React.MouseEvent, dropdownName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  const LogoIcon = () => (
    <svg
      className="my-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="bgCarrier" strokeWidth="0"></g>
      <g id="tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="iconCarrier">
        <path
          d="M22 22L2 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.5"
          d="M21 22V8.5C21 7.09554 21 6.39331 20.6629 5.88886C20.517 5.67048 20.3295 5.48298 20.1111 5.33706C19.6067 5 18.9045 5 17.5 5"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.5"
          d="M3 22V8.5C3 7.09554 3 6.39331 3.33706 5.88886C3.48298 5.67048 3.67048 5.48298 3.88886 5.33706C4.39331 5 5.09554 5 6.5 5"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          d="M12 22V19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M10 12H14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M5.5 11H7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M5.5 14H7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M17 11H18.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M17 14H18.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M5.5 8H7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M17 8H18.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          opacity="0.5"
          d="M10 15H14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          d="M12 9V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M14 7L10 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );

  return (
    <header
      id="header"
      className={`header d-flex align-items-center fixed-top ${scrolled ? "scrolled" : ""
        }`}
    >
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        {/* Logo - Left Side */}
        <Link
          to="/"
          className="logo d-flex align-items-center"
          onClick={closeMobileNav}
        >
          <LogoIcon />
          <h1 className="sitename">MediTrust</h1>
        </Link>

        {/* Navigation Menu - Center */}
        <nav
          id="navmenu"
          className={`navmenu ${isMobileNavActive ? "mobile-nav-active" : ""}`}
          onClick={(e) => {
            // Prevent closing when clicking inside the nav
            e.stopPropagation();
          }}
        >
          <ul>
            <li>
              <Link to="/" className={isActive("/")} onClick={closeMobileNav}>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={isActive("/about")}
                onClick={closeMobileNav}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/departments"
                className={isActive("/departments")}
                onClick={closeMobileNav}
              >
                Departments
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className={isActive("/services")}
                onClick={closeMobileNav}
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/doctors"
                className={isActive("/doctors")}
                onClick={closeMobileNav}
              >
                Doctors
              </Link>
            </li>
            <li
              className={`dropdown ${activeDropdown === "more" ? "active dropdown-active" : ""
                }`}
            >
              <a href="#" onClick={(e) => toggleDropdown(e, "more")}>
                <span>More Pages</span>{" "}
                <i className="bi bi-chevron-down toggle-dropdown"></i>
              </a>
              <ul
                className={activeDropdown === "more" ? "dropdown-active" : ""}
              >
                <li>
                  <Link to="/department-details" onClick={closeMobileNav}>
                    Department Details
                  </Link>
                </li>
                <li>
                  <Link to="/service-details" onClick={closeMobileNav}>
                    Service Details
                  </Link>
                </li>
                <li>
                  <Link to="/quickappointment" onClick={closeMobileNav}>
                    Quick Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/testimonials" onClick={closeMobileNav}>
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={closeMobileNav}>
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" onClick={closeMobileNav}>
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/terms" onClick={closeMobileNav}>
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" onClick={closeMobileNav}>
                    Privacy
                  </Link>
                </li>
                {!isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/sign-in" onClick={closeMobileNav}>
                        <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/sign-up" onClick={closeMobileNav}>
                        <i className="bi bi-person-plus me-2"></i>Sign Up
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout ({user?.name})
                    </a>
                  </li>
                )}
                <li>
                  <Link to="/404" onClick={closeMobileNav}>
                    404
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                to="/contact"
                className={isActive("/contact")}
                onClick={closeMobileNav}
              >
                Contact
              </Link>
            </li>
          </ul>
          <i
            className={`mobile-nav-toggle d-xl-none bi ${isMobileNavActive ? "bi-x" : "bi-list"
              }`}
            onClick={toggleMobileNav}
            aria-label="Toggle mobile menu"
          ></i>
        </nav>

        {/* Auth Buttons - Right Side */}
        <div className="d-flex align-items-center header-auth-buttons">
          {!isAuthenticated ? (
            <Link
              to="/sign-in"
              className="btn-signin d-none d-md-flex align-items-center"
              onClick={closeMobileNav}
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <span className="d-flex flex-column">
                <span>Sign In</span>
              </span>
            </Link>
          ) : (
            <div className="dropdown d-none d-md-block">
              <button
                className="btn-signin d-flex align-items-center gap-2 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ border: 'none', background: 'transparent' }}
              >
                <i className="bi bi-person-circle fs-5"></i>
                <span className="fw-bold">{user?.name?.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                <li><h6 className="dropdown-header">Hello, {user?.name}</h6></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link to="/profile" className="dropdown-item d-flex align-items-center gap-2" onClick={closeMobileNav}>
                    <i className="bi bi-person"></i> Profile
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
          <Link
            className="btn-getstarted"
            to="/quickappointment"
            onClick={closeMobileNav}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Appointment
          </Link>
        </div>

        <style>{`
          .header-container {
            gap: 20px;
            position: relative;
          }
          
          .header .logo {
            flex-shrink: 0;
            z-index: 10;
          }
          
          @media (min-width: 1200px) {
            .header .navmenu {
              position: absolute;
              left: 45%;
              transform: translateX(-50%);
              z-index: 5;
            }
          }
          
          .header-auth-buttons {
            gap: 5px;
            flex-shrink: 0;
            z-index: 10;
            align-items: center;
          }
          
          .header-auth-buttons .btn-signin {
            background: #ffffff;
            border: 1px solid var(--accent-color);
            color: var(--accent-color);
            border-radius: 50px;
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            line-height: 1;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            will-change: transform;
            transform: translateZ(0);
          }
          
          .header-auth-buttons .btn-signin i {
            font-size: 18px;
            color: var(--accent-color);
            flex-shrink: 0;
          }
          
          .header-auth-buttons .btn-signin span {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
            gap: 0;
          }
          
          .header-auth-buttons .btn-signin span span {
            font-size: 12px;
            line-height: 1.2;
            font-weight: 600;
            color: var(--accent-color);
          }
          
          .header-auth-buttons .btn-signin:hover {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
            transform: translateZ(0) translateY(-1px);
            box-shadow: 0 4px 12px rgba(4, 158, 187, 0.25);
          }
          
          .header-auth-buttons .btn-signin:hover i,
          .header-auth-buttons .btn-signin:hover span span {
            color: white;
          }
          
          .header-auth-buttons .btn-getstarted {
            background: var(--accent-color);
            border: none;
            color: white;
            border-radius: 50px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(4, 158, 187, 0.2);
            margin: 0;
            will-change: transform;
            transform: translateZ(0);
          }
          
          .header-auth-buttons .btn-getstarted:hover {
            background: color-mix(in srgb, var(--accent-color) 90%, black 10%);
            transform: translateZ(0) translateY(-1px);
            box-shadow: 0 4px 12px rgba(4, 158, 187, 0.3);
            color: white;
          }
          
          @media (max-width: 1199px) {
            .header-container {
              flex-wrap: nowrap;
              gap: 10px;
            }
            
            .header .logo {
              margin-right: 0;
              flex-shrink: 0;
            }
            
            .header .navmenu {
              flex: 0 0 auto;
              order: 3;
            }
            
            .header-auth-buttons {
              order: 2;
              margin-left: auto;
              margin-right: 10px;
            }
            
            .header-auth-buttons .btn-signin {
              display: none !important;
            }
            
            .header-auth-buttons .btn-getstarted {
              padding: 8px 18px;
              font-size: 13px;
              white-space: nowrap;
            }
          }
          
          @media (max-width: 768px) {
            .header-auth-buttons {
              margin-right: 8px;
            }
            
            .header-auth-buttons .btn-getstarted {
              padding: 7px 16px;
              font-size: 12px;
            }
          }
          
          @media (max-width: 576px) {
            .header-auth-buttons .btn-getstarted {
              padding: 6px 14px;
              font-size: 11px;
            }
            
            .header-container {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
          }
          
          @media (min-width: 768px) and (max-width: 991px) {
            .header-auth-buttons .btn-signin {
              padding: 8px 12px;
              font-size: 12px;
              gap: 8px;
            }
            
            .header-auth-buttons .btn-signin i {
              font-size: 16px;
            }
            
            .header-auth-buttons .btn-signin span span {
              font-size: 11px;
            }
          }
          
          /* Mobile menu improvements */
          @media (max-width: 1199px) {
            .mobile-nav-toggle {
              display: flex !important;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              border-radius: 8px;
              background: rgba(4, 158, 187, 0.1);
              transition: all 0.3s ease;
            }
            
            .mobile-nav-toggle:hover {
              background: rgba(4, 158, 187, 0.2);
            }
            
            .navmenu.mobile-nav-active .mobile-nav-toggle {
              background: rgba(255, 255, 255, 0.2);
              color: white;
            }
            
            .navmenu.mobile-nav-active .mobile-nav-toggle:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            
            .navmenu ul {
              animation: slideInRight 0.3s ease-out;
            }
            
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            .navmenu .dropdown.active > ul {
              display: block !important;
              animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          }

          /* User Profile Dropdown Styles */
          .header-auth-buttons .dropdown-menu {
            background: #ffffff;
            border: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border-radius: 12px;
            padding: 8px;
            min-width: 220px;
            animation: dropdownSlideIn 0.3s ease;
            margin-top: 15px !important;
          }

          .header-auth-buttons .dropdown-menu::before {
            content: '';
            position: absolute;
            top: -6px;
            right: 20px;
            width: 12px;
            height: 12px;
            background: #ffffff;
            transform: rotate(45deg);
            box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
          }

          .header-auth-buttons .dropdown-header {
            color: var(--heading-color);
            font-weight: 700;
            padding: 10px 16px;
            font-size: 0.95rem;
          }

          .header-auth-buttons .dropdown-divider {
            margin: 4px 0;
            border-color: rgba(0, 0, 0, 0.05);
          }

          .header-auth-buttons .dropdown-item {
            padding: 10px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-weight: 500;
            color: var(--default-color);
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .header-auth-buttons .dropdown-item i {
            font-size: 1.1rem;
            transition: all 0.2s ease;
          }

          .header-auth-buttons .dropdown-item:hover {
            background-color: #f8f9fa; /* Subtle gray background */
            color: var(--accent-color);
          }
          
          .header-auth-buttons .dropdown-item:hover i {
            color: var(--accent-color);
          }

          .header-auth-buttons .dropdown-item.text-danger {
            color: #dc3545;
          }

          .header-auth-buttons .dropdown-item.text-danger:hover {
            background-color: rgba(220, 53, 69, 0.05);
            color: #dc3545;
          }
          
          .header-auth-buttons .dropdown-item.text-danger:hover i {
            color: #dc3545;
          }

          @keyframes dropdownSlideIn {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </header>
  );
};

export default Header;
