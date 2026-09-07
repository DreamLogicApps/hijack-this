import Link from 'next/link';
import { ArrowLeft, Shield, Zap, TrendingUp, Skull, Star } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black noise-overlay p-4 sm:p-8 font-mono relative flex flex-col items-center">
      <MatrixRain />

      <div className="max-w-4xl w-full relative z-10 space-y-8 mt-8 sm:mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-terminal-green transition-colors uppercase tracking-widest text-sm mb-2">
          <ArrowLeft className="w-4 h-4" /> Return to Terminal
        </Link>

        <header className="border-l-4 border-terminal-green pl-6 space-y-2 py-2">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter glitch-text text-white">
            About HackRank
          </h1>
          <p className="text-white/50 text-lg">The ultimate King-of-the-Hill link battle.</p>
        </header>

        <section className="bg-black/60 backdrop-blur-md border border-white/[0.06] p-6 sm:p-8 rounded-sm glow-box space-y-8 text-sm sm:text-base leading-relaxed">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
              <Skull className="w-6 h-6 text-terminal-green" />
              <h2 className="text-2xl font-bold uppercase tracking-wider text-terminal-green">The Main Throne</h2>
            </div>
            
            <p className="text-white/80">
              Welcome to <span className="font-bold text-white">HackRank.lol</span>. The main event is the Champion Slot — a massive, focal spotlight for the entire internet to see.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <Zap className="w-5 h-5 text-glitch-red" />
                <h3 className="font-bold uppercase text-glitch-red tracking-wide">1. Seize Control</h3>
                <p className="text-white/60">Pay the current bounty to instantly hijack the #1 spot. The moment your transaction clears, your link goes live globally.</p>
              </div>
              
              <div className="space-y-3">
                <TrendingUp className="w-5 h-5 text-terminal-green" />
                <h3 className="font-bold uppercase tracking-wide">2. The Price Inflates</h3>
                <p className="text-white/60">Every time the spot is hijacked, the minimum required bid increases by 10%. The longer the game goes, the higher the stakes.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold uppercase text-white mt-6 pt-4">Exclusive Features of the Crown</h3>
            <ul className="list-none space-y-4 pt-2">
              <li className="flex gap-3">
                <span className="text-terminal-green font-bold">▶</span>
                <div>
                  <strong className="text-white uppercase tracking-wider block mb-1">Global Background Projection</strong>
                  When you win the bid, a live, full-screen screenshot of your website is dynamically generated and permanently projected into the background of HackRank for all visitors to see.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-terminal-green font-bold">▶</span>
                <div>
                  <strong className="text-white uppercase tracking-wider block mb-1">Cyber QR Code Integration</strong>
                  Your link automatically generates a scannable, cyberpunk-themed QR Code so mobile users can easily jump straight to your project.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-terminal-green font-bold">▶</span>
                <div>
                  <strong className="text-white uppercase tracking-wider block mb-1">Permanent History Leaderboard</strong>
                  Even after you are overthrown, your reign, alias, and the amount you paid are permanently etched into the global history feed.
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
              <Star className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold uppercase tracking-wider text-gold">Sponsored Slots</h2>
            </div>
            
            <p className="text-white/80">
              Can&apos;t afford the main throne? Secure one of the 6 highly visible Sponsored Slots. These spots offer fixed pricing and tier-based prominence.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 border-l-2 border-gold pl-3">
                <h3 className="font-bold uppercase text-gold tracking-wide">Prime Tier</h3>
                <p className="text-white/60 text-xs">The highest visibility secondary slots. Features gold styling and premium placement.</p>
              </div>
              <div className="space-y-2 border-l-2 border-slate-400 pl-3">
                <h3 className="font-bold uppercase text-slate-300 tracking-wide">Featured Tier</h3>
                <p className="text-white/60 text-xs">Standard high-contrast placement with a sleek glassmorphic design.</p>
              </div>
              <div className="space-y-2 border-l-2 border-amber-600 pl-3">
                <h3 className="font-bold uppercase text-amber-500 tracking-wide">Starter Tier</h3>
                <p className="text-white/60 text-xs">The most affordable entry point for persistent visibility on the site.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] p-4 border-l-2 border-glitch-blue mt-8">
            <h3 className="font-bold text-glitch-blue uppercase flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" /> Security Notice
            </h3>
            <p className="text-xs text-white/50">
              We actively monitor all submitted links. Submitting NSFW, malicious, phishing, or illegal URLs will result in an immediate permanent ban and the removal of your link without a refund.
            </p>
          </div>
        </section>

        <div className="text-center pt-8 pb-12">
          <Link href="/">
            <button className="px-10 py-4 bg-gradient-to-r from-terminal-green via-terminal-green to-[#00f0ff] text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all duration-300 transform active:scale-95 animate-pulse-ring">
              INITIATE HIJACK
            </button>
          </Link>
        </div>
      </div>

      <footer className="w-full mt-12 py-8 text-center text-[10px] sm:text-xs text-white/30 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 border-t border-white/[0.06]">
        <p>© {new Date().getFullYear()} HACKRANK.LOL - SYSTEM OPERATIONAL</p>
        <span className="hidden sm:inline text-white/10">•</span>
        <a href="https://x.com/itsjack_dev" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors uppercase tracking-widest flex items-center gap-1">
          <span className="font-bold text-[12px] -mt-[1px]">𝕏</span> Created by @itsjack_dev
        </a>
      </footer>
    </main>
  );
}
