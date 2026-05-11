import { useNavigate } from 'react-router-dom';
import huVmsLogo from '../../assets/HU-VMS-logo.png';
import realtimeTrackingImg from '../../assets/realtime tracking.jpg';
import notifyImg from '../../assets/notify.jpg';
import reportsImg from '../../assets/reports.jpg';
import userManagementImg from '../../assets/usermanagement.jpg';
import vmImg from '../../assets/vm.jpg';
import customsImg from '../../assets/customs.jpg';
import './landingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src={huVmsLogo} alt="HU-VMS Logo" className="logo-icon-img" />
            <span className="logo-text">HU-VMS</span>
          </div>
          <div className="nav-links">
            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('services')} className="nav-link">Services</button>
            <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
          </div>
          <button onClick={() => navigate('/login')} className="login-btn">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="highlight">HU Vehicle Management System</span>
            </h1>
            
            {/* Animated Feature Cards */}
            <div className="features-animation-container">
              <div className="features-track">
                <div className="animated-feature-card">
                  <span className="feature-card-icon">📊</span>
                  <span className="feature-card-text">Real-time Tracking</span>
                </div>
                <div className="animated-feature-card">
                  <span className="feature-card-icon">🚙</span>
                  <span className="feature-card-text">Fleet Management</span>
                </div>
                <div className="animated-feature-card">
                  <span className="feature-card-icon">📈</span>
                  <span className="feature-card-text">Analytics & Reports</span>
                </div>
                {/* Duplicate for seamless loop */}
                <div className="animated-feature-card">
                  <span className="feature-card-icon">📊</span>
                  <span className="feature-card-text">Real-time Tracking</span>
                </div>
                <div className="animated-feature-card">
                  <span className="feature-card-icon">🚙</span>
                  <span className="feature-card-text">Fleet Management</span>
                </div>
                <div className="animated-feature-card">
                  <span className="feature-card-icon">📈</span>
                  <span className="feature-card-text">Analytics & Reports</span>
                </div>
              </div>
            </div>
            
            <p className="hero-subtitle">
              Streamline your fleet operations with our comprehensive vehicle management solution. Track vehicles, manage drivers, and generate detailed reports all in one place.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/login')} className="btn-primary-hero">
                Get Started
              </button>
              <button onClick={() => scrollToSection('about')} className="btn-secondary-hero">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Everything you need to manage university vehicle operations efficiently</p>

          {/* Stats bar */}
          <div className="services-stats">
            <div className="services-stat">
              <span className="services-stat-number">6+</span>
              <span className="services-stat-label">Core Services</span>
            </div>
            <div className="services-stat-divider" />
            <div className="services-stat">
              <span className="services-stat-number">24/7</span>
              <span className="services-stat-label">System Uptime</span>
            </div>
            <div className="services-stat-divider" />
            <div className="services-stat">
              <span className="services-stat-number">100%</span>
              <span className="services-stat-label">Digital Workflow</span>
            </div>
            <div className="services-stat-divider" />
            <div className="services-stat">
              <span className="services-stat-number">Real-time</span>
              <span className="services-stat-label">Fleet Tracking</span>
            </div>
          </div>

          <div className="services-grid">

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#16a34a,#15803d)', '--card-glow': 'rgba(22,163,74,0.06)', '--tag-bg': 'rgba(22,163,74,0.12)', '--tag-border': 'rgba(22,163,74,0.3)', '--tag-color': '#4ade80' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">01</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
                <span className="service-icon">🚗</span>
              </div>
              <h3>Vehicle Booking</h3>
              <p>Submit and manage vehicle requests online. Staff can book vehicles for official trips with smart auto-assignment based on purpose and passenger count.</p>
              <span className="service-tag">For Staff &amp; Faculty</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#3b82f6,#2563eb)', '--card-glow': 'rgba(59,130,246,0.06)', '--tag-bg': 'rgba(59,130,246,0.12)', '--tag-border': 'rgba(59,130,246,0.3)', '--tag-color': '#93c5fd' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">02</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
                <span className="service-icon">📅</span>
              </div>
              <h3>Trip Scheduling</h3>
              <p>Plan and schedule trips with date, time, destination, and purpose. The system automatically detects the best vehicle type for each trip category.</p>
              <span className="service-tag">Smart Scheduling</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#8b5cf6,#7c3aed)', '--card-glow': 'rgba(139,92,246,0.06)', '--tag-bg': 'rgba(139,92,246,0.12)', '--tag-border': 'rgba(139,92,246,0.3)', '--tag-color': '#c4b5fd' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">03</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
                <span className="service-icon">👤</span>
              </div>
              <h3>Driver &amp; Vehicle Assignment</h3>
              <p>Transport officers assign the best-matched vehicle and driver to each trip. Includes fuel estimation using real road distance and vehicle consumption rates.</p>
              <span className="service-tag">AI-Assisted Matching</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#f59e0b,#d97706)', '--card-glow': 'rgba(245,158,11,0.06)', '--tag-bg': 'rgba(245,158,11,0.12)', '--tag-border': 'rgba(245,158,11,0.3)', '--tag-color': '#fcd34d' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">04</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
                <span className="service-icon">📍</span>
              </div>
              <h3>Real-Time Tracking</h3>
              <p>Monitor all university vehicles on an interactive satellite map. Track live positions, speed, and status of every vehicle in the fleet.</p>
              <span className="service-tag">Live Map View</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#dc2626,#b91c1c)', '--card-glow': 'rgba(220,38,38,0.06)', '--tag-bg': 'rgba(220,38,38,0.12)', '--tag-border': 'rgba(220,38,38,0.3)', '--tag-color': '#fca5a5' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">05</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }}>
                <span className="service-icon">🔐</span>
              </div>
              <h3>Gate Verification</h3>
              <p>Security officers verify vehicle entry and exit using QR code scanning or plate number detection. Unauthorized vehicles are flagged instantly.</p>
              <span className="service-tag">QR + ALPR</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

            <div className="service-card"
              style={{ '--card-gradient': 'linear-gradient(135deg,#0891b2,#0e7490)', '--card-glow': 'rgba(8,145,178,0.06)', '--tag-bg': 'rgba(8,145,178,0.12)', '--tag-border': 'rgba(8,145,178,0.3)', '--tag-color': '#67e8f9' }}
              onClick={() => navigate('/login')}>
              <span className="service-card-number">06</span>
              <div className="service-icon-wrap" style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.3)' }}>
                <span className="service-icon">📊</span>
              </div>
              <h3>Reports &amp; Analytics</h3>
              <p>Generate comprehensive reports on fuel consumption, trip history, driver performance, maintenance costs, and fleet utilization with interactive charts.</p>
              <span className="service-tag">Data-Driven Insights</span>
              <div className="service-card-arrow">Get started <span>→</span></div>
            </div>

          </div>

          <div className="services-cta">
            <button onClick={() => navigate('/login')} className="btn-primary-hero">
              Access All Services →
            </button>
            <p className="services-cta-text">Login required · Secure university portal</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <h2 className="section-title">About Our System</h2>
          <p className="section-subtitle">
            A comprehensive solution for managing university vehicle operations
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={vmImg} alt="Vehicle Management" className="feature-image" />
              </div>
              <h3>Vehicle Management</h3>
              <p>Track and manage your entire fleet with ease. Monitor vehicle status, maintenance schedules, and availability in real-time.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={userManagementImg} alt="User Management" className="feature-image" />
              </div>
              <h3>User Management</h3>
              <p>Manage drivers, transport officers, and users efficiently. Assign roles and permissions with our intuitive interface.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={reportsImg} alt="Advanced Reports" className="feature-image" />
              </div>
              <h3>Advanced Reports</h3>
              <p>Generate detailed reports on trips, fuel consumption, driver performance, and more. Export and share with ease.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={realtimeTrackingImg} alt="Real-time Tracking" className="feature-image" />
              </div>
              <h3>Real-time Tracking</h3>
              <p>Track vehicle locations in real-time with our integrated mapping system. Monitor routes and optimize operations.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={notifyImg} alt="Notifications" className="feature-image" />
              </div>
              <h3>Notifications</h3>
              <p>Stay informed with instant notifications for requests, approvals, maintenance alerts, and system updates.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon feature-icon-image">
                <img src={customsImg} alt="Customizable" className="feature-image" />
              </div>
              <h3>Customizable</h3>
              <p>Personalize your experience with multiple themes and configurable settings to match your preferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Have questions or need support? We&apos;d love to hear from you.
          </p>

          <div className="contact-content">
            {/* Info side */}
            <div className="contact-info">
              <div className="contact-info-header">
                <h3>Let&apos;s connect</h3>
                <p>Reach out through any of the channels below and our team will get back to you as soon as possible.</p>
              </div>

              <div className="info-card">
                <div className="info-icon-wrap blue">📍</div>
                <div className="info-card-text">
                  <span className="info-card-label">Address</span>
                  <span className="info-card-value">Haramaya University, P.O. Box 138<br/>Dire Dawa, Ethiopia</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrap purple">📧</div>
                <div className="info-card-text">
                  <span className="info-card-label">Email</span>
                  <span className="info-card-value">transport@haramaya.edu.et<br/>support@hu-vms.edu.et</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrap teal">📞</div>
                <div className="info-card-text">
                  <span className="info-card-label">Phone</span>
                  <span className="info-card-value">+251 25 553 0325<br/>+251 25 553 0326</span>
                </div>
              </div>
            </div>

            {/* Form side */}
            <div className="contact-form">
              <p className="contact-form-title">Send us a message</p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input type="text" placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" placeholder="How can we help?" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea placeholder="Write your message here..." rows="5" required></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  <span>Send Message</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">

            {/* Brand */}
            <div className="footer-section">
              <div className="footer-title">
                <span className="footer-icon">🚗</span>
                <span className="footer-title-gradient">HU-VMS</span>
              </div>
              <p className="footer-text">
                Haramaya University Vehicle Management System — streamlining fleet operations for better efficiency and transparency across the campus.
              </p>
              <div className="footer-badge">
                <span className="footer-badge-dot"></span>
                System Online
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><button onClick={() => scrollToSection('home')}>Home</button></li>
                <li><button onClick={() => scrollToSection('services')}>Services</button></li>
                <li><button onClick={() => scrollToSection('about')}>About</button></li>
                <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
                <li><button onClick={() => navigate('/login')}>Login</button></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4>Services</h4>
              <ul className="footer-links">
                <li><button onClick={() => scrollToSection('services')}>Vehicle Booking</button></li>
                <li><button onClick={() => scrollToSection('services')}>Trip Scheduling</button></li>
                <li><button onClick={() => scrollToSection('services')}>Gate Verification</button></li>
                <li><button onClick={() => scrollToSection('services')}>Reports & Analytics</button></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">📍</div>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">Address</span>
                  <span className="footer-contact-value">Haramaya University<br/>Dire Dawa, Ethiopia</span>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">📧</div>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">Email</span>
                  <span className="footer-contact-value">transport@haramaya.edu.et</span>
                </div>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">📞</div>
                <div className="footer-contact-text">
                  <span className="footer-contact-label">Phone</span>
                  <span className="footer-contact-value">+251 25 553 0325</span>
                </div>
              </div>
            </div>

          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              &copy; 2024 <span>Haramaya University VMS</span>. All rights reserved.
            </div>
            <div className="footer-bottom-right">
              Made with <span className="footer-heart">♥</span> for Haramaya University
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
