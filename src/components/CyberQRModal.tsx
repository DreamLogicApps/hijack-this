'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, ExternalLink } from 'lucide-react';

interface CyberQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  label: string;
  ownerName: string;
}

export function CyberQRModal({ isOpen, onClose, url, label, ownerName }: CyberQRModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] bg-black border-2 border-terminal-green/70 text-terminal-green glow-box flex flex-col items-center text-center font-mono">
        <DialogHeader className="space-y-1 text-center">
          <DialogTitle className="glitch-text text-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-terminal-green animate-pulse" /> CYBER QR SCANNER
          </DialogTitle>
          <DialogDescription className="text-terminal-green/70 text-xs font-mono">
            Scan with your mobile camera to open target link.
          </DialogDescription>
        </DialogHeader>

        {/* QR Container */}
        <div className="my-4 p-4 bg-black border-2 border-terminal-green/50 shadow-[0_0_20px_rgba(57,255,20,0.3)] relative group">
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#000000"
            fgColor="#39ff14"
            level="H"
            includeMargin={true}
          />
          <div className="absolute inset-0 bg-terminal-green/5 pointer-events-none group-hover:bg-transparent transition-colors" />
        </div>

        {/* Link & Owner Metadata */}
        <div className="w-full space-y-2 bg-terminal-green/10 p-3 border border-terminal-green/30 text-xs">
          <div className="text-terminal-green/60 uppercase text-[10px] tracking-widest">
            TARGET LINK
          </div>
          <div className="font-bold text-white truncate px-1">
            {label}
          </div>
          <div className="text-[10px] text-glitch-blue font-bold">
            BY {ownerName}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-terminal-green hover:underline pt-1"
          >
            {url} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
