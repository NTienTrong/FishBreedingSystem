export type SseEventHandler = (event: MessageEvent & { type?: string }) => void;

export function subscribeToSse(path: string, onEvent: SseEventHandler) {
  if (typeof window === "undefined") return () => {};
  const es = new EventSource(path);

  es.onmessage = (e) => onEvent(e as MessageEvent & { type?: string });

  es.addEventListener("orderUpdate", (e) => onEvent(e as MessageEvent & { type?: string }));
  es.addEventListener("orderCreated", (e) => onEvent(e as MessageEvent & { type?: string }));
  es.addEventListener("transaction", (e) => onEvent(e as MessageEvent & { type?: string }));
  es.addEventListener("coupon", (e) => onEvent(e as MessageEvent & { type?: string }));

  es.onerror = () => {
    // EventSource will try to reconnect automatically; do nothing here.
  };

  return () => {
    try {
      es.close();
    } catch (err) {
      // ignore
    }
  };
}
