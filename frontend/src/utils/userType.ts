export type GitHubUser = {
    username: string;
    id: number;
    node_id: string;
    email: string | null;
    type: string;
    name: string;
    user_view_type: string;
    bio: string | null;
    location: string | null;
    notification_email: string | null;
    avatar_url: string | null;
    html_url: string;
  }
  
  export type User = {
    _id?: string; // MongoDB ObjectId
    access_token: string;
    access_token_expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    token_type: string;
    username: string;
    id: number;
    email: string | null;
    isAdmin: boolean;
    user: GitHubUser;
    repos: any[]; // GitHub repo objects
    __v?: number; // Mongoose version key
  }

  