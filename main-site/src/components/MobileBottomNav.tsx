import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type NavItem = {
  id: string
  label: string
  icon: string
  path: string
  isActive: (pathname: string, search: string) => boolean
}

const navItems: NavItem[] = [
  {
    id: 'notifications',
    label: 'Notification',
    icon: 'bi-bell',
    path: '/notifications',
    isActive: (pathname) => pathname.startsWith('/notifications')
  },
  {
    id: 'appointments',
    label: 'Appointment',
    icon: 'bi-calendar2-check',
    path: '/quickappointment',
    isActive: (pathname) => pathname.startsWith('/quickappointment') || pathname.startsWith('/appointment')
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'bi-person-circle',
    path: '/profile',
    isActive: (pathname, search) => pathname.startsWith('/profile') && !search.includes('tab=appointments')
  }
]

const MobileBottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement | null>(null)
  const [isDarkUnderlay, setIsDarkUnderlay] = useState(false)

  const activeId = useMemo(() => {
    const active = navItems.find((item) => item.isActive(location.pathname, location.search))
    return active?.id ?? ''
  }, [location.pathname, location.search])
  const activeIndex = useMemo(() => {
    const index = navItems.findIndex((item) => item.id === activeId)
    return index >= 0 ? index : 0
  }, [activeId])

  useEffect(() => {
    const getBrightness = (color: string) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
      if (!match) return 255
      const r = Number(match[1])
      const g = Number(match[2])
      const b = Number(match[3])
      return (r * 299 + g * 587 + b * 114) / 1000
    }

    const hasVisibleBackground = (color: string) => {
      if (!color || color === 'transparent') return false
      const rgbaMatch = color.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([0-9.]+)\)/i)
      if (!rgbaMatch) return true
      return Number(rgbaMatch[1]) > 0
    }

    const getBackgroundColorFromTree = (startElement: Element | null) => {
      let current = startElement
      while (current && current !== document.documentElement) {
        const styles = window.getComputedStyle(current)
        if (hasVisibleBackground(styles.backgroundColor)) {
          return styles.backgroundColor
        }
        current = current.parentElement
      }

      const bodyBg = window.getComputedStyle(document.body).backgroundColor
      return hasVisibleBackground(bodyBg) ? bodyBg : 'rgb(255, 255, 255)'
    }

    const isKnownDarkSection = (element: Element | null) => {
      if (!element) return false
      return Boolean(
        element.closest('.modern-hero-section') ||
        element.closest('.dark-background') ||
        element.closest('.page-title.dark-background') ||
        element.closest('.footer-section')
      )
    }

    const updateNavMode = () => {
      const navEl = navRef.current
      if (!navEl) return

      const navRect = navEl.getBoundingClientRect()
      const sampleX = Math.floor(window.innerWidth / 2)
      const sampleY = Math.max(0, Math.floor(navRect.top - 8))

      const stack = document.elementsFromPoint(sampleX, sampleY)
      const targetElement = stack.find((el) => el !== navEl && !navEl.contains(el)) ?? document.body

      if (isKnownDarkSection(targetElement)) {
        setIsDarkUnderlay(true)
        return
      }

      const bgColor = getBackgroundColorFromTree(targetElement)
      setIsDarkUnderlay(getBrightness(bgColor) < 140)
    }

    window.addEventListener('scroll', updateNavMode)
    window.addEventListener('resize', updateNavMode)
    updateNavMode()
    const timeoutId = window.setTimeout(updateNavMode, 50)

    return () => {
      window.removeEventListener('scroll', updateNavMode)
      window.removeEventListener('resize', updateNavMode)
      window.clearTimeout(timeoutId)
    }
  }, [location.pathname, location.search])

  return (
    <>
      <nav
        ref={navRef}
        className={`mobile-bottom-nav ${isDarkUnderlay ? 'dark-underlay' : ''}`}
        aria-label="Mobile quick navigation"
        style={{ '--active-index': activeIndex } as CSSProperties}
      >
        <span className="mobile-bottom-nav-active-pill" aria-hidden="true"></span>
        {navItems.map((item) => {
          const isActive = item.id === activeId

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-bottom-nav-icon-wrap">
                <i className={`bi ${item.icon}`}></i>
              </span>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        .mobile-bottom-nav {
          --item-count: 3;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          transform: none;
          width: 100%;
          max-width: none;
          display: none;
          align-items: center;
          justify-content: space-between;
          gap: 0;
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
          background: transparent;
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-left: 0;
          border-right: 0;
          border-bottom: 0;
          border-radius: 0;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.05);
          z-index: 1105;
          overflow: hidden;
        }

        .mobile-bottom-nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          z-index: 0;
          pointer-events: none;
        }

        .mobile-bottom-nav.dark-underlay {
          border-top-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.05);
        }

        .mobile-bottom-nav-active-pill {
          position: absolute;
          left: 8px;
          top: 8px;
          bottom: calc(8px + env(safe-area-inset-bottom));
          width: calc((100% - 16px) / var(--item-count));
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent-color), transparent 88%);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-color), transparent 76%);
          transform: translateX(calc(var(--active-index) * 100%));
          transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1), background 260ms ease, box-shadow 260ms ease;
          z-index: 1;
          pointer-events: none;
        }

        .mobile-bottom-nav.dark-underlay .mobile-bottom-nav-active-pill {
          background: rgba(255, 255, 255, 0.16);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
        }

        .mobile-bottom-nav-item {
          position: relative;
          z-index: 2;
          flex: 1;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: color-mix(in srgb, var(--heading-color), transparent 30%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 52px;
          padding: 6px 4px;
          transition: color 240ms ease, transform 220ms ease;
        }

        .mobile-bottom-nav-item.active {
          color: var(--accent-color);
          transform: translateY(-1px);
        }

        .mobile-bottom-nav.dark-underlay .mobile-bottom-nav-item {
          color: rgba(255, 255, 255, 0.8);
        }

        .mobile-bottom-nav.dark-underlay .mobile-bottom-nav-item.active {
          color: #ffffff;
          transform: translateY(-1px);
        }

        .mobile-bottom-nav-icon-wrap {
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transform: translateY(0);
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .mobile-bottom-nav-item.active .mobile-bottom-nav-icon-wrap {
          transform: translateY(-2px) scale(1.06);
        }

        .mobile-bottom-nav-label {
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.02em;
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease;
        }

        .mobile-bottom-nav-item.active .mobile-bottom-nav-label {
          transform: translateY(-1px);
        }

        .mobile-bottom-nav-item:active {
          transform: scale(0.98);
        }

        @media (max-width: 767px) {
          .mobile-bottom-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}

export default MobileBottomNav
