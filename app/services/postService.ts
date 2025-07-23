import { directusAPI } from './api';
import type { Post, CreatePost, UpdatePost } from '../types';

class PostService {
  // Get all posts with user information and comment counts
  async getAllPosts(): Promise<Post[]> {
    try {
      const posts = await directusAPI.getItems<Post>('posts', {
        fields: '*,user_created.id,user_created.email,user_created.first_name,user_created.last_name,comment_count',
        sort: '-date_created'
      });
      return posts;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  // Get a single post by ID
  async getPost(id: string): Promise<Post> {
    try {
      const post = await directusAPI.getItem<Post>('posts', id, {
        fields: '*,user_created.id,user_created.email,user_created.first_name,user_created.last_name,comment_count'
      });
      return post;
    } catch (error) {
      console.error('Failed to fetch post:', error);
      throw error;
    }
  }

  // Create a new post
  async createPost(postData: CreatePost): Promise<Post> {
    try {
      const post = await directusAPI.createItem<Post>('posts', postData);
      return post;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  // Update an existing post
  async updatePost(id: string, postData: UpdatePost): Promise<Post> {
    try {
      const post = await directusAPI.updateItem<Post>('posts', id, postData);
      return post;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  // Delete a post
  async deletePost(id: string): Promise<void> {
    try {
      await directusAPI.deleteItem('posts', id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }

  // Get posts by current user
  async getUserPosts(): Promise<Post[]> {
    try {
      const user = directusAPI.getCachedUser();
      if (!user) throw new Error('User not authenticated');

      const posts = await directusAPI.getItems<Post>('posts', {
        fields: '*,user_created.id,user_created.email,user_created.first_name,user_created.last_name,comment_count',
        filter: {
          user_created: {
            _eq: user.id
          }
        },
        sort: '-date_created'
      });
      return posts;
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
export default postService;
