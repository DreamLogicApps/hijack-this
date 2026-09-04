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
import { Loader2, ExternalLink, Copy, Check, Flame, AlertTriangle, QrCode } from 'lucide-react';

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

const AdSlotCard = ({ link, onHijack, align, size = 'md' }: { link: LinkData, onHijack: () => void, align: 'left' | 'right', size?: 'lg' | 'md' | 'sm' }) => {
  const containerClass = size === 'lg' ? 'p-3' : size === 'md' ? 'p-2' : 'p-1.5';
  const labelClass = size === 'lg' ? 'text-sm sm:text-base' : size === 'md' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs';
  const titleClass = size === 'lg' ? 'text-[9px] sm:text-[10px]' : 'text-[8px] sm:text-[9px]';
  const buttonClass = size === 'lg' ? 'text-[10px] sm:text-xs py-2' : size === 'md' ? 'text-[9px] sm:text-[10px] py-1.5' : 'text-[8px] sm:text-[9px] py-1';
  
  return (
    <div className={`${containerClass} border border-glitch-blue/50 bg-black/80 text-center flex flex-col items-center gap-1 hover:border-glitch-blue transition-colors group relative shadow-[0_0_15px_rgba(0,188,212,0.1)] h-full justify-between w-full`}>
      <div className="w-full">
        <div className={`${titleClass} font-bold text-glitch-blue uppercase tracking-widest bg-glitch-blue/10 px-2 py-1 border border-glitch-blue/30 w-full mb-2`}>
          {align === 'left' ? 'L' : 'R'} {link.slot_type?.split('_')[2]} AD SLOT
        </div>
        
        <a href={link.url} target="_blank" rel="noopener noreferrer" className={`group-hover:text-white text-glitch-blue transition-colors font-bold ${labelClass} break-all flex items-center justify-center gap-1.5 max-w-full`}>
          {getLogoUrl(link.url) && (
            <img 
              src={getLogoUrl(link.url)} 
              alt="Logo" 
              className={`${size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} rounded-sm border border-glitch-blue/30 group-hover:border-white/50 transition-colors object-cover shrink-0`}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <span className="truncate underline decoration-glitch-blue/50 underline-offset-4">{link.label}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
        
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <div className={`text-[10px] text-glitch-blue/70 font-mono`}>
            by <span className="font-bold text-glitch-blue">{link.owner_name}</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-glitch-blue/50 font-mono bg-glitch-blue/10 px-1.5 py-0.5 border border-glitch-blue/20">
            <span className="w-1 h-1 bg-glitch-red animate-ping rounded-full inline-block"></span>
            {link.clicks || 0} CLICKS
          </div>
        </div>
      </div>
      
      <button
        onClick={onHijack}
        className={`mt-2 w-full border border-glitch-blue/50 bg-glitch-blue/10 hover:bg-glitch-blue/20 text-glitch-blue ${buttonClass} font-bold font-mono transition-all active:scale-95`}
      >
        HIJACK ${(link.hijack_price * 1.1).toFixed(2)}+
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
        <div className="flex flex-col items-center gap-4 crt-flicker">
          <Loader2 className="h-10 w-10 animate-spin text-terminal-green" />
          <p className="glitch-text text-sm tracking-widest uppercase">INITIALIZING HIJACK_OS...</p>
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
    <main className="min-h-screen relative flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden bg-black">
      <MatrixRain />

      {screenshotUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt="Current Target Site Background"
            className="w-full h-full object-cover opacity-50 filter blur-md contrast-125 saturate-125 animate-ken-burns transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/70 to-black/95" />
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
              <p className="text-yellow-400 font-mono text-xs sm:text-sm">
                <span className="text-glitch-blue">{takeoverInfo.owner}</span> paid ${takeoverInfo.price.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none opacity-20 sm:opacity-30 select-none font-mono text-[9px] sm:text-[10px] z-0">
        <div className="absolute top-[5%] left-[2%] text-glitch-red rotate-12 animate-pulse">404_LINK_CORRUPTED</div>
        <div className="absolute top-[88%] left-[4%] text-glitch-blue -rotate-6">HTTP_402_PAYMENT_REQUIRED</div>
        <div className="absolute top-[12%] right-[3%] text-terminal-green rotate-45">STATUS: OVERRIDDEN</div>
        <div className="absolute top-[80%] right-[5%] text-glitch-red -rotate-12">UNAUTHORIZED_ACCESS</div>
      </div>

      <div className={`relative z-10 w-full max-w-5xl bg-black/90 backdrop-blur-xl border-2 border-terminal-green/60 glow-box transition-all ${
        isTakeoverActive ? 'takeover-shake border-glitch-red shadow-[0_0_30px_rgba(255,0,60,0.6)]' : ''
      }`}>
        
        <div className="bg-terminal-green/10 border-b border-terminal-green/50 p-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-glitch-red animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
            <span className="font-bold text-terminal-green tracking-wider pl-1 text-[11px] sm:text-xs">HACKRANK.LOL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-terminal-green/70">
            <span className="inline-block w-2 h-2 rounded-full bg-terminal-green animate-ping" /> LIVE REIGN
          </div>
        </div>

        <div className="p-2.5 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
          <StatsHeader
            currentPrice={mainLink.hijack_price}
            updatedAt={mainLink.updated_at}
            totalVolume={totalVolume}
            totalBids={totalBids}
          />

          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 w-full">
            
            {/* Left Ad Column */}
            <div className="lg:col-span-1 hidden lg:flex flex-col gap-3 justify-start h-full">
              <AdSlotCard link={leftAd1} align="left" size="lg" onHijack={() => { setActiveSlotType('ad_left_1'); setIsModalOpen(true); }} />
              <AdSlotCard link={leftAd2} align="left" size="md" onHijack={() => { setActiveSlotType('ad_left_2'); setIsModalOpen(true); }} />
              <AdSlotCard link={leftAd3} align="left" size="sm" onHijack={() => { setActiveSlotType('ad_left_3'); setIsModalOpen(true); }} />
            </div>

            <div className={`lg:col-span-2 relative p-4 sm:p-6 md:p-8 bg-black/95 border-2 transition-all flex flex-col items-center text-center space-y-4 sm:space-y-5 glow-box h-full ${
              isTakeoverActive ? 'border-glitch-red' : 'border-terminal-green/80'
            }`}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase max-w-full truncate">
                <Flame className="h-3.5 w-3.5 fill-yellow-400 shrink-0" /> REIGNING CHAMPION: <span className="text-white underline truncate">{mainLink.owner_name}</span>
              </div>

              <div className="py-2 sm:py-4 w-full flex flex-col items-center gap-2">
                <a
                  href={mainLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => mainLink.id && handleTrackClick('current', mainLink.id)}
                  className="group inline-flex items-center justify-center gap-3 sm:gap-4 text-xl sm:text-3xl md:text-4xl font-black text-terminal-green hover:text-white transition-all duration-300 glow-text break-all max-w-full"
                >
                  {getLogoUrl(mainLink.url) && (
                    <img 
                      src={getLogoUrl(mainLink.url)} 
                      alt="Logo" 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl border-2 border-terminal-green/50 group-hover:border-white transition-colors object-cover shrink-0 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <span className="truncate max-w-[220px] sm:max-w-md underline decoration-terminal-green decoration-2 underline-offset-8">{mainLink.label}</span>
                  <ExternalLink className="h-4 w-4 sm:h-6 sm:w-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </a>
                <div className="mt-3 mb-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-terminal-green/80 bg-terminal-green/10 border border-terminal-green/20 px-2.5 py-1 uppercase tracking-widest shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]">
                  <span className="w-1.5 h-1.5 bg-glitch-red animate-ping rounded-full inline-block"></span>
                  <span className="font-bold text-terminal-green glow-text">{mainLink.clicks || 0} CLICKS</span>
                </div>
              </div>

              {siteDescription && (
                <div className="text-center px-4 max-w-sm sm:max-w-md">
                  <p className="text-terminal-green/60 text-[11px] sm:text-xs font-mono italic leading-relaxed line-clamp-2">
                    &quot;{siteDescription}&quot;
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 font-mono text-[11px] sm:text-xs">
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1.5 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green border border-terminal-green/30 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-terminal-green" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'COPIED!' : 'COPY URL'}
                </button>
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-2.5 py-1.5 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green border border-terminal-green/30 flex items-center gap-1 transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5" /> QR CODE
                </button>
                <button
                  onClick={handleShareX}
                  className="px-2.5 py-1.5 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green border border-terminal-green/30 flex items-center gap-1 transition-colors"
                >
                  <span className="font-bold leading-none text-[13px] -mt-[1px]">𝕏</span>
                  POST
                </button>
              </div>

              <div className="w-full pt-5 pb-2 flex justify-center mt-auto">
                <button
                  onClick={() => { setActiveSlotType('main'); setIsModalOpen(true); }}
                  className="w-full max-w-xs sm:max-w-sm relative overflow-hidden group flex items-center justify-center gap-2 rounded-full bg-terminal-green px-6 py-3.5 text-black font-bold text-sm sm:text-base animate-breathe-glow transition-all duration-300 active:scale-95"
                >
                  <div className="absolute top-0 left-0 h-full w-0 bg-white group-hover:w-full transition-all duration-300 ease-out z-0"></div>
                  <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-0 left-0 h-full w-[40px] bg-white/40 mix-blend-overlay blur-[2px] animate-[sweep_4s_infinite_ease-in-out]"></div>
                  </div>

                  <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm transition-colors duration-300">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff0000] drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform duration-300" />
                    HIJACK FOR ${(mainLink.hijack_price * 1.10).toFixed(2)}+
                  </span>
                </button>
              </div>
            </div>

            {/* Right Ad Column */}
            <div className="lg:col-span-1 hidden lg:flex flex-col gap-3 justify-start h-full">
              <AdSlotCard link={rightAd1} align="right" size="lg" onHijack={() => { setActiveSlotType('ad_right_1'); setIsModalOpen(true); }} />
              <AdSlotCard link={rightAd2} align="right" size="md" onHijack={() => { setActiveSlotType('ad_right_2'); setIsModalOpen(true); }} />
              <AdSlotCard link={rightAd3} align="right" size="sm" onHijack={() => { setActiveSlotType('ad_right_3'); setIsModalOpen(true); }} />
            </div>
            
            {/* Mobile Ads Layout (2-column stack) */}
            <div className="grid grid-cols-2 gap-2 lg:hidden mt-2">
              <AdSlotCard link={leftAd1} align="left" size="md" onHijack={() => { setActiveSlotType('ad_left_1'); setIsModalOpen(true); }} />
              <AdSlotCard link={rightAd1} align="right" size="md" onHijack={() => { setActiveSlotType('ad_right_1'); setIsModalOpen(true); }} />
              <AdSlotCard link={leftAd2} align="left" size="sm" onHijack={() => { setActiveSlotType('ad_left_2'); setIsModalOpen(true); }} />
              <AdSlotCard link={rightAd2} align="right" size="sm" onHijack={() => { setActiveSlotType('ad_right_2'); setIsModalOpen(true); }} />
              <AdSlotCard link={leftAd3} align="left" size="sm" onHijack={() => { setActiveSlotType('ad_left_3'); setIsModalOpen(true); }} />
              <AdSlotCard link={rightAd3} align="right" size="sm" onHijack={() => { setActiveSlotType('ad_right_3'); setIsModalOpen(true); }} />
            </div>

          </div>

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

      <footer className="w-full mt-12 py-8 text-center text-[10px] sm:text-xs text-terminal-green/40 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        <p>© {new Date().getFullYear()} HACKRANK.LOL - SYSTEM OPERATIONAL</p>
        <span className="hidden sm:inline text-terminal-green/20">•</span>
        <a href="https://x.com/itsjack_dev" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors uppercase tracking-widest border-b border-transparent hover:border-terminal-green/50 flex items-center gap-1">
          <span className="font-bold text-[12px] -mt-[1px]">𝕏</span> Created by @itsjack_dev
        </a>
        <span className="hidden sm:inline text-terminal-green/20">•</span>
        <Link href="/about" className="hover:text-terminal-green transition-colors uppercase tracking-widest border-b border-transparent hover:border-terminal-green/50">
          About / Rules
        </Link>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-terminal-green font-mono">
        <Loader2 className="h-10 w-10 animate-spin text-terminal-green" />
      </div>
    }>
      <HijackAppContent />
    </Suspense>
  );
}
