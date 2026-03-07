// src/components/blog/ShareButtons.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook, Copy, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-all"
        onClick={handleTwitterShare}
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/50 transition-all"
        onClick={handleLinkedInShare}
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hover:bg-blue-700/10 hover:text-blue-700 hover:border-blue-700/50 transition-all"
        onClick={handleFacebookShare}
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50 transition-all"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
        onClick={handleCopyLink}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}