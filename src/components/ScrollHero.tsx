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
  funnelLane: number; // Pre-assigned lane for funnel flow (mixed, not by color)
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

  const headRadius = 5 * scale;
  const headY = y - 12 * scale;
  ctx.beginPath();
  ctx.arc(x, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();

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

// Calendar slot positions for converted leads
interface CalendarSlot {
  x: number;
  y: number;
  row: number;
  col: number;
}

function drawCalendar(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  opacity: number,
  slots: CalendarSlot[]
): CalendarSlot[] {
  const calWidth = 400;
  const calHeight = 300;
  const left = centerX - calWidth / 2;
  const top = centerY - calHeight / 2;
  const rows = 4;
  const cols = 5;
  const headerHeight = 45;
  const cellWidth = calWidth / cols;
  const cellHeight = (calHeight - headerHeight) / rows;

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

  // Vertical lines
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(left + i * cellWidth, top + headerHeight);
    ctx.lineTo(left + i * cellWidth, top + calHeight);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(left, top + headerHeight + i * cellHeight);
    ctx.lineTo(left + calWidth, top + headerHeight + i * cellHeight);
    ctx.stroke();
  }

  // Calculate slot positions
  const slotPositions: CalendarSlot[] = [];
  const usedSlots = [
    { row: 0, col: 1 }, // Tue morning
    { row: 1, col: 3 }, // Thu mid-morning
    { row: 2, col: 0 }, // Mon afternoon
    { row: 0, col: 4 }, // Fri morning
    { row: 3, col: 2 }, // Wed late
    { row: 1, col: 0 }, // Mon mid-morning
  ];

  usedSlots.forEach((slot) => {
    slotPositions.push({
      x: left + slot.col * cellWidth + cellWidth / 2,
      y: top + headerHeight + slot.row * cellHeight + cellHeight / 2 + 10,
      row: slot.row,
      col: slot.col,
    });
  });

  return slotPositions;
}

