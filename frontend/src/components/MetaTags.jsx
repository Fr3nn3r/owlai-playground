import { Helmet } from 'react-helmet';

function MetaTags({ title, description }) {
  const defaultTitle = "Intelligence Artificielle sur le droit français";
  const defaultDescription = "Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit.";
  const imageUrl = `${window.location.origin}/owl-default.jpg`;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph meta tags for Facebook and LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}

export default MetaTags; 