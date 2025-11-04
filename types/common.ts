export type ActionsReturnType<T> = Promise<{
  success: boolean;
  message?: string;
  data?: T;
  errors?: {
    message: string;
    name: string;
  };
}>;
