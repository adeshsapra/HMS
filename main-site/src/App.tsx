import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollTop from './components/ScrollTop'
import Preloader from './components/Preloader'
import MobileBottomNav from './components/MobileBottomNav'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Departments from './pages/Departments'
import DepartmentDetails from './pages/DepartmentDetails'
import Doctors from './pages/Doctors'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import QuickAppointment from './pages/QuickAppointment'
import Appointment from './pages/Appointment'
import DoctorDetails from './pages/DoctorDetails'
import DoctorProfile from './pages/DoctorProfile'
import Contact from './pages/Contact'
import Testimonials from './pages/Testimonials'
import FAQ from './pages/FAQ'
import Gallery from './pages/Gallery'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import NotificationDetails from './pages/NotificationDetails'
import Payment from './pages/Payment'
import SuccessPayment from './pages/SuccessPayment'
import CancelPayment from './pages/CancelPayment'
import ProtectedRoute from './components/ProtectedRoute'
// Home Care Pages
import HomeCareLanding from './pages/HomeCare/HomeCareLanding'
import BookingWizard from './pages/HomeCare/BookingWizard'


import PlanDetails from './pages/PlanDetails'

function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'
  const showMobileBottomNav = !isAuthPage

  useEffect(() => {
    // Initialize AOS
    import('aos').then((AOS) => {
      AOS.default.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      })
    })

    // Initialize PureCounter only for non-auth pages
    if (!isAuthPage) {
      const script = document.createElement('script')
      script.src = '/assets/vendor/purecounter/purecounter_vanilla.js'
      script.async = true

      script.onload = () => {
        if ((window as any).PureCounter) {
          new (window as any).PureCounter()
        }
      }

      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [isAuthPage])

  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          {!isAuthPage && <Preloader />}
          {!isAuthPage && <Header />}
          <main className={`${isAuthPage ? 'main-auth' : 'main'} ${showMobileBottomNav ? 'main-with-mobile-nav' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/department-details/:id" element={<DepartmentDetails />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/services" element={<Services />} />
              <Route path="/service-details/:id" element={<ServiceDetails />} />
              <Route path="/quickappointment" element={<QuickAppointment />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              <Route path="/doctor-profile/:id" element={<DoctorProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications/:id" element={<NotificationDetails />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/payment/success" element={
                <ProtectedRoute>
                  <SuccessPayment />
                </ProtectedRoute>
              } />
              <Route path="/payment/cancel" element={
                <ProtectedRoute>
                  <CancelPayment />
                </ProtectedRoute>
              } />

              {/* Home Care Routes */}
              <Route path="/home-care" element={<HomeCareLanding />} />
              <Route path="/home-care/booking" element={<BookingWizard />} />

              {/* Health Plan Subscription */}
              <Route path="/health-plans/:id" element={
                <ProtectedRoute>
                  <PlanDetails />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!isAuthPage && showMobileBottomNav && <MobileBottomNav />}
          {!isAuthPage && <Footer />}
          {!isAuthPage && <ScrollTop />}
          <style>{`
            @media (max-width: 767px) {
              .main-with-mobile-nav {
                padding-bottom: 96px;
              }
            }
          `}</style>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
