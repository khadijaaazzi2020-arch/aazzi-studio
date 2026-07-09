import { SITE_URL } from "@/lib/site";

// JSON-LD for the homepage, emitted as a single @graph so entities can
// reference each other by @id. Server component → prerendered into the
// static HTML, zero client-side cost.
//
// Entities: ProfessionalService (the studio — an Organization subtype),
// WebSite, WebPage, and the studio's service catalog. FAQPage/BreadcrumbList
// are intentionally absent: the site has no FAQ and only one page.

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;
const LOGO_ID = `${SITE_URL}/#logo`;

const SERVICES = [
  {
    name: "Website Design",
    description: "Modern, custom-designed websites that build trust.",
  },
  {
    name: "E-commerce Stores",
    description: "High-converting online stores, including Shopify builds.",
  },
  {
    name: "Brand Identity",
    description: "Visual identity systems that represent your brand.",
  },
  {
    name: "Motion & Interaction",
    description: "Smooth, engaging motion and interaction design.",
  },
];

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: "AAZZI STUDIO",
      url: `${SITE_URL}/`,
      email: "hello@aazzistudio.com",
      description:
        "Web design studio building fast, modern websites and high-converting e-commerce stores.",
      logo: {
        "@type": "ImageObject",
        "@id": LOGO_ID,
        url: `${SITE_URL}/aazzi-logo.jpg`,
        width: 1242,
        height: 1242,
        caption: "AAZZI STUDIO",
      },
      image: { "@id": LOGO_ID },
      priceRange: "$$",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            provider: { "@id": ORG_ID },
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: "AAZZI STUDIO",
      publisher: { "@id": ORG_ID },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: `${SITE_URL}/`,
      name: "AAZZI STUDIO — Premium Websites & E-commerce Stores",
      description:
        "We design fast, modern websites and high-converting e-commerce stores that help brands grow online.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      primaryImageOfPage: { "@id": LOGO_ID },
      inLanguage: "en",
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: all values are build-time
      // constants; "<" is escaped to keep the script parser-proof.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
