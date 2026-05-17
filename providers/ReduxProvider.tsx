"use client";

import { useRef, ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/store";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  // Create the store once per React tree, never on the server singleton
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
