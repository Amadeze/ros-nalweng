"use client";

import React from "react";
import { RepSection, RepHeading, RepText, RepCard } from "../components/PrimitiveRenderer";

// =============================================================================
// JOURNAL GRID
// =============================================================================

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
}

const defaultArticles: Article[] = [
  { id: "1", title: "The Science of Extraction", excerpt: "Understanding the delicate balance of time, temperature, and yield.", date: "Oct 12, 2026", imageUrl: "https://images.unsplash.com/photo-1495474472202-d9ee64b8bb53?auto=format&fit=crop&q=80&w=600" },
  { id: "2", title: "Journey to Costa Rica", excerpt: "Our sourcing trip to the Tarrazú region and the farmers we met.", date: "Sep 28, 2026", imageUrl: "https://images.unsplash.com/photo-1524350876685-274059332607?auto=format&fit=crop&q=80&w=600" },
  { id: "3", title: "Mastering the Pour Over", excerpt: "A step-by-step guide to brewing the perfect V60 at home.", date: "Sep 15, 2026", imageUrl: "https://images.unsplash.com/photo-1544243542-9907c030dff7?auto=format&fit=crop&q=80&w=600" },
];

export function JournalGrid({ 
  headline = "Journal", 
  subheadline = "Thoughts, stories, and brewing guides from our team.", 
  articles = defaultArticles 
}) {
  return (
    <div className="w-full bg-[var(--rep-bg)] py-20">
      <RepSection>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <RepHeading level={2} className="mb-4">{headline}</RepHeading>
            <RepText size="lg" muted>{subheadline}</RepText>
          </div>
          <a href="#" className="text-[var(--rep-primary)] font-bold text-[length:var(--rep-fs-sm)] tracking-widest uppercase hover:underline">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <RepCard key={article.id} padding="none" className="group cursor-pointer border-transparent bg-transparent shadow-none hover:shadow-none hover:-translate-y-1 transition-transform">
              <div className="aspect-[4/3] rounded-[var(--rep-radius)] overflow-hidden mb-6 relative">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="px-2">
                <RepText size="xs" muted className="mb-2 font-semibold uppercase tracking-wider">{article.date}</RepText>
                <RepHeading level={4} className="mb-3 group-hover:text-[var(--rep-primary)] transition-colors">{article.title}</RepHeading>
                <RepText size="sm" muted className="line-clamp-2">{article.excerpt}</RepText>
              </div>
            </RepCard>
          ))}
        </div>
      </RepSection>
    </div>
  );
}
