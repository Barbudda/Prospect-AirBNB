type ProspectData = {
  name: string;
  city: string;
  targetType: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
};

type OutreachVariants = {
  email: string;
  short: string;
  dm: string;
};

function getSenderName(): string {
  return process.env.SENDER_NAME || "L'équipe Prospect";
}

export function generateOutreachMessage(prospect: ProspectData): OutreachVariants {
  const { city, targetType } = prospect;
  const sender = getSenderName();
  const isConcierge =
    targetType === "concierge" ||
    targetType === "property_manager" ||
    targetType === "agency";

  const email = isConcierge
    ? `Bonjour,

Je vous contacte car j'ai vu que vous gérez des locations courte durée à ${city}.

Je travaille sur un outil de conciergerie IA pour aider les gestionnaires Airbnb à réduire le temps passé à répondre aux messages voyageurs.

J'échange actuellement avec quelques professionnels du secteur pour mieux comprendre leurs vrais problèmes du quotidien.

Seriez-vous disponible pour un échange de 10 minutes cette semaine ?

Cordialement,
${sender}`
    : `Bonjour,

Je vous contacte car j'ai vu que vous proposez des locations à ${city}.

Je développe un outil de conciergerie IA pour aider les hôtes Airbnb à gagner du temps sur les messages voyageurs.

Je cherche à échanger avec quelques hôtes pour comprendre leurs vrais défis du quotidien — sans rien vous vendre, juste écouter.

Seriez-vous disponible pour un échange de 10 minutes cette semaine ?

Cordialement,
${sender}`;

  const short = isConcierge
    ? `Bonjour, je développe un outil IA de gestion des messages voyageurs pour les conciergeries à ${city}. Disponible 10 min cette semaine pour en parler ? ${sender}`
    : `Bonjour, je développe un assistant IA pour hôtes Airbnb à ${city}. Disponible 10 min pour un échange ? ${sender}`;

  const dm = isConcierge
    ? `Bonjour 👋 Je vois que vous gérez des locations à ${city}. Je travaille sur un assistant IA pour réduire la charge des messages voyageurs — est-ce que vous seriez ouvert à un échange rapide ? Merci`
    : `Bonjour 👋 Je vois que vous louez à ${city}. Je crée un assistant IA pour hôtes Airbnb — seriez-vous ouvert à partager votre expérience en 10 min ? Merci`;

  return { email, short, dm };
}
