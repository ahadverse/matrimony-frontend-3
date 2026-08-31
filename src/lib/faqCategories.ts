/**
 * How many questions each FAQ category holds, in page order.
 *
 * Both the page (which renders the accordions) and the route layout (which
 * emits the FAQPage structured data) build their lists from this one array, so
 * the schema can never advertise a question the page does not actually show —
 * which is exactly what Google's FAQ rich-result policy requires.
 */
export const FAQ_CATEGORY_SIZES = [4, 4, 4, 4, 4, 3] as const;

export interface FaqKeyPair {
  qKey: string;
  aKey: string;
}

/** `[{ titleKey, items: [{ qKey, aKey }] }]` for every category. */
export function faqCategoryKeys(): { titleKey: string; items: FaqKeyPair[] }[] {
  return FAQ_CATEGORY_SIZES.map((count, index) => {
    const cat = index + 1;
    return {
      titleKey: `faqPage.cat${cat}Title`,
      items: Array.from({ length: count }, (_, i) => ({
        qKey: `faqPage.cat${cat}q${i + 1}Q`,
        aKey: `faqPage.cat${cat}q${i + 1}A`,
      })),
    };
  });
}
