import type { SocialMedia } from '@/lib/types';

type SocialMediaLinksProps = SocialMedia;

const SOCIAL_MEDIA_CONFIG = {
  twitter: {
    icon: '𝕏',
    hoverColor: 'hover:bg-blue-500',
    label: 'Twitter / X',
  },
  twitch: {
    icon: '📺',
    hoverColor: 'hover:bg-purple-600',
    label: 'Twitch',
  },
  instagram: {
    icon: '📷',
    hoverColor: 'hover:bg-pink-600',
    label: 'Instagram',
  },
} as const;

interface SocialLinkProps {
  href: string;
  icon: string;
  hoverColor: string;
  label: string;
}

function SocialLink({ href, icon, hoverColor, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-8 h-8 bg-slate-900 ${hoverColor} rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-yellow-400/40`}
      title={label}
    >
      <span className="text-sm">{icon}</span>
    </a>
  );
}

export default function SocialMediaLinks({
  twitterUrl,
  twitchUrl,
  instagramUrl,
}: SocialMediaLinksProps) {
  return (
    <div className="flex gap-2 justify-center pt-2 border-t-2 border-yellow-400/30">
      {twitterUrl && (
        <SocialLink href={twitterUrl} {...SOCIAL_MEDIA_CONFIG.twitter} />
      )}
      {twitchUrl && (
        <SocialLink href={twitchUrl} {...SOCIAL_MEDIA_CONFIG.twitch} />
      )}
      {instagramUrl && (
        <SocialLink href={instagramUrl} {...SOCIAL_MEDIA_CONFIG.instagram} />
      )}
    </div>
  );
}
