"use server";

import { revalidatePath } from "next/cache";

/**
 * Called from the admin dashboard (client component) after approving or
 * rejecting a product.  Busts the Next.js server-side fetch cache for all
 * public pages that show products so the next visitor sees fresh data.
 */
export async function revalidateProductPages() {
  revalidatePath("/", "page");
  revalidatePath("/products", "page");
  revalidatePath("/categories", "layout");
}
