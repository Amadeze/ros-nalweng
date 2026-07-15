"use client";

import React from "react";
import { useRep } from "../core/RepProvider";
import { ComponentRegistry, UnknownComponent } from "./ComponentRegistry";

// =============================================================================
// SECTION BUILDER
// =============================================================================
// Iterates through the layout.sections array from RepConfig and renders them.
// =============================================================================

export function SectionBuilder() {
  const { config, tenant } = useRep();
  const { sections } = config.layout;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {sections.map((section, index) => {
        // Skip hidden sections
        if (section.isHidden) return null;

        // Resolve component from registry
        const Component = ComponentRegistry[section.type] || UnknownComponent;

        return (
          <div key={section.id} id={section.id} className="w-full relative">
            <Component 
              {...section.props} 
              tenant={tenant} 
              products={tenant?.products || []} 
            />
          </div>
        );
      })}
    </div>
  );
}
