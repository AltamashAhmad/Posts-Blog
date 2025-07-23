import { directusAPI } from './api';
import type { Comment, CreateCommentData, UpdateCommentData } from '../types';

class CommentService {
  private collection = 'comments';

  // Get all comments for a specific post
  async getCommentsForPost(postId: string): Promise<Comment[]> {
    const params = {
      filter: {
        post: { _eq: postId }
      },
      sort: ['date_created'],
      fields: [
        '*',
        'user_created.id',
        'user_created.first_name',
        'user_created.last_name',
        'user_created.email',
        'parent_comment.id',
        'parent_comment.content'
      ]
    };

    return directusAPI.getItems<Comment>(this.collection, params);
  }

  // Get a specific comment
  async getComment(id: string): Promise<Comment> {
    const params = {
      fields: [
        '*',
        'user_created.id',
        'user_created.first_name',
        'user_created.last_name',
        'user_created.email',
        'post.id',
        'post.title',
        'parent_comment.id',
        'parent_comment.content'
      ]
    };

    return directusAPI.getItem<Comment>(this.collection, id, params);
  }

  // Create a new comment
  async createComment(data: CreateCommentData): Promise<Comment> {
    const commentData = {
      content: data.content,
      post: data.postId,
      parent_comment: data.parentCommentId || null,
      status: 'published'
    };

    return directusAPI.createItem<Comment>(this.collection, commentData);
  }

  // Update a comment
  async updateComment(id: string, data: UpdateCommentData): Promise<Comment> {
    const updateData = {
      content: data.content
    };

    return directusAPI.updateItem<Comment>(this.collection, id, updateData);
  }

  // Delete a comment
  async deleteComment(id: string): Promise<void> {
    return directusAPI.deleteItem(this.collection, id);
  }

  // Get comments by user
  async getUserComments(userId: string): Promise<Comment[]> {
    const params = {
      filter: {
        user_created: { _eq: userId }
      },
      sort: ['-date_created'],
      fields: [
        '*',
        'post.id',
        'post.title',
        'parent_comment.id',
        'parent_comment.content'
      ]
    };

    return directusAPI.getItems<Comment>(this.collection, params);
  }

  // Get replies to a specific comment
  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const params = {
      filter: {
        parent_comment: { _eq: commentId }
      },
      sort: ['date_created'],
      fields: [
        '*',
        'user_created.id',
        'user_created.first_name',
        'user_created.last_name',
        'user_created.email'
      ]
    };

    return directusAPI.getItems<Comment>(this.collection, params);
  }

  // Helper method to organize comments into a tree structure
  organizeComments(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_comment && typeof comment.parent_comment === 'object' && comment.parent_comment.id) {
        // This is a reply
        const parentComment = commentMap.get(comment.parent_comment.id);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }
}

export const commentService = new CommentService();
export default commentService;
