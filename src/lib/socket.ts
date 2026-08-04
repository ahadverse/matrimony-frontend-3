'use client';

import { io, type Socket } from 'socket.io-client';
import { BACKEND_URL } from './api-client';
import { getToken } from './auth-token';

let socketPromise: Promise<Socket> | null = null;

async function connect(): Promise<Socket> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  return io(`${BACKEND_URL}/chat`, {
    auth: { token },
    transports: ['websocket'],
  });
}

export function getChatSocket(): Promise<Socket> {
  if (!socketPromise) {
    socketPromise = connect();
  }
  return socketPromise;
}

export function resetChatSocket() {
  socketPromise?.then((socket) => socket.disconnect()).catch(() => {});
  socketPromise = null;
}
