import Image from "next/image";

export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="container nav-container">
          <div className="logo">Michigan Realty</div>
          <nav className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      <section id="about" className="container hero">
        <div className="hero-content">
          <h1>Your Dream Home Awaits</h1>
          <p className="hero-subtitle">
            Hi, I'm Drew Wodarski. With over 10 years of experience as a Real Estate Broker,
            I'm dedicated to finding you not just a house, but a home.
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
        <div className="container">
          <div className="contact-card">
            <h2 className="text-center mb-8">Request a Callback</h2>
            <p className="text-center mb-4" style={{ color: 'var(--color-text-light)' }}>
              Fill out the form below and I will get back to you shortly.
            </p>
            <form>
              <div className="form-group grid-half">
                <div>
                  <label className="label" htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" className="input" required placeholder="Jane" />
                </div>
                <div>
                  <label className="label" htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" className="input" required placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="phone">Cell Phone Number</label>
                <input type="tel" id="phone" name="phone" className="input" required placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" className="input" required placeholder="jane@example.com" />
              </div>
              <button type="submit" className="btn btn-secondary submit-btn" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="container text-center" style={{ padding: '3rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Drew Wodarski. All rights reserved.</p>
      </footer>
    </main>
  );
}
