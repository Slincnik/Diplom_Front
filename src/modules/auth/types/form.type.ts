export type Form = {
  id: string | number;
  validate: () => Promise<Validate>;
  reset: () => void;
  resetValidation: () => void;
  isValid: boolean;
  errorMessages: string[];
};

type Validate = {
  valid: boolean;
  errors: Array<{
    id: string | number;
    errorMessages: string[];
  }>;
};
