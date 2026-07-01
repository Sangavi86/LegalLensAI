import styles from './LandingPage.module.css';

/**
 * Landing page — Milestone 1 scaffold.
 * This page will be replaced with proper auth flow in Milestone 2.
 * Shows the brand identity and confirms the app is running.
 */
function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Background orbs */}
      <div className={styles.orbTopLeft} aria-hidden="true" />
      <div className={styles.orbBottomRight} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden="true">⚖️</span>
            <span className={styles.logoText}>JurisMind</span>
            <span className={styles.logoBadge}>AI</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <button className={styles.btnOutline} type="button">Sign In</button>
            <button className={styles.btnPrimary} type="button">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.badge} animate-fade-in`}>
            <span className={styles.badgeDot} />
            Powered by Gemini 2.5 Flash · Multilingual AI
          </div>

          <h1 className={`${styles.heroTitle} animate-fade-in-up stagger-1`}>
            Understand Every
            <br />
            <span className="gradient-text">Legal Document</span>
            <br />
            Before You Sign
          </h1>

          <p className={`${styles.heroSubtitle} animate-fade-in-up stagger-2`}>
            JurisMind AI is your intelligent legal copilot. Upload any contract,
            NDA, lease, or agreement and get instant risk analysis, plain-language
            explanations, and AI-powered negotiation advice — in your language.
          </p>

          <div className={`${styles.heroCta} animate-fade-in-up stagger-3`}>
            <button className={styles.btnHero} type="button">
              Analyze Your First Document Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className={styles.btnSecondary} type="button">
              Watch Demo
            </button>
          </div>

          <div className={`${styles.heroStats} animate-fade-in-up stagger-4`}>
            {[
              { value: '12+', label: 'Languages Supported' },
              { value: '10+', label: 'Document Types' },
              { value: '< 60s', label: 'Analysis Time' },
            ].map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className={`${styles.heroVisual} animate-fade-in stagger-2`}>
          <div className={styles.mockCard}>
            <div className={styles.mockCardHeader}>
              <div className={styles.mockDots}>
                <span /><span /><span />
              </div>
              <span className={styles.mockTitle}>Employment Agreement.pdf</span>
            </div>
            <div className={styles.mockBody}>
              <div className={styles.mockRiskBadge}>
                <span className={`${styles.riskDot} ${styles.riskHigh}`} />
                Overall Risk: <strong>7.2 / 10</strong>
                <span className="risk-high" style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>HIGH</span>
              </div>
              {[
                { type: 'Non-Compete Clause', risk: 'HIGH', flag: true },
                { type: 'IP Ownership', risk: 'CRITICAL', flag: true },
                { type: 'Termination Rights', risk: 'MEDIUM', flag: false },
                { type: 'Payment Terms', risk: 'LOW', flag: false },
              ].map((clause) => (
                <div key={clause.type} className={styles.mockClause}>
                  <div className={styles.mockClauseLeft}>
                    {clause.flag && <span className={styles.redFlag}>🚩</span>}
                    <span className={styles.mockClauseType}>{clause.type}</span>
                  </div>
                  <span className={`risk-${clause.risk.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>
                    {clause.risk}
                  </span>
                </div>
              ))}
              <div className={styles.mockChat}>
                <div className={styles.mockChatBubble}>
                  💬 &ldquo;What happens to my IP if I leave?&rdquo;
                </div>
                <div className={`${styles.mockChatReply} animate-pulse`}>
                  <span className={styles.aiLabel}>AI</span>
                  Under Clause 12, all work product created during employment — including personal projects on company devices — belongs to the employer...
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={`${styles.sectionTitle} animate-fade-in-up`}>
            Not Just a PDF Summarizer
          </h2>
          <p className={styles.sectionSubtitle}>
            A complete AI legal intelligence system — from risk detection to negotiation strategy.
          </p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`${styles.featureCard} hover-lift animate-fade-in-up stagger-${i + 1}`}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusDot} />
        <span>Milestone 1 — Foundation scaffold running successfully</span>
        <span className={styles.statusSep}>·</span>
        <span>API: localhost:8000</span>
        <span className={styles.statusSep}>·</span>
        <span>AI Service: localhost:8001</span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🔍',
    title: 'Deep Risk Analysis',
    desc: 'Every clause scored 0–10. Indemnity, IP, non-compete, termination — all weighted and explained in plain language.',
  },
  {
    icon: '💬',
    title: 'Chat With Your Contract',
    desc: 'Ask any question about your document. Get cited, accurate answers powered by RAG — not hallucinations.',
  },
  {
    icon: '⚖️',
    title: 'Sign / Negotiate / Reject',
    desc: 'AI recommendation with specific negotiation talking points and alternative clause language.',
  },
  {
    icon: '🌐',
    title: 'Multilingual Intelligence',
    desc: '12+ languages. Indian languages via IndicTrans2. Global languages via Gemini. Analyze and chat in your language.',
  },
  {
    icon: '📊',
    title: 'Document Comparison',
    desc: 'Compare versions side by side. See exactly what changed between drafts with AI-generated summaries.',
  },
  {
    icon: '📚',
    title: 'Clause Library',
    desc: 'Build and search a library of standard and custom clauses. Find similar clauses across all your documents.',
  },
];

export default LandingPage;
