"use client";

import React from "react";
import Image from "next/image";
import ContactFormComponent from "./components/ContactForm";

export default function Home() {
  // Admin login is now handled on the admin page itself

  return (
    <main>
      <header className="header">
        <div className="container nav-container">
          <div className="logo">Realty Michigan</div>
          <nav className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#listings" className="nav-link">Listings</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      <section id="about" className="container hero">
        <div className="hero-content">
          <h1>Your Dream Home Awaits</h1>
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

      <section id="listings" className="container" style={{ marginBottom: '4rem' }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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

      <footer className="container text-center" style={{ padding: '3rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Drew Wodarski. All rights reserved.</p>
        <div style={{ marginTop: '1rem' }}>
          <a
            href="/admin"
            style={{ color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Admin
          </a>
        </div>
      </footer>
    </main >
  );
}


