"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/session";

import { z } from "zod";

const SettingsSchema = z.object({
  name: z.string().optional(),
  themeColor: z.string().optional(),
  heroText: z.string().optional(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  layoutStyle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  aboutText: z.string().optional(),
  catalogTitle: z.string().optional(),
  catalogSubtitle: z.string().optional(),
  footerText: z.string().optional(),
  midtransClientKey: z.string().optional(),
  midtransServerKey: z.string().optional(),
  midtransIsProduction: z.boolean().optional(),
  backgroundImageUrl: z.string().optional(),
  contactEmail: z.string().optional(),
  instagramHandle: z.string().optional(),
  fontFamily: z.string().optional(),
  themeMode: z.string().optional(),
  borderRadius: z.string().optional(),
  animationStyle: z.string().optional(),
  animationDirection: z.string().optional(),
  iconStyle: z.string().optional(),
  themeConfig: z.any().optional(),
  problemStatement: z.string().optional(),
  solutionStatement: z.string().optional(),
  uspText: z.string().optional(),
  features: z.any().optional(),
  testimonials: z.any().optional(),
  faqs: z.any().optional(),
}).passthrough();

export async function updateTenantSettings(_tenantId: string, data: any) {
  const user = await getCurrentUser();
  if (!user || !user.tenantId) {
    throw new Error("Unauthorized");
  }
  
  const parsed = SettingsSchema.parse(data);
  const tenantId = user.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: parsed.name,
      themeColor: parsed.themeColor,
      heroText: parsed.heroText,
      logoUrl: parsed.logoUrl,
      heroImageUrl: parsed.heroImageUrl,
      layoutStyle: parsed.layoutStyle,
      whatsappNumber: parsed.whatsappNumber,
      aboutText: parsed.aboutText,
      catalogTitle: parsed.catalogTitle,
      catalogSubtitle: parsed.catalogSubtitle,
      footerText: parsed.footerText,
      midtransClientKey: parsed.midtransClientKey,
      midtransServerKey: parsed.midtransServerKey,
      midtransIsProduction: parsed.midtransIsProduction,
      backgroundImageUrl: parsed.backgroundImageUrl,
      contactEmail: parsed.contactEmail,
      instagramHandle: parsed.instagramHandle,
      fontFamily: parsed.fontFamily,
      themeMode: parsed.themeMode,
      borderRadius: parsed.borderRadius,
      animationStyle: parsed.animationStyle,
      animationDirection: parsed.animationDirection,
      iconStyle: parsed.iconStyle,
      themeConfig: parsed.themeConfig,
      problemStatement: parsed.problemStatement,
      solutionStatement: parsed.solutionStatement,
      uspText: parsed.uspText,
      features: parsed.features,
      testimonials: parsed.testimonials,
      faqs: parsed.faqs,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/tenant"); // revalidate public tenant pages
}
