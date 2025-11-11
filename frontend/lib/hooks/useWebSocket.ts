'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/auth';

interface UseWebSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
}

export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    namespace = '/notifications',
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    if (!token) {
      setError(new Error('No authentication token available'));
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socketUrl = `${apiUrl}${namespace}`;

    setIsConnecting(true);
    setError(null);

    const socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnect?.();
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setIsConnecting(false);
      setError(err);
      onError?.(err);
    });

    socket.on('error', (err) => {
      setError(err);
      onError?.(err);
    });

    socketRef.current = socket;
  }, [token, namespace, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket is not connected. Cannot emit event:', event);
    }
  }, []);

  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
  };
}

