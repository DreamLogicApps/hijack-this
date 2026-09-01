import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';

export default function PrivacyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter glitch-text">
            Privacy Policy
          </h1>
          <p className="text-terminal-green/70 text-sm">Last Updated: September 2026</p>
        </header>

        <section className="bg-terminal-green/5 border border-terminal-green/30 p-6 sm:p-8 rounded-sm glow-box space-y-6 text-sm sm:text-base leading-relaxed text-terminal-green/80">
          
          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">1. Information We Collect</h2>
          <p>
            When you purchase a spot on HijackIt, we collect the information you voluntarily provide: the target URL, the display text, and your chosen alias. 
            We do not collect or store your payment information directly; all transactions are securely processed by our payment provider (Dodo Payments / Stripe).
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">2. How We Use Your Information</h2>
          <p>
            The URLs, display text, and aliases you provide are public by nature. They are displayed on the homepage and permanently stored in our public history feed to maintain the leaderboard and chronological timeline of the site.
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">3. Cookies & Tracking</h2>
          <p>
            We may use basic cookies or local storage strictly for functional purposes (like remembering your UI preferences). 
            We also utilize basic analytics to track traffic hits to the active links in order to display live statistics.
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">4. Data Deletion</h2>
          <p>
            If you wish to have your historical link or alias removed from our public timeline for privacy reasons, please contact the administrator. Note that removing a link does not qualify for a refund.
          </p>

        </section>
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
