'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Lead {
  id: number;
  startX: number;
  startY: number;
  color: 'warm' | 'cool';
  size: number;
  delay: number;
  converted: boolean;
  calendarSlot?: { row: number; col: number };
}

// Smooth easing function
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      setProgress(latest);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Calculate current stage based on progress
  const currentStage = progress < 0.15 ? 0 : progress < 0.45 ? 1 : progress < 0.75 ? 2 : 3;

  // Initialize dimensions and leads
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const coralCount = 24;
    const tealCount = 20;
    const newLeads: Lead[] = [];

    // Calendar slots for converted leads
    const calendarSlots = [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 0 },
      { row: 0, col: 4 },
      { row: 2, col: 2 },
      { row: 1, col: 0 },
      { row: 3, col: 3 },
      { row: 1, col: 2 },
      { row: 3, col: 1 },
      { row: 2, col: 4 },
    ];

    let slotIndex = 0;

    // Create coral (warm) leads - scattered across screen
    for (let i = 0; i < coralCount; i++) {
      const converted = i < 5;
      newLeads.push({
        id: i,
        startX: Math.random() * dimensions.width * 0.8 + dimensions.width * 0.1,
        startY: Math.random() * dimensions.height * 0.6 + dimensions.height * 0.15,
        color: 'warm',
        size: 16 + Math.random() * 6,
        delay: Math.random() * 0.3,
        converted,
        calendarSlot: converted ? calendarSlots[slotIndex++] : undefined,
      });
    }

    // Create teal (cool) leads
    for (let i = 0; i < tealCount; i++) {
      const converted = i < 5;
      newLeads.push({
        id: coralCount + i,
        startX: Math.random() * dimensions.width * 0.8 + dimensions.width * 0.1,
        startY: Math.random() * dimensions.height * 0.6 + dimensions.height * 0.15,
        color: 'cool',
        size: 16 + Math.random() * 6,
        delay: Math.random() * 0.3,
        converted,
        calendarSlot: converted ? calendarSlots[slotIndex++] : undefined,
      });
    }

    setLeads(newLeads);
  }, [dimensions]);

  // Funnel dimensions
  const funnelTop = dimensions.height * 0.12;
  const funnelBottom = dimensions.height * 0.78;
  const funnelTopWidth = Math.min(360, dimensions.width * 0.4);
  const funnelBottomWidth = 50;
  const spoutHeight = dimensions.height * 0.12;
  const centerX = dimensions.width / 2;

  // Calculate lead position based on progress
  const getLeadPosition = (lead: Lead) => {
    const { startX, startY, color, delay, converted, calendarSlot } = lead;
    const isWarm = color === 'warm';

    // Stage 0: Scattered with gentle float (0 - 0.15)
    if (progress < 0.15) {
      const floatProgress = progress / 0.15;
      const time = Date.now() * 0.001;
      const floatX = Math.sin(time * 0.5 + lead.id) * (8 - floatProgress * 4);
      const floatY = Math.cos(time * 0.4 + lead.id) * (6 - floatProgress * 3);

      return {
        x: startX + floatX,
        y: startY + floatY,
        opacity: 0.8,
        scale: 1,
      };
    }

    // Stage 1: Move to funnel top and enter (0.15 - 0.45)
    if (progress < 0.45) {
      const stageProgress = (progress - 0.15) / 0.30;
      const delayedProgress = Math.max(0, Math.min(1, (stageProgress - delay * 0.5) / (1 - delay * 0.5)));
      const eased = easeInOutCubic(delayedProgress);

      // Target: funnel top opening, spread across the width
      const spreadInFunnel = (lead.id % 12 - 6) / 6;
      const targetX = centerX + spreadInFunnel * funnelTopWidth * 0.6;
      const targetY = funnelTop + 40;

      return {
        x: startX + (targetX - startX) * eased,
        y: startY + (targetY - startY) * eased,
        opacity: 0.9,
        scale: 1 - eased * 0.1,
      };
    }

    // Stage 2: Fall through funnel, sort by color (0.45 - 0.75)
    if (progress < 0.75) {
      const stageProgress = (progress - 0.45) / 0.30;
      const delayedProgress = Math.max(0, Math.min(1, (stageProgress - delay * 0.4) / (1 - delay * 0.4)));
      const eased = easeOutCubic(delayedProgress);

      // Start position (at funnel top)
      const spreadInFunnel = (lead.id % 12 - 6) / 6;
      const startFunnelX = centerX + spreadInFunnel * funnelTopWidth * 0.6;
      const startFunnelY = funnelTop + 40;

      // Calculate position in funnel based on fall progress
      const funnelDepth = eased;
      const currentFunnelWidth = funnelTopWidth - (funnelTopWidth - funnelBottomWidth) * funnelDepth;

      // Sort by color as they fall - warm goes left, cool goes right
      const colorOffset = isWarm ? -0.3 : 0.3;
      const laneOffset = ((lead.id % 8) / 8 - 0.5) * 0.4 + colorOffset;

      const targetX = centerX + laneOffset * currentFunnelWidth;
      const targetY = funnelTop + 40 + (funnelBottom - funnelTop - 40) * funnelDepth;

      // Non-converted leads fade out as they reach bottom
      let opacity = 0.9;
      if (!converted && funnelDepth > 0.6) {
        opacity = 0.9 * (1 - (funnelDepth - 0.6) / 0.4);
      }

      return {
        x: startFunnelX + (targetX - startFunnelX) * eased,
        y: startFunnelY + (targetY - startFunnelY) * eased,
        opacity,
        scale: 0.9 - funnelDepth * 0.15,
      };
    }

    // Stage 3: Converted fly to calendar, others invisible (0.75 - 1)
    if (converted && calendarSlot) {
      const stageProgress = (progress - 0.75) / 0.25;
      const delayedProgress = Math.max(0, Math.min(1, (stageProgress - delay * 0.3) / (1 - delay * 0.3)));
      const eased = easeOutCubic(delayedProgress);

      // Calendar position
      const calWidth = 380;
      const calHeight = 340;
      const calLeft = centerX - calWidth / 2;
      const calTop = funnelBottom + spoutHeight + 30;
      const cellWidth = calWidth / 5;
      const cellHeight = (calHeight - 60) / 4;

      const targetX = calLeft + calendarSlot.col * cellWidth + cellWidth / 2;
      const targetY = calTop + 60 + calendarSlot.row * cellHeight + cellHeight / 2;

      // Start from spout exit
      const startSpoutX = centerX;
      const startSpoutY = funnelBottom + spoutHeight;

      return {
        x: startSpoutX + (targetX - startSpoutX) * eased,
        y: startSpoutY + (targetY - startSpoutY) * eased,
        opacity: 1,
        scale: 0.75 + eased * 0.35,
        glow: eased > 0.5,
      };
    }

    // Non-converted in stage 3 - invisible
    return { x: 0, y: 0, opacity: 0, scale: 0 };
  };

  const stages = [
    {
      title: 'Cold Leads Everywhere',
      subtitle: 'Scattered across the internet, waiting to be found',
    },
    {
      title: 'AI-Powered Discovery',
      subtitle: 'We find and enrich your ideal prospects',
    },
    {
      title: 'Personalized Outreach',
      subtitle: 'Every message crafted for maximum impact',
    },
    {
      title: 'Booked Calls',
      subtitle: 'Qualified meetings on your calendar',
    },
  ];

  // Funnel visibility
  const funnelOpacity = progress < 0.12 ? 0 : progress < 0.20 ? (progress - 0.12) / 0.08 : progress > 0.70 ? 1 - (progress - 0.70) / 0.08 : 1;

  // Calendar visibility
  const calendarOpacity = progress < 0.72 ? 0 : Math.min(1, (progress - 0.72) / 0.12);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 200, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 200, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />

        {/* Professional Glass Funnel */}
        {funnelOpacity > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: funnelOpacity }}
          >
            <defs>
              {/* Glass gradient */}
              <linearGradient id="funnelGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 212, 200, 0.08)" />
                <stop offset="50%" stopColor="rgba(0, 212, 200, 0.04)" />
                <stop offset="100%" stopColor="rgba(0, 255, 229, 0.12)" />
              </linearGradient>

              {/* Edge glow gradient */}
              <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 255, 229, 0.6)" />
                <stop offset="50%" stopColor="rgba(0, 212, 200, 0.4)" />
                <stop offset="100%" stopColor="rgba(0, 255, 229, 0.8)" />
              </linearGradient>

              {/* Blur filter for glass effect */}
              <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>

              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Inner shadow for depth */}
              <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
                <feOffset dx="0" dy="4" />
                <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                <feFlood floodColor="rgba(0, 255, 229, 0.3)" />
                <feComposite in2="shadowDiff" operator="in" />
                <feComposite in2="SourceGraphic" operator="over" />
              </filter>
            </defs>

            {/* Funnel cone - main body */}
            <path
              d={`
                M ${centerX - funnelTopWidth} ${funnelTop}
                Q ${centerX - funnelTopWidth * 0.95} ${funnelTop + (funnelBottom - funnelTop) * 0.5}
                  ${centerX - funnelBottomWidth} ${funnelBottom}
                L ${centerX + funnelBottomWidth} ${funnelBottom}
                Q ${centerX + funnelTopWidth * 0.95} ${funnelTop + (funnelBottom - funnelTop) * 0.5}
                  ${centerX + funnelTopWidth} ${funnelTop}
                Z
              `}
              fill="url(#funnelGlass)"
              filter="url(#innerShadow)"
            />

            {/* Spout */}
            <rect
              x={centerX - funnelBottomWidth}
              y={funnelBottom}
              width={funnelBottomWidth * 2}
              height={spoutHeight}
              fill="url(#funnelGlass)"
              filter="url(#innerShadow)"
            />

            {/* Left edge glow */}
            <path
              d={`
                M ${centerX - funnelTopWidth} ${funnelTop}
                Q ${centerX - funnelTopWidth * 0.95} ${funnelTop + (funnelBottom - funnelTop) * 0.5}
                  ${centerX - funnelBottomWidth} ${funnelBottom}
                L ${centerX - funnelBottomWidth} ${funnelBottom + spoutHeight}
              `}
              fill="none"
              stroke="url(#edgeGlow)"
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Right edge glow */}
            <path
              d={`
                M ${centerX + funnelTopWidth} ${funnelTop}
                Q ${centerX + funnelTopWidth * 0.95} ${funnelTop + (funnelBottom - funnelTop) * 0.5}
                  ${centerX + funnelBottomWidth} ${funnelBottom}
                L ${centerX + funnelBottomWidth} ${funnelBottom + spoutHeight}
              `}
              fill="none"
              stroke="url(#edgeGlow)"
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Top rim - 3D effect */}
            <ellipse
              cx={centerX}
              cy={funnelTop}
              rx={funnelTopWidth}
              ry={18}
              fill="none"
              stroke="rgba(0, 255, 229, 0.5)"
              strokeWidth="2.5"
              filter="url(#glow)"
            />

            {/* Bottom glow at spout exit */}
            <circle
              cx={centerX}
              cy={funnelBottom + spoutHeight}
              r={funnelBottomWidth * 1.5}
              fill="url(#funnelGlass)"
              style={{ opacity: 0.6 }}
            />
          </svg>
        )}

        {/* Calendar */}
        {calendarOpacity > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: funnelBottom + spoutHeight + 20,
              opacity: calendarOpacity,
            }}
          >
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                width: 380,
                height: 340,
                background: 'linear-gradient(180deg, rgba(15, 25, 35, 0.95) 0%, rgba(10, 20, 30, 0.98) 100%)',
                border: '1px solid rgba(0, 212, 200, 0.3)',
                boxShadow: '0 0 40px rgba(0, 255, 229, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Header */}
              <div
                className="h-12 flex items-center justify-center"
                style={{ background: 'rgba(0, 212, 200, 0.1)' }}
              >
                <span className="text-lg font-semibold" style={{ color: 'rgba(0, 255, 229, 0.9)' }}>
                  Your Calendar
                </span>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-5 h-8" style={{ borderBottom: '1px solid rgba(0, 212, 200, 0.1)' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div key={day} className="flex items-center justify-center text-xs" style={{ color: 'rgba(0, 212, 200, 0.6)' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 grid-rows-4 flex-1" style={{ height: 'calc(100% - 80px)' }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-b"
                    style={{ borderColor: 'rgba(0, 212, 200, 0.08)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leads */}
        {leads.map((lead) => {
          const pos = getLeadPosition(lead);
          if (pos.opacity < 0.01) return null;

          const color = lead.color === 'warm' ? 'rgb(255, 107, 107)' : 'rgb(0, 212, 200)';
          const glowColor = (pos as { glow?: boolean }).glow ? 'rgba(0, 255, 229, 0.8)' : 'transparent';

          return (
            <motion.div
              key={lead.id}
              className="absolute pointer-events-none"
              style={{
                left: pos.x,
                top: pos.y,
                transform: `translate(-50%, -50%) scale(${pos.scale})`,
                opacity: pos.opacity,
              }}
            >
              {/* Person icon */}
              <svg
                width={lead.size * 1.5}
                height={lead.size * 2}
                viewBox="0 0 24 32"
                style={{
                  filter: (pos as { glow?: boolean }).glow ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
                }}
              >
                {/* Head */}
                <circle cx="12" cy="8" r="6" fill={color} />
                {/* Body */}
                <path
                  d="M6 16 L6 14 Q6 12 12 12 Q18 12 18 14 L18 16 Q18 24 15 28 L9 28 Q6 24 6 16 Z"
                  fill={color}
                />
                {/* Arms */}
                <path
                  d="M6 15 L2 21 M18 15 L22 21"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>
          );
        })}

        {/* Stage Text */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center px-6 max-w-4xl">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={false}
                animate={{
                  opacity: currentStage === i ? 1 : 0,
                  y: currentStage === i ? 0 : currentStage > i ? -50 : 50,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <h2
                  className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {i === 3 ? (
                    <span className="text-gradient-accent">{stage.title}</span>
                  ) : (
                    stage.title
                  )}
                </h2>
                <p
                  className="text-lg sm:text-xl md:text-2xl"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {stage.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stage indicators */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3"
          animate={{ opacity: currentStage === 3 ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {stages.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                background: currentStage >= i ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
                transform: currentStage === i ? 'scale(1.4)' : 'scale(1)',
                boxShadow: currentStage === i ? '0 0 10px var(--color-accent)' : 'none',
              }}
            />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 right-8 z-20 text-sm"
          animate={{ opacity: currentStage === 0 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <span>Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1.5 h-3 rounded-full"
                style={{ background: 'var(--color-accent)' }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
