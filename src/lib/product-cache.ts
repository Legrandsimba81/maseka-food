import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getProductById = unstable_cache(
  async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
    });
  },
  ["product"],
  { revalidate: 60 } // Cache valable 60 secondes
);