import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'ES Decorations - Premium Event Management & Catering Services',
  description = 'Transform your events with ES Decorations. Premium catering, wedding decorations, event management, photography, and entertainment solutions in Pampady, Kottayam since 1995.',
  keywords = 'event management, catering services, wedding decoration, corporate events, photography, videography, event styling, Pampady, Kottayam, Kerala, balloon art, henna services, caricature',
  image = 'https://www.esdecorations.in/src/images/logo.png',
  url = 'https://www.esdecorations.in',
  type = 'website',
  author = 'ES Decorations'
}) => {
  const fullTitle = title.includes('ES Decorations') ? title : `${title} | ES Decorations`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ES Decorations" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="geo.region" content="IN-KL" />
      <meta name="geo.placename" content="Pampady, Kottayam" />
      <meta name="geo.position" content="9.6307;76.5919" />
      
      {/* Schema.org markup for Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "ES Decorations",
          "description": description,
          "url": "https://www.esdecorations.in",
          "logo": "https://www.esdecorations.in/src/images/logo.png",
          "image": image,
          "telephone": "+91-95620-39676",
          "email": "esdecorationsind@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Nadelpeedika Junction",
            "addressLocality": "Pampady",
            "addressRegion": "Kottayam",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "9.6307",
            "longitude": "76.5919"
          },
          "openingHours": "Mo-Fr 09:00-18:00",
          "priceRange": "$$",
          "servesCuisine": "Event Catering",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Event Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Catering Services",
                  "description": "Premium catering services for all events"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Wedding Decorations",
                  "description": "Elegant wedding decoration services"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Event Management",
                  "description": "Complete event planning and execution"
                }
              }
            ]
          },
          "sameAs": [
            "https://www.facebook.com/esdecorations",
            "https://www.instagram.com/esdecorations"
          ]
        })}
      </script>
    </Helmet>
  );
};