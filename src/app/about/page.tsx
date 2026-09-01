import Link from 'next/link';
import { ArrowLeft, Shield, Zap, TrendingUp, Skull } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-terminal-green p-4 sm:p-8 font-mono relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <MatrixRain />
      </div>

      <div className="max-w-3xl w-full relative z-10 space-y-8 mt-8 sm:mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-terminal-green/60 hover:text-terminal-green transition-colors uppercase tracking-widest text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Return to Terminal
        </Link>

        <header className="border-l-4 border-terminal-green pl-6 space-y-2 py-2">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter glitch-text">
            About HijackIt
          </h1>
          <p className="text-terminal-green/70 text-lg">The ultimate King-of-the-Hill link battle.</p>
        </header>

        <section className="bg-terminal-green/5 border border-terminal-green/30 p-6 sm:p-8 rounded-sm glow-box space-y-6 text-sm sm:text-base leading-relaxed">
          <div className="flex items-center gap-3 border-b border-terminal-green/20 pb-4">
            <Skull className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold uppercase tracking-wider text-yellow-400">The Rules of Engagement</h2>
          </div>
          
          <p>
            Welcome to <span className="font-bold text-white">HijackIt.lol</span>. This is a digital battleground where only one link can rule at a time. 
            There are no banners, no sidebars, and no hidden text links. Just one massive, focal spotlight for the entire internet to see.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <Zap className="w-5 h-5 text-glitch-red" />
              <h3 className="font-bold uppercase text-glitch-red tracking-wide">1. Seize Control</h3>
              <p className="text-terminal-green/80">Pay the current bounty to instantly hijack the #1 spot. The moment your transaction clears, your link goes live globally.</p>
            </div>
            
            <div className="space-y-3">
              <TrendingUp className="w-5 h-5 text-terminal-green" />
              <h3 className="font-bold uppercase tracking-wide">2. The Price Inflates</h3>
              <p className="text-terminal-green/80">Every time the spot is hijacked, the minimum required bid increases by 10%. The longer the game goes, the higher the stakes.</p>
            </div>
          </div>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2 mt-8 pt-4">Exclusive Features of the Crown</h2>
          <ul className="list-none space-y-4 pt-2">
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold">▶</span>
              <div>
                <strong className="text-white uppercase tracking-wider block mb-1">Global Background Projection</strong>
                When you win the bid, a live, full-screen screenshot of your website is dynamically generated and permanently projected into the background of HijackIt for all visitors to see.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold">▶</span>
              <div>
                <strong className="text-white uppercase tracking-wider block mb-1">Cyber QR Code Integration</strong>
                Your link automatically generates a scannable, cyberpunk-themed QR Code so mobile users can easily jump straight to your project.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold">▶</span>
              <div>
                <strong className="text-white uppercase tracking-wider block mb-1">Permanent History Leaderboard</strong>
                Even after you are overthrown, your reign, alias, and the amount you paid are permanently etched into the global history feed.
              </div>
            </li>
          </ul>

          <div className="bg-black/50 p-4 border-l-2 border-yellow-500 mt-8">
            <h3 className="font-bold text-yellow-500 uppercase flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" /> Security Notice
            </h3>
            <p className="text-xs text-terminal-green/60">
              We actively monitor all submitted links. Submitting NSFW, malicious, phishing, or illegal URLs will result in an immediate permanent ban and the removal of your link without a refund.
            </p>
          </div>
        </section>

        <div className="text-center pt-8 pb-12">
          <Link href="/">
            <button className="px-8 py-4 bg-terminal-green text-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 crt-flicker">
              INITIATE HIJACK
            </button>
          </Link>
        </div>
      </div>

      <footer className="w-full mt-12 py-8 text-center text-[10px] sm:text-xs text-terminal-green/40 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        <p>© {new Date().getFullYear()} HIJACKIT.LOL - SYSTEM OPERATIONAL</p>
        <span className="hidden sm:inline text-terminal-green/20">•</span>
        <a href="https://x.com/itsjack_dev" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors uppercase tracking-widest border-b border-transparent hover:border-terminal-green/50 flex items-center gap-1">
          <span className="font-bold text-[12px] -mt-[1px]">𝕏</span> Created by @itsjack_dev
        </a>
      </footer>
    </main>
  );
}
