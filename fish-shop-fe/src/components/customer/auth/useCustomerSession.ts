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
      const sessionResponse = await fetch("/api/customer/auth/session", {
        cache: "no-store",
        credentials: "include",
      });
      if (!sessionResponse.ok) {
        console.warn("[customer-session] cookie session invalid", {
          status: sessionResponse.status,
        });
        setSession({ authenticated: false });
        return;
      }

      setSession({ authenticated: true });

      const response = await fetch("/api/customer/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        console.warn("[customer-session] /api/customer/me unauthorized", {
          status: response.status,
        });
        return;
      }

      const data = (await response.json()) as { fullName?: string | null; email?: string | null };
      setSession({ authenticated: true, fullName: data.fullName, email: data.email });
    } catch (error) {
      console.warn("[customer-session] unexpected error", { error });
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
