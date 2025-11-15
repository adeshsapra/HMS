import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileNav = () => {
    setIsMobileNavActive(!isMobileNavActive);
  };

  const closeMobileNav = () => {
    setIsMobileNavActive(false);
  };

  const toggleDropdown = (e: React.MouseEvent, dropdownName: string) => {
    e.preventDefault();
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
      className={`header d-flex align-items-center fixed-top ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <Link
          to="/"
          className="logo d-flex align-items-center me-auto me-xl-0"
          onClick={closeMobileNav}
        >
          <LogoIcon />
          <h1 className="sitename">MediTrust</h1>
        </Link>

        <nav
          id="navmenu"
          className={`navmenu ${isMobileNavActive ? "mobile-nav-active" : ""}`}
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
              className={`dropdown ${
                activeDropdown === "more" ? "active" : ""
              }`}
            >
              <a href="#" onClick={(e) => toggleDropdown(e, "more")}>
                <span>More Pages</span>{" "}
                <i className="bi bi-chevron-down toggle-dropdown"></i>
              </a>
              <ul>
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
                  <Link to="/appointment" onClick={closeMobileNav}>
                    Appointment
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
                <li>
                  <Link to="/404" onClick={closeMobileNav}>
                    404
                  </Link>
                </li>
              </ul>
            </li>
            <li
              className={`dropdown ${
                activeDropdown === "main" ? "active" : ""
              }`}
            >
              <a href="#" onClick={(e) => toggleDropdown(e, "main")}>
                <span>Dropdown</span>{" "}
                <i className="bi bi-chevron-down toggle-dropdown"></i>
              </a>
              <ul>
                <li>
                  <a href="#">Dropdown 1</a>
                </li>
                <li className="dropdown">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <span>Deep Dropdown</span>{" "}
                    <i className="bi bi-chevron-down toggle-dropdown"></i>
                  </a>
                  <ul>
                    <li>
                      <a href="#">Deep Dropdown 1</a>
                    </li>
                    <li>
                      <a href="#">Deep Dropdown 2</a>
                    </li>
                    <li>
                      <a href="#">Deep Dropdown 3</a>
                    </li>
                    <li>
                      <a href="#">Deep Dropdown 4</a>
                    </li>
                    <li>
                      <a href="#">Deep Dropdown 5</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#">Dropdown 2</a>
                </li>
                <li>
                  <a href="#">Dropdown 3</a>
                </li>
                <li>
                  <a href="#">Dropdown 4</a>
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
            className={`mobile-nav-toggle d-xl-none bi ${
              isMobileNavActive ? "bi-x" : "bi-list"
            }`}
            onClick={toggleMobileNav}
          ></i>
        </nav>

        <Link
          className="btn-getstarted"
          to="/appointment"
          onClick={closeMobileNav}
        >
          Appointment
        </Link>
      </div>
    </header>
  );
};

export default Header;
