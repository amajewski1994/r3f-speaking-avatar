import { useEffect, useState } from "react";
import { COMPACT_MEDIA_QUERY } from "../data/layout";

export const useCompactLayout = () => {
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_MEDIA_QUERY);
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return compact;
};
