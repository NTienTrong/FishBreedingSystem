"use client";

import { useCallback, useEffect, useState } from "react";

export type CustomerSession = {
  authenticated: boolean;
  fullName?: string | null;
  email?: string | null;
};

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customer/me", { cache: "no-store" });
      if (!response.ok) {
        setSession({ authenticated: false });
        return;
      }

      const data = (await response.json()) as { fullName?: string | null; email?: string | null };
      setSession({ authenticated: true, fullName: data.fullName, email: data.email });
    } catch {
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const handleSessionUpdate = () => {
      loadSession();
    };

    window.addEventListener("customer-session-updated", handleSessionUpdate);
    return () => window.removeEventListener("customer-session-updated", handleSessionUpdate);
  }, [loadSession]);

  return { session, loading };
}
