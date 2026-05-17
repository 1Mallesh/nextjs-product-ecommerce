"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";
import ReduxProvider from "./ReduxProvider";
import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";
import SocketProvider from "./SocketProvider";
import StorageProvider from "./StorageProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <StorageProvider>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>
              <SocketProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    },
                    success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                  }}
                />
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </StorageProvider>
    </ReduxProvider>
  );
}
