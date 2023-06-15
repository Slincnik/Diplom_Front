export type IUser = {
  id: number;
  login: string;
  name: string;
  lastname: string | null;
  avatar: string | null;
  is_verify: boolean;
  fullname: string;
  created_at: string;
  cent_token: string;
};

export type loginParams = {
  login: string;
  password: string;
};

export type registerParams = {
  login: string;
  email: string;
  name: string;
  lastname: string | null;
  password: string;
  password_confirmation: string;
};

export type LoginResponse = {
  access_token: string;
  user: IUser;
};

export type RegisterResponse = LoginResponse;
