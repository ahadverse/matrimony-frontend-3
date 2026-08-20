'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useChatSocket } from '@/lib/chat/ChatProvider';
import { useSendSupportMessage, useSupportMessages, type SupportThreadPage } from '@/lib/queries';
import { ApiError } from '@/lib/api-client';
import type { SupportMessage } from '@/lib/types';
import { SupportChatButton } from './SupportChatButton';
import { SupportChatPanel } from './SupportChatPanel';

export function SupportChatWidget({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [hasUnread, setHasUnread] = useState(false);
  const socket = useChatSocket();
  const queryClient = useQueryClient();

  const { data, isLoading } = useSupportMessages(true);
  const sendMessage = useSendSupportMessage();

  useEffect(() => {
    if (!socket) return;

    function handleNewMessage(message: SupportMessage) {
      queryClient.setQueryData<SupportThreadPage | undefined>(['support-messages'], (old) => {
        if (!old) return old;
        if (old.items.some((m) => m.id === message.id)) return old;
        return { ...old, items: [...old.items, message], total: old.total + 1 };
      });
      if (message.senderRole === 'admin') setHasUnread(true);
    }

    socket.on('support:message-new', handleNewMessage);
    return () => {
      socket.off('support:message-new', handleNewMessage);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  function handleSend(body: string) {
    sendMessage.mutate(body, {
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not send message'),
    });
  }

  return (
    <>
      <SupportChatButton hasUnread={hasUnread} onClick={() => onOpenChange(!isOpen)} />
      <AnimatePresence>
        {isOpen && (
          <SupportChatPanel
            messages={data?.items ?? []}
            isLoading={isLoading}
            isSending={sendMessage.isPending}
            onSend={handleSend}
            onClose={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
