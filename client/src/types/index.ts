export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  location: string | null;
  photos: string[];
  interested_in: string[];
  age_min?: number;
  age_max?: number;
  distance_max?: number;
  // Career Journey fields (Step 2)
  founder_status?: string | null;
  industry?: string | null;
  funding_status?: string | null;
  company_name?: string | null;
  company_stage?: string | null;
  role?: string | null;
  founding_story?: string | null;
  biggest_challenge?: string | null;
  // Lifestyle & Compatibility fields (Step 3)
  work_life_balance?: string | null;
  ideal_date_night?: string | null;
  view_on_exit?: string | null;
  date_people_who_talk_work?: string | null;
  how_destress?: string | null;
  coffee_order?: string | null;
  hustle_quote?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  user_id: string;
  name: string;
  age: number;
  photos: string[];
  created_at: string;
  last_message?: string;
  last_message_time?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface SwipeUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  location: string | null;
  photos: string[];
  distance?: number | null;
  // Career Journey fields
  founder_status?: string | null;
  industry?: string | null;
  funding_status?: string | null;
  company_name?: string | null;
  company_stage?: string | null;
  role?: string | null;
  founding_story?: string | null;
  biggest_challenge?: string | null;
  // Lifestyle & Compatibility fields
  work_life_balance?: string | null;
  ideal_date_night?: string | null;
  view_on_exit?: string | null;
  date_people_who_talk_work?: string | null;
  how_destress?: string | null;
  coffee_order?: string | null;
  hustle_quote?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

