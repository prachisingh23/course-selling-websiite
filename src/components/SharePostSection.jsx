import React from 'react';
import { Check, Facebook, Link2, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const SharePostSection = ({ title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: 'Link Copied',
      description: 'Post link copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(title || 'Check out this post!');

  return (
    <div className="my-8 flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-white/62">Share this article:</span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 bg-white/5 text-white/68 hover:bg-[#1DA1F2]/18 hover:text-[#1DA1F2]"
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, '_blank')}
        >
          <Twitter className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 bg-white/5 text-white/68 hover:bg-[#1877F2]/18 hover:text-[#1877F2]"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')}
        >
          <Facebook className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 bg-white/5 text-white/68 hover:bg-[#0A66C2]/18 hover:text-[#0A66C2]"
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')}
        >
          <Linkedin className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 bg-white/5 text-white/68 hover:bg-cyan-300/18 hover:text-cyan-100"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default SharePostSection;
