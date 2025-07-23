// User types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  date_created: string;
  date_updated: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  user_created: User | string;
  date_created: string;
  date_updated: string;
  comment_count: number; // Now required - provided by Directus extension
}

export interface CreatePost {
  title: string;
  content: string;
}

export interface UpdatePost {
  title?: string;
  content?: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  post: Post | string;
  user_created: User | string;
  parent_comment?: Comment | string | null;
  date_created: string;
  date_updated: string;
  replies?: Comment[];
}

export interface CreateComment {
  content: string;
  post: string;
}

export interface UpdateComment {
  content: string;
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentData {
  content: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access_token: string;
  expires: number;
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

// API Response types
export interface DirectusResponse<T> {
  data: T;
}

export interface DirectusListResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}

export interface DirectusError {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
      field?: string;
    };
  }>;
}
