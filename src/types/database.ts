export interface DatabaseProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  total_tickets: number;
  available_tickets: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTicket {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}
