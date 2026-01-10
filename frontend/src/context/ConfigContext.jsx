import { createContext, useContext, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import * as api from "../services/api";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["solanaConfig"],
    queryFn: api.fetchConfig,
    staleTime: Infinity,
    retry: 3,
  });

  const config = useMemo(() => {
    if (isLoading) {
      return { isLoading: true, error: null };
    }

    if (error || !data) {
      return {
        isLoading: false,
        error: error?.message || "Failed to load config",
      };
    }

    return {
      network: data.network,
      endpoint: data.endpoint,
      programId: new PublicKey(data.programId),
      treasury: new PublicKey(data.treasury),
      idl: data.idl,
      isLoading: false,
      error: null,
    };
  }, [data, isLoading, error]);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useSolanaConfig() {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error("useSolanaConfig must be used within ConfigProvider");
  }
  return config;
}
