"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "@/config";
import { getToken } from "@/services/axios";
import { useAppSelector } from "@/store/hooks";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      return;
    }

    const token = getToken();
    if (!token) return;

    const socket = io(config.socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      isConnectedRef.current = true;
    });

    socket.on("disconnect", () => {
      isConnectedRef.current = false;
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected: isConnectedRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}
