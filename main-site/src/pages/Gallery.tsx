import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/Home/SectionHeading';
import { galleryAPI } from '../services/api';
import ContentLoader from '../components/ContentLoader';

interface GalleryCategory {
  id: number;
  name: string;
}

interface GalleryImage {
  id: number;
  title: string;
  image: string;
  description: string;
  gallery_category_id: number;
  category?: GalleryCategory;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const fetchGalleryData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesRes, imagesRes] = await Promise.all([
        galleryAPI.getCategories(),
        galleryAPI.getGalleries({ per_page: 100 })
      ]);

      if (categoriesRes.data.status) {
        setCategories(categoriesRes.data.data);
      }
      if (imagesRes.data.success) {
        setImages(imagesRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryData();
  }, [fetchGalleryData]);

  useEffect(() => {
    let lightbox: any;
    if (!loading && images.length > 0) {
      lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
      });
    }
    return () => {
      if (lightbox) lightbox.destroy();
    };
  }, [loading, images, activeCategory]);

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return images;
    return images.filter(img => img.gallery_category_id === activeCategory);
  }, [images, activeCategory]);

  const getFullImageUrl = useCallback((path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
    return `${baseUrl}/storage/${path}`;
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="gallery-page">
      <PageHero
        title="Our Gallery"
        description="Explore our world-class facilities and advanced medical technology."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Gallery' }
        ]}
      />

      <section className="py-5 bg-white">
        <div className="container py-lg-4">
          <SectionHeading desc="Take a virtual tour of MediTrust through our curated collection of photos showcasing our infrastructure and heart-warming patient care.">
            Hospital <span className="text-gradient">Gallery</span>
          </SectionHeading>

          {/* Category Filter */}
          <div className="row justify-content-center mb-5 mt-4">
            <div className="col-lg-10 text-center">
              <div className="d-flex flex-wrap justify-content-center gap-3 category-tabs">
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory('all')}
                  className={`btn-category ${activeCategory === 'all' ? 'active' : ''}`}
                >
                  All Collections
                </motion.button>
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`btn-category ${activeCategory === cat.id ? 'active' : ''}`}
                  >
                    {cat.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-5 text-center">
              <ContentLoader />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="row g-4 gallery-grid"
              >
                {filteredImages.length > 0 ? (
                  filteredImages.map((img) => (
                    <motion.div
                      key={img.id}
                      variants={itemVariants}
                      className="col-lg-4 col-md-6"
                      layout
                    >
                      <div className="gallery-item-premium">
                        <div className="img-container">
                          <img
                            src={getFullImageUrl(img.image)}
                            alt={img.title}
                            className="img-fluid"
                            loading="lazy"
                          />
                          <div className="item-overlay">
                            <div className="overlay-content">
                              <span className="cat-label">{img.category?.name || 'MediTrust'}</span>
                              <h4 className="title">{img.title}</h4>
                              {img.description && <p className="desc">{img.description}</p>}
                              <a
                                href={getFullImageUrl(img.image)}
                                className="glightbox zoom-btn"
                                data-gallery="hospital-gallery"
                              >
                                <i className="bi bi-arrows-fullscreen"></i>
                                <span>Preview Image</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-12 text-center py-5"
                  >
                    <div className="empty-state">
                      <i className="bi bi-images text-light-gray" style={{ fontSize: '4rem' }}></i>
                      <h4 className="mt-4 text-muted">No images found</h4>
                      <p>Try selecting another category or check back later.</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <style>{`
        .btn-category {
          background: #f8f9fa;
          border: 2px solid transparent;
          padding: 0.75rem 1.75rem;
          border-radius: 100px;
          color: #555;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }
        
        .btn-category:hover {
          color: var(--accent-color);
          background: white;
          border-color: rgba(2, 153, 190, 0.2);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        
        .btn-category.active {
          background: var(--accent-color);
          color: white;
          box-shadow: 0 10px 25px rgba(2, 153, 190, 0.35);
          transform: translateY(-2px);
        }

        .gallery-item-premium {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: #f0f0f0;
          height: 350px;
          transition: all 0.5s ease;
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
        }

        .gallery-item-premium .img-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .gallery-item-premium img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .gallery-item-premium:hover img {
          transform: scale(1.15);
        }

        .gallery-item-premium .item-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, 
            rgba(0,0,0,0.9) 0%, 
            rgba(0,0,0,0.3) 60%, 
            transparent 100%
          );
          display: flex;
          align-items: flex-end;
          padding: 2.5rem;
          opacity: 0;
          transition: all 0.5s ease;
        }

        .gallery-item-premium:hover .item-overlay {
          opacity: 1;
        }

        .overlay-content {
          color: white;
          transform: translateY(30px);
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .gallery-item-premium:hover .overlay-content {
          transform: translateY(0);
        }

        .cat-label {
          display: inline-block;
          background: var(--accent-color);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .overlay-content .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
          color: white;
        }

        .overlay-content .desc {
          font-size: 0.95rem;
          line-height: 1.5;
          opacity: 0.85;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .zoom-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
        }

        .zoom-btn i {
          width: 40px;
          height: 40px;
          background: white;
          color: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 1.1rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .zoom-btn:hover i {
          transform: scale(1.1);
          background: var(--accent-color);
          color: white;
        }

        .empty-state {
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 30px;
          border: 2px dashed #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default Gallery;

