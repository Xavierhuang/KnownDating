import { io, Socket } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const getSocketUrl = () => {
  // Use environment variable if set (for production)
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  if (Capacitor.isNativePlatform()) {
    // For iOS/Android: Use production server by default
    // Change to 'http://localhost:3002' for simulator testing
    return 'https://chatwithgods.com';
  }
  
  // For web production, use the same origin (socket will connect to same domain)
  if (window.location.protocol === 'https:') {
    return `https://${window.location.host}`;
  }
  return `http://${window.location.host}`;
};

const SOCKET_URL = getSocketUrl();

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();

