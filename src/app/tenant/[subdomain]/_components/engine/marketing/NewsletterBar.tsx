"use client";

import React, { useState } from "react";
import { RepSection, RepHeading, RepText, RepButton } from "../components/PrimitiveRenderer";

// =============================================================================
// NEWSLETTER BAR
// =============================================================================

export function NewsletterBar({ 
  headline = "Join the Club", 
  subheadline = "Subscribe for early access to limited micro-lots and exclusive brewing guides." 
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="w-full bg-[var(--rep-surface)] border-y border-[var(--rep-border)] py-16">
      <RepSection className="!py-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1 text-center md:text-left">
            <RepHeading level={3} className="mb-2">{headline}</RepHeading>
            <RepText size="base" muted>{subheadline}</RepText>
          </div>

          <div className="flex-1 w-full max-w-md">
            {subscribed ? (
              <div className="bg-[var(--rep-success)]/10 border border-[var(--rep-success)] text-[var(--rep-success)] px-6 py-4 rounded-[var(--rep-radius)] text-center font-medium">
                Thank you! You're on the list.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[var(--rep-bg)] text-[var(--rep-text)] border border-[var(--rep-border)] px-4 py-3 rounded-[var(--rep-radius)] focus:outline-none focus:border-[var(--rep-primary)] transition-colors"
                />
                <RepButton type="submit" variant="primary">
                  Subscribe
                </RepButton>
              </form>
            )}
          </div>

        </div>
      </RepSection>
    </div>
  );
}
