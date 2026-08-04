'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getChatSocket, resetChatSocket } from '@/lib/socket';
import type { ChatMessage } from '@/lib/types';

const ChatSocketContext = createContext<Socket | null>(null);

export function useChatSocket() {
  return useContext(ChatSocketContext);
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    getChatSocket()
      .then((s) => {
        if (!cancelled) setSocket(s);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    function refreshLists() {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    }

    // The thread page only patches ['messages', conversationId] for whichever
    // conversation is currently mounted — any OTHER conversation's message
    // cache never hears about the new message and goes stale. Without this,
    // opening a conversation you weren't actively viewing when a message
    // arrived shows everything except that message, until the 15s staleTime
    // happens to have elapsed on remount.
    function handleNewMessage(message: ChatMessage) {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    }

    socket.on('message:new', refreshLists);
    socket.on('message:new', handleNewMessage);
    socket.on('message:read', refreshLists);

    return () => {
      socket.off('message:new', refreshLists);
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', refreshLists);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    return () => {
      resetChatSocket();
    };
  }, []);

  return <ChatSocketContext.Provider value={socket}>{children}</ChatSocketContext.Provider>;
}
