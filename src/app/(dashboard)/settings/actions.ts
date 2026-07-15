"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTenantSettings(tenantId: string, data: any) {
  if (!tenantId) {
    throw new Error("Unauthorized");
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      themeColor: data.themeColor,
      heroText: data.heroText,
      logoUrl: data.logoUrl,
      heroImageUrl: data.heroImageUrl,
      layoutStyle: data.layoutStyle,
      whatsappNumber: data.whatsappNumber,
      aboutText: data.aboutText,
      catalogTitle: data.catalogTitle,
      catalogSubtitle: data.catalogSubtitle,
      footerText: data.footerText,
      midtransClientKey: data.midtransClientKey,
      midtransServerKey: data.midtransServerKey,
      midtransIsProduction: data.midtransIsProduction,
      backgroundImageUrl: data.backgroundImageUrl,
      contactEmail: data.contactEmail,
      instagramHandle: data.instagramHandle,
      fontFamily: data.fontFamily,
      themeMode: data.themeMode,
      borderRadius: data.borderRadius,
      animationStyle: data.animationStyle,
      animationDirection: data.animationDirection,
      iconStyle: data.iconStyle,
      themeConfig: data.themeConfig,
      problemStatement: data.problemStatement,
      solutionStatement: data.solutionStatement,
      uspText: data.uspText,
      features: data.features,
      testimonials: data.testimonials,
      faqs: data.faqs,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/tenant"); // revalidate public tenant pages
}
