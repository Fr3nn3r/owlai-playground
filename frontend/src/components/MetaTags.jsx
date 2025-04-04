import { Helmet } from 'react-helmet';

function MetaTags({ title, description }) {
  const defaultTitle = "Intelligence Artificielle sur le droit français";
  const defaultDescription = "Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit.";

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title || "Intelligence Artificielle sur le droit français"}</title>
      <meta name="description" content={description || "OwlAI - Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit."} />
      <meta name="author" content="Frédéric Brunner" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, noarchive" />
      <meta name="keywords" content="Juridique, assistance, législation, civil, pénal, travail, réglementation, contentieux, impôts" />

      {/* Open Graph meta tags for Facebook and LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://owlai-playground.vercel.app/" />
      <meta property="og:title" content={title || "OwlAI - Intelligence Artificielle sur le droit français"} />
      <meta property="og:description" content={description || "OwlAI - Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit."} />
      <meta property="og:image" content="https://owlai-playground.vercel.app/Marianne.jpg" />
      <meta property="og:site_name" content="OwlAI" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="OwlAI - Intelligence Artificielle sur le droit français" />
      <meta property="og:image:type" content="image/jpeg" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "OwlAI - Intelligence Artificielle sur le droit français"} />
      <meta name="twitter:description" content={description || "OwlAI - Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit."} />
      <meta name="twitter:image" content="https://owlai-playground.vercel.app/Marianne.jpg" />
    </Helmet>
  );
}

export default MetaTags; 