function drawFunnel(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) {
  const centerX = width / 2;
  const topY = height * 0.18;
  const bottomY = height * 0.82;
  const topWidth = Math.min(380, width * 0.35);
  const bottomWidth = 45;

  const glowGradient = ctx.createLinearGradient(centerX - topWidth, topY, centerX + topWidth, topY);
  glowGradient.addColorStop(0, `rgba(0, 212, 200, ${0.05 * opacity})`);
  glowGradient.addColorStop(0.5, `rgba(0, 255, 229, ${0.1 * opacity})`);
  glowGradient.addColorStop(1, `rgba(0, 212, 200, ${0.05 * opacity})`);

  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - topWidth - 20, topY);
  ctx.quadraticCurveTo(centerX - topWidth - 25, height * 0.5, centerX - bottomWidth - 15, bottomY);
  ctx.lineTo(centerX + bottomWidth + 15, bottomY);
  ctx.quadraticCurveTo(centerX + topWidth + 25, height * 0.5, centerX + topWidth + 20, topY);
  ctx.closePath();
  ctx.fill();

  const funnelGradient = ctx.createLinearGradient(centerX, topY, centerX, bottomY);
  funnelGradient.addColorStop(0, `rgba(0, 212, 200, ${0.03 * opacity})`);
  funnelGradient.addColorStop(0.3, `rgba(0, 212, 200, ${0.08 * opacity})`);
  funnelGradient.addColorStop(0.7, `rgba(0, 255, 229, ${0.12 * opacity})`);
  funnelGradient.addColorStop(1, `rgba(0, 255, 229, ${0.2 * opacity})`);

  ctx.fillStyle = funnelGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - topWidth, topY);
  ctx.quadraticCurveTo(centerX - topWidth, height * 0.5, centerX - bottomWidth, bottomY);
  ctx.lineTo(centerX + bottomWidth, bottomY);
  ctx.quadraticCurveTo(centerX + topWidth, height * 0.5, centerX + topWidth, topY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(0, 212, 200, ${0.4 * opacity})`;
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0, 255, 229, 0.5)';
  ctx.shadowBlur = 10 * opacity;

  ctx.beginPath();
  ctx.moveTo(centerX - topWidth, topY);
  ctx.quadraticCurveTo(centerX - topWidth, height * 0.5, centerX - bottomWidth, bottomY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + topWidth, topY);
  ctx.quadraticCurveTo(centerX + topWidth, height * 0.5, centerX + bottomWidth, bottomY);
  ctx.stroke();

  ctx.strokeStyle = `rgba(0, 255, 229, ${0.3 * opacity})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - topWidth, topY);
  ctx.quadraticCurveTo(centerX, topY - 15, centerX + topWidth, topY);
  ctx.stroke();

  const bottomGlow = ctx.createRadialGradient(centerX, bottomY, 0, centerX, bottomY, bottomWidth * 2);
  bottomGlow.addColorStop(0, `rgba(0, 255, 229, ${0.3 * opacity})`);
  bottomGlow.addColorStop(0.5, `rgba(0, 212, 200, ${0.1 * opacity})`);
  bottomGlow.addColorStop(1, 'rgba(0, 212, 200, 0)');

  ctx.fillStyle = bottomGlow;
  ctx.beginPath();
  ctx.arc(centerX, bottomY, bottomWidth * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  const particleCount = 8;
  const time = Date.now() * 0.001;
  for (let i = 0; i < particleCount; i++) {
    const t = ((time * 0.3 + i / particleCount) % 1);
    const leftX = centerX - topWidth + (topWidth - bottomWidth) * t;
    const rightX = centerX + topWidth - (topWidth - bottomWidth) * t;
    const py = topY + (bottomY - topY) * t;
    const particleOpacity = Math.sin(t * Math.PI) * 0.5 * opacity;

    ctx.fillStyle = `rgba(0, 255, 229, ${particleOpacity})`;
    ctx.beginPath();
    ctx.arc(leftX, py, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightX, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
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

    // Initialize leads - GROUPED BY COLOR initially
    const coralCount = 28;
    const tealCount = 22;
    const totalLeads = coralCount + tealCount;
    const leads: Lead[] = [];

    // Pre-shuffle funnel lanes so colors mix when falling
    const funnelLanes: number[] = [];
    for (let i = 0; i < totalLeads; i++) {
      funnelLanes.push(i);
    }
    // Shuffle lanes
    for (let i = funnelLanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [funnelLanes[i], funnelLanes[j]] = [funnelLanes[j], funnelLanes[i]];
    }

    // Create coral leads (warm) - positioned more on the left
    for (let i = 0; i < coralCount; i++) {
      const startX = Math.random() * width * 0.55 + width * 0.05;
      const startY = Math.random() * height * 0.6 + height * 0.1;

      leads.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetOffsetX: (Math.random() - 0.5) * 80,
        targetOffsetY: (Math.random() - 0.5) * 40,
        funnelLane: funnelLanes[i], // Shuffled lane assignment
        size: 18 + Math.random() * 8,
        opacity: 0.7 + Math.random() * 0.3,
        speed: 0.4 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        converted: i < 5, // 5 warm leads convert
        color: 'warm',
        groupIndex: i,
      });
    }

    // Create teal leads (cool) - positioned more on the right
    for (let i = 0; i < tealCount; i++) {
      const startX = Math.random() * width * 0.55 + width * 0.4;
      const startY = Math.random() * height * 0.6 + height * 0.1;

      leads.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetOffsetX: (Math.random() - 0.5) * 80,
        targetOffsetY: (Math.random() - 0.5) * 40,
        funnelLane: funnelLanes[coralCount + i], // Shuffled lane assignment
        size: 18 + Math.random() * 8,
        opacity: 0.7 + Math.random() * 0.3,
        speed: 0.4 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        converted: i < 5, // 5 cool leads convert
        color: 'cool',
        groupIndex: i,
      });
    }

    leadsRef.current = leads;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = progressRef.current;
      const time = Date.now();

      const centerX = width / 2;
      const funnelTopY = height * 0.18;
      const funnelBottomY = height * 0.82;

      // Draw funnel (fades out completely before calendar appears)
      if (progress > 0.1 && progress < 0.72) {
        const funnelOpacity = progress < 0.2
          ? (progress - 0.1) / 0.1
          : progress > 0.65
            ? 1 - (progress - 0.65) / 0.07 // Fade out before Stage 3
            : 1;
        drawFunnel(ctx, width, height, Math.max(0, funnelOpacity));
      }

      // Draw calendar in Stage 3
      if (progress > 0.72) {
        const calendarOpacity = Math.min(1, (progress - 0.72) / 0.15);
        const calendarCenterY = funnelBottomY + 120;
        drawCalendar(ctx, centerX, calendarCenterY, calendarOpacity, []);
      }
      const topWidth = Math.min(380, width * 0.35);
      const bottomWidth = 45;

      leads.forEach((lead) => {
        let x: number, y: number, opacity: number, size: number;
        let isGlowing = false;

        const isWarm = lead.color === 'warm';
        const sideMultiplier = isWarm ? -1 : 1;

        if (progress < 0.12) {
          // Stage 0: Scattered, gentle drift
          const driftFactor = progress / 0.12;

          const floatX = Math.sin(time * 0.0008 * lead.speed + lead.angle) * (12 - driftFactor * 6);
          const floatY = Math.cos(time * 0.0006 * lead.speed + lead.angle) * (10 - driftFactor * 5);

          const targetX = centerX + lead.targetOffsetX;
          const targetY = funnelTopY - 20 + lead.targetOffsetY;

          x = lead.startX + floatX + (targetX - lead.startX) * driftFactor * 0.2;
          y = lead.startY + floatY + (targetY - lead.startY) * driftFactor * 0.1;
          opacity = lead.opacity;
          size = lead.size;

        } else if (progress < 0.42) {
          // Stage 1: Converge into color groups (coral left, teal right)
          // Extended duration for smoother, longer animation
          const convergeProgress = (progress - 0.12) / 0.30;
          // Ease-in-out for smooth start AND end (not snappy)
          const eased = convergeProgress < 0.5
            ? 2 * Math.pow(convergeProgress, 2)
            : 1 - Math.pow(-2 * convergeProgress + 2, 2) / 2;

          const groupSpread = topWidth * 0.35;
          const baseX = centerX + sideMultiplier * groupSpread;
          const withinGroupOffset = ((lead.groupIndex % 6) - 2.5) * 22;
          const rowOffset = Math.floor(lead.groupIndex / 6) * 28;

          const targetX = baseX + withinGroupOffset;
          const targetY = funnelTopY + 30 + rowOffset;

          const prevX = lead.startX + (centerX - lead.startX) * 0.2;
          const prevY = lead.startY + (funnelTopY - 20 - lead.startY) * 0.1;

          x = prevX + (targetX - prevX) * eased;
          y = prevY + (targetY - prevY) * eased;
          opacity = lead.opacity;
          size = lead.size;

        } else if (progress < 0.72) {
          // Stage 2: STAGGERED FALL - bottom rows fall first, then upper rows follow
          const fallProgress = (progress - 0.42) / 0.30;

          // Calculate this lead's row in the grouped formation (0 = top row, higher = lower)
          const row = Math.floor(lead.groupIndex / 6);
          const posInRow = lead.groupIndex % 6;
          const maxRows = 5;

          // Bottom rows (higher row number) start falling FIRST
          // More dramatic delay between rows for visible staggering
          const rowDelay = (maxRows - row) * 0.15; // 15% delay per row
          // Add tiny variation within row so they don't fall identically
          const inRowVariation = posInRow * 0.015;
          const totalDelay = rowDelay + inRowVariation;

          // Calculate this lead's individual fall progress
          const leadFallProgress = Math.max(0, (fallProgress - totalDelay) / Math.max(0.4, 1 - totalDelay));

          // Gravity-like easing: slow start, then accelerate
          const eased = leadFallProgress < 1
            ? Math.pow(leadFallProgress, 1.8) // Accelerating fall like gravity
            : 1;

          // Starting position (grouped by color)
          const groupSpread = topWidth * 0.35;
          const baseX = centerX + sideMultiplier * groupSpread;
          const withinGroupOffset = ((posInRow) - 2.5) * 22;
          const groupRowOffset = row * 28;
          const groupedX = baseX + withinGroupOffset;
          const groupedY = funnelTopY + 30 + groupRowOffset;

          // Target position in funnel (mixed lanes based on pre-shuffled funnelLane)
          const laneCount = 10;
          const lane = lead.funnelLane % laneCount;
          const funnelDepth = Math.min(1, eased * 1.1); // How far down the funnel
          const currentWidth = topWidth - (topWidth - bottomWidth) * funnelDepth;
          const laneOffset = ((lane - laneCount / 2) / (laneCount / 2)) * currentWidth * 0.7;
          const targetX = centerX + laneOffset;
          const targetY = funnelTopY + 50 + (funnelBottomY - funnelTopY - 60) * funnelDepth;

          // If this lead hasn't started falling yet, stay in grouped position
          if (leadFallProgress <= 0) {
            x = groupedX;
            y = groupedY;
          } else {
            // Interpolate from grouped position to funnel position
            x = groupedX + (targetX - groupedX) * eased;
            y = groupedY + (targetY - groupedY) * eased;
          }

          // Non-converted fade as they reach bottom
          if (!lead.converted && funnelDepth > 0.6) {
            opacity = lead.opacity * (1 - (funnelDepth - 0.6) * 2);
          } else {
            opacity = lead.opacity;
          }
          size = lead.size * (1 - funnelDepth * 0.1);

        } else {
          // Stage 3: Converted leads fly to calendar slots
          const exitProgress = (progress - 0.72) / 0.28;
          const eased = 1 - Math.pow(1 - exitProgress, 3); // Smooth ease-out

          // Calculate calendar slot positions (match drawCalendar dimensions)
          const calendarCenterY = funnelBottomY + 120;
          const calWidth = 400;
          const calHeight = 300;
          const calLeft = centerX - calWidth / 2;
          const calTop = calendarCenterY - calHeight / 2;
          const cols = 5;
          const rows = 4;
          const headerHeight = 45;
          const cellWidth = calWidth / cols;
          const cellHeight = (calHeight - headerHeight) / rows;

          // Predefined slots for 10 converted leads (spread across calendar)
          const slotAssignments = [
            { row: 0, col: 1 }, // Tue row 1
            { row: 1, col: 3 }, // Thu row 2
            { row: 2, col: 0 }, // Mon row 3
            { row: 0, col: 4 }, // Fri row 1
            { row: 2, col: 2 }, // Wed row 3
            { row: 1, col: 0 }, // Mon row 2
            { row: 3, col: 3 }, // Thu row 4
            { row: 1, col: 2 }, // Wed row 2
            { row: 3, col: 1 }, // Tue row 4
            { row: 2, col: 4 }, // Fri row 3
          ];

          if (lead.converted) {
            const convertedIndex = lead.color === 'warm' ? lead.groupIndex : lead.groupIndex + 5;
            const slot = slotAssignments[convertedIndex % slotAssignments.length];

            // Start position (funnel exit)
            const startX = centerX;
            const startY = funnelBottomY + 10;

            // Target position (calendar slot) - center in cell, below day headers
            const targetX = calLeft + slot.col * cellWidth + cellWidth / 2;
            const targetY = calTop + headerHeight + 30 + slot.row * cellHeight + cellHeight / 2;

            // Stagger the arrival - each lead has slight delay (reduced for 10 leads)
            const staggerDelay = convertedIndex * 0.06;
            const leadEased = Math.max(0, Math.min(1, (eased - staggerDelay) / (1 - staggerDelay)));
            const smoothEased = leadEased < 1 ? 1 - Math.pow(1 - leadEased, 2.5) : 1;

            x = startX + (targetX - startX) * smoothEased;
            y = startY + (targetY - startY) * smoothEased;
            opacity = 1;
            size = lead.size * (0.9 + smoothEased * 0.3); // Grow slightly as they settle
            isGlowing = smoothEased > 0.5;
          } else {
            // Non-converted leads fade out quickly and disappear
            x = centerX;
            y = funnelBottomY - 10;
            opacity = Math.max(0, lead.opacity * 0.1 * (1 - eased * 3)); // Faster fade
            size = lead.size * (1 - eased * 0.5);
          }
        }

        if (opacity > 0.02) {
          let color;
          if (isGlowing || (lead.converted && progress > 0.7)) {
            color = TEAL_GLOW;
          } else if (lead.color === 'warm') {
            if (progress > 0.45 && progress < 0.72) {
              const transition = (progress - 0.45) / 0.27;
              color = {
                r: CORAL.r + (TEAL.r - CORAL.r) * transition * 0.35,
                g: CORAL.g + (TEAL.g - CORAL.g) * transition * 0.35,
                b: CORAL.b + (TEAL.b - CORAL.b) * transition * 0.35,
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

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=300%', // Longer scroll distance for smoother feel
      pin: true,
      scrub: 2.5, // Higher = more smoothing/resistance feel
      snap: {
        // Snap to transition boundaries with resistance
        snapTo: (progress) => {
          // Define snap points at stage transitions (equal duration for stages 1 & 2)
          const snapPoints = [0, 0.12, 0.42, 0.72, 1];

          // Find the closest snap point
          let closest = snapPoints[0];
          let minDist = Math.abs(progress - closest);

          for (const point of snapPoints) {
            const dist = Math.abs(progress - point);
            if (dist < minDist) {
              minDist = dist;
              closest = point;
            }
          }

          // Stronger snap at Stage 1 (AI-Powered Discovery)
          const snapThreshold = closest === 0.12 ? 0.08 : 0.05;

          // Only snap if we're close to a transition point
          // This creates "sticky" zones at each transition
          if (minDist < snapThreshold) {
            return closest;
          }

          // Otherwise, let it move freely
          return progress;
        },
        duration: { min: 0.4, max: 0.8 },
        delay: 0.05,
        ease: 'power2.inOut',
      },
      onUpdate: (self) => {
        // Apply resistance near transition points by remapping progress
        // This creates "sticky" zones where scrolling feels harder
        const raw = self.progress;
        let adjusted = raw;

        // Transition points: 0.12, 0.42, 0.72 (equal duration for stages 1 & 2)
        // Create resistance zones around each transition
        const transitions = [
          { point: 0.12, width: 0.06, strength: 0.2 },
          { point: 0.42, width: 0.04, strength: 0.35 },
          { point: 0.72, width: 0.04, strength: 0.35 },
        ];

        for (const t of transitions) {
          const distFromTransition = Math.abs(raw - t.point);
          if (distFromTransition < t.width) {
            // We're in a resistance zone - slow down progress
            const resistanceFactor = 1 - (1 - t.strength) * (1 - distFromTransition / t.width);
            if (raw < t.point) {
              adjusted = t.point - (t.point - raw) / resistanceFactor;
            } else {
              adjusted = t.point + (raw - t.point) / resistanceFactor;
            }
          }
        }

        progressRef.current = adjusted;

        if (adjusted < 0.12) setCurrentStage(0);
        else if (adjusted < 0.42) setCurrentStage(1);
        else if (adjusted < 0.72) setCurrentStage(2);
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
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
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
