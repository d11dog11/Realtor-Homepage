"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ContactFormComponent from "./components/ContactForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Adjust to trigger when section is in view
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ["about", "listings", "contact"];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <header className="header">
        <div className="container nav-container">
          <div className="logo" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1', gap: '2px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em' }}>Drew Wodarski</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db' }}>Realty Michigan</span>
          </div>
          <nav className="nav-links">
            <a href="#about" className={`nav-link ${activeTab === "about" ? "active" : ""}`}>About</a>
            <a href="#contact" className={`nav-link ${activeTab === "contact" ? "active" : ""}`}>Contact</a>
            <a href="#listings" className={`nav-link ${activeTab === "listings" ? "active" : ""}`}>Listings</a>
          </nav>
        </div>
      </header>

      <section id="about" className="container hero">
        <div className="hero-content">
          <h1>Your <span className="gradient-text">Dream Home</span> Awaits</h1>
          <p className="hero-subtitle">
            Hi, I&apos;m Drew Wodarski. With over 10 years of experience as a Real Estate Broker,
            I&apos;m dedicated to finding you not just a house, but a home.
            My approach is personal, detailed, and tailored to your unique lifestyle.
          </p>
          <a href="#contact" className="btn btn-primary">Request a Call</a>
        </div>
        <div className="hero-image-wrapper">
          <Image
            src="/headshot.png"
            alt="Drew Wodarski"
            width={800}
            height={800}
            className="hero-image"
            priority
          />
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container" id="contact-container">
          <div className="contact-card">
            <h2 className="text-center mb-8">Request a Callback</h2>
            <p className="text-center mb-4" style={{ color: 'var(--color-text-light)' }}>
              Fill out the form below and I will get back to you shortly.
            </p>
            {/* We'll import and use the ContactForm component dynamically or just rewrite it here if easy, 
                but better to keep using the existing component. 
                However, since this is now a client component (due to useState), we need to ensure ContactForm is compatible.
                ContactForm has "use client" so it's fine.
            */}
            <ContactFormComponent />
          </div>
        </div>
      </section>

      <section id="listings" className="container" style={{ marginTop: '8rem', marginBottom: '8rem' }}>
        <div style={{
          background: 'var(--color-bg-card)',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden'
        }}>
          <h2 className="text-center mb-8">Current Listings</h2>
          <iframe
            src="https://link.flexmls.com/1z56325dywzs,18"
            title="Flexmls Property Listings"
            style={{
              width: '100%',
              height: '800px',
              border: 'none',
              borderRadius: '0.5rem'
            }}
            loading="lazy"
          ></iframe>
        </div>
      </section>

      <footer className="container text-center" style={{ padding: '3rem 0', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Drew Wodarski. All rights reserved.</p>
        <div style={{ marginTop: '1rem' }}>
          <a
            href="/admin"
            style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Admin
          </a>
        </div>
      </footer>
    </main >
  );
}


