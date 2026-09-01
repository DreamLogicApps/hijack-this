'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Plus, Minus, Globe, CheckCircle2 } from 'lucide-react';

interface HijackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
}

export function HijackModal({ isOpen, onClose, currentPrice }: HijackModalProps) {
  const minRequiredPrice = Number((currentPrice * 1.10).toFixed(2));
  
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newName, setNewName] = useState('');
  const [customPrice, setCustomPrice] = useState<string>(minRequiredPrice.toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [urlIcon, setUrlIcon] = useState<React.ReactNode>(<Globe className="h-4 w-4 text-terminal-green/50" />);
  const [isUrlValid, setIsUrlValid] = useState(false);

  // Reset loading state whenever modal opens or current price updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomPrice(minRequiredPrice.toFixed(2));
      setLoading(false);
      setError('');
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPrice, minRequiredPrice, isOpen]);

  // Reset loading state if user returns from checkout tab/back button
  useEffect(() => {
    const handlePageShow = () => {
      setLoading(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handlePageShow);
    };
  }, []);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const sanitizeInput = (input: string) => {
    return input.replace(/[<>]/g, '');
  };

  useEffect(() => {
    let checkUrl = newUrl.trim();
    if (checkUrl.startsWith('@')) {
      checkUrl = 'https://x.com/' + checkUrl.substring(1);
    } else if (checkUrl && !checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
      checkUrl = 'https://' + checkUrl;
    }

    if (isValidUrl(checkUrl)) {
      setIsUrlValid(true);
      try {
        const urlObj = new URL(checkUrl);
        const domain = urlObj.hostname.replace('www.', '');
        
        // Twitter/X logic
        if (domain === 'x.com' || domain === 'twitter.com') {
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            const handle = pathParts[0];
            setUrlIcon(
              <img src={`https://unavatar.io/twitter/${handle}`} alt="avatar" className="w-5 h-5 rounded-full border border-terminal-green/50 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            );
            return;
          }
        }
        
        // Default favicon
        setUrlIcon(
          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="favicon" className="w-4 h-4 rounded-sm object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
        );
      } catch (e) {
        setUrlIcon(<Globe className="h-4 w-4 text-terminal-green/50" />);
      }
    } else {
      setIsUrlValid(false);
      setUrlIcon(<Globe className="h-4 w-4 text-terminal-green/50" />);
    }
  }, [newUrl]);

  const handleUrlBlur = () => {
    let finalUrl = newUrl.trim();
    if (finalUrl.startsWith('@')) {
      finalUrl = 'https://x.com/' + finalUrl.substring(1);
      setNewUrl(finalUrl);
    } else if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
      setNewUrl(finalUrl);
    }
    
    if (isValidUrl(finalUrl)) {
      try {
        const urlObj = new URL(finalUrl);
        const domain = urlObj.hostname.replace('www.', '');
        const domainName = domain.split('.')[0];
        
        if (!newLabel) {
          setNewLabel(domainName.charAt(0).toUpperCase() + domainName.slice(1));
        }

        if (domain === 'x.com' || domain === 'twitter.com') {
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0 && !newName) {
            setNewName(pathParts[0]);
          }
        }
      } catch (e) {}
    }
  };

  const activePrice = Number(customPrice) || minRequiredPrice;

  const handleIncrement = (delta: number) => {
    const nextVal = Math.max(minRequiredPrice, Number((activePrice + delta).toFixed(2)));
    setCustomPrice(nextVal.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalUrl = newUrl.trim();
    if (finalUrl.startsWith('@')) {
      finalUrl = 'https://x.com/' + finalUrl.substring(1);
      setNewUrl(finalUrl); // update the input visually
    } else if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
      setNewUrl(finalUrl); // update the input visually
    }

    if (!isValidUrl(finalUrl)) {
      setError('Please enter a valid URL (e.g., example.com)');
      return;
    }

    if (!newLabel.trim() || !newName.trim()) {
      setError('Label and Alias are required.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    if (activePrice < minRequiredPrice) {
      setError(`Minimum bid required is $${minRequiredPrice.toFixed(2)}`);
      return;
    }

    setLoading(true);

    // Timeout safety fallback: auto reset button if redirect stalls
    const redirectTimeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUrl: finalUrl,
          newLabel: sanitizeInput(newLabel),
          newName: sanitizeInput(newName.startsWith('@') ? newName : `@${newName}`),
          customPrice: activePrice,
        }),
      });

      const data = await res.json();

      if (data.url) {
        clearTimeout(redirectTimeout);
        window.location.href = data.url;
      } else {
        clearTimeout(redirectTimeout);
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: unknown) {
      clearTimeout(redirectTimeout);
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.');
      } else {
        setError('Something went wrong.');
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) setLoading(false);
      onClose();
    }}>
      <DialogContent className="sm:max-w-[450px] bg-black border-terminal-green/60 text-terminal-green glow-box">
        <DialogHeader>
          <DialogTitle className="glitch-text text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" /> INITIATE HIJACK
          </DialogTitle>
          <DialogDescription className="text-terminal-green/70 font-mono text-xs">
            Outbid the champion. Min required bid is <span className="text-terminal-green font-bold">${minRequiredPrice.toFixed(2)}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-mono">
          {/* Custom Cyberpunk Bid Stepper Controls */}
          <div className="space-y-1.5 p-3 bg-terminal-green/5 border border-terminal-green/30">
            <div className="flex justify-between items-center">
              <Label htmlFor="customPrice" className="text-terminal-green uppercase text-xs tracking-widest font-bold">
                Your Bid Amount ($)
              </Label>
              <span className="text-[10px] text-terminal-green/60">Min: ${minRequiredPrice.toFixed(2)}</span>
            </div>

            {/* Retro Custom Input with Stepper Buttons */}
            <div className="flex items-center gap-1 bg-black border border-terminal-green/50 p-1">
              <button
                type="button"
                onClick={() => handleIncrement(-0.50)}
                disabled={activePrice <= minRequiredPrice}
                className="w-9 h-9 flex items-center justify-center bg-terminal-green/10 hover:bg-terminal-green/30 text-terminal-green disabled:opacity-20 font-bold text-lg border border-terminal-green/30 transition-colors"
                title="Decrease by $0.50"
              >
                <Minus className="h-4 w-4" />
              </button>

              <Input
                id="customPrice"
                type="number"
                step="any"
                min={minRequiredPrice}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="bg-transparent border-none text-yellow-400 font-black text-xl text-center focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-9"
                required
              />

              <button
                type="button"
                onClick={() => handleIncrement(0.50)}
                className="w-9 h-9 flex items-center justify-center bg-terminal-green/10 hover:bg-terminal-green/30 text-terminal-green font-bold text-lg border border-terminal-green/30 transition-colors"
                title="Increase by $0.50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Preset Shortcut Buttons */}
            <div className="flex gap-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => setCustomPrice(minRequiredPrice.toFixed(2))}
                className="flex-1 text-[10px] py-1 bg-terminal-green/10 hover:bg-terminal-green/30 text-terminal-green border border-terminal-green/30 font-bold uppercase transition-colors"
              >
                Min
              </button>
              <button
                type="button"
                onClick={() => setCustomPrice((minRequiredPrice + 1).toFixed(2))}
                className="flex-1 text-[10px] py-1 bg-terminal-green/10 hover:bg-terminal-green/30 text-terminal-green border border-terminal-green/30 font-bold uppercase transition-colors"
              >
                +$1
              </button>
              <button
                type="button"
                onClick={() => setCustomPrice((minRequiredPrice + 5).toFixed(2))}
                className="flex-1 text-[10px] py-1 bg-terminal-green/10 hover:bg-terminal-green/30 text-terminal-green border border-terminal-green/30 font-bold uppercase transition-colors"
              >
                +$5
              </button>
              <button
                type="button"
                onClick={() => setCustomPrice((currentPrice * 2).toFixed(2))}
                className="flex-1 text-[10px] py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/40 font-bold uppercase transition-colors"
              >
                2x
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newUrl" className="text-terminal-green uppercase text-xs tracking-widest flex justify-between items-center">
              <span>New Target URL</span>
              {isUrlValid && <span className="text-[10px] text-terminal-green font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> VALID</span>}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 pointer-events-none">
                {urlIcon}
              </div>
              <Input
                id="newUrl"
                placeholder="x.com/itsjack_dev"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onBlur={handleUrlBlur}
                className="bg-black/80 border-terminal-green/30 text-terminal-green focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-terminal-green/30 rounded-xl text-base pl-10 h-11 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newLabel" className="text-terminal-green uppercase text-xs tracking-widest">Display Text</Label>
            <Input
              id="newLabel"
              placeholder="The Ultimate Link"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="bg-black/80 border-terminal-green/30 text-terminal-green focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-terminal-green/30 rounded-xl text-sm h-11 px-4 transition-all"
              required
              maxLength={40}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newName" className="text-terminal-green uppercase text-xs tracking-widest">Your Alias / Handle</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-green/50 font-bold">@</span>
              <Input
                id="newName"
                placeholder="outbidking"
                value={newName.replace(/^@/, '')}
                onChange={(e) => setNewName(e.target.value.replace(/^@/, ''))}
                className="bg-black/80 border-terminal-green/30 text-terminal-green focus:border-terminal-green focus:ring-1 focus:ring-terminal-green/50 placeholder:text-terminal-green/30 rounded-xl text-sm h-11 pl-8 pr-4 transition-all"
                required
                maxLength={25}
              />
            </div>
          </div>

          {error && <p className="text-glitch-red text-xs font-bold pt-1">{error}</p>}

          <div className="flex items-start gap-2 pt-2 pb-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 accent-terminal-green w-3.5 h-3.5 bg-black border-terminal-green/50 cursor-pointer"
              required
            />
            <label htmlFor="terms" className="text-[10px] sm:text-xs text-terminal-green/70 leading-tight cursor-pointer">
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-terminal-green">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-terminal-green">Privacy Policy</a>. All sales are final and non-refundable.
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full bg-terminal-green text-black hover:bg-terminal-green/90 font-bold uppercase tracking-wider rounded-none crt-flicker py-5 text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'PROCESSING...' : `CONFIRM BID $${activePrice.toFixed(2)}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
