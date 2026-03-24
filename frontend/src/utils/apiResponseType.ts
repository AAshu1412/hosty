
export type APIResponse<T> = {
  msg: string | null;
  status_response: number;
  token: string | null;
  error: string | null;
  data: T | null;
  };

