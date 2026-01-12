import { useState, useEffect } from "react";

interface Options {
  enterDelay?: number;
  exitDelay?: number;
}

interface Result {
  mounted: boolean;
  rendered: boolean;
}

export default function useDelayedRender(active: boolean, options: Options = {}): Result {
  const { enterDelay = 0, exitDelay = 0 } = options;
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let mountTimeout: ReturnType<typeof setTimeout>;
    let renderTimeout: ReturnType<typeof setTimeout>;

    if (active) {
      setMounted(true);
      renderTimeout = setTimeout(() => setRendered(true), enterDelay);
    } else {
      setRendered(false);
      mountTimeout = setTimeout(() => setMounted(false), exitDelay);
    }

    return () => {
      clearTimeout(mountTimeout);
      clearTimeout(renderTimeout);
    };
  }, [active, enterDelay, exitDelay]);

  return { mounted, rendered };
}
