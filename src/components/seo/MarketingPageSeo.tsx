import { JsonLd, breadcrumbSchema, webPageSchema } from './JsonLd';

/**
 * The structured data every marketing route shares: what the page is, and where
 * it sits in the site. Rendered from each route's `layout.tsx`, which is a
 * server component even where the page itself is client-side.
 */
export function MarketingPageSeo({
  name,
  title,
  description,
  path,
  pageNode,
}: {
  /** Breadcrumb label — short, e.g. "FAQ". */
  name: string;
  /** Full page title, matching the route's metadata. */
  title: string;
  description: string;
  path: string;
  /**
   * Replaces the default `WebPage` node for routes that are something more
   * specific — a `CollectionPage` for the directory, a `ContactPage` for
   * contact. Both share the same `@id`, so passing one here must replace the
   * default rather than sit beside it: two nodes claiming one `@id` is a
   * validation error and Google keeps neither.
   */
  pageNode?: object;
}) {
  return (
    <>
      <JsonLd data={pageNode ?? webPageSchema({ name: title, description, path })} />
      <JsonLd data={breadcrumbSchema([{ name, path }])} />
    </>
  );
}
