"use client";
import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("print") === "true") {
        setTimeout(() => window.print(), 500);
      }
    }
  }, []);
  return null;
}
