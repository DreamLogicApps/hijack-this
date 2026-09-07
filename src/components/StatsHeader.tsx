'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Clock, BarChart3, Zap } from 'lucide-react';

interface StatsHeaderProps {
  currentPrice: number;
  updatedAt: string;
  totalVolume: number;
  totalBids: number;
}

export function StatsHeader({ currentPrice, updatedAt, totalVolume, totalBids }: StatsHeaderProps) {
  const [reignTime, setReignTime] = useState<string>('00:00:00');

  useEffect(() => {
    const calculateTime = () => {
      if (!updatedAt) return;
      const start = new Date(updatedAt).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);

      const seconds = Math.floor((diffMs / 1000) % 60);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (days > 0) {
        setReignTime(`${days}d ${pad(hours)}h ${pad(minutes)}m`);
      } else {
        setReignTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [updatedAt]);

  const stats = [
    {
      icon: <DollarSign className="h-3.5 w-3.5 shrink-0" />,
      label: 'TOP BID',
      value: `$${currentPrice.toFixed(2)}`,
      color: 'text-terminal-green',
      glow: 'drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]',
    },
    {
      icon: <Clock className="h-3.5 w-3.5 shrink-0" />,
      label: 'REIGN',
      value: reignTime,
      color: 'text-glitch-blue',
      glow: 'drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]',
    },
    {
      icon: <BarChart3 className="h-3.5 w-3.5 shrink-0" />,
      label: 'VOLUME',
      value: `$${totalVolume.toFixed(2)}`,
      color: 'text-gold',
      glow: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]',
    },
    {
      icon: <Zap className="h-3.5 w-3.5 shrink-0" />,
      label: 'HIJACKS',
      value: `${totalBids}`,
      color: 'text-terminal-green',
      glow: '',
    },
  ];

  return (
    <div className="flex items-stretch gap-0 bg-black/60 border border-terminal-green/20 overflow-hidden mb-3 sm:mb-4">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className={`flex-1 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 min-w-0 ${
            idx < stats.length - 1 ? 'border-r border-terminal-green/10' : ''
          }`}
        >
          <div className={`${stat.color} opacity-60 hidden sm:block`}>
            {stat.icon}
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="text-[8px] sm:text-[9px] text-terminal-green/40 uppercase tracking-widest font-bold truncate">
              {stat.label}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${stat.color} ${stat.glow} truncate tabular-nums`}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
