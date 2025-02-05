import { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY) {
        // Scrolling UP
        setIsNavbarVisible(true);
      } else if (currentScrollY > 50) {
        // Scrolling DOWN and past the threshold
        setIsNavbarVisible(false);
      }
      
      setLastScrollY(currentScrollY);
      
      // Parallax effect - negative value for correct direction
      setScrollPosition(-window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Custom cursor update
  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // Optimized parallax speeds based on star position
  const getParallaxSpeed = (index) => {
    // Stars 1-4 (left side, top to bottom)
    if (index < 4) return 0.15 + (index * 0.05);
    // Stars 5-8 (right side, top to bottom)
    if (index < 8) return 0.25 + ((index - 4) * 0.05);
    // Stars 9-12 (outer edges)
    return 0.35 + ((index - 8) * 0.05);
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    const navbarHeight = 80; // Approximate navbar height
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="App">
      <div className="stars-container">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`star star-${i + 1}`}
            style={{
              transform: `translate3d(0, ${scrollPosition * getParallaxSpeed(i)}px, 0) scale(${1 + i * 0.05})`
            }}
          />
        ))}
      </div>

      <nav className={`navbar ${isNavbarVisible ? '' : 'navbar-hidden'}`}>
        <div className="navbar-brand">LaTeX Copilot</div>
        <div className="navbar-links">
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
          <a href="#installation" onClick={(e) => scrollToSection(e, 'installation')}>Install</a>
          <a href="https://github.com/maxx06/auto-latex" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </nav>

      <header className="App-header">
        <div className="header-content">
          <h1>
            <span className="gradient-text">AI-Powered LaTeX</span>
            <br />
            Assistant for Overleaf
          </h1>
          <p className="subtitle">Transform your LaTeX writing experience with intelligent suggestions and automated formatting.</p>
          <div className="cta-buttons">
            <a href="#installation" onClick={(e) => scrollToSection(e, 'installation')} className="primary-button">Get Started</a>
            <a href="https://github.com/maxx06/auto-latex" className="secondary-button">View on GitHub</a>
          </div>
        </div>
        <div className="header-gradient"></div>
      </header>

      <main className="App-main">
        <section className="features" id="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Smart Suggestions</h3>
              <p>Get intelligent LaTeX code suggestions powered by Claude AI</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Seamless Integration</h3>
              <p>Works directly within your Overleaf editor</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Easy to Use</h3>
              <p>Press Ctrl+Enter to request changes anytime</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Full Control</h3>
              <p>Accept or reject suggestions with a single click</p>
            </div>
          </div>
        </section>

        <section className="installation" id="installation">
          <h2>Getting Started</h2>
          <div className="steps">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Download Extension</h3>
              <p>Install LaTeX Copilot from the Chrome Web Store</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Open Overleaf</h3>
              <p>Navigate to your Overleaf project</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <h3>Start Using</h3>
              <p>Press Ctrl+Enter to begin getting AI suggestions</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>Created by Max Xiong</p>
      </footer>

      <div className="custom-cursor" ref={cursorRef}></div>
    </div>
  );
}

export default App;
