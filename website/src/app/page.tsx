export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
            MortAi
          </div>
          <button
            className="px-6 py-2 rounded-full font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg-primary)'
            }}
          >
            Book Your Audit
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Turn Cold Leads Into{' '}
            <span className="text-gradient-accent">Booked Calls</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            AI-powered outreach that finds, contacts, and books your ideal customers
            while you focus on closing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 glow-accent"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg-primary)'
              }}
            >
              Book Your $50 Audit
            </button>
            <button
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 border"
              style={{
                borderColor: 'var(--color-text-secondary)',
                color: 'var(--color-text-primary)',
                background: 'transparent'
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> Done-For-You
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> Results-Driven
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for 3D Funnel - will be added in Phase 3 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Three.js canvas will go here */}
      </div>
    </div>
  );
}
