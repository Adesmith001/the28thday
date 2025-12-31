export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: string;
  metadata?: {
    ventingMode?: boolean;
    userProfile?: Record<string, unknown>;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  summary?: string;
}
