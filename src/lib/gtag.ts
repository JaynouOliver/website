export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const isGaEnabled = () => typeof window !== "undefined" && typeof (window as any).gtag === "function" && GA_MEASUREMENT_ID.length > 0;

export const trackPageview = (url: string) => {
  if (!isGaEnabled()) return;
  (window as any).gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const trackGaEvent = (action: string, params: Record<string, any> = {}) => {
  if (!isGaEnabled()) return;
  (window as any).gtag("event", action, params);
};
