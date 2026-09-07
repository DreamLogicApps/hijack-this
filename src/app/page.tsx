'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { HijackModal } from '@/components/HijackModal';
import { StatsHeader } from '@/components/StatsHeader';
import { HistoryFeed, HistoryItem } from '@/components/HistoryFeed';
import { CyberQRModal } from '@/components/CyberQRModal';
import { MatrixRain } from '@/components/MatrixRain';
import { Loader2, ExternalLink, Copy, Check, Flame, AlertTriangle, QrCode, Zap, Crown, ArrowRight, MousePointerClick, Clock } from 'lucide-react';

interface LinkData {
  id: string;
  url: string;
  label: string;
  hijack_price: number;
  owner_name: string;
  updated_at: string;
  clicks?: number;
  slot_type?: string;
}

const FALLBACK_LINK: LinkData = {
  id: 'seed-id-1',
  url: 'https://youtube.com',
  label: "The Internet's Forgotten Scraps",
  hijack_price: 5.00,
  owner_name: 'System Admin',
  updated_at: new Date().toISOString(),
  slot_type: 'main',
};

const createFallback = (id: string, label: string, price: number, slotType: string): LinkData => ({
  id,
  url: 'https://hackrank.lol',
  label,
  hijack_price: price,
  owner_name: 'System',
  updated_at: new Date().toISOString(),
  slot_type: slotType,
});

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

/* ─── Slot Tier Config ─── */
const SLOT_TIERS: Record<string, { label: string; tier: string; borderClass: string; badgeColor: string; bgClass: string; hoverBorderClass: string }> = {
  ad_left_1:  { label: 'PRIME',    tier: '1', borderClass: 'slot-tier-prime',    badgeColor: 'bg-gold/20 text-gold border-gold/30', bgClass: 'bg-gradient-to-b from-gold/[0.04] to-black/80 border-white/[0.08]', hoverBorderClass: 'hover:border-gold/40 shadow-[0_0_15px_rgba(251,191,36,0)] hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]' },
  ad_right_1: { label: 'PRIME',    tier: '1', borderClass: 'slot-tier-prime',    badgeColor: 'bg-gold/20 text-gold border-gold/30', bgClass: 'bg-gradient-to-b from-gold/[0.04] to-black/80 border-white/[0.08]', hoverBorderClass: 'hover:border-gold/40 shadow-[0_0_15px_rgba(251,191,36,0)] hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]' },
  ad_left_2:  { label: 'FEATURED', tier: '2', borderClass: 'slot-tier-featured', badgeColor: 'bg-slate-400/20 text-slate-300 border-slate-400/30', bgClass: 'bg-black/70 border-white/[0.06]', hoverBorderClass: 'hover:border-slate-300/30' },
  ad_right_2: { label: 'FEATURED', tier: '2', borderClass: 'slot-tier-featured', badgeColor: 'bg-slate-400/20 text-slate-300 border-slate-400/30', bgClass: 'bg-black/70 border-white/[0.06]', hoverBorderClass: 'hover:border-slate-300/30' },
  ad_left_3:  { label: 'STARTER',  tier: '3', borderClass: 'slot-tier-starter',  badgeColor: 'bg-amber-700/20 text-amber-500 border-amber-600/30', bgClass: 'bg-black/40 border-white/[0.04]', hoverBorderClass: 'hover:border-amber-500/30 opacity-80 hover:opacity-100' },
  ad_right_3: { label: 'STARTER',  tier: '3', borderClass: 'slot-tier-starter',  badgeColor: 'bg-amber-700/20 text-amber-500 border-amber-600/30', bgClass: 'bg-black/40 border-white/[0.04]', hoverBorderClass: 'hover:border-amber-500/30 opacity-80 hover:opacity-100' },
};

