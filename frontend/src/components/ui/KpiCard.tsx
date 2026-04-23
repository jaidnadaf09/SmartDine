import React, { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red" | "indigo";
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  trendLabel,
  sparklineData = []
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'string' ? value : 0);

  // Animated counter for numbers
  useEffect(() => {
    if (typeof value === 'string') {
        setDisplayValue(value);
        return;
    }

    let start = Number(displayValue) || 0;
    const end = value;
    if (start === end) return;

    const duration = 800;
    const stepTime = 20;
    const range = end - start;
    const steps = duration / stepTime;
    const increment = range / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`sd-kpi-card sd-kpi-${color}`}>
      <div className="sd-kpi-top">
        <div className="sd-kpi-icon">{icon}</div>
        <div className="sd-kpi-title">{title}</div>
      </div>

      <div className="sd-kpi-value">{displayValue}</div>

      {/* Sparkline Visualization */}
      {sparklineData.length > 0 && (
        <div className="sd-kpi-sparkline">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklineData
                .map((v, i) => {
                    const x = (i / (sparklineData.length - 1)) * 100;
                    const max = Math.max(...sparklineData, 1);
                    const y = 30 - (v / max) * 25; 
                    return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        </div>
      )}

      {/* Trend Indicator / Label */}
      {(trend !== undefined || trendLabel) && (
        <div className={`sd-kpi-trend ${trend !== undefined ? (trend >= 0 ? "positive" : "negative") : ""}`}>
          {trend !== undefined && (
            <span className="trend-arrow">{trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>
          )}
          {trendLabel && <span className="trend-label">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default KpiCard;

