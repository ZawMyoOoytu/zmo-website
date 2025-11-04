// frontend/src/pages/Contact.js
import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'message' ? value.slice(0, 500) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      alert('Thank you for your message! I will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is your typical response time?",
      answer: "I typically respond to all inquiries within 24 hours. For urgent matters, please mention 'URGENT' in your subject line."
    },
    {
      question: "Do you work remotely?",
      answer: "Yes, I work remotely with clients from all over the world. I'm comfortable with different time zones and communication tools."
    },
    {
      question: "What types of projects do you take on?",
      answer: "I specialize in web development, React applications, and full-stack projects. I'm open to discussing any project that involves modern web technologies."
    },
    {
      question: "What is your development process?",
      answer: "My process includes discovery, planning, development, testing, and deployment. I believe in transparent communication and regular updates throughout the project."
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Let's Create Something 
              <span className="gradient-text"> Amazing Together</span>
            </h1>
            <p className="hero-subtitle">
              Ready to bring your ideas to life? Let's discuss your project and turn your vision into reality. 
              I'm here to help you build exceptional digital experiences.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">24h</span>
                <span className="stat-label">Response Time</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Main Section */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            
            {/* Contact Information Sidebar */}
            <div className="contact-sidebar">
              <div className="sidebar-card">
                <h2 className="sidebar-title">Get In Touch</h2>
                <p className="sidebar-description">
                  Whether you have a project in mind, need technical consultation, or just want to say hello - I'd love to hear from you!
                </p>

                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="method-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="method-content">
                      <h4>Email Me</h4>
                      <p>myothum848@gmail.com</p>
                      <span className="method-subtext">I'll reply within 24 hours</span>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="method-content">
                      <h4>Call Me</h4>
                      <p>+959261934500</p>
                      <span className="method-subtext">Mon - Fri, 9AM - 6PM</span>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="method-content">
                      <h4>Location</h4>
                      <p>Yangon, Myanmar</p>
                      <span className="method-subtext">Available for remote work worldwide</span>
                    </div>
                  </div>
                </div>

                <div className="social-section">
                  <h4 className="social-title">Follow My Journey</h4>
                  <div className="social-links">
                    <button 
                      className="social-btn github"
                      onClick={() => window.open('https://github.com/ZawMyoOoytu', '_blank')}
                    >
                      <i className="fab fa-github"></i>
                      GitHub
                    </button>
                    <button 
                      className="social-btn linkedin"
                      onClick={() => window.open('https://www.linkedin.com/in/zaw-myo-oo-541201aa/', '_blank')}
                    >
                      <i className="fab fa-linkedin"></i>
                      LinkedIn
                    </button>
                    <button 
                      className="social-btn twitter"
                      onClick={() => window.open('https://twitter.com/ZawMyoOo(@myothum848)', '_blank')}
                    >
                      <i className="fab fa-twitter"></i>
                      Twitter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">Send Me a Message</h2>
                  <p className="form-subtitle">Fill out the form below and I'll get back to you as soon as possible</p>
                </div>
                
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Type *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">What is this regarding?</option>
                      <option value="web-development">Web Development</option>
                      <option value="react-app">React Application</option>
                      <option value="full-stack">Full Stack Project</option>
                      <option value="consultation">Technical Consultation</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Project Details *
                      <span className="char-count">{formData.message.length}/500</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Tell me about your project, timeline, budget, and any specific requirements..."
                      rows="5"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-header">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">Quick answers to common questions about working with me</p>
          </div>
          <div className="faq-grid">
            {faqItems.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFAQ === index ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="faq-header">
                  <h3 className="faq-question">{faq.question}</h3>
                  <i className={`fas fa-chevron-${activeFAQ === index ? 'up' : 'down'}`}></i>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;