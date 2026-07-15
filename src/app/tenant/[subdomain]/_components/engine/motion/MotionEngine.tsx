"use client";

import React, { createContext, useContext, useMemo } from "react";
import { MotionConfig, Variants } from "framer-motion";
import { RepConfig } from "../core/RepConfig";

// =============================================================================
// MOTION ENGINE
// =============================================================================
// Provides global motion configurations and pre-defined variants.
// =============================================================================

export interface MotionTokens {
  transition: any;
  variants: {
    fadeUp: Variants;
    fadeScale: Variants;
    stagger: Variants;
  };
}

const MotionContext = createContext<MotionTokens | undefined>(undefined);

export function useRepMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useRepMotion must be used within a MotionEngine");
  }
  return context;
}

function resolveMotion(type: RepConfig["tokens"]["motion"]): MotionTokens {
  switch (type) {
    case "slow":
      return {
        transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
        }
      };
    case "fast":
      return {
        transition: { duration: 0.3, ease: "easeOut" },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } },
        }
      };
    case "luxury":
      return {
        transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.9, filter: "blur(4px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)" } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } },
        }
      };
    case "playful":
      return {
        transition: { type: "spring", bounce: 0.5, duration: 0.8 },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.5, rotate: -5 }, visible: { opacity: 1, scale: 1, rotate: 0 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
        }
      };
    case "cyber":
      return {
        transition: { duration: 0.4, ease: "steps(5, end)" },
        variants: {
          fadeUp: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 1.1 }, visible: { opacity: 1, scale: 1 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
        }
      };
    case "organic":
      return {
        transition: { duration: 1.0, ease: "easeInOut" },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
        }
      };
    case "normal":
    default:
      return {
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
        variants: {
          fadeUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
          fadeScale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
          stagger: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
        }
      };
  }
}

export function MotionEngine({ config, children }: { config: RepConfig; children: React.ReactNode }) {
  const motionTokens = useMemo(() => resolveMotion(config.tokens.motion), [config.tokens.motion]);

  return (
    <MotionContext.Provider value={motionTokens}>
      <MotionConfig transition={motionTokens.transition}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
