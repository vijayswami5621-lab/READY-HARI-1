import { Helmet } from 'react-helmet-async';

interface Breadcrumb {
  name: string;
  item: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;
  type?: string;
  schema?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function SEO({ 
  title, 
  description, 
  keywords = "Hari Pathshala, Bhagavad Gita, Ramcharitmanas, Sanskrit Learning, Sanatan Dharma", 
  url, 
  image = "https://i.ibb.co/qMG2MS27/logo.png",
  type = "website",
  schema,
  breadcrumbs
}: SEOProps) {
  const fullUrl = url.startsWith('http') 
    ? url 
    : `https://haripathshala.online${url.startsWith('/') ? '' : '/'}${url}`;

  const breadcrumbSchema = breadcrumbs ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item.startsWith('http') ? crumb.item : `https://haripathshala.online${crumb.item.startsWith('/') ? '' : '/'}${crumb.item}`
    }))
  }) : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data Schema */}
      {schema && (
        <script type="application/ld+json">
          {schema}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {breadcrumbSchema}
        </script>
      )}
    </Helmet>
  );
}
