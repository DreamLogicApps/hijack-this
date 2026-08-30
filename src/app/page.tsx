'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HijackModal } from '@/components/HijackModal';
import { StatsHeader } from '@/components/StatsHeader';
import { HistoryFeed, HistoryItem } from '@/components/HistoryFeed';
import { CyberQRModal } from '@/components/CyberQRModal';
import { MatrixRain } from '@/components/MatrixRain';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Copy, Check, Share2, Flame, AlertTriangle, Eye, QrCode } from 'lucide-react';

interface LinkData {
  id: string;
  url: string;
  label: string;
  hijack_price: number;
  owner_name: string;
  updated_at: string;
  clicks?: number;
}

const FALLBACK_LINK: LinkData = {
  id: 'seed-id-1',
  url: 'https://youtube.com',
  label: "The Internet's Forgotten Scraps",
  hijack_price: 5.00,
  owner_name: 'System Admin',
  updated_at: new Date().toISOString(),
};

function HijackAppContent() {
  const searchParams = useSearchParams();
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTakeoverActive, setIsTakeoverActive] = useState(false);
  const [takeoverInfo, setTakeoverInfo] = useState<{ owner: string; price: number } | null>(null);
  const currentPriceRef = useRef<number>(0);

  const triggerTakeoverAnimation = (owner: string, price: number) => {
    setTakeoverInfo({ owner, price });
    setIsTakeoverActive(true);
    setTimeout(() => {
      setIsTakeoverActive(false);
    }, 2500);
  };

  const fetchData = async () => {
    try {
      // Set safety timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 4000)
      );

      const dbFetch = async () => {
        const { data: link, error: linkErr } = await supabase
          .from('current_link')
          .select('*')
          .limit(1)
          .single();

        if (linkErr) throw linkErr;
        return link;
      };

      const link = await Promise.race([dbFetch(), timeoutPromise]) as LinkData;
      if (link) {
        setLinkData(link);
        currentPriceRef.current = link.hijack_price;
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
      // Fallback to default link so mobile never hangs
      setLinkData((prev) => prev || FALLBACK_LINK);
    } finally {
      setLoading(false);
    }
  };

  const hasHandledSuccessRef = useRef(false);

  useEffect(() => {
    // Avoid synchronous state updates inside useEffect
    const initTimer = setTimeout(() => {
      fetchData();
    }, 0);

    // Check if query params indicate success redirect
    if (searchParams.get('success') === 'true') {
      if (hasHandledSuccessRef.current) return;
      hasHandledSuccessRef.current = true;

      const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
      const newUrl = searchParams.get('newUrl');
      const newLabel = searchParams.get('newLabel');
      const newName = searchParams.get('newName');
      const newPrice = searchParams.get('newPrice');
      const linkId = searchParams.get('linkId');

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }

      if (newUrl && newLabel && newName && newPrice) {
        fetch('/api/confirm-hijack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, newUrl, newLabel, newName, newPrice, linkId }),
        }).then(async (res) => {
          if (res.ok) {
            fetchData();
            triggerTakeoverAnimation(newName, parseFloat(newPrice));
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
      // Subscribe to current_link changes
      currentLinkChannel = supabase
        .channel('current-link-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'current_link' },
          (payload) => {
            const newData = payload.new as LinkData;
            if (newData) {
              setLinkData(newData);
              // Only trigger animation if the price actually increased (meaning a new takeover, not just a click)
              if (newData.hijack_price > currentPriceRef.current) {
                currentPriceRef.current = newData.hijack_price;
                triggerTakeoverAnimation(newData.owner_name, newData.hijack_price);
              }
            }
          }
        )
        .subscribe();

      // Subscribe to hijack_history changes
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

  const activeLink = linkData || FALLBACK_LINK;
  const totalVolume = history.reduce((acc, item) => acc + (item.price_paid || 0), 0);
  const totalBids = history.length;

  const handleCopyLink = () => {
    if (!activeLink) return;
    navigator.clipboard.writeText(activeLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    if (!activeLink) return;
    const text = encodeURIComponent(`🔥 ${activeLink.owner_name} is currently holding the #1 link on HijackThis for $${activeLink.hijack_price.toFixed(2)}!\n\nCan you outbid them?`);
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

  // Generate dynamic live website screenshot preview URL via Microlink API
  const screenshotUrl = activeLink?.url 
    ? `https://api.microlink.io/?url=${encodeURIComponent(activeLink.url)}&screenshot=true&embed=screenshot.url`
    : null;

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden bg-black">
      {/* 💚 Layer 1: Digital Binary Matrix Rain Animation */}
      <MatrixRain />

      {/* 🌐 Layer 2: Phantom Background Site Projection with Ken-Burns Motion */}
      {screenshotUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshotUrl}
            alt="Current Target Site Background"
            className="w-full h-full object-cover opacity-50 filter blur-md contrast-125 saturate-125 animate-ken-burns transition-all duration-1000"
          />
          {/* Dark Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/70 to-black/95" />
        </div>
      )}

      {/* Fullscreen Dramatic Glitch Flash Overlay */}
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

      {/* Background Floating 404 & Cyber Status Codes */}
      <div className="absolute inset-0 pointer-events-none opacity-20 sm:opacity-30 select-none font-mono text-[9px] sm:text-[10px] z-0">
        <div className="absolute top-[5%] left-[2%] text-glitch-red rotate-12 animate-pulse">404_LINK_CORRUPTED</div>
        <div className="absolute top-[88%] left-[4%] text-glitch-blue -rotate-6">HTTP_402_PAYMENT_REQUIRED</div>
        <div className="absolute top-[12%] right-[3%] text-terminal-green rotate-45">STATUS: OVERRIDDEN</div>
        <div className="absolute top-[80%] right-[5%] text-glitch-red -rotate-12">UNAUTHORIZED_ACCESS</div>
      </div>

      {/* Main Retro Terminal Window */}
      <div className={`relative z-10 w-full max-w-xl bg-black/90 backdrop-blur-xl border-2 border-terminal-green/60 glow-box transition-all ${
        isTakeoverActive ? 'takeover-shake border-glitch-red shadow-[0_0_30px_rgba(255,0,60,0.6)]' : ''
      }`}>
        
        {/* Terminal Header Bar */}
        <div className="bg-terminal-green/10 border-b border-terminal-green/50 p-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-glitch-red animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
            <span className="font-bold text-terminal-green tracking-wider pl-1 text-[11px] sm:text-xs">HIJACKTHIS.SITE</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-terminal-green/70">
            <span className="inline-block w-2 h-2 rounded-full bg-terminal-green animate-ping" /> LIVE REIGN
          </div>
        </div>

        {/* Inner Padding */}
        <div className="p-2.5 sm:p-4 md:p-5 space-y-3 sm:space-y-4">

          {/* Stats Bar Header */}
          <StatsHeader
            currentPrice={activeLink.hijack_price}
            updatedAt={activeLink.updated_at}
            totalVolume={totalVolume}
            totalBids={totalBids}
          />


          {/* Central Focal Champion Box */}
          <div className={`relative p-3 sm:p-6 md:p-8 bg-black/95 border-2 transition-all flex flex-col items-center text-center space-y-4 sm:space-y-5 glow-box ${
            isTakeoverActive ? 'border-glitch-red' : 'border-terminal-green/80'
          }`}>
            {/* Champion Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase max-w-full truncate">
              <Flame className="h-3.5 w-3.5 fill-yellow-400 shrink-0" /> REIGNING CHAMPION: <span className="text-white underline truncate">{activeLink.owner_name}</span>
            </div>

            {/* The Focal Point: ONE Glowing Functioning Stylized Link */}
            <div className="py-2 sm:py-4 w-full flex flex-col items-center gap-2">
              <a
                href={activeLink.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => activeLink.id && handleTrackClick('current', activeLink.id)}
                className="group inline-flex items-center justify-center gap-1.5 text-xl sm:text-3xl md:text-4xl font-black text-terminal-green hover:text-white transition-all duration-300 glow-text underline decoration-terminal-green decoration-2 underline-offset-8 break-all max-w-full"
              >
                <span className="truncate max-w-[260px] sm:max-w-md">{activeLink.label}</span>
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
              <div className="mt-3 mb-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-terminal-green/80 bg-terminal-green/10 border border-terminal-green/20 px-2.5 py-1 uppercase tracking-widest shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]">
                <span className="w-1.5 h-1.5 bg-glitch-red animate-ping rounded-full inline-block"></span>
                <span className="font-bold text-terminal-green glow-text">{activeLink.clicks || 0} CLICKS</span>
              </div>
            </div>

            {/* Background Site Indicator */}
            <div className="hidden sm:flex items-center gap-1 text-[9px] sm:text-[10px] text-terminal-green/80 font-mono bg-terminal-green/10 px-2 sm:px-2.5 py-1 border border-terminal-green/30 max-w-full truncate">
              <Eye className="h-3 w-3 text-glitch-blue shrink-0" />
              <span className="truncate">PHANTOM BACKGROUND PROJECTING: <span className="text-yellow-400 font-bold">{activeLink.url}</span></span>
            </div>

            {/* Action Toolbar */}
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
                <Share2 className="h-3.5 w-3.5" /> SHARE ON X
              </button>
            </div>

            {/* Primary Call to Action */}
            <div className="w-full pt-2 sm:pt-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-terminal-green text-black hover:bg-terminal-green/90 font-black text-sm sm:text-base uppercase tracking-widest py-4 sm:py-6 rounded-none crt-flicker shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-transform active:scale-[0.98]"
              >
                ⚡ HIJACK FOR ${(activeLink.hijack_price * 1.10).toFixed(2)}+
              </Button>
            </div>
          </div>

          {/* History Feed & Leaderboard Tabs */}
          <HistoryFeed history={history} onTrackClick={handleTrackClick} />

        </div>
      </div>

      {/* Hijack Modal */}
      {activeLink && (
        <HijackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentPrice={activeLink.hijack_price}
        />
      )}

      {/* Cyber QR Code Overlay Modal */}
      {activeLink && (
        <CyberQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          url={activeLink.url}
          label={activeLink.label}
          ownerName={activeLink.owner_name}
        />
      )}
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
