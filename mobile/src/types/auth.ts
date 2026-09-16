export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export type LoginResult = {
  token: string;
  user: AuthUser;
};
