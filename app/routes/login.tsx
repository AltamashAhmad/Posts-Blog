import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types';
import type { Route } from './+types/login';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Directus Client" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export function loader() {
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      setError('');
      await login(values);
      
      // Redirect to dashboard or intended page
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="text-gradient">
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor size="sm" component={Link} to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert
            icon={<IconInfoCircle size="1rem" />}
            title="Error"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />

            <Button 
              type="submit" 
              fullWidth 
              mt="xl" 
              loading={loading}
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
