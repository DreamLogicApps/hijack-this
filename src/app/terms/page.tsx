import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-terminal-green/70 text-sm">Last Updated: September 2026</p>
        </header>

        <section className="bg-terminal-green/5 border border-terminal-green/30 p-6 sm:p-8 rounded-sm glow-box space-y-6 text-sm sm:text-base leading-relaxed text-terminal-green/80">
          
          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using HackRank.lol, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">2. The "King of the Hill" Mechanic</h2>
          <p>
            HackRank is a digital bidding platform. When you purchase the #1 spot, your link will be displayed exclusively until another user pays the new inflated bounty. 
            There is no guaranteed duration for how long your link will remain active. It could be days, hours, or seconds. <strong>All sales are final and strictly non-refundable.</strong>
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">3. Prohibited Content</h2>
          <p>
            You agree not to submit any links that contain, promote, or link to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Not Safe For Work (NSFW) content, pornography, or sexually explicit material.</li>
            <li>Malicious software, phishing, scams, or viruses.</li>
            <li>Illegal goods, services, or activities.</li>
            <li>Hate speech, harassment, or threats.</li>
          </ul>
          <p>
            <strong>Violation Consequence:</strong> We actively monitor submissions. If your link violates these terms, your link will be permanently purged from the database immediately, you will be banned from the platform, and <strong>you will not receive a refund.</strong>
          </p>

          <h2 className="text-xl font-bold uppercase text-white border-b border-terminal-green/20 pb-2">4. Disclaimer of Warranties</h2>
          <p>
            The site is provided on an "as is" and "as available" basis without any warranties of any kind. We do not guarantee uninterrupted access to the site or the permanent storage of your historical data.
          </p>

        </section>
      </div>
    </main>
  );
}
