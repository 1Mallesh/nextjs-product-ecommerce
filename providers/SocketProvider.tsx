"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket((prev) => { prev?.disconnect(); return null; });
      setIsConnected(false);
      return;
    }

    const token = getToken();
    if (!token) return;

    // API spec: connect to /tracking namespace with "Bearer <token>"
    const s = io(`${config.socketUrl}/tracking`, {
      auth: { token }, // gateway strips "Bearer " if needed — send raw
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    s.on("connect", () => {
      setIsConnected(true);
      // Join personal notification room after connect
      s.emit("join-user-room");
    });
    s.on("disconnect", () => setIsConnected(false));

    setSocket(s);

    return () => {
      s.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
