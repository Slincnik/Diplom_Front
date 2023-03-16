export type IUser = {
  id: number;
  login: string;
  name: string;
  lastname: string | null;
  avatar: string | null;
  is_verify: boolean;
  created_at: string;
  cent_token: string;
};
