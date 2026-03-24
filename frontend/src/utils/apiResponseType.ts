import type { GitHubUser } from "./userType";

export type APIResponse = {
  msg: string | null;
  status_response: number;
  token: string | null;
  error: string | null;
  data: GitHubUser | null;
  };