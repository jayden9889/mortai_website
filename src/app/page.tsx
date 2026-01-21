'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic import for scroll animation (no SSR for GSAP)
const ScrollHero = dynamic(() => import('@/components/ScrollHero'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Cold Leads Everywhere
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Scattered across the internet, waiting to be found
        </p>
      </div>
    </div>
  ),
});

// Logo component - Apple-style minimal
function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 24, text: 'text-xs' },
    default: { icon: 32, text: 'text-sm' },
    large: { icon: 48, text: 'text-base' },
  };
  const s = sizes[size];

  return (
    <a href="/" className="flex items-center gap-2 group">
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
    </a>
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How is this different from other lead gen agencies?",
      answer: "Most agencies blast generic templates to purchased lists. We scrape fresh leads daily, enrich them with real data from reviews and social proof, then craft personalized outreach that speaks to their specific pain points. It's problem-aware prospecting, not spam."
    },
    {
      question: "What industries do you work with?",
      answer: "We work best with B2B service businesses—agencies, consultants, SaaS companies, and professional services. If your ideal customer leaves reviews online or has a digital footprint, we can find and reach them."
    },
    {
      question: "How quickly will I see results?",
      answer: "Most clients see their first booked calls within 2-3 weeks of campaign launch. We spend the first week on setup and data enrichment, then ramp up outreach. Results compound as we optimize based on response data."
    },
    {
      question: "What happens on the Strategy Call?",
      answer: "We dive into your business, identify your ideal customer profile, and map out exactly how we'd build a campaign for you. You'll leave with a clear picture of the opportunity—and actionable insights you can use whether we work together or not."
    },
    {
      question: "Do I need to provide leads or a list?",
      answer: "No. We handle everything—finding leads, enriching their data, writing copy, and running campaigns. You just show up to the calls we book for you."
    },
    {
      question: "What if I'm not happy with the results?",
      answer: "We're confident in our process, but we also know trust is earned. That's why we offer founding client pricing with flexible terms. We're building case studies and want you to win as much as you do."
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Navigation - Apple-style minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: 'rgba(10, 15, 20, 0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="default" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--color-text-secondary)' }}>How It Works</a>
            <a href="#services" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--color-text-secondary)' }}>Services</a>
            <a href="#faq" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--color-text-secondary)' }}>FAQ</a>
          </div>
          <a
            href="/book"
            className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg-primary)'
            }}
          >
            Book a Call
          </a>
        </div>
      </nav>

      {/* Scroll-Animated Hero Section */}
      <ScrollHero />

      {/* CTA after hero journey */}
      <section className="py-20 md:py-28" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Turn Cold Leads Into{' '}
            <span className="text-gradient-accent">Booked Calls</span>
          </h2>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            We scrape fresh leads daily, enrich them with real data, and send personalized outreach that actually gets replies—so you can focus on closing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/book"
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 glow-accent"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-bg-primary)'
              }}
            >
              Book a Free Strategy Call
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 border"
              style={{
                borderColor: 'var(--color-text-secondary)',
                color: 'var(--color-text-primary)',
                background: 'transparent'
              }}
            >
              See How It Works
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> No Commitment
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> 30-Min Call
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-accent)' }}>✓</span> Custom Strategy
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 md:py-32" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Cold Outreach Is Broken
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              You've tried the templates. You've bought the lists. And your inbox is still empty.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📉",
                title: "Sub-1% Response Rates",
                description: "Generic mass emails get ignored. Your prospects see through templates instantly—and hit delete."
              },
              {
                icon: "⏰",
                title: "10+ Hours/Week Wasted",
                description: "Finding leads, writing emails, managing follow-ups. Time you could spend on revenue-generating calls."
              },
              {
                icon: "🎯",
                title: "Dead-End Leads",
                description: "Purchased lists are stale. You're pitching businesses that closed, moved, or will never buy from you."
              }
            ].map((problem, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-white/5 transition-all hover:border-white/10"
                style={{ background: 'var(--color-bg-primary)' }}
              >
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {problem.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
                The Solution
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Outreach That Actually Works
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                We combine AI automation with genuine personalization. Every message references real information about your prospect—their reviews, their challenges, their wins.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Fresh Leads, Daily",
                    description: "We scrape and verify new prospects every day. No stale lists."
                  },
                  {
                    title: "Data-Enriched Messaging",
                    description: "We pull from reviews, social profiles, and public data to personalize every touchpoint."
                  },
                  {
                    title: "Fully Managed Campaigns",
                    description: "We handle everything. You just show up to the calls."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative p-8 rounded-3xl border border-white/10"
              style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)' }}
            >
              <div className="absolute inset-0 rounded-3xl opacity-50" style={{ background: 'radial-gradient(circle at 50% 0%, var(--color-accent-light), transparent 60%)' }}></div>
              <div className="relative space-y-4">
                <div className="p-4 rounded-xl border border-white/5" style={{ background: 'var(--color-bg-primary)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>Subject</p>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Saw your 5-star review from Sarah M...</p>
                </div>
                <div className="p-4 rounded-xl border border-white/5" style={{ background: 'var(--color-bg-primary)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>Preview</p>
                  <p style={{ color: 'var(--color-text-primary)' }}>
                    "She mentioned you transformed her brand's social presence in just 3 weeks. That's exactly the kind of result we help agencies like yours get more of..."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Personalized for every prospect
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Three Steps to Booked Calls
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              We handle the entire pipeline so you can focus on what you do best—closing deals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {[
              {
                step: "01",
                title: "Scrape",
                description: "We identify and extract your ideal prospects from across the web. Fresh data, every day."
              },
              {
                step: "02",
                title: "Enrich",
                description: "We pull reviews, social data, and business intel to understand each prospect's unique situation."
              },
              {
                step: "03",
                title: "Outreach",
                description: "We craft and send personalized campaigns that get responses and book calls on your calendar."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div
                  className="p-8 rounded-2xl border border-white/5 h-full transition-all hover:border-white/10 hover:-translate-y-1"
                  style={{ background: 'var(--color-bg-primary)' }}
                >
                  <div
                    className="text-5xl font-bold mb-6 opacity-20"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              Services
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Choose Your Growth Path
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              From audit to full-scale growth engine. Start where it makes sense for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Ad Creative",
                price: "$500/mo",
                description: "Scroll-stopping video ads crafted to convert cold traffic into paying customers.",
                features: [
                  "Luxury Video Production",
                  "Ad Strategy & Scripting",
                  "Platform Optimization",
                  "Performance Creative",
                  "Monthly Creative Refresh"
                ],
                cta: "Book a Call",
                popular: false
              },
              {
                name: "AI Outreach",
                price: "$2,500/mo",
                description: "Done-for-you AI email campaigns that book qualified calls on your calendar.",
                features: [
                  "Fresh Lead Scraping Daily",
                  "Data Enrichment & Personalization",
                  "Multi-Channel Sequences",
                  "Inbox Management",
                  "Weekly Performance Reports",
                  "+ Bonus Per Meeting Booked"
                ],
                cta: "Book a Call",
                popular: true
              },
              {
                name: "Full Growth",
                price: "$4,500/mo",
                description: "The complete growth engine. Outreach + ads + strategy, fully managed by us.",
                features: [
                  "Everything in AI Outreach",
                  "Everything in Ad Creative",
                  "Dedicated Growth Strategist",
                  "Priority Slack Support",
                  "Monthly Growth Reviews",
                  "Operations Audit & Automation Strategy"
                ],
                cta: "Book a Call",
                popular: false
              }
            ].map((service, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border transition-all hover:-translate-y-1 flex flex-col ${
                  service.popular ? 'border-[var(--color-accent)]' : 'border-white/5 hover:border-white/10'
                }`}
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                {service.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {service.name}
                </h3>
                <div className="text-2xl font-bold mb-3" style={{ color: 'var(--color-accent)' }}>
                  {service.price}
                </div>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {service.description}
                </p>
                <ul className="space-y-3 mb-6 flex-grow">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: 'var(--color-accent)' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/book"
                  className={`w-full py-3 rounded-full font-medium transition-all hover:scale-105 text-center block ${
                    service.popular ? 'glow-accent' : ''
                  }`}
                  style={{
                    background: service.popular ? 'var(--color-accent)' : 'transparent',
                    color: service.popular ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                    border: service.popular ? 'none' : '1px solid var(--color-text-secondary)'
                  }}
                >
                  {service.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl border border-white/10 max-w-2xl mx-auto text-center" style={{ background: 'var(--color-bg-secondary)' }}>
            <p className="text-sm mb-2" style={{ color: 'var(--color-accent)' }}>
              Founding Client Program
            </p>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              We're selectively onboarding founding clients who want priority access and preferential rates. Limited spots as we build our case study portfolio.
            </p>
            <a
              href="/book"
              className="inline-block px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'transparent',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent)'
              }}
            >
              Apply for Founding Access
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Got Questions?
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-white/5 rounded-xl overflow-hidden transition-all"
                style={{ background: 'var(--color-bg-primary)' }}
              >
                <button
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {faq.question}
                  </span>
                  <span
                    className="text-2xl transition-transform flex-shrink-0"
                    style={{
                      color: 'var(--color-accent)',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaq === i ? '500px' : '0px',
                    opacity: openFaq === i ? 1 : 0
                  }}
                >
                  <p className="px-6 pb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            Ready to Fill Your Calendar?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Book a free strategy call and we'll map out exactly how we'd build a campaign for your business.
          </p>
          <a
            href="/book"
            className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 glow-accent"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg-primary)'
            }}
          >
            Book Your Free Call
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="small" />
            <div className="flex items-center gap-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              © 2026 MortAi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
