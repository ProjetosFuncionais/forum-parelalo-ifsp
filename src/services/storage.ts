import { 
  User, Post, Comment, Like, Follow, AcademicEvent, EventParticipant, 
  Conversation, Message, Notification, SavedPost, Report 
} from '../types';
import { 
  SEED_USERS, SEED_POSTS, SEED_COMMENTS, SEED_EVENTS, SEED_FOLLOWS 
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'forum_ifsp_users_v1',
  POSTS: 'forum_ifsp_posts_v1',
  COMMENTS: 'forum_ifsp_comments_v1',
  LIKES: 'forum_ifsp_likes_v1',
  FOLLOWS: 'forum_ifsp_follows_v1',
  EVENTS: 'forum_ifsp_events_v1',
  EVENT_PARTICIPANTS: 'forum_ifsp_event_participants_v1',
  CONVERSATIONS: 'forum_ifsp_conversations_v1',
  MESSAGES: 'forum_ifsp_messages_v1',
  NOTIFICATIONS: 'forum_ifsp_notifications_v1',
  SAVED_POSTS: 'forum_ifsp_saved_posts_v1',
  REPORTS: 'forum_ifsp_reports_v1',
  CURRENT_USER_ID: 'forum_ifsp_current_user_id_v1',
  THEME: 'forum_ifsp_theme_v1'
};

export type ThemePreference = 'light' | 'dark' | 'system';

export const STORE_CHANGE_EVENT = 'forum_ifsp_store_change';

class StorageService {
  private changeQueued = false;

