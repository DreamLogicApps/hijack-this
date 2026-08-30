'use client';

import { useState } from 'react';
import { ExternalLink, Trophy, History, ChevronLeft, ChevronRight, Crown, Medal, Award } from 'lucide-react';

export interface HistoryItem {
  id: string;
  url: string;
  label: string;
  owner_name: string;
  price_paid: number;
  clicks?: number;
  created_at: string;
}

interface HistoryFeedProps {
  history: HistoryItem[];
  onTrackClick?: (type: 'history', id: string) => void;
}

const ITEMS_PER_PAGE = 5;

export function HistoryFeed({ history, onTrackClick }: HistoryFeedProps) {
  const [tab, setTab] = useState<'activity' | 'leaderboard'>('activity');
  const [activityPage, setActivityPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  // Sorted by highest paid for leaderboard
  const leaderboard = [...history].sort((a, b) => b.price_paid - a.price_paid);

  const activeList = tab === 'activity' ? history : leaderboard;
  const currentPage = tab === 'activity' ? activityPage : leaderboardPage;
  const setPage = tab === 'activity' ? setActivityPage : setLeaderboardPage;

  const totalPages = Math.max(1, Math.ceil(activeList.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = activeList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const past = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((now - past) / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-black/90 border border-terminal-green/40 font-mono text-xs overflow-hidden max-w-full">
      {/* Tab Header */}
      <div className="flex border-b border-terminal-green/30 bg-terminal-green/5">
        <button
          onClick={() => setTab('activity')}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-colors ${
            tab === 'activity'
              ? 'bg-terminal-green/20 text-terminal-green border-b-2 border-terminal-green'
              : 'text-terminal-green/50 hover:text-terminal-green'
          }`}
        >
          <History className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Live Feed ({history.length})</span>
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex-1 py-2 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-colors ${
            tab === 'leaderboard'
              ? 'bg-terminal-green/20 text-terminal-green border-b-2 border-terminal-green'
              : 'text-terminal-green/50 hover:text-terminal-green'
          }`}
        >
          <Trophy className="h-3.5 w-3.5 text-yellow-400 shrink-0" /> <span className="truncate">Leaderboard ({leaderboard.length})</span>
        </button>
      </div>

      {/* List Content */}
      <div className="divide-y divide-terminal-green/10 min-h-[220px] overflow-hidden">
        {paginatedList.length === 0 ? (
          <div className="p-8 text-center text-terminal-green/40 font-mono text-xs">
            {tab === 'activity' ? 'NO RECENT ACTIVITY' : 'NO LEADERBOARD DATA'}
          </div>
        ) : (
          paginatedList.map((item, idx) => {
            const globalIndex = startIndex + idx;
            return (
              <div key={`${item.id}-${idx}`} className="p-2 sm:p-2.5 flex items-center justify-between hover:bg-terminal-green/5 transition-colors gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
                  {tab === 'leaderboard' && (
                    <div className="w-5 sm:w-6 flex items-center justify-center shrink-0">
                      {globalIndex === 0 ? (
                        <span title="#1 Gold Champion" className="flex items-center justify-center">
                          <Crown className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" />
                        </span>
                      ) : globalIndex === 1 ? (
                        <span title="#2 Silver" className="flex items-center justify-center">
                          <Medal className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-300 fill-slate-300/20 drop-shadow-[0_0_6px_rgba(203,213,225,0.7)]" />
                        </span>
                      ) : globalIndex === 2 ? (
                        <span title="#3 Bronze" className="flex items-center justify-center">
                          <Award className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-500 fill-amber-500/20 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-terminal-green/10 border border-terminal-green/30 text-terminal-green/60 text-[9px] font-bold flex items-center justify-center">
                          {globalIndex + 1}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col text-left min-w-0 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-glitch-blue text-xs truncate max-w-[100px] sm:max-w-[160px]">{item.owner_name}</span>
                      {tab === 'activity' && (
                        <span className="text-[9px] sm:text-[10px] text-terminal-green/40 shrink-0">
                          {formatTimeAgo(item.created_at)}
                          <span className="mx-1 opacity-50">•</span>
                          {item.clicks || 0} clicks
                        </span>
                      )}
                      {tab === 'leaderboard' && (
                        <span className="text-[9px] sm:text-[10px] text-terminal-green/40 shrink-0 ml-1">
                          <span className="mx-1 opacity-50">•</span>
                          {item.clicks || 0} clicks
                        </span>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrackClick?.('history', item.id)}
                      className="text-terminal-green/80 hover:text-terminal-green hover:underline truncate text-[10px] sm:text-[11px] flex items-center gap-1 max-w-full mt-0.5"
                    >
                      <span className="truncate max-w-[140px] sm:max-w-[220px]">{item.label}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 inline" />
                    </a>
                  </div>
                </div>

                <div className={`font-bold text-xs shrink-0 pl-1 ${tab === 'leaderboard' ? 'text-yellow-400' : 'text-terminal-green'}`}>
                  ${item.price_paid.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t border-terminal-green/30 bg-terminal-green/5 text-[10px] sm:text-[11px] font-mono">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/30 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 font-bold border border-terminal-green/30"
          >
            <ChevronLeft className="h-3 w-3" /> PREV
          </button>
          
          <span className="text-terminal-green/70 font-mono text-[10px]">
            PAGE <span className="text-terminal-green font-bold">{currentPage}</span> / <span className="text-terminal-green font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/30 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 font-bold border border-terminal-green/30"
          >
            NEXT <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
