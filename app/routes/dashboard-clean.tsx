import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import {
  Container,
  Title,
  Button,
  Card,
  Text,
  Textarea,
  TextInput,
  Group,
  Stack,
  Divider,
  Avatar,
  ActionIcon,
  Menu,
  Modal,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconLogout,
  IconEdit,
  IconTrash,
  IconDots,
  IconUser,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import { commentService } from '../services/commentService';
import { getUserDisplayName } from '../utils/helpers';
import type { Post, Comment, CreatePost, UpdatePost } from '../types';

export function meta() {
  return [
    { title: "Dashboard - Directus Client" },
    { name: "description", content: "Your main dashboard" },
  ];
}

export function loader() {
  return null;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Create Post Form
  const postForm = useForm<CreatePost>({
    initialValues: { title: '', content: '' },
    validate: {
      title: (value) => (!value.trim() ? 'Title is required' : null),
      content: (value) => (!value.trim() ? 'Content is required' : null),
    },
  });

  const editPostForm = useForm<UpdatePost>({
    initialValues: { title: '', content: '' },
  });

  
  const [commentForms, setCommentForms] = useState<{ [postId: string]: string }>({});

  // Load all data - optimized with Directus extension
  const loadData = async () => {
    try {
      setLoading(true);
      const postsData = await postService.getAllPosts();
      setPosts(postsData);

      setComments({});
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lazy load comments for a specific post (only when user expands comments)
  const loadCommentsForPost = async (postId: string) => {
    if (!comments[postId]) {
      try {
        const postComments = await commentService.getCommentsForPost(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to load comments',
          color: 'red',
        });
      }
    }
  };

  // Create new post
  const handleCreatePost = async (values: CreatePost) => {
    try {
      await postService.createPost(values);
      postForm.reset();
      notifications.show({
        title: 'Success',
        message: 'Post created successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create post',
        color: 'red',
      });
    }
  };

  // Update post
  const handleUpdatePost = async (postId: string, values: UpdatePost) => {
    try {
      await postService.updatePost(postId, values);
      setEditingPost(null);
      notifications.show({
        title: 'Success',
        message: 'Post updated successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update post',
        color: 'red',
      });
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      notifications.show({
        title: 'Success',
        message: 'Post deleted successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete post',
        color: 'red',
      });
    }
  };

  // Create comment
  const handleCreateComment = async (postId: string) => {
    const content = commentForms[postId]?.trim();
    if (!content) return;

    try {
      await commentService.createComment({ content, postId });
      setCommentForms({ ...commentForms, [postId]: '' });
      notifications.show({
        title: 'Success',
        message: 'Comment added successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add comment',
        color: 'red',
      });
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await commentService.updateComment(commentId, { content });
      setEditingComment(null);
      notifications.show({
        title: 'Success',
        message: 'Comment updated successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update comment',
        color: 'red',
      });
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      notifications.show({
        title: 'Success',
        message: 'Comment deleted successfully',
        color: 'green',
      });
      loadData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete comment',
        color: 'red',
      });
    }
  };

  // Check if user owns a post
  const isPostOwner = (post: Post) => {
    if (!user) return false;
    const postUser = typeof post.user_created === 'object' ? post.user_created : null;
    return postUser && postUser.id === user.id;
  };

  // Check if user owns a comment
  const isCommentOwner = (comment: Comment) => {
    if (!user) return false;
    const commentUser = typeof comment.user_created === 'object' ? comment.user_created : null;
    return commentUser && commentUser.id === user.id;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Text ta="center">Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Header with Welcome Message and Logout */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Welcome back, {getUserDisplayName(user)}!</Title>
          <Text c="dimmed" size="sm">Manage your posts and engage with the community</Text>
        </div>
        <Button leftSection={<IconLogout size="1rem" />} onClick={handleLogout} variant="light">
          Logout
        </Button>
      </Group>

      <Stack gap="xl">
        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconEdit size="1.5rem" color="var(--mantine-color-blue-6)" />
                <Text fw={500}>Total Posts</Text>
                <Text size="xl" fw={700}>{posts.length}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconUser size="1.5rem" color="var(--mantine-color-green-6)" />
                <Text fw={500}>Your Posts</Text>
                <Text size="xl" fw={700}>{posts.filter(post => isPostOwner(post)).length}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconDots size="1.5rem" color="var(--mantine-color-purple-6)" />
                <Text fw={500}>Total Comments</Text>
                <Text size="xl" fw={700}>
                  {posts.reduce((total, post) => total + (parseInt(String(post.comment_count)) || 0), 0)}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Create Post Section */}
        <Card withBorder p="lg" shadow="sm">
          <Title order={2} mb="md">✍️ Create New Post</Title>
          <Text c="dimmed" size="sm" mb="md">Share your thoughts with the community</Text>
          <form onSubmit={postForm.onSubmit(handleCreatePost)}>
            <Stack>
              <TextInput
                label="Title"
                placeholder="Enter an engaging title for your post"
                {...postForm.getInputProps('title')}
              />
              <Textarea
                label="Content"
                placeholder="What's on your mind? Share your story..."
                rows={4}
                {...postForm.getInputProps('content')}
              />
              <Group justify="flex-end">
                <Button type="submit" leftSection={<IconEdit size="1rem" />}>
                  Publish Post
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>

        {/* All Posts Section */}
        <div>
          <Title order={2} mb="lg">📝 Community Posts</Title>
          <Text c="dimmed" size="sm" mb="lg">Discover and engage with posts from the community</Text>
          
          {posts.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              No posts yet. Be the first to create one!
            </Text>
          ) : (
            <Stack gap="lg">
              {posts.map((post) => {
                const postComments = comments[post.id] || [];
                const authorName = typeof post.user_created === 'object' 
                  ? getUserDisplayName(post.user_created) 
                  : 'Unknown User';

                // Lazy load comments when user wants to view them
                const handleShowComments = () => {
                  loadCommentsForPost(post.id);
                };

                return (
                  <Card key={post.id} withBorder p="lg">
                    {/* Post Header */}
                    <Group justify="space-between" mb="md">
                      <Group>
                        <Avatar size="sm">
                          <IconUser size="1rem" />
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>{authorName}</Text>
                          <Text size="xs" c="dimmed">
                            {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
                          </Text>
                        </div>
                      </Group>
                      
                      {/* Post Actions (Edit/Delete for owner) */}
                      {isPostOwner(post) && (
                        <Menu>
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDots size="1rem" />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size="1rem" />}
                              onClick={() => {
                                setEditingPost(post.id);
                                editPostForm.setValues({ title: post.title, content: post.content });
                              }}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size="1rem" />}
                              color="red"
                              onClick={() => {
                                setDeleteTarget({ type: 'post', id: post.id });
                                setDeleteModalOpen(true);
                              }}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      )}
                    </Group>

                    {/* Post Content */}
                    {editingPost === post.id ? (
                      <form onSubmit={editPostForm.onSubmit((values) => handleUpdatePost(post.id, values))}>
                        <Stack>
                          <TextInput {...editPostForm.getInputProps('title')} />
                          <Textarea rows={4} {...editPostForm.getInputProps('content')} />
                          <Group>
                            <Button type="submit" size="sm">Save</Button>
                            <Button variant="subtle" size="sm" onClick={() => setEditingPost(null)}>
                              Cancel
                            </Button>
                          </Group>
                        </Stack>
                      </form>
                    ) : (
                      <>
                        <Title order={3} mb="sm">{post.title}</Title>
                        <Text mb="md" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Text>
                      </>
                    )}

                    <Divider my="md" />

                    {/* Comments Section - Use server-side count */}
                    <Title order={4} mb="md">Comments ({post.comment_count})</Title>
                    
                    {/* Load comments button if not already loaded */}
                    {!comments[post.id] && post.comment_count > 0 && (
                      <Button variant="subtle" size="sm" mb="md" onClick={handleShowComments}>
                        Show Comments
                      </Button>
                    )}
                    
                    {postComments.length > 0 && (
                      <Stack gap="sm" mb="md">
                        {postComments.map((comment) => {
                          const commentAuthor = typeof comment.user_created === 'object' 
                            ? getUserDisplayName(comment.user_created) 
                            : 'Unknown User';

                          return (
                            <Card key={comment.id} withBorder p="sm" bg="gray.0">
                              <Group justify="space-between" mb="xs">
                                <Group>
                                  <Avatar size="xs">
                                    <IconUser size="0.8rem" />
                                  </Avatar>
                                  <Text size="sm" fw={500}>{commentAuthor}</Text>
                                  <Text size="xs" c="dimmed">
                                    {formatDistanceToNow(new Date(comment.date_created), { addSuffix: true })}
                                  </Text>
                                </Group>
                                
                                {/* Comment Actions (Edit/Delete for owner) */}
                                {isCommentOwner(comment) && (
                                  <Menu>
                                    <Menu.Target>
                                      <ActionIcon size="sm" variant="subtle">
                                        <IconDots size="0.8rem" />
                                      </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                      <Menu.Item
                                        leftSection={<IconEdit size="0.8rem" />}
                                        onClick={() => setEditingComment(comment.id)}
                                      >
                                        Edit
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconTrash size="0.8rem" />}
                                        color="red"
                                        onClick={() => {
                                          setDeleteTarget({ type: 'comment', id: comment.id });
                                          setDeleteModalOpen(true);
                                        }}
                                      >
                                        Delete
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                )}
                              </Group>
                              
                              {editingComment === comment.id ? (
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  const textarea = e.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
                                  handleUpdateComment(comment.id, textarea.value);
                                }}>
                                  <Stack gap="xs">
                                    <Textarea defaultValue={comment.content} rows={2} />
                                    <Group gap="xs">
                                      <Button type="submit" size="xs">Save</Button>
                                      <Button variant="subtle" size="xs" onClick={() => setEditingComment(null)}>
                                        Cancel
                                      </Button>
                                    </Group>
                                  </Stack>
                                </form>
                              ) : (
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Text>
                              )}
                            </Card>
                          );
                        })}
                      </Stack>
                    )}

                    {/* Add Comment Form */}
                    <Group align="flex-end">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentForms[post.id] || ''}
                        onChange={(e) => setCommentForms({ ...commentForms, [post.id]: e.target.value })}
                        style={{ flex: 1 }}
                        rows={2}
                      />
                      <Button 
                        onClick={() => handleCreateComment(post.id)}
                        disabled={!commentForms[post.id]?.trim()}
                      >
                        Comment
                      </Button>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete ${deleteTarget?.type}`}
          centered
        >
          <Text mb="md">
            Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (deleteTarget?.type === 'post') {
                  handleDeletePost(deleteTarget.id);
                } else if (deleteTarget?.type === 'comment') {
                  handleDeleteComment(deleteTarget.id);
                }
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </Group>
        </Modal>
      </Stack>
    </Container>
  );
}
