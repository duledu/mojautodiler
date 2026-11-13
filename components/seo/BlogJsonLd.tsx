import {
  serializeBlogBreadcrumbJsonLd,
  serializeBlogPostingJsonLd,
} from '@/lib/seo/blog-seo';
import type { BlogPostPublicDetail } from '@/types/blog';

interface Props {
  readonly post: BlogPostPublicDetail;
}

/**
 * Renders BlogPosting and BreadcrumbList JSON-LD structured data using
 * the safe `serializeJsonLd()` serializer (escaping `<`, `>`, `&`, and line separators).
 */
export default function BlogJsonLd({ post }: Props) {
  const blogPostingJson = serializeBlogPostingJsonLd(post);
  const breadcrumbJson = serializeBlogBreadcrumbJsonLd(post);

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
    </>
  );
}
