import { useEffect, useRef } from "react";
import * as settingsApi from "../api/settings";

export function useIdleTimeout(onIdle: () => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minutesRef = useRef(30);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    const schedule = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const minutes = minutesRef.current;
      if (minutes < 5) return;
      timeoutRef.current = setTimeout(() => {
        onIdleRef.current();
      }, minutes * 60 * 1000);
    };

    settingsApi.getSettings().then((res) => {
      const m = res.data.idle_timeout_minutes;
      if (typeof m === "number" && m >= 5) minutesRef.current = m;
      schedule();
    }).catch(() => schedule());

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, schedule));
    return () => {
      events.forEach((e) => window.removeEventListener(e, schedule));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
