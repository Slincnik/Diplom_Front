export type ServerError = {
  success: boolean;
  error: {
    error: string;
  };
  errors?: {
    [key: string]: string[];
  };
};
