// src/analytics.ts
import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-M1M5T7Z63J");
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string
) => {
  ReactGA.event({ category, action, label });
};
