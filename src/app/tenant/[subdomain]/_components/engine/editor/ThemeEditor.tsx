"use client";

import React, { useState } from "react";
import { RepEditorProvider, useRepEditor } from "./RepEditorContext";
import { EditorSidebar } from "./EditorSidebar";
import { RepProvider } from "../core/RepProvider";
import { SectionBuilder } from "../layout/SectionBuilder";
import { Desktop, DeviceMobile } from "@phosphor-icons/react";

// =============================================================================
// THEME EDITOR (DASHBOARD WRAPPER)
// =============================================================================

function EditorCanvas({ tenant }: { tenant: any }) {
  const { liveConfig } = useRepEditor();
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex-1 h-full bg-slate-200/50 flex flex-col overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-xs font-semibold text-slate-700">Live Preview</span>
        </div>
        
        {/* Viewport Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded transition-all ${viewport === "desktop" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Desktop size={16} weight={viewport === "desktop" ? "fill" : "regular"} />
          </button>
          <button 
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded transition-all ${viewport === "mobile" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <DeviceMobile size={16} weight={viewport === "mobile" ? "fill" : "regular"} />
          </button>
        </div>
        
        <div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-colors">
            Publish Changes
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center">
        <div 
          className={`bg-white shadow-2xl rounded-xl overflow-hidden overflow-y-auto transition-all duration-500 ease-in-out border border-slate-300 ring-1 ring-black/5 ${
            viewport === "mobile" ? "w-[375px] h-[812px]" : "w-full min-h-full"
          }`}
        >
          {/* THE MAGIC HAPPENS HERE */}
          <RepProvider tenant={tenant} overrideConfig={liveConfig}>
            <SectionBuilder />
          </RepProvider>
        </div>
      </div>
      
    </div>
  );
}

export function ThemeEditor({ tenant }: { tenant: any }) {
  return (
    <RepEditorProvider>
      <div className="flex w-screen h-screen overflow-hidden bg-slate-900">
        <EditorSidebar />
        <EditorCanvas tenant={tenant} />
      </div>
    </RepEditorProvider>
  );
}
