'use client';

import { useState } from 'react';
import { ExternalLink, Trophy, History, ChevronLeft, ChevronRight, Crown, Medal, Award, Radio } from 'lucide-react';

export interface HistoryItem {
  id: string;
  url: string;
  label: string;
  owner_name: string;
  price_paid: number;
  clicks?: number;
  created_at: string;
  slot_type?: string;
}

interface HistoryFeedProps {
  history: HistoryItem[];
  onTrackClick?: (type: 'history' | 'current', id: string) => void;
  activeLinkId?: string;
}

const ITEMS_PER_PAGE = 5;

export function HistoryFeed({ history, onTrackClick, activeLinkId }: HistoryFeedProps) {
  const [tab, setTab] = useState<'activity' | 'leaderboard'>('activity');
  const [leaderboardSort, setLeaderboardSort] = useState<'bid' | 'traffic' | 'reign'>('bid');
  const [activityDateFilter, setActivityDateFilter] = useState<'all' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  const getLogoUrl = (urlStr: string) => {
    try {
      const urlObj = new URL(urlStr);
      const domain = urlObj.hostname.replace('www.', '');
      if (domain === 'x.com' || domain === 'twitter.com') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          return `https://unavatar.io/twitter/${pathParts[0]}`;
        }
      }
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return '';
    }
  };

  const getReignTimeMs = (item: HistoryItem) => {
    const originalIndex = history.findIndex(h => h.id === item.id);
    if (originalIndex < 0) return 0;
    
    // Find the next oldest item with the exact same slot_type
    const overthrowerIndex = history.findIndex((h, idx) => idx < originalIndex && h.slot_type === item.slot_type);
    
    if (overthrowerIndex < 0) {
      // It hasn't been overthrown yet
      return Date.now() - new Date(item.created_at).getTime();
    }
    const currentCreatedAt = new Date(item.created_at).getTime();
    const overthrownAt = new Date(history[overthrowerIndex].created_at).getTime();
    return Math.max(0, overthrownAt - currentCreatedAt);
  };

  const getSlotLabel = (type?: string) => {
    if (!type || type === 'main') return '';
    if (type.includes('left_1') || type.includes('right_1')) return 'PRIME';
    if (type.includes('left_2') || type.includes('right_2')) return 'FEATURED';
    if (type.includes('left_3') || type.includes('right_3')) return 'STARTER';
    return 'SLOT';
  };

  const getReignTimeStr = (item: HistoryItem) => {
    const originalIndex = history.findIndex(h => h.id === item.id);
    const overthrowerIndex = history.findIndex((h, idx) => idx < originalIndex && h.slot_type === item.slot_type);
    if (overthrowerIndex < 0) return 'LIVE';
    
    const diff = getReignTimeMs(item);
    if (diff < 0) return '0s';

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const filteredHistory = history.filter(item => {
    if (activityDateFilter === 'all') return true;
    if (activityDateFilter === 'custom' && customDate) {
      const itemDateStr = new Date(item.created_at).toLocaleDateString('en-CA');
      return itemDateStr === customDate;
    }
    return true;
  });

  const leaderboard = [...history].sort((a, b) => {
    if (leaderboardSort === 'traffic') return (b.clicks || 0) - (a.clicks || 0);
    if (leaderboardSort === 'reign') return getReignTimeMs(b) - getReignTimeMs(a);
    return b.price_paid - a.price_paid;
  });

  const activeList = tab === 'activity' ? filteredHistory : leaderboard;
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
    <div className="bg-black/60 border border-white/[0.06] font-mono text-xs overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-white/[0.06]">
        <button
          onClick={() => setTab('activity')}
          className={`flex-1 py-2.5 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
            tab === 'activity'
              ? 'bg-terminal-green/[0.08] text-terminal-green border-b-2 border-terminal-green'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
          }`}
        >
          <History className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Live Feed ({history.length})</span>
        </button>
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex-1 py-2.5 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
            tab === 'leaderboard'
              ? 'bg-gold/[0.08] text-gold border-b-2 border-gold'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
          }`}
        >
          <Trophy className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Leaderboard ({leaderboard.length})</span>
        </button>
      </div>

      {/* Activity Filters */}
      {tab === 'activity' && (
        <div className="flex items-center justify-end px-3 py-2 border-b border-white/[0.04] bg-white/[0.01] gap-2 overflow-x-auto">
           <span className="text-[9px] sm:text-[10px] text-white/25 mr-1 uppercase font-bold tracking-widest hidden sm:inline shrink-0">FILTER:</span>
           
           <button
             onClick={() => {
               setActivityDateFilter('all');
               setCustomDate('');
               setActivityPage(1);
             }}
             className={`text-[9px] sm:text-[10px] uppercase font-bold px-2.5 sm:px-3 py-1 transition-all border shrink-0 ${
               activityDateFilter === 'all' 
                 ? 'bg-terminal-green/15 text-terminal-green border-terminal-green/40' 
                 : 'bg-transparent text-white/25 border-white/[0.08] hover:text-white/50 hover:border-white/15'
             }`}
           >
             ALL TIME
           </button>

           <input 
             type="date"
             value={customDate}
             onChange={(e) => {
               setCustomDate(e.target.value);
               if (e.target.value) {
                 setActivityDateFilter('custom');
                 setActivityPage(1);
               } else {
                 setActivityDateFilter('all');
               }
             }}
             className={`bg-transparent border text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 outline-none transition-all shrink-0 h-[26px] sm:h-[28px] ${
               activityDateFilter === 'custom'
                 ? 'border-terminal-green/40 text-terminal-green bg-terminal-green/15'
                 : 'border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/15'
             }`}
             style={{ colorScheme: 'dark' }}
           />
        </div>
      )}

      {/* Leaderboard Filters */}
      {tab === 'leaderboard' && (
        <div className="flex items-center justify-end px-3 py-2 border-b border-white/[0.04] bg-white/[0.01] gap-1.5 sm:gap-2 overflow-x-auto">
           <span className="text-[9px] sm:text-[10px] text-white/25 mr-1 uppercase font-bold tracking-widest hidden sm:inline shrink-0">SORT:</span>
           
           {(['bid', 'traffic', 'reign'] as const).map((opt) => (
             <button
               key={opt}
               onClick={() => setLeaderboardSort(opt)}
               className={`text-[9px] sm:text-[10px] uppercase font-bold px-2.5 sm:px-3 py-1 transition-all border shrink-0 ${
                 leaderboardSort === opt 
                   ? 'bg-gold/15 text-gold border-gold/40' 
                   : 'bg-transparent text-white/25 border-white/[0.08] hover:text-white/50 hover:border-white/15'
               }`}
             >
               {opt === 'bid' ? 'Highest Bid' : opt === 'traffic' ? 'Most Traffic' : 'Longest Reign'}
             </button>
           ))}
        </div>
      )}

      {/* List Content */}
      <div className="min-h-[240px]">
        {paginatedList.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <Radio className="h-6 w-6 text-white/15" />
            <span className="text-white/20 text-xs font-mono uppercase tracking-widest">
              {tab === 'activity' ? 'No recent activity' : 'No leaderboard data'}
            </span>
          </div>
        ) : (
          paginatedList.map((item, idx) => {
            const globalIndex = startIndex + idx;
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={`${item.id}-${idx}`} 
                className={`px-3 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0 transition-all duration-150 hover:bg-white/[0.03] border-b border-white/[0.03] last:border-b-0 ${
                  isEven ? 'bg-white/[0.01]' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 overflow-hidden flex-1">
                  {tab === 'leaderboard' ? (
                    <div className="w-6 sm:w-7 flex items-center justify-center shrink-0">
                      {globalIndex === 0 ? (
                        <Crown className="h-4.5 w-4.5 text-gold fill-gold/20 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                      ) : globalIndex === 1 ? (
                        <Medal className="h-4 w-4 text-slate-300 fill-slate-300/20 drop-shadow-[0_0_4px_rgba(203,213,225,0.5)]" />
                      ) : globalIndex === 2 ? (
                        <Award className="h-4 w-4 text-amber-500 fill-amber-500/20 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30 text-[9px] font-bold flex items-center justify-center tabular-nums">
                          {globalIndex + 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
                      {getLogoUrl(item.url) ? (
                        <img 
                          src={getLogoUrl(item.url)} 
                          alt="" 
                          className="w-full h-full rounded-md object-cover border border-white/10"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full rounded-md border border-white/[0.08] bg-white/[0.03]" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col text-left min-w-0 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-glitch-blue text-xs truncate max-w-[100px] sm:max-w-[160px]">{item.owner_name}</span>
                      {item.slot_type && item.slot_type !== 'main' && (
                        <span className={`text-[8px] font-bold px-1 py-0.5 border uppercase tracking-widest hidden sm:inline-block ${
                          item.slot_type.includes('1') ? 'text-gold bg-gold/[0.05] border-gold/30' :
                          item.slot_type.includes('2') ? 'text-slate-300 bg-slate-300/[0.05] border-slate-400/30' :
                          'text-amber-500 bg-amber-700/[0.05] border-amber-600/30'
                        }`}>
                          {getSlotLabel(item.slot_type)}
                        </span>
                      )}
                      {tab === 'activity' && (
                        <span className="text-[9px] sm:text-[10px] text-white/25 shrink-0">
                          {formatTimeAgo(item.created_at)}
                          <span className="mx-1 opacity-40">·</span>
                          <span className="text-gold/60">Reigned: {getReignTimeStr(item)}</span>
                          <span className="mx-1 opacity-40">·</span>
                          {item.clicks || 0} clicks
                        </span>
                      )}
                      {tab === 'leaderboard' && (
                        <span className="text-[9px] sm:text-[10px] text-white/25 shrink-0 ml-1">
                          <span className="mx-1 opacity-40">·</span>
                          <span className="text-gold/60">Reigned: {getReignTimeStr(item)}</span>
                          <span className="mx-1 opacity-40">·</span>
                          {item.clicks || 0} clicks
                        </span>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        const isCurrentActive = history.length > 0 && item.id === history[0].id;
                        if (isCurrentActive && activeLinkId) {
                          onTrackClick?.('current', activeLinkId);
                        } else {
                          onTrackClick?.('history', item.id);
                        }
                      }}
                      className="text-white/40 hover:text-terminal-green/80 truncate text-[10px] sm:text-[11px] flex items-center gap-1.5 max-w-full mt-0.5 group transition-colors"
                    >
                      {tab === 'leaderboard' && getLogoUrl(item.url) && (
                        <img 
                          src={getLogoUrl(item.url)} 
                          alt="" 
                          className="w-3.5 h-3.5 rounded-sm object-cover shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <span className="truncate max-w-[140px] sm:max-w-[220px]">{item.label}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 inline opacity-40" />
                    </a>
                  </div>
                </div>

                <div className={`font-bold text-xs shrink-0 pl-2 tabular-nums px-2 py-0.5 border ${
                  tab === 'leaderboard' 
                    ? 'text-gold bg-gold/[0.08] border-gold/20' 
                    : 'text-terminal-green/70 bg-terminal-green/[0.06] border-terminal-green/15'
                }`}>
                  ${item.price_paid.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06] bg-white/[0.01] text-[10px] sm:text-[11px] font-mono">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1 font-bold border border-white/[0.06] transition-all"
          >
            <ChevronLeft className="h-3 w-3" /> PREV
          </button>
          
          <span className="text-white/25 font-mono text-[10px]">
            <span className="text-white/50 font-bold">{currentPage}</span> / <span className="text-white/50 font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1 font-bold border border-white/[0.06] transition-all"
          >
            NEXT <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
