import { useEffect } from 'react'
import AOS from 'aos'
import GLightbox from 'glightbox'
import PageHero from '../components/PageHero'

const Gallery = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })

    const lightbox = GLightbox({
      selector: '.glightbox'
    })

    return () => {
      lightbox.destroy()
    }
  }, [])

  const galleryImages = Array.from({ length: 8 }, (_, i) => `gallery-${i + 1}.webp`)

  return (
    <div className="gallery-page">
      <PageHero
        title="Gallery"
        description="Explore our modern facilities, departments, and medical infrastructure."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Gallery' }
        ]}
      />


      <section id="gallery" className="gallery section">
        <div className="container" data-aos="fade-up">
          <div className="row gy-4">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={idx * 100}>
                <div className="gallery-item">
                  <a href={`/assets/img/gallery/${img}`} className="glightbox">
                    <img src={`/assets/img/gallery/${img}`} alt={`Gallery ${idx + 1}`} className="img-fluid" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Gallery

