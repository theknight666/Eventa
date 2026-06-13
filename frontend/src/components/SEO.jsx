import React from "react";
import Head from "next/head";

export default function SEO({ title, description, url, image, type = "website", keywords, noindex = false, children }) {
  const siteName = "Eventa";
  const defaultTitle = "Eventa - Discover and Book the Best Events";
  const defaultDescription = "Discover, book, and manage amazing events near you. Eventa is your premium platform for tech, business, and social events across India.";
  const defaultImage = "https://eventa.in/seo-planet.png"; 

  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={keywords || "events in India, tech events, startup events, Eventa"} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {url && <meta property="twitter:url" content={url} />}
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />

      {/* JSON-LD or additional tags injected as children */}
      {children}
    </Head>
  );
}
