export const POST_KINDS = [
  { id: "idea", label: "Ideia", emoji: "💭", hint: "Uma semente. Ainda não precisa estar pronta." },
  { id: "building", label: "Em construção", emoji: "🔨", hint: "Mostre o que está nascendo agora." },
  { id: "learning", label: "Aprendizado", emoji: "📚", hint: "O que você descobriu no caminho." },
  { id: "help", label: "Preciso de ajuda", emoji: "🆘", hint: "Peça o que está travando você." },
  { id: "done", label: "Concluído", emoji: "✅", hint: "Uma etapa ou um projeto que fechou." },
  { id: "achievement", label: "Conquista", emoji: "🏆", hint: "Celebre sem transformar em ranking." },
  { id: "tip", label: "Dica", emoji: "💡", hint: "Algo que pode servir para outra pessoa." },
  { id: "talk", label: "Conversa", emoji: "💬", hint: "Um pensamento, sem pressa." },
] as const;

export type PostKind = (typeof POST_KINDS)[number]["id"];

export const PROJECT_STEPS = [
  { id: "idea", label: "Ideia" },
  { id: "building", label: "Em construção" },
  { id: "progress", label: "Em andamento" },
  { id: "done", label: "Concluído" },
] as const;

export type ProjectStatus = (typeof PROJECT_STEPS)[number]["id"];

export const REACTIONS = [
  { id: "idea", label: "Boa ideia", emoji: "💡" },
  { id: "helped", label: "Ajudou", emoji: "🤝" },
  { id: "congrats", label: "Parabéns", emoji: "👏" },
  { id: "like", label: "Gostei", emoji: "❤️" },
  { id: "inspiring", label: "Inspirador", emoji: "🚀" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["id"];

export const VISIBILITY = [
  { id: "public", label: "Público", emoji: "🌎" },
  { id: "followers", label: "Seguidores", emoji: "👥" },
  { id: "me", label: "Somente eu", emoji: "🔒" },
] as const;

export type Visibility = (typeof VISIBILITY)[number]["id"];

export const SPACE_FIELDS = [
  { id: "bio", label: "Biografia" },
  { id: "thinking", label: "O que estou pensando" },
  { id: "doing", label: "O que estou fazendo" },
  { id: "learning", label: "O que estou aprendendo" },
  { id: "projects", label: "Meus projetos" },
  { id: "achievements", label: "Minhas conquistas" },
  { id: "ideas", label: "Ideias" },
  { id: "helpOffering", label: "Ajuda que ofereço" },
  { id: "helpSeeking", label: "Ajuda que procuro" },
] as const;

export type SpaceField = (typeof SPACE_FIELDS)[number]["id"];

export const FEED_TABS = [
  { id: "for-you", label: "Para você" },
  { id: "idea", label: "Ideias" },
  { id: "projects", label: "Projetos" },
  { id: "learning", label: "Aprendizados" },
  { id: "help", label: "Preciso de ajuda" },
  { id: "achievement", label: "Conquistas" },
] as const;

export function kindMeta(id: string) {
  return POST_KINDS.find((item) => item.id === id) ?? POST_KINDS[7];
}

export function isPostKind(value: string): value is PostKind {
  return POST_KINDS.some((item) => item.id === value);
}

export function isVisibility(value: string): value is Visibility {
  return VISIBILITY.some((item) => item.id === value);
}

export function isReactionKind(value: string): value is ReactionKind {
  return REACTIONS.some((item) => item.id === value);
}

export const DEFAULT_PRIVACY: Record<SpaceField, Visibility> = {
  bio: "public",
  thinking: "public",
  doing: "public",
  learning: "public",
  projects: "public",
  achievements: "public",
  ideas: "public",
  helpOffering: "public",
  helpSeeking: "public",
};
