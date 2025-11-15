# MediTrust React - Hospital Management System

A fully functional React clone of the MediTrust Bootstrap Hospital Management System website template.

## Features

- ✅ Complete React 18+ implementation with TypeScript
- ✅ All pages from original Bootstrap site converted to React components
- ✅ React Router v6+ for navigation
- ✅ Bootstrap 5+ integration with all original styling preserved
- ✅ AOS (Animate On Scroll) animations
- ✅ GLightbox for gallery images
- ✅ Responsive design matching original site
- ✅ All forms with React state management
- ✅ Mobile navigation with dropdown support
- ✅ Scroll-to-top functionality
- ✅ Preloader component

## Pages Included

- Home
- About
- Departments
- Department Details
- Doctors
- Services
- Service Details
- Appointment (with form handling)
- Contact (with form handling)
- Testimonials
- FAQ (with accordion functionality)
- Gallery (with lightbox)
- Terms
- Privacy
- 404 Not Found

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
meditrust-react/
├── public/
│   └── assets/          # All images, fonts, and vendor files
├── src/
│   ├── components/     # Reusable components (Header, Footer, etc.)
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Entry point
```

## Technologies Used

- React 18+
- TypeScript
- React Router DOM v7
- Bootstrap 5.3
- Bootstrap Icons
- Font Awesome
- AOS (Animate On Scroll)
- GLightbox
- Vite

## Notes

- All assets are located in `/public/assets/`
- CSS files are imported in `main.tsx`
- PureCounter is loaded dynamically for counter animations
- All forms use React state management (no jQuery)
- Mobile navigation is fully functional with React hooks

## License

This project is a React conversion of the MediTrust Bootstrap template.

