import { Helmet } from 'react-helmet';

function MetaTags({ title, description, imageUrl, url }) {
  const defaultTitle = "OwlAI - Assistant IA Intelligent";
  const defaultDescription = "Posez vos questions à OwlAI et obtenez des réponses intelligentes basées sur l'IA.";
  const defaultImage = `${window.location.origin}/owl-default.jpg`;

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = imageUrl || defaultImage;
  const finalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* OpenGraph metadata */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="OwlAI" />

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}

export default MetaTags; 