import {
  serializeBlogBreadcrumbJsonLd,
  serializeBlogFaqJsonLd,
  serializeBlogPostingJsonLd,
} from '@/lib/seo/blog-seo';
import type { BlogPostPublicDetail } from '@/types/blog';

interface Props {
  readonly post: BlogPostPublicDetail;
}

/**
 * Renders BlogPosting, BreadcrumbList, and (when present) FAQPage JSON-LD
 * structured data using the safe `serializeJsonLd()` serializer.
 */
export default function BlogJsonLd({ post }: Props) {
  const blogPostingJson = serializeBlogPostingJsonLd(post);
  const breadcrumbJson = serializeBlogBreadcrumbJsonLd(post);
  const faqJson = serializeBlogFaqJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: blogPostingJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      {faqJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJson }}
        />
      )}
    </>
  );
}
