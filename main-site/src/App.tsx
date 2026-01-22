import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollTop from './components/ScrollTop'
import Preloader from './components/Preloader'

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
// Home Care Pages
import HomeCareLanding from './pages/HomeCare/HomeCareLanding'
import BookingWizard from './pages/HomeCare/BookingWizard'


function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'

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
          <main className={isAuthPage ? "main-auth" : "main"}>
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications/:id" element={<NotificationDetails />} />

              {/* Home Care Routes */}
              <Route path="/home-care" element={<HomeCareLanding />} />
              <Route path="/home-care/booking" element={<BookingWizard />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!isAuthPage && <Footer />}
          {!isAuthPage && <ScrollTop />}
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
