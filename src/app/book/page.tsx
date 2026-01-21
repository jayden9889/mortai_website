'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

// Logo component
function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 24, text: 'text-xs' },
    default: { icon: 32, text: 'text-sm' },
    large: { icon: 48, text: 'text-base' },
  };
  const s = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <Image
        src="/logo.png"
        alt="MortAi"
        width={s.icon}
        height={s.icon}
        className="transition-transform group-hover:scale-105"
      />
      <span className={`font-logo font-semibold ${s.text}`} style={{ color: 'var(--color-text-primary)' }}>
        MortAi
      </span>
    </Link>
  );
}

export default function BookPage() {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: 'rgba(10, 15, 20, 0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="default" />
          <Link
            href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Book Your{' '}
              <span className="text-gradient-accent">Strategy Call</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              30 minutes to map out exactly how we'd build a lead generation campaign for your business. No commitment, just clarity.
            </p>
          </div>

          {/* Calendly Embed */}
          <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'var(--color-bg-secondary)' }}>
            <div
              className="calendly-inline-widget"
              data-url="https://calendly.com/mortai/strategy-call?hide_gdpr_banner=1&background_color=111922&text_color=f0f4f8&primary_color=00d4c8"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>

          {/* What to Expect */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Your Business",
                description: "We'll learn about your ideal customers, current challenges, and growth goals."
              },
              {
                title: "The Strategy",
                description: "We'll map out a campaign tailored to your specific market and offering."
              },
              {
                title: "Clear Next Steps",
                description: "You'll leave with actionable insights whether we work together or not."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-white/5"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-4"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                >
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
