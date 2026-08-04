import { Heart, MessageCircle, Send, Star } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { useConversations, useLikesYou, useMyLikes, useShortlist } from '@/lib/queries';

export function StatTilesRow() {
  const { t } = useLanguage();
  const { data: likesYou } = useLikesYou();
  const { data: myLikes } = useMyLikes();
  const { data: shortlist } = useShortlist();
  const { data: conversations } = useConversations();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile icon={<Heart size={18} />} value={likesYou?.length ?? 0} label={t('dashboard.statReceived')} />
      <StatTile icon={<Send size={18} />} value={myLikes?.length ?? 0} label={t('dashboard.statSent')} />
      <StatTile icon={<Star size={18} />} value={shortlist?.length ?? 0} label={t('dashboard.statShortlisted')} />
      <StatTile icon={<MessageCircle size={18} />} value={conversations?.length ?? 0} label={t('dashboard.statMatches')} />
    </div>
  );
}