  /** Agrupa várias gravações da mesma ação em um único evento de mudança. */
  private notifyChange() {
    if (typeof window === 'undefined' || this.changeQueued) return;
    this.changeQueued = true;
    queueMicrotask(() => {
      this.changeQueued = false;
      window.dispatchEvent(new CustomEvent(STORE_CHANGE_EVENT));
    });
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyChange();
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public init() {
    if (typeof window === 'undefined') return;
    
    // Seed Users if not present
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
    }
    // Seed Posts
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      this.setItem(STORAGE_KEYS.POSTS, SEED_POSTS);
    }
    // Seed Comments
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      this.setItem(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    }
    // Seed Events
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.setItem(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    }
    // Seed Follows
    if (!localStorage.getItem(STORAGE_KEYS.FOLLOWS)) {
      this.setItem(STORAGE_KEYS.FOLLOWS, SEED_FOLLOWS);
    }
    // Default current user
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_vitor');
    }
    // Seed sample conversation between Vitor and Mariana
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      const sampleConv: Conversation = {
        id: 'conv_vitor_mariana',
        participants: ['user_vitor', 'user_mariana'],
        lastMessage: 'Perfeito! Enviei o currículo e o histórico escolar para seu e-mail institucional.',
        lastMessageSenderId: 'user_vitor',
        lastMessageAt: '2026-10-15T16:00:00.000Z',
        unreadCount: { 'user_mariana': 1, 'user_vitor': 0 }
      };
      const sampleMsg1: Message = {
        id: 'msg_1',
        conversationId: 'conv_vitor_mariana',
        senderId: 'user_mariana',
        content: 'Olá Vítor! Vi seu interesse na bolsa de IC sobre modelos de linguagem. Você tem disponibilidade de 20h semanais?',
        createdAt: '2026-10-15T15:35:00.000Z',
        read: true
      };
      const sampleMsg2: Message = {
        id: 'msg_2',
        conversationId: 'conv_vitor_mariana',
        senderId: 'user_vitor',
        content: 'Olá Professora! Sim, minhas aulas no IFSP Pirituba são no período noturno, então tenho as manhãs e tardes livres.',
        createdAt: '2026-10-15T15:45:00.000Z',
        read: true
      };
      const sampleMsg3: Message = {
        id: 'msg_3',
        conversationId: 'conv_vitor_mariana',
        senderId: 'user_vitor',
        content: 'Perfeito! Enviei o currículo e o histórico escolar para seu e-mail institucional.',
        createdAt: '2026-10-15T16:00:00.000Z',
        read: false
      };
      this.setItem(STORAGE_KEYS.CONVERSATIONS, [sampleConv]);
      this.setItem(STORAGE_KEYS.MESSAGES, [sampleMsg1, sampleMsg2, sampleMsg3]);
    }
    // Seed initial notifications
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const sampleNotifs: Notification[] = [
        {
          id: 'notif_1',
          userId: 'user_vitor',
          actorId: 'user_mariana',
          type: 'comment',
          referenceId: 'post_1',
          content: 'respondeu ao seu comentário na publicação sobre Iniciação Científica',
          read: false,
          createdAt: '2026-10-15T15:20:00.000Z'
        },
        {
          id: 'notif_2',
          userId: 'user_vitor',
          actorId: 'user_lucas',
          type: 'like',
          referenceId: 'post_2',
          content: 'curtiu seu resumo de Cálculo e Estrutura de Dados',
          read: true,
          createdAt: '2026-10-16T08:30:00.000Z'
        },
        {
          id: 'notif_3',
          userId: 'user_vitor',
          actorId: 'user_beatriz',
          type: 'follow',
          referenceId: 'user_beatriz',
          content: 'começou a seguir você',
          read: false,
          createdAt: '2026-10-16T09:12:00.000Z'
        }
      ];
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, sampleNotifs);
    }
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.COMMENTS);
    localStorage.removeItem(STORAGE_KEYS.LIKES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOWS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.EVENT_PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_POSTS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.init();
    this.notifyChange();
  }

  // --- CURRENT USER & AUTH ---
  public getCurrentUserId(): string {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_vitor');
  }

  public setCurrentUserId(userId: string) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  public getCurrentUser(): User | undefined {
    const currentId = this.getCurrentUserId();
    return this.getUserById(currentId);
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase().replace('@', '');
    return this.getUsers().find(u => u.username.toLowerCase() === clean);
  }

  public getUserByEmail(email: string): User | undefined {
    const clean = email.trim().toLowerCase();
    return this.getUsers().find(u => u.email.toLowerCase() === clean);
  }

  public createUser(user: Omit<User, 'id' | 'followersCount' | 'followingCount' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    this.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  public searchUsers(query: string): User[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return this.getUsers().filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q) || 
      u.campus.toLowerCase().includes(q) ||
      u.course.toLowerCase().includes(q)
    );
  }

  public toggleBlockUser(currentUserId: string, targetUserId: string): boolean {
    const user = this.getUserById(currentUserId);
    if (!user) return false;
    const blocked = user.blockedUsers || [];
    const isBlocked = blocked.includes(targetUserId);
    const updatedBlocked = isBlocked
      ? blocked.filter(id => id !== targetUserId)
      : [...blocked, targetUserId];
    this.updateUser(currentUserId, { blockedUsers: updatedBlocked });
    return !isBlocked;
  }

  // --- POSTS ---
  public getPosts(): Post[] {
    return this.getItem<Post[]>(STORAGE_KEYS.POSTS, []);
  }

  public getPostById(id: string): Post | undefined {
    return this.getPosts().find(p => p.id === id);
  }

  public createPost(data: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'savedCount' | 'sharesCount' | 'createdAt'>): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      ...data,
      id: `post_${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      savedCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString()
    };
    posts.unshift(newPost);
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return newPost;
  }

  public updatePost(id: string, updates: Partial<Post>): Post | undefined {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return posts[index];
  }

  public sharePost(id: string) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;
    post.sharesCount = (post.sharesCount || 0) + 1;
    this.setItem(STORAGE_KEYS.POSTS, posts);
  }

  public deletePost(id: string, userId: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    const currentUser = this.getUserById(userId);
    if (!post) return false;
    // Authorized if author or admin/moderator
    if (post.authorId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'moderator') {
      return false;
    }
    const updated = posts.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.POSTS, updated);
    this.setItem(STORAGE_KEYS.COMMENTS, this.getComments().filter(c => c.postId !== id));
    return true;
  }

  // --- LIKES ---
  public getLikes(): Like[] {
    return this.getItem<Like[]>(STORAGE_KEYS.LIKES, []);
  }

  public hasUserLiked(userId: string, targetId: string, targetType: 'post' | 'comment'): boolean {
    const likes = this.getLikes();
    return likes.some(l => l.userId === userId && l.targetId === targetId && l.targetType === targetType);
  }

  public toggleLike(userId: string, targetId: string, targetType: 'post' | 'comment'): boolean {
    const likes = this.getLikes();
    const existingIndex = likes.findIndex(l => l.userId === userId && l.targetId === targetId && l.targetType === targetType);
    let liked = false;

    if (existingIndex > -1) {
      likes.splice(existingIndex, 1);
      liked = false;
    } else {
      likes.push({
        id: `like_${Date.now()}`,
        userId,
        targetId,
        targetType,
        createdAt: new Date().toISOString()
      });
      liked = true;
    }
    this.setItem(STORAGE_KEYS.LIKES, likes);

    // Update target count
    if (targetType === 'post') {
      const posts = this.getPosts();
      const post = posts.find(p => p.id === targetId);
      if (post) {
        post.likesCount = Math.max(0, post.likesCount + (liked ? 1 : -1));
        this.setItem(STORAGE_KEYS.POSTS, posts);

        // Send notification to author if liked and not self
        if (liked && post.authorId !== userId) {
          this.createNotification({
            userId: post.authorId,
            actorId: userId,
            type: 'like',
            referenceId: post.id,
            content: 'curtiu sua publicação'
          });
        }
      }
    } else {
      const comments = this.getComments();
      const comment = comments.find(c => c.id === targetId);
      if (comment) {
        comment.likesCount = Math.max(0, comment.likesCount + (liked ? 1 : -1));
        this.setItem(STORAGE_KEYS.COMMENTS, comments);
      }
    }

    return liked;
  }

  // --- SAVED POSTS ---
  public getSavedPosts(userId: string): SavedPost[] {
    return this.getItem<SavedPost[]>(STORAGE_KEYS.SAVED_POSTS, []).filter(s => s.userId === userId);
  }

  public isPostSaved(userId: string, postId: string): boolean {
    return this.getItem<SavedPost[]>(STORAGE_KEYS.SAVED_POSTS, []).some(s => s.userId === userId && s.postId === postId);
  }

  public toggleSavePost(userId: string, postId: string): boolean {
    const list = this.getItem<SavedPost[]>(STORAGE_KEYS.SAVED_POSTS, []);
    const idx = list.findIndex(s => s.userId === userId && s.postId === postId);
    let saved = false;

    if (idx > -1) {
      list.splice(idx, 1);
      saved = false;
    } else {
      list.push({
        id: `save_${Date.now()}`,
        userId,
        postId,
        createdAt: new Date().toISOString()
      });
      saved = true;
    }
    this.setItem(STORAGE_KEYS.SAVED_POSTS, list);

    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.savedCount = Math.max(0, post.savedCount + (saved ? 1 : -1));
      this.setItem(STORAGE_KEYS.POSTS, posts);
    }

    return saved;
  }

  // --- COMMENTS ---
  public getComments(): Comment[] {
    return this.getItem<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  }

  public getCommentsByPost(postId: string): Comment[] {
    return this.getComments().filter(c => c.postId === postId);
  }

  public createComment(data: { postId: string; authorId: string; content: string; parentId?: string }): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      ...data,
      id: `comment_${Date.now()}`,
      likesCount: 0,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    this.setItem(STORAGE_KEYS.COMMENTS, comments);

    // Update post count
    const posts = this.getPosts();
    const post = posts.find(p => p.id === data.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
      this.setItem(STORAGE_KEYS.POSTS, posts);

      // Notify post author or parent comment author
      if (post.authorId !== data.authorId) {
        this.createNotification({
          userId: post.authorId,
          actorId: data.authorId,
          type: 'comment',
          referenceId: post.id,
          content: data.parentId ? 'respondeu a um comentário na sua publicação' : 'comentou na sua publicação'
        });
      }
    }

    return newComment;
  }

  public deleteComment(id: string, userId: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === id);
    const currentUser = this.getUserById(userId);
    if (!comment) return false;
    if (comment.authorId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'moderator') {
      return false;
    }

    const updated = comments.filter(c => c.id !== id && c.parentId !== id);
    const removedCount = comments.length - updated.length;
    this.setItem(STORAGE_KEYS.COMMENTS, updated);

    // Decrement post commentsCount
    const posts = this.getPosts();
    const post = posts.find(p => p.id === comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - removedCount);
      this.setItem(STORAGE_KEYS.POSTS, posts);
    }
    return true;
  }

  // --- FOLLOWS ---
  public getFollows(): Follow[] {
    return this.getItem<Follow[]>(STORAGE_KEYS.FOLLOWS, []);
  }

  public isFollowing(followerId: string, followingId: string): boolean {
    return this.getFollows().some(f => f.followerId === followerId && f.followingId === followingId);
  }

  public toggleFollow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false; // Prevent self-follow
    const follows = this.getFollows();
    const idx = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    let following = false;

    if (idx > -1) {
      follows.splice(idx, 1);
      following = false;
    } else {
      follows.push({
        id: `f_${Date.now()}`,
        followerId,
        followingId,
        createdAt: new Date().toISOString()
      });
      following = true;
    }
    this.setItem(STORAGE_KEYS.FOLLOWS, follows);

    // Update followersCount and followingCount
    const follower = this.getUserById(followerId);
    const target = this.getUserById(followingId);
    if (follower && target) {
      this.updateUser(followerId, {
        followingCount: Math.max(0, (follower.followingCount || 0) + (following ? 1 : -1))
      });
      this.updateUser(followingId, {
        followersCount: Math.max(0, (target.followersCount || 0) + (following ? 1 : -1))
      });

      if (following) {
        this.createNotification({
          userId: followingId,
          actorId: followerId,
          type: 'follow',
          referenceId: followerId,
          content: 'começou a seguir você'
        });
      }
    }

    return following;
  }

  public getFollowers(userId: string): User[] {
    const followerIds = this.getFollows()
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    return this.getUsers().filter(u => followerIds.includes(u.id));
  }

  public getFollowing(userId: string): User[] {
    const followingIds = this.getFollows()
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    return this.getUsers().filter(u => followingIds.includes(u.id));
  }

  // --- EVENTS ---
  public getEvents(): AcademicEvent[] {
    return this.getItem<AcademicEvent[]>(STORAGE_KEYS.EVENTS, []);
  }

  public getEventById(id: string): AcademicEvent | undefined {
    return this.getEvents().find(e => e.id === id);
  }

  public createEvent(data: Omit<AcademicEvent, 'id' | 'attendeesCount' | 'interestedCount' | 'createdAt'>): AcademicEvent {
    const events = this.getEvents();
    const newEvent: AcademicEvent = {
      ...data,
      id: `event_${Date.now()}`,
      attendeesCount: 0,
      interestedCount: 0,
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<AcademicEvent>): AcademicEvent | undefined {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    events[idx] = { ...events[idx], ...updates };
    this.setItem(STORAGE_KEYS.EVENTS, events);
    return events[idx];
  }

  public deleteEvent(id: string, userId: string): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === id);
    const currentUser = this.getUserById(userId);
    if (!event) return false;
    if (event.organizerId !== userId && currentUser?.role !== 'admin' && currentUser?.role !== 'moderator') {
      return false;
    }
    const updated = events.filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EVENTS, updated);
    return true;
  }

  public getEventParticipants(): EventParticipant[] {
    return this.getItem<EventParticipant[]>(STORAGE_KEYS.EVENT_PARTICIPANTS, []);
  }

  public getUserEventParticipation(userId: string, eventId: string): 'attending' | 'interested' | null {
    const record = this.getEventParticipants().find(p => p.userId === userId && p.eventId === eventId);
    return record ? record.status : null;
  }

  public toggleEventParticipation(userId: string, eventId: string, status: 'attending' | 'interested'): 'attending' | 'interested' | null {
    const list = this.getEventParticipants();
    const idx = list.findIndex(p => p.userId === userId && p.eventId === eventId);
    const event = this.getEventById(eventId);
    if (!event) return null;

    let resultStatus: 'attending' | 'interested' | null = null;

    if (idx > -1) {
      const oldStatus = list[idx].status;
      if (oldStatus === status) {
        // Toggle off
        list.splice(idx, 1);
        resultStatus = null;
        if (oldStatus === 'attending') event.attendeesCount = Math.max(0, event.attendeesCount - 1);
        if (oldStatus === 'interested') event.interestedCount = Math.max(0, event.interestedCount - 1);
      } else {
        // Switch status
        list[idx].status = status;
        resultStatus = status;
        if (oldStatus === 'attending') event.attendeesCount = Math.max(0, event.attendeesCount - 1);
        if (oldStatus === 'interested') event.interestedCount = Math.max(0, event.interestedCount - 1);
        if (status === 'attending') event.attendeesCount += 1;
        if (status === 'interested') event.interestedCount += 1;
      }
    } else {
      // New participation
      list.push({
        id: `ep_${Date.now()}`,
        eventId,
        userId,
        status,
        createdAt: new Date().toISOString()
      });
      resultStatus = status;
      if (status === 'attending') event.attendeesCount += 1;
      if (status === 'interested') event.interestedCount += 1;
    }

    this.setItem(STORAGE_KEYS.EVENT_PARTICIPANTS, list);
    this.updateEvent(eventId, {
      attendeesCount: event.attendeesCount,
      interestedCount: event.interestedCount
    });

    return resultStatus;
  }

  // --- CONVERSATIONS & CHAT ---
  public getConversations(userId: string): Conversation[] {
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    return convs.filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  public getOrCreateConversation(userAId: string, userBId: string): Conversation {
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const existing = convs.find(c => 
      c.participants.includes(userAId) && c.participants.includes(userBId)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participants: [userAId, userBId],
      lastMessage: '',
      lastMessageSenderId: userAId,
      lastMessageAt: new Date().toISOString(),
      unreadCount: { [userAId]: 0, [userBId]: 0 }
    };
    convs.unshift(newConv);
    this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
    return newConv;
  }

  public getMessages(conversationId: string): Message[] {
    const all = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return all.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public sendMessage(conversationId: string, senderId: string, content: string): Message {
    const messages = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
      read: false
    };
    messages.push(newMsg);
    this.setItem(STORAGE_KEYS.MESSAGES, messages);

    // Update conversation metadata
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = convs.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = content;
      conv.lastMessageSenderId = senderId;
      conv.lastMessageAt = newMsg.createdAt;
      
      const otherParticipant = conv.participants.find(p => p !== senderId);
      if (otherParticipant) {
        conv.unreadCount = conv.unreadCount || {};
        conv.unreadCount[otherParticipant] = (conv.unreadCount[otherParticipant] || 0) + 1;

        // Send push/notification to recipient
        this.createNotification({
          userId: otherParticipant,
          actorId: senderId,
          type: 'message',
          referenceId: conversationId,
          content: 'enviou uma nova mensagem privada para você'
        });
      }
      this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    return newMsg;
  }

  public markConversationAsRead(conversationId: string, userId: string) {
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = convs.find(c => c.id === conversationId);
    if (conv && conv.unreadCount && conv.unreadCount[userId]) {
      conv.unreadCount[userId] = 0;
      this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
    }

    // Mark messages as read
    const msgs = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    let modified = false;
    msgs.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== userId && !m.read) {
        m.read = true;
        modified = true;
      }
    });
    if (modified) {
      this.setItem(STORAGE_KEYS.MESSAGES, msgs);
    }
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): Notification[] {
    const notifs = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs.filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const notifs = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const notifs = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    const notifs = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  public getUnreadNotificationsCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  // --- REPORTS & MODERATION ---
  public getReports(): Report[] {
    return this.getItem<Report[]>(STORAGE_KEYS.REPORTS, []);
  }

  public createReport(data: Omit<Report, 'id' | 'status' | 'createdAt'>): Report {
    const reports = this.getReports();
    const newReport: Report = {
      ...data,
      id: `report_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    this.setItem(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  public updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'dismissed'): boolean {
    const reports = this.getReports();
    const r = reports.find(item => item.id === reportId);
    if (!r) return false;
    r.status = status;
    this.setItem(STORAGE_KEYS.REPORTS, reports);
    return true;
  }

  public suspendUser(userId: string, isSuspended: boolean): boolean {
    return !!this.updateUser(userId, { isSuspended });
  }

  // --- THEME ---
  public getTheme(): ThemePreference {
    const value = this.getItem<string>(STORAGE_KEYS.THEME, 'system');
    return value === 'light' || value === 'dark' ? value : 'system';
  }

  public setTheme(theme: ThemePreference) {
    // Gravado direto, sem disparar evento: trocar o tema não muda dados.
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch {
      /* armazenamento indisponível */
    }
  }
}

export const storage = new StorageService();
