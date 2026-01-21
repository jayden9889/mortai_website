'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Lead {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  funnelLane: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
  converted: boolean;
  color: 'warm' | 'cool';
  groupIndex: number;
}

// Colors
const CORAL = { r: 255, g: 107, b: 107 };
const TEAL = { r: 0, g: 212, b: 200 };
const TEAL_GLOW = { r: 0, g: 255, b: 229 };

function drawPersonIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: { r: number; g: number; b: number },
  opacity: number,
  glowing: boolean = false
) {
  const scale = size / 20;

  if (glowing) {
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.shadowBlur = 20;
  }

  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;

  // Head
  const headRadius = 5 * scale;
  const headY = y - 12 * scale;
  ctx.beginPath();
  ctx.arc(x, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyTop = headY + headRadius + 2 * scale;
  const bodyWidth = 10 * scale;
  const bodyHeight = 14 * scale;

  ctx.beginPath();
  ctx.moveTo(x - bodyWidth / 2, bodyTop);
  ctx.lineTo(x + bodyWidth / 2, bodyTop);
  ctx.quadraticCurveTo(x + bodyWidth / 2, bodyTop + bodyHeight * 0.3, x + bodyWidth * 0.35, bodyTop + bodyHeight);
  ctx.lineTo(x - bodyWidth * 0.35, bodyTop + bodyHeight);
  ctx.quadraticCurveTo(x - bodyWidth / 2, bodyTop + bodyHeight * 0.3, x - bodyWidth / 2, bodyTop);
  ctx.closePath();
  ctx.fill();

  // Arms
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x - bodyWidth / 2, bodyTop + 2 * scale);
  ctx.lineTo(x - bodyWidth / 2 - 4 * scale, bodyTop + 8 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + bodyWidth / 2, bodyTop + 2 * scale);
  ctx.lineTo(x + bodyWidth / 2 + 4 * scale, bodyTop + 8 * scale);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawCalendar(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  opacity: number
) {
  const calWidth = 400;
  const calHeight = 380;
  const left = centerX - calWidth / 2;
  const top = centerY - calHeight / 2;
  const rows = 4;
  const cols = 5;
  const headerHeight = 45;
  const dayHeaderSpace = 25;
  const cellWidth = calWidth / cols;
  const cellHeight = (calHeight - headerHeight - dayHeaderSpace) / rows;

  // Calendar background with glow
  ctx.shadowColor = 'rgba(0, 255, 229, 0.4)';
  ctx.shadowBlur = 20 * opacity;

  // Main background
  const bgGradient = ctx.createLinearGradient(left, top, left, top + calHeight);
  bgGradient.addColorStop(0, `rgba(15, 25, 35, ${0.95 * opacity})`);
  bgGradient.addColorStop(1, `rgba(10, 20, 30, ${0.98 * opacity})`);
  ctx.fillStyle = bgGradient;
  ctx.beginPath();
  ctx.roundRect(left, top, calWidth, calHeight, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = `rgba(0, 212, 200, ${0.5 * opacity})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Header
  ctx.fillStyle = `rgba(0, 212, 200, ${0.15 * opacity})`;
  ctx.beginPath();
  ctx.roundRect(left, top, calWidth, headerHeight, [12, 12, 0, 0]);
  ctx.fill();

  // Header text
  ctx.fillStyle = `rgba(0, 255, 229, ${opacity})`;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Your Calendar', centerX, top + 28);

  // Day headers
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = `rgba(0, 212, 200, ${0.7 * opacity})`;
  days.forEach((day, i) => {
    ctx.fillText(day, left + cellWidth * i + cellWidth / 2, top + headerHeight + 20);
  });

  // Grid lines
  ctx.strokeStyle = `rgba(0, 212, 200, ${0.15 * opacity})`;
  ctx.lineWidth = 1;

  const gridTop = top + headerHeight + dayHeaderSpace;

  // Vertical lines
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(left + i * cellWidth, gridTop);
    ctx.lineTo(left + i * cellWidth, top + calHeight);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(left, gridTop + i * cellHeight);
    ctx.lineTo(left + calWidth, gridTop + i * cellHeight);
    ctx.stroke();
  }

  // Line below day headers
  ctx.beginPath();
  ctx.moveTo(left, gridTop);
  ctx.lineTo(left + calWidth, gridTop);
  ctx.stroke();
}

function drawFunnel(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) {
  const centerX = width / 2;
  const topY = height * 0.22;
  const bottomY = height * 0.58;
  const topWidth = Math.min(260, width * 0.24);
  const bottomWidth = 28;
  const spoutHeight = height * 0.08;
  const spoutBottomY = bottomY + spoutHeight;

  // Clean glass-like gradient for funnel body
  const funnelGradient = ctx.createLinearGradient(centerX, topY, centerX, spoutBottomY);
  funnelGradient.addColorStop(0, `rgba(0, 212, 200, ${0.06 * opacity})`);
  funnelGradient.addColorStop(0.4, `rgba(0, 212, 200, ${0.04 * opacity})`);
  funnelGradient.addColorStop(0.7, `rgba(0, 255, 229, ${0.08 * opacity})`);
  funnelGradient.addColorStop(1, `rgba(0, 255, 229, ${0.12 * opacity})`);

  // Draw cone
  ctx.fillStyle = funnelGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - topWidth, topY);
  ctx.quadraticCurveTo(centerX - topWidth * 0.9, (topY + bottomY) / 2, centerX - bottomWidth, bottomY);
  ctx.lineTo(centerX + bottomWidth, bottomY);
  ctx.quadraticCurveTo(centerX + topWidth * 0.9, (topY + bottomY) / 2, centerX + topWidth, topY);
  ctx.closePath();
  ctx.fill();

  // Draw spout
  ctx.beginPath();
  ctx.rect(centerX - bottomWidth, bottomY, bottomWidth * 2, spoutHeight);
  ctx.fill();

  // Edge strokes with glow
  ctx.strokeStyle = `rgba(0, 255, 229, ${0.4 * opacity})`;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0, 255, 229, 0.5)';
  ctx.shadowBlur = 8 * opacity;

  // Left edge
  ctx.beginPath();
  ctx.moveTo(centerX - topWidth, topY);
  ctx.quadraticCurveTo(centerX - topWidth * 0.9, (topY + bottomY) / 2, centerX - bottomWidth, bottomY);
  ctx.lineTo(centerX - bottomWidth, spoutBottomY);
  ctx.stroke();

  // Right edge
  ctx.beginPath();
  ctx.moveTo(centerX + topWidth, topY);
  ctx.quadraticCurveTo(centerX + topWidth * 0.9, (topY + bottomY) / 2, centerX + bottomWidth, bottomY);
  ctx.lineTo(centerX + bottomWidth, spoutBottomY);
  ctx.stroke();

  // Top ellipse rim for 3D effect
  ctx.strokeStyle = `rgba(0, 255, 229, ${0.5 * opacity})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, topY, topWidth, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom glow
  const bottomGlow = ctx.createRadialGradient(centerX, spoutBottomY, 0, centerX, spoutBottomY, bottomWidth * 2);
  bottomGlow.addColorStop(0, `rgba(0, 255, 229, ${0.3 * opacity})`);
  bottomGlow.addColorStop(0.5, `rgba(0, 212, 200, ${0.1 * opacity})`);
  bottomGlow.addColorStop(1, 'rgba(0, 212, 200, 0)');

  ctx.shadowBlur = 0;
  ctx.fillStyle = bottomGlow;
  ctx.beginPath();
  ctx.arc(centerX, spoutBottomY, bottomWidth * 2, 0, Math.PI * 2);
  ctx.fill();
}

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leadsRef = useRef<Lead[]>([]);
  const progressRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize leads
    const coralCount = 26;
    const tealCount = 22;
    const totalLeads = coralCount + tealCount;
    const leads: Lead[] = [];

    // Shuffle funnel lanes for mixed colors when falling
    const funnelLanes: number[] = [];
    for (let i = 0; i < totalLeads; i++) {
      funnelLanes.push(i);
    }
    for (let i = funnelLanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [funnelLanes[i], funnelLanes[j]] = [funnelLanes[j], funnelLanes[i]];
    }

    // Create coral leads (warm)
    for (let i = 0; i < coralCount; i++) {
      const startX = Math.random() * width * 0.6 + width * 0.05;
      const startY = Math.random() * height * 0.55 + height * 0.12;

      leads.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetOffsetX: (Math.random() - 0.5) * 60,
        targetOffsetY: (Math.random() - 0.5) * 30,
        funnelLane: funnelLanes[i],
        size: 16 + Math.random() * 6,
        opacity: 0.75 + Math.random() * 0.25,
        speed: 0.4 + Math.random() * 0.3,
        angle: Math.random() * Math.PI * 2,
        converted: i < 5,
        color: 'warm',
        groupIndex: i,
      });
    }

    // Create teal leads (cool)
    for (let i = 0; i < tealCount; i++) {
      const startX = Math.random() * width * 0.6 + width * 0.35;
      const startY = Math.random() * height * 0.55 + height * 0.12;

      leads.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetOffsetX: (Math.random() - 0.5) * 60,
        targetOffsetY: (Math.random() - 0.5) * 30,
        funnelLane: funnelLanes[coralCount + i],
        size: 16 + Math.random() * 6,
        opacity: 0.75 + Math.random() * 0.25,
        speed: 0.4 + Math.random() * 0.3,
        angle: Math.random() * Math.PI * 2,
        converted: i < 5,
        color: 'cool',
        groupIndex: i,
      });
    }

    leadsRef.current = leads;

    // Funnel dimensions (smaller, positioned lower)
    const funnelTopY = height * 0.22;
    const funnelBottomY = height * 0.58;
    const topWidth = Math.min(260, width * 0.24);
    const bottomWidth = 28;
    const spoutHeight = height * 0.08;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = progressRef.current;
      const time = Date.now();
      const centerX = width / 2;

      // Draw funnel (visible in stages 1 and 2)
      if (progress > 0.03 && progress < 0.72) {
        const funnelOpacity = progress < 0.10
          ? (progress - 0.03) / 0.07
          : progress > 0.65
            ? 1 - (progress - 0.65) / 0.07
            : 1;
        drawFunnel(ctx, width, height, Math.max(0, funnelOpacity));
      }

      // Draw calendar in Stage 3 - positioned below the "Booked Calls" heading (which is at top)
      if (progress > 0.72) {
        const calendarOpacity = Math.min(1, (progress - 0.72) / 0.12);
        // Calendar centered in the space below the heading
        const calendarCenterY = height * 0.55;
        drawCalendar(ctx, centerX, calendarCenterY, calendarOpacity);
      }

      // Animate leads
      leads.forEach((lead) => {
        let x: number, y: number, opacity: number, size: number;
        let isGlowing = false;

        const isWarm = lead.color === 'warm';

        if (progress < 0.03) {
          // Stage 0: Scattered with gentle float (very brief - animation starts almost immediately)
          const floatX = Math.sin(time * 0.0006 * lead.speed + lead.angle) * 8;
          const floatY = Math.cos(time * 0.0005 * lead.speed + lead.angle) * 6;

          x = lead.startX + floatX;
          y = lead.startY + floatY;
          opacity = lead.opacity;
          size = lead.size;

        } else if (progress < 0.38) {
          // Stage 1: Converge ABOVE the funnel, then pour in from top
          const stageProgress = (progress - 0.03) / 0.35;

          // Two phases: first converge above funnel (0-0.6), then drop into funnel opening (0.6-1.0)
          if (stageProgress < 0.6) {
            // Phase 1: Move to convergence point ABOVE the funnel
            const phase1Progress = stageProgress / 0.6;
            const eased = phase1Progress < 0.5
              ? 2 * phase1Progress * phase1Progress
              : 1 - Math.pow(-2 * phase1Progress + 2, 2) / 2;

            // Target: above the funnel opening, slightly spread out
            const spreadAbove = ((lead.groupIndex % 12) - 6) / 6;
            const targetX = centerX + spreadAbove * topWidth * 0.6;
            const targetY = funnelTopY - 35; // Just above the funnel rim

            x = lead.startX + (targetX - lead.startX) * eased;
            y = lead.startY + (targetY - lead.startY) * eased;
            opacity = lead.opacity;
            size = lead.size * (1 - eased * 0.05);
          } else {
            // Phase 2: Drop into funnel opening from above
            const phase2Progress = (stageProgress - 0.6) / 0.4;
            const eased = Math.pow(phase2Progress, 1.5); // Gravity-like drop

            // Start: convergence point above funnel
            const spreadAbove = ((lead.groupIndex % 12) - 6) / 6;
            const startX = centerX + spreadAbove * topWidth * 0.6;
            const startY = funnelTopY - 35;

            // Target: just inside the funnel opening
            const spreadInFunnel = ((lead.groupIndex % 10) - 5) / 5;
            const targetX = centerX + spreadInFunnel * topWidth * 0.5;
            const targetY = funnelTopY + 30;

            x = startX + (targetX - startX) * eased;
            y = startY + (targetY - startY) * eased;
            opacity = lead.opacity;
            size = lead.size * (0.95 - eased * 0.05);
          }

        } else if (progress < 0.72) {
          // Stage 2: Fall through funnel from top, sort by color
          const stageProgress = (progress - 0.38) / 0.34;

          // Staggered fall based on position
          const row = Math.floor(lead.groupIndex / 6);
          const posInRow = lead.groupIndex % 6;
          const rowDelay = row * 0.06;
          const inRowDelay = posInRow * 0.008;
          const totalDelay = rowDelay + inRowDelay;

          const delayedProgress = Math.max(0, (stageProgress - totalDelay) / (1 - totalDelay));
          // Gravity-like easing for realistic fall
          const eased = delayedProgress < 1 ? Math.pow(delayedProgress, 1.8) : 1;

          // Start position: just inside funnel opening (where Stage 1 ended)
          const spreadInFunnel = ((lead.groupIndex % 10) - 5) / 5;
          const startFunnelX = centerX + spreadInFunnel * topWidth * 0.5;
          const startFunnelY = funnelTopY + 30;

          // Calculate fall depth through the funnel
          const funnelDepth = Math.min(1, eased);
          const currentWidth = topWidth - (topWidth - bottomWidth) * funnelDepth;

          // Sort by color as they fall - warm to left, cool to right
          const colorOffset = isWarm ? -0.35 : 0.35;
          const laneOffset = ((lead.funnelLane % 8) / 8 - 0.5) * 0.4 + colorOffset;

          const targetX = centerX + laneOffset * currentWidth;
          const targetY = funnelTopY + 30 + (funnelBottomY + spoutHeight - funnelTopY - 30) * funnelDepth;

          if (delayedProgress <= 0) {
            x = startFunnelX;
            y = startFunnelY;
          } else {
            x = startFunnelX + (targetX - startFunnelX) * eased;
            y = startFunnelY + (targetY - startFunnelY) * eased;
          }

          // Non-converted fade out at bottom of funnel
          if (!lead.converted && funnelDepth > 0.65) {
            opacity = lead.opacity * (1 - (funnelDepth - 0.65) / 0.35);
          } else {
            opacity = lead.opacity;
          }
          size = lead.size * (1 - funnelDepth * 0.12);

        } else {
          // Stage 3: Converted fly to calendar
          const stageProgress = (progress - 0.72) / 0.28;
          const eased = 1 - Math.pow(1 - stageProgress, 2.5);

          // Calendar dimensions (match drawCalendar)
          const calWidth = 400;
          const calHeight = 380;
          const calendarCenterY = height * 0.55; // Centered below heading at top
          const calLeft = centerX - calWidth / 2;
          const calTop = calendarCenterY - calHeight / 2;
          const cols = 5;
          const rows = 4;
          const headerHeight = 45;
          const dayHeaderSpace = 25;
          const cellWidth = calWidth / cols;
          const cellHeight = (calHeight - headerHeight - dayHeaderSpace) / rows;

          // Calendar slots for 10 converted leads
          const slotAssignments = [
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

          if (lead.converted) {
            const convertedIndex = lead.color === 'warm' ? lead.groupIndex : lead.groupIndex + 5;
            const slot = slotAssignments[convertedIndex % slotAssignments.length];

            // Start from spout exit
            const startX = centerX;
            const startY = funnelBottomY + spoutHeight;

            // Target: calendar cell
            const targetX = calLeft + slot.col * cellWidth + cellWidth / 2;
            const targetY = calTop + headerHeight + dayHeaderSpace + slot.row * cellHeight + cellHeight / 2;

            // Stagger arrival
            const staggerDelay = convertedIndex * 0.05;
            const leadProgress = Math.max(0, Math.min(1, (eased - staggerDelay) / (1 - staggerDelay)));
            const smoothEased = leadProgress < 1 ? 1 - Math.pow(1 - leadProgress, 2) : 1;

            x = startX + (targetX - startX) * smoothEased;
            y = startY + (targetY - startY) * smoothEased;
            opacity = 1;
            size = lead.size * (0.85 + smoothEased * 0.25);
            isGlowing = smoothEased > 0.5;
          } else {
            // Non-converted invisible
            x = 0;
            y = 0;
            opacity = 0;
            size = 0;
          }
        }

        if (opacity > 0.02) {
          let color;
          if (isGlowing || (lead.converted && progress > 0.73)) {
            color = TEAL_GLOW;
          } else if (lead.color === 'warm') {
            // Warm leads transition color slightly as they fall
            if (progress > 0.50 && progress < 0.75) {
              const transition = (progress - 0.50) / 0.25;
              color = {
                r: CORAL.r + (TEAL.r - CORAL.r) * transition * 0.3,
                g: CORAL.g + (TEAL.g - CORAL.g) * transition * 0.3,
                b: CORAL.b + (TEAL.b - CORAL.b) * transition * 0.3,
              };
            } else {
              color = CORAL;
            }
          } else {
            color = TEAL;
          }

          drawPersonIcon(ctx, x, y, size, color, opacity, isGlowing);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // GSAP ScrollTrigger for smooth scrolling
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 2,
      onUpdate: (self) => {
        progressRef.current = self.progress;

        if (self.progress < 0.03) setCurrentStage(0);
        else if (self.progress < 0.38) setCurrentStage(1);
        else if (self.progress < 0.72) setCurrentStage(2);
        else setCurrentStage(3);
      },
    });

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      trigger.kill();
    };
  }, []);

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

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'transparent' }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6 max-w-4xl">
          {stages.map((stage, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center transition-all duration-500 ${
                i === 3 ? 'justify-start pt-16' : 'justify-center'
              }`}
              style={{
                opacity: currentStage === i ? 1 : 0,
                transform: `translateY(${currentStage === i ? 0 : currentStage > i ? -40 : 40}px)`,
              }}
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
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 transition-opacity duration-500"
        style={{ opacity: currentStage === 3 ? 0 : 1 }}
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
      </div>

      <div
        className="absolute bottom-8 right-8 z-20 text-sm transition-opacity duration-500"
        style={{
          color: 'var(--color-text-secondary)',
          opacity: currentStage === 0 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div
              className="w-1.5 h-3 rounded-full animate-bounce"
              style={{ background: 'var(--color-accent)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
