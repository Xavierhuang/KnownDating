export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  location: string | null;
  photos: string | null; // JSON string
  interested_in: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface UserWithoutPassword {
  id: number;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  location: string | null;
  photos: string[];
  interested_in: string[];
  created_at: string;
  updated_at: string;
}

export interface Swipe {
  id: number;
  swiper_id: number;
  swiped_id: number;
  direction: 'left' | 'right';
  created_at: string;
}

export interface Match {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
}

export interface Message {
  id: number;
  match_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  read: boolean;
}

export interface AuthRequest extends Express.Request {
  userId?: number;
}

