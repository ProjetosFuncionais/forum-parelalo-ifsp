export type UserRole = 'student' | 'teacher' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  campus: string;
  course: string;
  semester?: number;
  role: UserRole;
  interests: string[];
  followersCount: number;
  followingCount: number;
  createdAt: string;
  blockedUsers?: string[];
  isSuspended?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  tags: string[];
  campus: string;
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // For replies
  likesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Like {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export type EventCategory = 
  | 'tecnologia' 
  | 'palestra' 
  | 'workshop' 
  | 'hackathon' 
  | 'iniciacao_cientifica' 
  | 'cultura' 
  | 'esporte' 
  | 'estagio';

export type EventStatus = 'upcoming' | 'ongoing' | 'concluded';

export interface AcademicEvent {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  coverUrl?: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  campus: string;
  attendeesCount: number;
  interestedCount: number;
  status: EventStatus;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: 'attending' | 'interested';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>; // userId -> count
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export type NotificationType = 'follow' | 'like' | 'comment' | 'message' | 'event_reminder' | 'system';

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  referenceId?: string; // postId, eventId, etc.
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'event' | 'user';
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
