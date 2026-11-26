import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import {
  UNIVERSE_CATEGORY_MAP,
  type UniverseEdge,
  type UniverseNode,
} from '../../lib/knowledgeGraph';
import type { GraphPreferences } from '../../types';

export interface UniverseCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnMe: () => void;
  fitToScreen: () => void;
  resetLayout: () => void;
}

interface SimNode extends SimulationNodeDatum, UniverseNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  appear: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  id: string;
  relationType: UniverseEdge['relationType'];
  label: string;
  isCustom?: boolean;
  directional?: boolean;
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

interface UniverseCanvasProps {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  theme: 'dark' | 'light';
  preferences: GraphPreferences;
  selectedNodeId: string | null;
  searchQuery: string;
  onSelectNode: (nodeId: string | null) => void;
  onOpenRecord: (node: UniverseNode) => void;
  onHoverNode?: (node: UniverseNode | null) => void;
}

export const UniverseCanvas = forwardRef<UniverseCanvasHandle, UniverseCanvasProps>(
  function UniverseCanvas(
    {
      nodes,
      edges,
      theme,
      preferences,
      selectedNodeId,
      searchQuery,
      onSelectNode,
      onOpenRecord,
      onHoverNode,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const simNodesRef = useRef<SimNode[]>([]);
    const simLinksRef = useRef<SimLink[]>([]);
    const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
    const transformRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
    const hoveredNodeIdRef = useRef<string | null>(null);
    const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
    const searchQueryRef = useRef<string>(searchQuery);
    const prefsRef = useRef<GraphPreferences>(preferences);
    const themeRef = useRef<'dark' | 'light'>(theme);
    const sizeRef = useRef<{ width: number; height: number }>({ width: 960, height: 640 });
    const rafIdRef = useRef<number | null>(null);
    const dragStateRef = useRef<{
      mode: 'none' | 'node' | 'pan' | 'pinch';
      nodeId?: string;
      startX: number;
      startY: number;
      startTx: number;
      startTy: number;
      moved: boolean;
      pinchStartDist?: number;
      pinchStartScale?: number;
      pinchMidX?: number;
      pinchMidY?: number;
    }>({
      mode: 'none',
      startX: 0,
      startY: 0,
      startTx: 0,
      startTy: 0,
      moved: false,
    });
    const lastTapRef = useRef<{ time: number; nodeId: string | null }>({
      time: 0,
      nodeId: null,
    });

    selectedNodeIdRef.current = selectedNodeId;
    searchQueryRef.current = searchQuery;
    prefsRef.current = preferences;
    themeRef.current = theme;

    const screenToWorld = (sx: number, sy: number) => {
      const t = transformRef.current;
      return {
        x: (sx - t.x) / t.k,
        y: (sy - t.y) / t.k,
      };
    };

    const getNodeRadius = (node: SimNode, prefs: GraphPreferences) =>
      Math.max(4, node.baseRadius * (prefs.nodeSizeScale || 1));

    const findNodeAt = (sx: number, sy: number): SimNode | null => {
      const { x: wx, y: wy } = screenToWorld(sx, sy);
      const prefs = prefsRef.current;
      const list = simNodesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const n = list[i];
        const hitRadius = getNodeRadius(n, prefs) + 7 / Math.max(0.5, transformRef.current.k);
        const dx = wx - n.x;
        const dy = wy - n.y;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return n;
        }
      }
      return null;
    };

    const scheduleRender = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(drawFrame);
    };

    const drawFrame = () => {
      rafIdRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      const isDark = themeRef.current === 'dark';
      const prefs = prefsRef.current;
      const animate = prefs.animationsEnabled && !prefs.reducedMotion;
      const activeFocusId = selectedNodeIdRef.current || hoveredNodeIdRef.current;
      const q = searchQueryRef.current.trim().toLowerCase();

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear background
      ctx.fillStyle = isDark ? '#09090B' : '#F8F9FB';
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural dot grid
      const rawT = transformRef.current;
      const safeK = Number.isFinite(rawT.k) && rawT.k > 0.05 ? rawT.k : 1;
      const safeX = Number.isFinite(rawT.x) ? rawT.x : width / 2;
      const safeY = Number.isFinite(rawT.y) ? rawT.y : height / 2;
      const t = { x: safeX, y: safeY, k: safeK };
      const gridStep = Math.max(24, Math.min(180, 34 * t.k));
      const offsetX = ((t.x % gridStep) + gridStep) % gridStep;
      const offsetY = ((t.y % gridStep) + gridStep) % gridStep;
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(9, 9, 11, 0.05)';
      for (let gx = offsetX; gx < width; gx += gridStep) {
        for (let gy = offsetY; gy < height; gy += gridStep) {
          ctx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
        }
      }

      ctx.translate(t.x, t.y);
      ctx.scale(t.k, t.k);

      const simNodes = simNodesRef.current;
      const simLinks = simLinksRef.current;

      // Determine connected neighbor set for focus highlighting
      const neighborIds = new Set<string>();
      const connectedLinkIds = new Set<string>();
      if (activeFocusId) {
        neighborIds.add(activeFocusId);
        for (const l of simLinks) {
          const sId = typeof l.source === 'object' && l.source !== null ? l.source.id : String(l.source);
          const tId = typeof l.target === 'object' && l.target !== null ? l.target.id : String(l.target);
          if (sId === activeFocusId || tId === activeFocusId) {
            neighborIds.add(sId);
            neighborIds.add(tId);
            connectedLinkIds.add(l.id);
          }
        }
      }

      let needsMoreFrames = false;

      // 1. Draw edges
      for (const link of simLinks) {
        if (typeof link.source !== 'object' || link.source === null || typeof link.target !== 'object' || link.target === null) {
          continue;
        }
        const src = link.source;
        const tgt = link.target;

        const progress = animate ? Math.min(src.appear, tgt.appear) : 1;
        if (progress < 0.02) continue;

        const isHighlighted = !activeFocusId || connectedLinkIds.has(link.id);
        const edgeAlpha = activeFocusId
          ? isHighlighted
            ? 0.85
            : 0.08
          : link.isCustom
          ? 0.55
          : 0.34;

        ctx.save();
        ctx.globalAlpha = edgeAlpha * progress;

        if (link.relationType === 'references' || link.relationType === 'related_to') {
          ctx.setLineDash([4, 4]);
        } else if (link.relationType === 'supports_goal' || link.relationType === 'uses_skill') {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }

        const strokeColor = isHighlighted && activeFocusId
          ? isDark
            ? '#A5B4FC'
            : '#4F46E5'
          : link.relationType === 'depends_on'
          ? '#B80C09'
          : link.relationType === 'supports_goal'
          ? '#F59E0B'
          : isDark
          ? 'rgba(183, 181, 179, 0.5)'
          : 'rgba(82, 82, 91, 0.45)';

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = (isHighlighted && activeFocusId ? 1.7 : 1.05) / Math.sqrt(Math.max(0.5, t.k));

        const endX = src.x + (tgt.x - src.x) * progress;
        const endY = src.y + (tgt.y - src.y) * progress;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Directional arrow for dependency or highlighted directed links
        if ((link.directional || link.relationType === 'depends_on') && progress > 0.85) {
          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 12) {
            const tgtR = getNodeRadius(tgt, prefs) + 3;
            const ux = dx / dist;
            const uy = dy / dist;
            const tipX = tgt.x - ux * tgtR;
            const tipY = tgt.y - uy * tgtR;
            const arrowSize = 6 / Math.sqrt(Math.max(0.6, t.k));
            const angle = Math.atan2(dy, dx);
            ctx.setLineDash([]);
            ctx.fillStyle = strokeColor;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(
              tipX - arrowSize * Math.cos(angle - Math.PI / 6),
              tipY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              tipX - arrowSize * Math.cos(angle + Math.PI / 6),
              tipY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        }

        // Edge relationship label when active node is focused & edge connected
        if (activeFocusId && isHighlighted && t.k >= 0.72) {
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          ctx.setLineDash([]);
          ctx.font = `500 ${Math.max(8.5, 9.5 / Math.sqrt(t.k))}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const padX = 4;
          const textW = ctx.measureText(link.label).width;
          ctx.fillStyle = isDark ? 'rgba(17, 17, 22, 0.86)' : 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(midX - textW / 2 - padX, midY - 7, textW + padX * 2, 14);
          ctx.fillStyle = isDark ? '#D4D4D8' : '#3F3F46';
          ctx.fillText(link.label, midX, midY);
        }

        ctx.restore();
      }

      // 2. Draw nodes
      for (const node of simNodes) {
        if (animate && node.appear < 1) {
          node.appear = Math.min(1, node.appear + 0.08);
          needsMoreFrames = true;
        } else {
          node.appear = 1;
        }

        const catMeta = UNIVERSE_CATEGORY_MAP[node.category] || UNIVERSE_CATEGORY_MAP.personal;
        const baseColor = isDark ? catMeta.color : catMeta.lightColor;
        const r = getNodeRadius(node, prefs) * (0.4 + 0.6 * node.appear);
        const isSelected = selectedNodeIdRef.current === node.id;
        const isHovered = hoveredNodeIdRef.current === node.id;
        const isMatch =
          q.length > 0 &&
          `${node.title} ${node.category} ${node.tags?.join(' ') || ''}`
            .toLowerCase()
            .includes(q);
        const isDimmed =
          Boolean(activeFocusId && !neighborIds.has(node.id)) ||
          Boolean(q.length > 0 && !isMatch && node.id !== 'me' && !isSelected);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.16 : 1;

        // Halo ring on Me, Selected, Hovered, or Search match
        if (isSelected || isHovered || isMatch || node.id === 'me') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + (isSelected ? 5 : 3.5), 0, Math.PI * 2);
          ctx.fillStyle =
            node.id === 'me'
              ? isDark
                ? 'rgba(99, 102, 241, 0.22)'
                : 'rgba(79, 70, 229, 0.16)'
              : isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(9, 9, 11, 0.08)';
          ctx.fill();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle =
          node.id === 'me'
            ? isDark
              ? '#6366F1'
              : '#4F46E5'
            : node.tier === 'category'
            ? isDark
              ? '#17171E'
              : '#FFFFFF'
            : baseColor;
        ctx.fill();

        // Crisp node outline
        ctx.lineWidth = node.tier === 'category' || isSelected ? 2 : 1.25;
        ctx.strokeStyle = isSelected
          ? isDark
            ? '#FFFFFF'
            : '#09090B'
          : node.tier === 'category'
          ? baseColor
          : node.isCompleted
          ? '#10B981'
          : node.isOverdue
          ? '#F43F5E'
          : isDark
          ? 'rgba(255, 255, 255, 0.28)'
          : 'rgba(9, 9, 11, 0.18)';
        ctx.stroke();

        // Status indicator dot on corner for completed / overdue
        if (node.id !== 'me' && node.tier !== 'category' && (node.isCompleted || node.isOverdue)) {
          ctx.beginPath();
          ctx.arc(node.x + r * 0.72, node.y - r * 0.72, 2.7, 0, Math.PI * 2);
          ctx.fillStyle = node.isOverdue ? '#F43F5E' : '#10B981';
          ctx.fill();
        }

        // Core label inside "Me"
        if (node.id === 'me') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ME', node.x, node.y + 0.5);
        }

        // Label visibility rules
        const showLabel =
          node.id === 'me' ||
          isSelected ||
          isHovered ||
          isMatch ||
          (activeFocusId && neighborIds.has(node.id)) ||
          (prefs.labelVisibility === 'always') ||
          (prefs.labelVisibility === 'auto' &&
            (node.tier === 'category' ||
              node.tier === 'primary' ||
              t.k >= 1.12));

        if (showLabel && !isDimmed) {
          const labelText =
            node.title.length > 28 && !isSelected && !isHovered
              ? `${node.title.slice(0, 27)}…`
              : node.title;
          const fontSize =
            node.id === 'me' || node.tier === 'category'
              ? 12 / Math.min(1.4, Math.max(0.85, t.k * 0.9))
              : 10.5 / Math.min(1.35, Math.max(0.85, t.k * 0.95));
          ctx.font = `${node.tier === 'core' || node.tier === 'category' || isSelected ? 700 : 500} ${fontSize}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const labelY = node.y + r + 5;
          const metrics = ctx.measureText(labelText);
          const bgPadX = 5;
          const bgPadY = 2;
          ctx.fillStyle = isDark ? 'rgba(9, 9, 11, 0.76)' : 'rgba(248, 249, 251, 0.85)';
          ctx.fillRect(
            node.x - metrics.width / 2 - bgPadX,
            labelY - bgPadY,
            metrics.width + bgPadX * 2,
            fontSize + bgPadY * 2
          );
          ctx.fillStyle = isSelected || isHovered
            ? isDark
              ? '#FFFFFF'
              : '#09090B'
            : isDark
            ? '#E4E4E7'
            : '#18181B';
          ctx.fillText(labelText, node.x, labelY);
        }

        ctx.restore();
      }

      ctx.restore();

      if (needsMoreFrames) {
        scheduleRender();
      }
    };

    const fitCameraToNodes = (animateStep = false) => {
      void animateStep;
      const list = simNodesRef.current;
      const { width, height } = sizeRef.current;
      if (!list.length) return;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const n of list) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
      const spanX = Math.max(160, maxX - minX + 120);
      const spanY = Math.max(140, maxY - minY + 120);
      const k = Math.max(0.28, Math.min(1.5, Math.min(width / spanX, height / spanY) * 0.88));
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      transformRef.current = {
        x: width / 2 - cx * k,
        y: height / 2 - cy * k,
        k,
      };
      scheduleRender();
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const { width, height } = sizeRef.current;
        const t = transformRef.current;
        const nextK = Math.min(3.5, t.k * 1.25);
        const factor = nextK / t.k;
        transformRef.current = {
          x: width / 2 - (width / 2 - t.x) * factor,
          y: height / 2 - (height / 2 - t.y) * factor,
          k: nextK,
        };
        scheduleRender();
      },
      zoomOut: () => {
        const { width, height } = sizeRef.current;
        const t = transformRef.current;
        const nextK = Math.max(0.2, t.k * 0.8);
        const factor = nextK / t.k;
        transformRef.current = {
          x: width / 2 - (width / 2 - t.x) * factor,
          y: height / 2 - (height / 2 - t.y) * factor,
          k: nextK,
        };
        scheduleRender();
      },
      centerOnMe: () => {
        const meNode = simNodesRef.current.find((n) => n.id === 'me');
        const { width, height } = sizeRef.current;
        const target = meNode || { x: 0, y: 0 };
        const k = Math.max(0.85, Math.min(1.2, transformRef.current.k));
        transformRef.current = {
          x: width / 2 - target.x * k,
          y: height / 2 - target.y * k,
          k,
        };
        scheduleRender();
      },
      fitToScreen: () => fitCameraToNodes(true),
      resetLayout: () => {
        const sim = simulationRef.current;
        for (const n of simNodesRef.current) {
          if (n.id === 'me') {
            n.fx = 0;
            n.fy = 0;
            n.x = 0;
            n.y = 0;
          } else {
            n.fx = null;
            n.fy = null;
          }
        }
        const { width, height } = sizeRef.current;
        transformRef.current = { x: width / 2, y: height / 2, k: 1 };
        if (sim) {
          sim.alpha(0.9).restart();
        }
        scheduleRender();
      },
    }));

    // Track container resize cleanly
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        const prevW = sizeRef.current.width;
        const prevH = sizeRef.current.height;
        const w = Math.max(280, Math.round(rect.width));
        const h = Math.max(320, Math.round(rect.height));
        sizeRef.current = { width: w, height: h };
        if (transformRef.current.x === 0 && transformRef.current.y === 0) {
          transformRef.current = { x: w / 2, y: h / 2, k: 1 };
        } else {
          transformRef.current.x += (w - prevW) / 2;
          transformRef.current.y += (h - prevH) / 2;
        }
        scheduleRender();
      };
      updateSize();
      const observer = new ResizeObserver(updateSize);
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    // Build / update d3-force simulation whenever nodes/edges/physics change
    useEffect(() => {
      const prevMap = new Map(simNodesRef.current.map((n) => [n.id, n]));
      const simNodes: SimNode[] = nodes.map((node, idx) => {
        const prev = prevMap.get(node.id);
        const angle = (idx / Math.max(1, nodes.length)) * Math.PI * 2;
        const ring = node.id === 'me' ? 0 : node.tier === 'category' ? 110 : 210 + (idx % 5) * 28;
        return {
          ...node,
          x: prev ? prev.x : Math.cos(angle) * ring,
          y: prev ? prev.y : Math.sin(angle) * ring,
          vx: prev ? prev.vx : 0,
          vy: prev ? prev.vy : 0,
          fx: node.id === 'me' ? 0 : prev?.fx,
          fy: node.id === 'me' ? 0 : prev?.fy,
          appear: prev ? prev.appear : preferences.animationsEnabled && !preferences.reducedMotion ? 0.05 : 1,
        };
      });

      const simLinks: SimLink[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        relationType: e.relationType,
        label: e.label,
        isCustom: e.isCustom,
        directional: e.directional,
      }));

      simNodesRef.current = simNodes;
      simLinksRef.current = simLinks;

      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      const sim = forceSimulation<SimNode, SimLink>(simNodes)
        .force(
          'link',
          forceLink<SimNode, SimLink>(simLinks)
            .id((d) => d.id)
            .distance((l) => {
              const tgt = l.target as SimNode;
              if (tgt.id === 'me') return preferences.linkDistance * 1.15;
              if (tgt.tier === 'category') return preferences.linkDistance * 0.92;
              return preferences.linkDistance * 0.85;
            })
            .strength((l) => (l.isCustom ? 0.55 : 0.72))
        )
        .force(
          'charge',
          forceManyBody<SimNode>()
            .strength((d) =>
              d.id === 'me'
                ? -preferences.repulsionStrength * 1.8
                : d.tier === 'category'
                ? -preferences.repulsionStrength * 1.25
                : -preferences.repulsionStrength
            )
            .distanceMax(520)
        )
        .force(
          'collide',
          forceCollide<SimNode>((d) => getNodeRadius(d, preferences) + 12).iterations(2)
        )
        .force('center', forceCenter(0, 0).strength(0.08))
        .force('x', forceX<SimNode>(0).strength(0.03))
        .force('y', forceY<SimNode>(0).strength(0.03))
        .alphaDecay(0.032)
        .alphaMin(0.008);

      simulationRef.current = sim;

      if (preferences.reducedMotion || !preferences.animationsEnabled) {
        sim.stop();
        sim.tick(90);
        for (const n of simNodes) n.appear = 1;
        scheduleRender();
      } else {
        sim.on('tick', () => {
          scheduleRender();
        });
        sim.on('end', () => {
          scheduleRender();
        });
        sim.alpha(Math.max(0.45, sim.alpha())).restart();
      }

      return () => {
        sim.stop();
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }, [
      nodes,
      edges,
      preferences.linkDistance,
      preferences.repulsionStrength,
      preferences.nodeSizeScale,
      preferences.animationsEnabled,
      preferences.reducedMotion,
    ]);

    // Re-render cleanly when selection, search, label mode, or theme changes without restarting physics
    useEffect(() => {
      scheduleRender();
    }, [selectedNodeId, searchQuery, preferences.labelVisibility, theme]);

    // Pointer + Wheel + Pinch-Touch handlers
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const t = transformRef.current;
        const zoomFactor = Math.exp(-e.deltaY * 0.0014);
        const nextK = Math.max(0.2, Math.min(3.5, t.k * zoomFactor));
        const ratio = nextK / t.k;
        transformRef.current = {
          x: sx - (sx - t.x) * ratio,
          y: sy - (sy - t.y) * ratio,
          k: nextK,
        };
        scheduleRender();
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const hit = findNodeAt(sx, sy);
        if (hit) {
          dragStateRef.current = {
            mode: 'node',
            nodeId: hit.id,
            startX: sx,
            startY: sy,
            startTx: transformRef.current.x,
            startTy: transformRef.current.y,
            moved: false,
          };
          hit.fx = hit.x;
          hit.fy = hit.y;
          simulationRef.current?.alphaTarget(0.2).restart();
        } else {
          dragStateRef.current = {
            mode: 'pan',
            startX: sx,
            startY: sy,
            startTx: transformRef.current.x,
            startTy: transformRef.current.y,
            moved: false,
          };
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const drag = dragStateRef.current;

        if (drag.mode === 'node' && drag.nodeId) {
          const distMoved = Math.hypot(sx - drag.startX, sy - drag.startY);
          if (distMoved > 3) drag.moved = true;
          const node = simNodesRef.current.find((n) => n.id === drag.nodeId);
          if (node) {
            const world = screenToWorld(sx, sy);
            node.fx = world.x;
            node.fy = world.y;
            node.x = world.x;
            node.y = world.y;
            scheduleRender();
          }
          return;
        }

        if (drag.mode === 'pan') {
          const dx = sx - drag.startX;
          const dy = sy - drag.startY;
          if (Math.hypot(dx, dy) > 3) drag.moved = true;
          transformRef.current.x = drag.startTx + dx;
          transformRef.current.y = drag.startTy + dy;
          scheduleRender();
          return;
        }

        const hit = findNodeAt(sx, sy);
        const nextHover = hit ? hit.id : null;
        if (hoveredNodeIdRef.current !== nextHover) {
          hoveredNodeIdRef.current = nextHover;
          canvas.style.cursor = hit ? 'pointer' : 'grab';
          onHoverNode?.(hit || null);
          scheduleRender();
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        const drag = dragStateRef.current;
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        if (drag.mode === 'node' && drag.nodeId) {
          const node = simNodesRef.current.find((n) => n.id === drag.nodeId);
          if (node) {
            if (node.id !== 'me') {
              node.fx = null;
              node.fy = null;
            }
            simulationRef.current?.alphaTarget(0);
            if (!drag.moved) {
              const now = Date.now();
              if (
                lastTapRef.current.nodeId === node.id &&
                now - lastTapRef.current.time < 340
              ) {
                onOpenRecord(node);
                lastTapRef.current = { time: 0, nodeId: null };
              } else {
                onSelectNode(node.id);
                lastTapRef.current = { time: now, nodeId: node.id };
              }
            }
          }
        } else if (drag.mode === 'pan' && !drag.moved) {
          const hit = findNodeAt(sx, sy);
          onSelectNode(hit ? hit.id : null);
        }

        dragStateRef.current = {
          mode: 'none',
          startX: 0,
          startY: 0,
          startTx: transformRef.current.x,
          startTy: transformRef.current.y,
          moved: false,
        };
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const x1 = e.touches[0].clientX - rect.left;
          const y1 = e.touches[0].clientY - rect.top;
          const x2 = e.touches[1].clientX - rect.left;
          const y2 = e.touches[1].clientY - rect.top;
          dragStateRef.current = {
            mode: 'pinch',
            startX: (x1 + x2) / 2,
            startY: (y1 + y2) / 2,
            startTx: transformRef.current.x,
            startTy: transformRef.current.y,
            moved: true,
            pinchStartDist: Math.hypot(x2 - x1, y2 - y1),
            pinchStartScale: transformRef.current.k,
            pinchMidX: (x1 + x2) / 2,
            pinchMidY: (y1 + y2) / 2,
          };
          return;
        }

        if (e.touches.length === 1) {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const sx = e.touches[0].clientX - rect.left;
          const sy = e.touches[0].clientY - rect.top;
          const hit = findNodeAt(sx, sy);
          if (hit) {
            dragStateRef.current = {
              mode: 'node',
              nodeId: hit.id,
              startX: sx,
              startY: sy,
              startTx: transformRef.current.x,
              startTy: transformRef.current.y,
              moved: false,
            };
            hit.fx = hit.x;
            hit.fy = hit.y;
            simulationRef.current?.alphaTarget(0.2).restart();
          } else {
            dragStateRef.current = {
              mode: 'pan',
              startX: sx,
              startY: sy,
              startTx: transformRef.current.x,
              startTy: transformRef.current.y,
              moved: false,
            };
          }
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        const drag = dragStateRef.current;
        if (e.touches.length === 2 && drag.mode === 'pinch') {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const x1 = e.touches[0].clientX - rect.left;
          const y1 = e.touches[0].clientY - rect.top;
          const x2 = e.touches[1].clientX - rect.left;
          const y2 = e.touches[1].clientY - rect.top;
          const dist = Math.hypot(x2 - x1, y2 - y1);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const baseDist = Math.max(10, drag.pinchStartDist || dist);
          const nextK = Math.max(
            0.2,
            Math.min(3.5, (drag.pinchStartScale || 1) * (dist / baseDist))
          );
          const ratio = nextK / (drag.pinchStartScale || 1);
          const anchorX = drag.pinchMidX ?? midX;
          const anchorY = drag.pinchMidY ?? midY;
          transformRef.current = {
            x: midX - (anchorX - drag.startTx) * ratio,
            y: midY - (anchorY - drag.startTy) * ratio,
            k: nextK,
          };
          scheduleRender();
          return;
        }

        if (e.touches.length === 1) {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const sx = e.touches[0].clientX - rect.left;
          const sy = e.touches[0].clientY - rect.top;
          if (drag.mode === 'node' && drag.nodeId) {
            if (Math.hypot(sx - drag.startX, sy - drag.startY) > 6) drag.moved = true;
            const node = simNodesRef.current.find((n) => n.id === drag.nodeId);
            if (node) {
              const world = screenToWorld(sx, sy);
              node.fx = world.x;
              node.fy = world.y;
              node.x = world.x;
              node.y = world.y;
              scheduleRender();
            }
          } else if (drag.mode === 'pan') {
            const dx = sx - drag.startX;
            const dy = sy - drag.startY;
            if (Math.hypot(dx, dy) > 6) drag.moved = true;
            transformRef.current.x = drag.startTx + dx;
            transformRef.current.y = drag.startTy + dy;
            scheduleRender();
          }
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const drag = dragStateRef.current;
        if (drag.mode === 'node' && drag.nodeId) {
          const node = simNodesRef.current.find((n) => n.id === drag.nodeId);
          if (node) {
            if (node.id !== 'me') {
              node.fx = null;
              node.fy = null;
            }
            simulationRef.current?.alphaTarget(0);
            if (!drag.moved) {
              const now = Date.now();
              if (
                lastTapRef.current.nodeId === node.id &&
                now - lastTapRef.current.time < 340
              ) {
                onOpenRecord(node);
                lastTapRef.current = { time: 0, nodeId: null };
              } else {
                onSelectNode(node.id);
                lastTapRef.current = { time: now, nodeId: node.id };
              }
            }
          }
        } else if (drag.mode === 'pan' && !drag.moved && e.touches.length === 0) {
          onSelectNode(null);
        }

        if (e.touches.length === 0) {
          dragStateRef.current = {
            mode: 'none',
            startX: 0,
            startY: 0,
            startTx: transformRef.current.x,
            startTy: transformRef.current.y,
            moved: false,
          };
        }
      };

      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);

      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }, [onOpenRecord, onSelectNode, onHoverNode]);

    return (
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label="Knowledge Universe Interactive Graph Canvas"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
        />
      </div>
    );
  }
);
