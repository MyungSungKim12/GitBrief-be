export type AuthenticatedUser = {
  id: string;
  githubLogin: string;
  avatarUrl: string | null;
  githubToken: string;
};
