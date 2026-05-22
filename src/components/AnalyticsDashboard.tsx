/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  DollarSign, 
  Target, 
  Eye, 
  Award,
  Facebook,
  Instagram,
  Linkedin,
  HelpCircle
} from "lucide-react";

export const AnalyticsDashboard: React.FC = () => {
  const { metrics, followerTrends, performance, subscription } = useApp();
  
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [hoveredPerfId, setHoveredPerfId] = useState<string | null>(null);

  // Math dimensions for Follower Trend line chart
  const svgWidth = 560;
  const svgHeight = 220;
  const padding = 35;

  const minVal = Math.min(...followerTrends.map((pt) => pt.followers));
  const maxVal = Math.max(...followerTrends.map((pt) => pt.followers));
  const range = maxVal - minVal || 1;

  // Render SVG points calculation
  const points = followerTrends.map((pt, idx) => {
    const x = padding + (idx * (svgWidth - padding * 2)) / (followerTrends.length - 1);
    const y = svgHeight - padding - ((pt.followers - minVal) * (svgHeight - padding * 2)) / range;
    return { x, y, pt, idx };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`
    : "";

  // Bar Chart calculations for Post Performance metrics
  const maxEngagement = Math.max(...performance.map((p) => p.engagementNum), 1);

  const getPlatformClass = (plat: string) => {
    switch (plat) {
      case "Facebook":
        return "bg-blue-600";
      case "Instagram":
        return "bg-pink-500";
      case "LinkedIn":
        return "bg-blue-700";
      default:
        return "bg-indigo-650";
    }
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case "Facebook":
        return <Facebook className="h-3.5 w-3.5 text-blue-600" />;
      case "Instagram":
        return <Instagram className="h-3.5 w-3.5 text-pink-500" />;
      case "LinkedIn":
        return <Linkedin className="h-3.5 w-3.5 text-blue-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* 1. Header Information */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Channel Analytics & Growth Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time metric trackers and responsive visualization charts tailored to your campaigns.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-indigo-50/70 p-3 items-center space-x-2.5 border border-indigo-100/30">
          <Award className="h-5 w-5 text-indigo-600" />
          <div className="text-left leading-none">
            <span className="text-[9px] font-mono text-indigo-500 uppercase tracking-wider block">
              Active Tier Profile:
            </span>
            <span className="text-xs font-bold text-indigo-900 capitalize font-display">
              {subscription.tier} Analytics Hub
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS (Total Reach, Engagement, Followers) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {Object.entries(metrics).map(([key, itemVal]) => {
          const item = itemVal as any;
          return (
            <div
              key={key}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              id={`metric_card_${key}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold ${
                  item.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {item.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{item.change}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-black text-gray-950 tracking-tight">
                  {item.value}
                </h3>
                <p className="text-[10px] text-gray-400 leading-normal">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FUNCTIONALS GRID VISUALS (Line Chart + Bar Chart) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Chart 1: Follower Growth Trend (SVG Line Chart with Hover Interactions) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-gray-950">Followers Trendline</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Overall historical growth trend calculated weekly</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 block">{followerTrends[followerTrends.length - 1].followers} followers</span>
              <span className="text-[9px] font-mono text-gray-405">Peak reached</span>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full overflow-hidden flex justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-xl self-center">
              {/* Grid Lines */}
              {[4, 3, 2, 1, 0].map((gr, idx) => {
                const yGrid = padding + (idx * (svgHeight - padding * 2)) / 4;
                return (
                  <line
                    key={idx}
                    x1={padding}
                    y1={yGrid}
                    x2={svgWidth - padding}
                    y2={yGrid}
                    className="stroke-gray-100 stroke-1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Under Curve Fill */}
              {pathD && (
                <path
                  d={areaD}
                  className="fill-indigo-50/30"
                />
              )}

              {/* Curve Line */}
              {pathD && (
                <path
                  d={pathD}
                  className="stroke-indigo-600 stroke-2.5 fill-none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Circles mapping dots */}
              {points.map((p) => (
                <g key={p.idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredTrendIdx === p.idx ? 6 : 3.5}
                    onClick={() => setHoveredTrendIdx(p.idx)}
                    onMouseEnter={() => setHoveredTrendIdx(p.idx)}
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                    className="fill-indigo-600 hover:fill-indigo-805 stroke-white stroke-2 cursor-pointer transition-all"
                  />
                </g>
              ))}

              {/* Text Axis Labels (Day date text labels) */}
              {points.map((p) => (
                <text
                  key={p.idx}
                  x={p.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className="fill-gray-400 font-mono text-[9px] font-medium"
                >
                  {p.pt.date.replace("May ", "")}
                </text>
              ))}
            </svg>

            {/* Float Tooltip Indicator details */}
            {hoveredTrendIdx !== null && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 rounded-lg bg-gray-950 p-2 text-white shadow-xl animate-slide-up text-[10px] space-y-0.5 pointer-events-none border border-gray-800">
                <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400">
                  {followerTrends[hoveredTrendIdx].date}, 2026
                </div>
                <div className="font-bold text-xs text-indigo-400">
                  {followerTrends[hoveredTrendIdx].followers.toLocaleString()} active fans
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Top Performing Posts Bar Chart representation */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-gray-950">Active Campaign Engagement</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-sans">Organic reach and total engagement breakdown</p>
            </div>
            
            <span className="text-[10px] font-semibold text-gray-450 uppercase font-mono tracking-widest shrink-0 bg-gray-100/70 p-1.5 rounded">
              LATEST CAMPAIGNS
            </span>
          </div>

          {/* Bar Chart list layout */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {performance.map((item) => {
              const pct = (item.engagementNum / maxEngagement) * 100;
              const isHovered = hoveredPerfId === item.id;
              
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredPerfId(item.id)}
                  onMouseLeave={() => setHoveredPerfId(null)}
                  className="space-y-1 cursor-pointer group"
                  id={`perf_bar_entry_${item.id}`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-gray-900">
                      {getPlatformIcon(item.platform)}
                      <span className="truncate max-w-44 sm:max-w-56 text-xs">{item.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400 font-bold">
                      {item.engagementNum} acts / {item.reachNum} views
                    </span>
                  </div>

                  {/* Horizontal Bar Visual tracker */}
                  <div className="h-5 w-full bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-lg transition-all duration-300 ${getPlatformClass(item.platform)} opacity-85 group-hover:opacity-100`}
                    />

                    {/* Quick percentage tooltip overlay */}
                    {isHovered && (
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-black/60 font-mono">
                          ER: {((item.engagementNum / item.reachNum) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
