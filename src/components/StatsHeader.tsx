'use client';

import { useEffect, useState } from 'react';

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-1.5 sm:p-3 bg-black/80 border border-terminal-green/30 text-xs font-mono mb-3 sm:mb-4 text-left overflow-hidden">
      <div className="p-1.5 sm:p-2 bg-terminal-green/5 border border-terminal-green/20 min-w-0 overflow-hidden">
        <span className="text-terminal-green/50 uppercase block text-[9px] sm:text-[10px] tracking-widest truncate">TOP BID</span>
        <span className="text-terminal-green text-xs sm:text-sm md:text-base font-bold glitch-text block truncate">
          ${currentPrice.toFixed(2)}
        </span>
      </div>

      <div className="p-1.5 sm:p-2 bg-terminal-green/5 border border-terminal-green/20 min-w-0 overflow-hidden">
        <span className="text-terminal-green/50 uppercase block text-[9px] sm:text-[10px] tracking-widest truncate">REIGN TIME</span>
        <span className="text-glitch-blue text-xs sm:text-sm md:text-base font-bold font-mono block truncate">
          {reignTime}
        </span>
      </div>

      <div className="p-1.5 sm:p-2 bg-terminal-green/5 border border-terminal-green/20 min-w-0 overflow-hidden">
        <span className="text-terminal-green/50 uppercase block text-[9px] sm:text-[10px] tracking-widest truncate">TOTAL VOLUME</span>
        <span className="text-yellow-400 text-xs sm:text-sm md:text-base font-bold block truncate">
          ${totalVolume.toFixed(2)}
        </span>
      </div>

      <div className="p-1.5 sm:p-2 bg-terminal-green/5 border border-terminal-green/20 min-w-0 overflow-hidden">
        <span className="text-terminal-green/50 uppercase block text-[9px] sm:text-[10px] tracking-widest truncate">TOTAL HIJACKS</span>
        <span className="text-terminal-green text-xs sm:text-sm md:text-base font-bold block truncate">
          {totalBids}
        </span>
      </div>
    </div>
  );
}
