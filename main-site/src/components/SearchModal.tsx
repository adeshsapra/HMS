import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { searchableModules, type SearchableModule } from '../data/searchableModules';
import { departmentAPI, doctorAPI, serviceAPI, homeCareAPI } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [moduleResults, setModuleResults] = useState<SearchableModule[]>([]);
  const [dynamicResults, setDynamicResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchableModule[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`recent_searches_${user?.id || 'guest'}`);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        const filteredRecent = searchableModules
          .filter(mod => parsed.includes(mod.id))
          .filter(mod => !mod.roles || (user && mod.roles.includes(user.role_id)));

        const orderedRecent = parsed
          .map(id => filteredRecent.find(m => m.id === id))
          .filter(Boolean) as SearchableModule[];

        setRecentSearches(orderedRecent.slice(0, 5));
      }

      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setModuleResults([]);
      setDynamicResults([]);
      setSelectedIndex(0);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, user]);

  // Async multi-module search with debounce
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setModuleResults([]);
        setDynamicResults([]);
        return;
      }

      setLoading(true);
      try {
        // Fast local module filter
        const filteredModules = searchableModules.filter(mod => {
          const matchesQuery = mod.title.toLowerCase().includes(query.toLowerCase()) ||
            mod.description.toLowerCase().includes(query.toLowerCase());
          const hasAccess = !mod.roles || (user && mod.roles.includes(user.role_id));
          return matchesQuery && hasAccess;
        });
        setModuleResults(filteredModules);

        // Fetch from Public APIs
        const [deptRes, docRes, serviceRes, homeCareRes] = await Promise.all([
          departmentAPI.getAll(1, 5, { keyword: query.trim() }),
          doctorAPI.getAll(1, 5, { search: query.trim() }),
          serviceAPI.getAll(1, 5, { keyword: query.trim() }),
          homeCareAPI.getServices()
        ]);

        const combinedDynamics: any[] = [];

        if (deptRes.data?.success) {
          deptRes.data.data.forEach((d: any) => combinedDynamics.push({
            id: d.id,
            title: d.name,
            description: d.description || 'Department',
            path: `/department-details/${d.id}`,
            type: 'Department',
            icon: 'bi-building'
          }));
        }

        if (docRes.data?.success) {
          docRes.data.data.forEach((d: any) => combinedDynamics.push({
            id: d.id,
            title: `Dr. ${d.first_name} ${d.last_name}`,
            description: d.specialization || 'Doctor',
            path: `/doctor-profile/${d.id}`,
            type: 'Doctor',
            icon: 'bi-person-badge'
          }));
        }

        if (serviceRes.data?.success) {
          serviceRes.data.data.forEach((s: any) => combinedDynamics.push({
            id: s.id,
            title: s.name,
            description: s.description || 'Hospital Service',
            path: `/service-details/${s.id}`,
            type: 'Service',
            icon: 'bi-clipboard2-pulse'
          }));
        }

        if (homeCareRes.data?.success) {
          homeCareRes.data.data
            .filter((s: any) => s.title.toLowerCase().includes(query.toLowerCase()))
            .forEach((s: any) => combinedDynamics.push({
              id: s.id,
              title: s.title,
              description: s.category || 'Home Care Service',
              path: `/home-care`, // Deep linking to specific home care service may need more context
              type: 'Home Care',
              icon: 'bi-house-heart'
            }));
        }

        setDynamicResults(combinedDynamics);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Main search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [query, user]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const allResults = [...moduleResults, ...dynamicResults];
      const items = query.trim().length === 0 ? recentSearches : allResults;
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          handleSelect(items[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, moduleResults, dynamicResults, recentSearches, selectedIndex]);

  const clearRecentSearches = () => {
    localStorage.removeItem(`recent_searches_${user?.id || 'guest'}`);
    setRecentSearches([]);
  };

  const handleSelect = (module: any) => {
    if (module.id && !module.type) {
      const stored = localStorage.getItem(`recent_searches_${user?.id || 'guest'}`);
      let recentIds: string[] = stored ? JSON.parse(stored) : [];
      recentIds = [module.id, ...recentIds.filter(id => id !== module.id)].slice(0, 5);
      localStorage.setItem(`recent_searches_${user?.id || 'guest'}`, JSON.stringify(recentIds));
    }

    navigate(module.path);
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95, y: 10 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="search-modal-wrapper">
          <motion.div
            className="search-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          <div className="search-modal-container">
            <motion.div
              className="search-modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="search-header">
                <i className="bi bi-search search-icon"></i>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for pages, services, or medical modules..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-close-btn" onClick={onClose} aria-label="Close">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* Body */}
              <div className="search-body custom-scrollbar">
                {query.trim().length === 0 ? (
                  <div className="search-defaults">
                    {recentSearches.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">
                          <h3 className="section-title">Recent Searches</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearRecentSearches();
                            }}
                            className="clear-recent-btn"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="recent-list">
                          {recentSearches.map((mod, index) => (
                            <div
                              key={mod.id}
                              className={`search-item ${selectedIndex === index ? 'active' : ''}`}
                              onClick={() => handleSelect(mod)}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div className="item-icon">
                                <i className={`bi ${mod.icon}`}></i>
                              </div>
                              <div className="item-info">
                                <span className="item-title">{mod.title}</span>
                                <span className="item-path">{mod.path}</span>
                              </div>
                              <i className="bi bi-chevron-right arrow-icon"></i>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="search-section" style={{ marginTop: '20px' }}>
                      <h3 className="section-title px-1">Quick Links</h3>
                      <div className="quick-links-grid">
                        {searchableModules.slice(0, 4).map(mod => (
                          <div
                            key={mod.id}
                            className="quick-link-card"
                            onClick={() => handleSelect(mod)}
                          >
                            <i className={`bi ${mod.icon}`}></i>
                            <span>{mod.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="search-results">
                    {loading && (moduleResults.length === 0 && dynamicResults.length === 0) ? (
                      <div className="py-20 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Finding modules and experts...</p>
                      </div>
                    ) : (moduleResults.length > 0 || dynamicResults.length > 0) ? (
                      <div className="space-y-6">
                        {moduleResults.length > 0 && (
                          <div className="search-section mb-4">
                            <h3 className="section-title mb-2 px-1">Modules</h3>
                            <div className="results-list">
                              {moduleResults.map((mod, index) => (
                                <div
                                  key={mod.id}
                                  className={`search-item ${selectedIndex === index ? 'active' : ''}`}
                                  onClick={() => handleSelect(mod)}
                                  onMouseEnter={() => setSelectedIndex(index)}
                                >
                                  <div className="item-icon result-icon">
                                    <i className={`bi ${mod.icon}`}></i>
                                  </div>
                                  <div className="item-info">
                                    <span className="item-title">{mod.title}</span>
                                    <span className="item-desc">{mod.description}</span>
                                  </div>
                                  <div className="item-action">
                                    <span className="badge-jump">Explore</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dynamicResults.length > 0 && (
                          <div className="search-section mt-4">
                            <h3 className="section-title mb-2 px-1">Detailed Findings</h3>
                            <div className="results-list">
                              {dynamicResults.map((item, index) => (
                                <div
                                  key={item.id + item.type}
                                  className={`search-item ${selectedIndex === (index + moduleResults.length) ? 'active' : ''}`}
                                  onClick={() => handleSelect(item)}
                                  onMouseEnter={() => setSelectedIndex(index + moduleResults.length)}
                                >
                                  <div className="item-icon result-icon">
                                    <i className={`bi ${item.icon}`}></i>
                                  </div>
                                  <div className="item-info">
                                    <div className="flex items-center gap-2">
                                      <span className="item-title">{item.title}</span>
                                      <span className="badge-type">{item.type}</span>
                                    </div>
                                    <span className="item-desc">{item.description}</span>
                                  </div>
                                  <div className="item-action">
                                    <span className="badge-jump">View Details</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : !loading && (
                      <div className="no-results">
                        <i className="bi bi-search-heart"></i>
                        <p>No matches found for "<span>{query}</span>"</p>
                        <small>Try searching for Home, Doctors, or Services</small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="search-footer">
                <div className="search-logo">
                  <i className="bi bi-meta"></i>
                  <span>MediTrust Search</span>
                </div>
                <div className="search-hint">
                  <span><kbd>↑↓</kbd> to navigate</span>
                  <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                  <span><kbd>↵</kbd> to select</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <style>{`
        .search-modal-wrapper {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10vh;
        }

        .search-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .search-modal-container {
          position: relative;
          z-index: 10001;
          width: 100%;
          max-width: 650px;
          padding: 0 20px;
        }

        .search-modal-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        }

        /* Header Styles */
        .search-header {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          gap: 16px;
        }

        .search-icon {
          font-size: 20px;
          color: var(--accent-color);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 18px;
          font-weight: 500;
          color: #1e293b;
        }

        .search-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .search-close-btn {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .search-close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #1e293b;
        }

        /* Body Styles */
        .search-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 700;
          margin: 0;
        }

        .search-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 12px 12px;
        }

        .clear-recent-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-recent-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .search-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          gap: 16px;
          margin-bottom: 4px;
        }

        .search-item:hover, .search-item.active {
          background: rgba(4, 158, 187, 0.08);
        }

        .item-icon {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #64748b;
          transition: all 0.2s;
        }

        .search-item:hover .item-icon, .search-item.active .item-icon {
          background: var(--accent-color);
          color: white;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .item-title {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }

        .item-path, .item-desc {
          font-size: 12px;
          color: #64748b;
        }

        .arrow-icon {
          color: #cbd5e1;
          font-size: 14px;
          opacity: 0;
          transition: all 0.2s;
        }

        .search-item:hover .arrow-icon, .search-item.active .arrow-icon {
          opacity: 1;
          transform: translateX(4px);
        }

        .badge-jump {
          font-size: 11px;
          background: rgba(4, 158, 187, 0.1);
          color: var(--accent-color);
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .badge-type {
          font-size: 10px;
          background: #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }

        .results-list {
          display: flex;
          flex-direction: column;
        }

        /* Quick Links */
        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
          padding: 12px;
        }

        .quick-link-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-link-card i {
          font-size: 24px;
          color: var(--accent-color);
        }

        .quick-link-card span {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .quick-link-card:hover {
          border-color: var(--accent-color);
          background: white;
          box-shadow: 0 10px 20px -10px rgba(4, 158, 187, 0.3);
          transform: translateY(-2px);
        }

        /* No Results */
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .no-results i {
          font-size: 48px;
          color: #e2e8f0;
          margin-bottom: 20px;
        }

        .no-results p {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .no-results p span {
          font-weight: 700;
          color: #1e293b;
        }

        /* Footer Styles */
        .search-footer {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 12px;
        }

        .search-hint kbd {
          background: white;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 10px;
          font-family: inherit;
          box-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }

        .search-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .search-logo i {
          color: var(--accent-color);
          font-size: 14px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        @media (max-width: 640px) {
          .search-modal-wrapper {
            padding-top: 0;
          }
          .search-modal-container {
            padding: 0;
            height: 100%;
          }
          .search-modal-content {
            height: 100%;
            max-height: 100%;
            border-radius: 0;
            border: none;
          }
          .search-header {
            padding: 16px;
          }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default SearchModal;
