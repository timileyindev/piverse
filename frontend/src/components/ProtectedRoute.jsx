import { useWallet } from "@solana/wallet-adapter-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }) => {
  const { connected } = useWallet();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!connected) {
      setLocation("/");
    }
  }, [connected, setLocation]);

  if (!connected) {
    return null;
  }

  return children;
};
