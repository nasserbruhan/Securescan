
import React from 'react';

interface Props {
  score: number;
}

const SecurityGauge: React.FC<Props> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return '#10b981'; // Green-500
    if (score >= 50) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  const getLabel = () => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Vulnerable';
    return 'Critical';
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r="45"
          stroke={getColor()}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono">{score}</span>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{getLabel()}</span>
      </div>
    </div>
  );
};

export default SecurityGauge;
