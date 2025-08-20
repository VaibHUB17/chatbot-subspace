export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}