const SponsoredSlotCard = ({ link, onHijack, onTrackClick }: { link: LinkData, onHijack: () => void, onTrackClick?: () => void }) => {
  const config = SLOT_TIERS[link.slot_type || ''] || SLOT_TIERS.ad_left_3;
  const [reignTime, setReignTime] = useState<string>('00:00:00');

  useEffect(() => {
    const calculateTime = () => {
      if (!link.updated_at || link.owner_name === 'System') return;
      const start = new Date(link.updated_at).getTime();
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
  }, [link.updated_at, link.owner_name]);
  
  return (
    <div className={`${config.borderClass} ${config.bgClass} ${config.hoverBorderClass} border backdrop-blur-sm transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden`}>
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative p-2.5 sm:p-3 space-y-2">
        {/* Tier Badge */}
        <div className={`inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border ${config.badgeColor}`}>
          {config.label}
        </div>
        
        {/* Link with Logo */}
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={onTrackClick} 
          className="flex items-center gap-2 group/link"
        >
          {getLogoUrl(link.url) && (
            <img 
              src={getLogoUrl(link.url)} 
              alt="" 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border border-white/10 object-cover shrink-0 group-hover/link:border-white/30 transition-colors"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-white/90 group-hover/link:text-white truncate transition-colors">
              {link.label}
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40 truncate">
              by {link.owner_name}
            </div>
          </div>
          <ExternalLink className="h-3 w-3 text-white/20 group-hover/link:text-white/50 shrink-0 transition-colors" />
        </a>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white/30">
              <span className="w-1 h-1 bg-glitch-red animate-pulse rounded-full inline-block"></span>
              {link.clicks || 0} clicks
            </div>
            {link.owner_name !== 'System' && (
              <div className="flex items-center gap-1 text-glitch-blue/60">
                <Clock className="w-2.5 h-2.5" />
                {reignTime}
              </div>
            )}
          </div>
          <div className="text-gold font-bold">${link.hijack_price.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Claim Button */}
      <button
        onClick={onHijack}
        className="w-full py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] hover:bg-terminal-green/20 text-white/50 hover:text-terminal-green border-t border-white/[0.06] transition-all duration-200 flex items-center justify-center gap-1"
      >
        CLAIM ${(link.hijack_price * 1.1).toFixed(2)}+
        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </button>
    </div>
  );
};

function HijackAppContent() {
  const searchParams = useSearchParams();
  const [linksData, setLinksData] = useState<LinkData[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlotType, setActiveSlotType] = useState('main');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [takeoverInfo, setTakeoverInfo] = useState<{ owner: string; price: number } | null>(null);
  const [siteDescription, setSiteDescription] = useState('');
  
  const currentPriceRef = useRef<number>(FALLBACK_LINK.hijack_price);

  const mainLink = linksData.find(l => l.slot_type === 'main') || FALLBACK_LINK;
  const leftAd1 = linksData.find(l => l.slot_type === 'ad_left_1') || createFallback('l1', 'Ad Spot Available', 3.00, 'ad_left_1');
  const leftAd2 = linksData.find(l => l.slot_type === 'ad_left_2') || createFallback('l2', 'Ad Spot Available', 2.00, 'ad_left_2');
  const leftAd3 = linksData.find(l => l.slot_type === 'ad_left_3') || createFallback('l3', 'Ad Spot Available', 1.00, 'ad_left_3');

  const rightAd1 = linksData.find(l => l.slot_type === 'ad_right_1') || createFallback('r1', 'Ad Spot Available', 3.00, 'ad_right_1');
  const rightAd2 = linksData.find(l => l.slot_type === 'ad_right_2') || createFallback('r2', 'Ad Spot Available', 2.00, 'ad_right_2');
  const rightAd3 = linksData.find(l => l.slot_type === 'ad_right_3') || createFallback('r3', 'Ad Spot Available', 1.00, 'ad_right_3');

  const allAdSlots = [leftAd1, rightAd1, leftAd2, rightAd2, leftAd3, rightAd3];

  const triggerTakeoverAnimation = (owner: string, price: number) => {
    setTakeoverInfo({ owner, price });
    setIsTakeoverActive(true);
    setTimeout(() => {
      setIsTakeoverActive(false);
    }, 2500);
  };

  const fetchData = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 4000)
      );

      const dbFetch = async () => {
        const { data: links, error: linkErr } = await supabase
          .from('current_link')
          .select('*');

        if (linkErr) throw linkErr;
        return links;
      };

      const links = await Promise.race([dbFetch(), timeoutPromise]) as LinkData[];
      if (links && links.length > 0) {
        setLinksData(links);
        const main = links.find(l => l.slot_type === 'main');
        if (main) currentPriceRef.current = main.hijack_price;
      }

      // Fetch history
      const { data: historyData } = await supabase
        .from('hijack_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyData && historyData.length > 0) {
        setHistory(historyData);
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const hasHandledSuccessRef = useRef(false);

  useEffect(() => {
    if (!mainLink.url && !FALLBACK_LINK.url) return;
    const urlToFetch = mainLink.url || FALLBACK_LINK.url;
    setSiteDescription('');
    
    const fetchMeta = async () => {
      try {
        const urlObj = new URL(urlToFetch);
        const domain = urlObj.hostname.replace('www.', '');
        if (domain === 'x.com' || domain === 'twitter.com') {
          setSiteDescription('X (Twitter) Profile');
          return;
        }

        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(urlToFetch)}`);
        const data = await res.json();
        if (data?.data?.description) {
          setSiteDescription(data.data.description);
        } else if (data?.data?.title) {
          setSiteDescription(data.data.title);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, [mainLink.url]);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      fetchData();
    }, 0);

    if (searchParams.get('success') === 'true') {
      if (hasHandledSuccessRef.current) return;
      hasHandledSuccessRef.current = true;

      const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
      const newUrl = searchParams.get('newUrl');
      const newLabel = searchParams.get('newLabel');
      const newName = searchParams.get('newName');
      const newPrice = searchParams.get('newPrice');
      const linkId = searchParams.get('linkId');
      const slotType = searchParams.get('slotType') || 'main';

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }

      if (newUrl && newLabel && newName && newPrice) {
        fetch('/api/confirm-hijack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, newUrl, newLabel, newName, newPrice, linkId, slotType }),
        }).then(async (res) => {
          if (res.ok) {
            fetchData();
            if (slotType === 'main') {
              triggerTakeoverAnimation(newName, parseFloat(newPrice));
            }
          } else {
            console.warn('🔒 Payment verification failed or rejected by gateway.');
            fetchData();
          }
        });
      } else {
        setTimeout(() => fetchData(), 0);
      }
    }

    let currentLinkChannel: ReturnType<typeof supabase.channel>;
    let historyChannel: ReturnType<typeof supabase.channel>;

    try {
      currentLinkChannel = supabase
        .channel('current-link-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'current_link' },
          (payload) => {
            const newData = payload.new as LinkData;
            if (newData) {
              setLinksData(prev => {
                const filtered = prev.filter(l => l.slot_type !== newData.slot_type);
                return [...filtered, newData];
              });
              
              if (newData.slot_type === 'main' && newData.hijack_price > currentPriceRef.current) {
                currentPriceRef.current = newData.hijack_price;
                triggerTakeoverAnimation(newData.owner_name, newData.hijack_price);
              }
            }
          }
        )
        .subscribe();

      historyChannel = supabase
        .channel('history-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hijack_history' },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setHistory((prev) => [payload.new as HistoryItem, ...prev.slice(0, 19)]);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              setHistory((prev) => 
                prev.map(item => item.id === payload.new.id ? (payload.new as HistoryItem) : item)
              );
            }
          }
        )
        .subscribe();
    } catch (subErr) {
      console.error('Supabase subscription error:', subErr);
    }

    return () => {
      clearTimeout(initTimer);
      if (currentLinkChannel) supabase.removeChannel(currentLinkChannel);
      if (historyChannel) supabase.removeChannel(historyChannel);
    };
  }, [searchParams]);

  const totalVolume = history.reduce((acc, item) => acc + (item.price_paid || 0), 0);
  const totalBids = history.length;

  const handleCopyLink = () => {
    if (!mainLink) return;
    navigator.clipboard.writeText(mainLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    if (!mainLink) return;
    const text = encodeURIComponent(`🚨 SYSTEM OVERRIDE 🚨\n\n${mainLink.owner_name} just seized the #1 spot on HackRank for $${mainLink.hijack_price.toFixed(2)}! 👑💰\n\nThey are currently siphoning all the site traffic. Do you have what it takes to overthrow them? 🗡️💻\n\n#HackRank #KingOfTheHill`);
    const shareUrl = `https://x.com/intent/post?text=${text}&url=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank');
  };

  const handleTrackClick = async (type: 'current' | 'history', id: string) => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-terminal-green font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-terminal-green opacity-80" />
          <p className="text-xs tracking-[0.3em] uppercase text-terminal-green/60">INITIALIZING HACKRANK...</p>
        </div>
      </div>
    );
  }

  const screenshotUrl = mainLink?.url 
    ? `https://api.microlink.io/?url=${encodeURIComponent(mainLink.url)}&screenshot=true&embed=screenshot.url`
    : null;

  const getActivePrice = () => {
    switch(activeSlotType) {
      case 'main': return mainLink.hijack_price;
      case 'ad_left_1': return leftAd1.hijack_price;
      case 'ad_left_2': return leftAd2.hijack_price;
      case 'ad_left_3': return leftAd3.hijack_price;
      case 'ad_right_1': return rightAd1.hijack_price;
      case 'ad_right_2': return rightAd2.hijack_price;
      case 'ad_right_3': return rightAd3.hijack_price;
      default: return 1.00;
    }
  };
  
  const currentActiveTargetPrice = getActivePrice();

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden bg-black noise-overlay">
      <MatrixRain />

      {screenshotUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt="Current Target Site Background"
            className="w-full h-full object-cover opacity-40 filter blur-lg contrast-110 saturate-110 animate-ken-burns transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/10 via-black/60 to-black/95" />
        </div>
      )}

      {isTakeoverActive && (
        <div className="fixed inset-0 pointer-events-none z-50 takeover-flash flex items-center justify-center border-4 sm:border-8 border-glitch-red">
          <div className="bg-black/95 p-4 sm:p-6 border-2 border-glitch-red text-center space-y-2 max-w-sm sm:max-w-md mx-3 shadow-[0_0_50px_rgba(255,0,60,0.8)]">
            <div className="flex items-center justify-center gap-2 text-glitch-red font-black text-lg sm:text-xl tracking-wider glitch-text">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" /> SYSTEM OVERRIDE <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce" />
            </div>
            <p className="text-white font-bold text-base sm:text-lg">
              NEW CHAMPION TAKEOVER!
            </p>
            {takeoverInfo && (
              <p className="text-gold font-mono text-xs sm:text-sm">
                <span className="text-glitch-blue">{takeoverInfo.owner}</span> paid ${takeoverInfo.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Container ─── */}
      <div className={`relative z-10 w-full max-w-5xl bg-black/90 backdrop-blur-xl border border-terminal-green/30 transition-all rounded-sm overflow-hidden ${
        isTakeoverActive ? 'takeover-shake border-glitch-red shadow-[0_0_30px_rgba(255,0,60,0.6)]' : 'glow-box'
      }`}>
        
        {/* Terminal Title Bar */}
        <div className="bg-gradient-to-r from-terminal-green/[0.08] via-terminal-green/[0.04] to-transparent border-b border-terminal-green/20 px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-glitch-red/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-terminal-green/80" />
            </div>
            <span className="font-bold text-terminal-green/80 tracking-wider text-[11px] sm:text-xs">HACKRANK.LOL</span>
            <span className="text-terminal-green/30 hidden sm:inline">—</span>
            <span className="text-terminal-green/30 text-[10px] hidden sm:inline">king of the hill</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-terminal-green/50">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" /> LIVE
          </div>
        </div>

        <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
          <StatsHeader
            currentPrice={mainLink.hijack_price}
            updatedAt={mainLink.updated_at}
            totalVolume={totalVolume}
            totalBids={totalBids}
          />

          {/* ─── Champion Card ─── */}
          <div className={`relative p-5 sm:p-7 md:p-10 bg-gradient-to-b from-black/95 via-black/90 to-black/95 border transition-all flex flex-col items-center text-center space-y-5 sm:space-y-6 overflow-hidden ${
            isTakeoverActive ? 'border-glitch-red' : 'border-terminal-green/30'
          }`}>
            {/* Subtle gradient aura behind champion */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(57,255,20,0.04)_0%,_transparent_70%)]" />

            {/* Left Cyberpunk Flank */}
            <div className="hidden md:flex absolute left-4 xl:left-8 top-0 bottom-0 flex-col justify-between py-8 pointer-events-none opacity-40 select-none z-0">
              <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 bg-terminal-green rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                <div className="w-px h-16 bg-gradient-to-b from-terminal-green to-transparent" />
              </div>
              <div 
                className="text-[9px] font-bold text-terminal-green tracking-[0.4em] uppercase rotate-180" 
                style={{ writingMode: 'vertical-rl' }}
              >
                CHAMPION_LOCK // ACTIVE
              </div>
              <div className="flex flex-col items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-5 h-0.5 ${i < 3 ? 'bg-terminal-green' : 'bg-terminal-green/20'}`} />
                ))}
              </div>
            </div>

            {/* Right Cyberpunk Flank */}
            <div className="hidden md:flex absolute right-4 xl:right-8 top-0 bottom-0 flex-col justify-between py-8 pointer-events-none opacity-40 select-none items-end z-0">
              <div className="flex flex-col items-end gap-1.5 font-mono text-[9px] text-glitch-blue text-right leading-none">
                <div>0xFF</div>
                <div>0x3A</div>
                <div className="animate-pulse font-bold">0x8B</div>
                <div>0x1C</div>
                <div className="opacity-50">0x00</div>
              </div>
              
              <div className="relative w-10 h-10 opacity-70">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-glitch-blue" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-glitch-blue" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-glitch-blue" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-glitch-blue" />
                <div className="absolute inset-1.5 border border-glitch-blue/30 rounded-full flex items-center justify-center animate-[spin_4s_linear_infinite]">
                  <div className="w-1 h-1 bg-glitch-blue rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 mr-4">
                <div className="w-px h-16 bg-gradient-to-t from-glitch-blue to-transparent" />
              </div>
            </div>
            
            {/* Champion Badge */}
            <div className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border border-gold/30 text-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase glow-gold">
              <Crown className="h-3.5 w-3.5 fill-gold/30 animate-float" />
              REIGNING CHAMPION: <span className="text-white font-black">{mainLink.owner_name}</span>
            </div>

            {/* Main Link Display */}
            <div className="relative py-3 sm:py-5 w-full flex flex-col items-center gap-3">
              <a
                href={mainLink.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => mainLink.id && handleTrackClick('current', mainLink.id)}
                className="group inline-flex items-center justify-center gap-3 sm:gap-4 text-xl sm:text-3xl md:text-4xl font-black text-terminal-green hover:text-white transition-all duration-300 break-all max-w-full"
              >
                {getLogoUrl(mainLink.url) && (
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 bg-terminal-green/20 rounded-xl blur-md group-hover:bg-white/20 transition-colors" />
                    <img 
                      src={getLogoUrl(mainLink.url)} 
                      alt="Logo" 
                      className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl border-2 border-terminal-green/40 group-hover:border-white/50 transition-colors object-cover shadow-lg"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
                <span className="truncate max-w-[220px] sm:max-w-md glow-text">{mainLink.label}</span>
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </a>
              
              {/* Click Counter */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-terminal-green/60">
                <span className="flex items-center gap-1.5 bg-terminal-green/[0.06] border border-terminal-green/15 px-2.5 py-1 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-glitch-red animate-pulse rounded-full inline-block" />
                  <span className="font-bold text-terminal-green/80">{mainLink.clicks || 0}</span> CLICKS
                </span>
              </div>
            </div>

            {/* Site Description */}
            {siteDescription && (
              <p className="text-terminal-green/40 text-[11px] sm:text-xs font-mono italic leading-relaxed line-clamp-2 max-w-sm sm:max-w-md px-4">
                &quot;{siteDescription}&quot;
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px]">
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-terminal-green/15 text-terminal-green/70 hover:text-terminal-green border border-terminal-green/15 hover:border-terminal-green/30 flex items-center gap-1.5 transition-all duration-200"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'COPIED!' : 'COPY URL'}
              </button>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-terminal-green/15 text-terminal-green/70 hover:text-terminal-green border border-terminal-green/15 hover:border-terminal-green/30 flex items-center gap-1.5 transition-all duration-200"
              >
                <QrCode className="h-3 w-3" /> QR
              </button>
              <button
                onClick={handleShareX}
                className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-terminal-green/15 text-terminal-green/70 hover:text-terminal-green border border-terminal-green/15 hover:border-terminal-green/30 flex items-center gap-1.5 transition-all duration-200"
              >
                <span className="font-bold leading-none text-[12px]">𝕏</span> POST
              </button>
            </div>

            {/* HIJACK CTA Button */}
            <div className="w-full pt-3 pb-1 flex justify-center">
              <button
                onClick={() => { setActiveSlotType('main'); setIsModalOpen(true); }}
                className="w-full max-w-xs sm:max-w-sm relative overflow-hidden group flex items-center justify-center gap-2 bg-gradient-to-r from-terminal-green via-terminal-green to-[#00f0ff] px-6 py-3.5 sm:py-4 text-black font-bold text-sm sm:text-base tracking-wide animate-pulse-ring transition-all duration-300 active:scale-95 hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-glitch-red drop-shadow-[0_0_4px_rgba(255,0,60,0.8)] group-hover:scale-110 transition-transform duration-300" />
                  HIJACK FOR ${(mainLink.hijack_price * 1.10).toFixed(2)}+
                </span>
              </button>
            </div>
          </div>

          {/* ─── Sponsored Slots Section ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-slot-cyan" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Sponsored Slots</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/25 font-mono">6 positions available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* Prime Column */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <SponsoredSlotCard link={leftAd1} onTrackClick={() => leftAd1.id && handleTrackClick('current', leftAd1.id)} onHijack={() => { setActiveSlotType(leftAd1.slot_type || 'main'); setIsModalOpen(true); }} />
                <SponsoredSlotCard link={rightAd1} onTrackClick={() => rightAd1.id && handleTrackClick('current', rightAd1.id)} onHijack={() => { setActiveSlotType(rightAd1.slot_type || 'main'); setIsModalOpen(true); }} />
              </div>
              
              {/* Featured Column */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <SponsoredSlotCard link={leftAd2} onTrackClick={() => leftAd2.id && handleTrackClick('current', leftAd2.id)} onHijack={() => { setActiveSlotType(leftAd2.slot_type || 'main'); setIsModalOpen(true); }} />
                <SponsoredSlotCard link={rightAd2} onTrackClick={() => rightAd2.id && handleTrackClick('current', rightAd2.id)} onHijack={() => { setActiveSlotType(rightAd2.slot_type || 'main'); setIsModalOpen(true); }} />
              </div>

              {/* Starter Column */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <SponsoredSlotCard link={leftAd3} onTrackClick={() => leftAd3.id && handleTrackClick('current', leftAd3.id)} onHijack={() => { setActiveSlotType(leftAd3.slot_type || 'main'); setIsModalOpen(true); }} />
                <SponsoredSlotCard link={rightAd3} onTrackClick={() => rightAd3.id && handleTrackClick('current', rightAd3.id)} onHijack={() => { setActiveSlotType(rightAd3.slot_type || 'main'); setIsModalOpen(true); }} />
              </div>
            </div>
          </div>

          {/* ─── History / Leaderboard ─── */}
          <HistoryFeed history={history} onTrackClick={handleTrackClick} activeLinkId={mainLink?.id} />

        </div>
      </div>

      {isModalOpen && (
        <HijackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentPrice={currentActiveTargetPrice}
          slotType={activeSlotType}
        />
      )}

      {mainLink && (
        <CyberQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          url={mainLink.url}
          label={mainLink.label}
          ownerName={mainLink.owner_name}
        />
      )}

      {/* ─── How It Works Strip ─── */}
      <div className="relative z-10 w-full max-w-5xl mt-6 sm:mt-8">
        <div className="border border-white/[0.06] bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/30 text-center mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3 text-left">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full border border-terminal-green/30 bg-terminal-green/10 flex items-center justify-center text-terminal-green font-bold text-xs">1</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white/80">Pay to Hijack</div>
                <div className="text-[10px] sm:text-xs text-white/30 leading-relaxed">Outbid the current champion with a higher bid.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold font-bold text-xs">2</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white/80">Claim the Throne</div>
                <div className="text-[10px] sm:text-xs text-white/30 leading-relaxed">Your link goes live instantly for all visitors.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full border border-glitch-blue/30 bg-glitch-blue/10 flex items-center justify-center text-glitch-blue font-bold text-xs">3</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white/80">Reign Supreme</div>
                <div className="text-[10px] sm:text-xs text-white/30 leading-relaxed">Hold your position until someone outbids you.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 w-full max-w-5xl mt-6 py-6 text-center font-mono">
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-white/25">
          <p>© {new Date().getFullYear()} HACKRANK.LOL</p>
          <span className="hidden sm:inline text-white/10">•</span>
          <a href="https://x.com/itsjack_dev" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green/60 transition-colors flex items-center gap-1">
            <span className="font-bold text-[12px]">𝕏</span> @itsjack_dev
          </a>
          <span className="hidden sm:inline text-white/10">•</span>
          <Link href="/about" className="hover:text-terminal-green/60 transition-colors uppercase tracking-widest">
            About / Rules
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-terminal-green font-mono">
        <Loader2 className="h-8 w-8 animate-spin text-terminal-green opacity-60" />
      </div>
    }>
      <HijackAppContent />
    </Suspense>
  );
}
