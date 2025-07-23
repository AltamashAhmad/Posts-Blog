import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import type { RegisterData } from '../types';
import type { Route } from './+types/register';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - Directus Client" },
    { name: "description", content: "Create a new account" },
  ];
}

export function loader() {
  return null;
}

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const form = useForm<RegisterData>({
    initialValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      first_name: (value) => (value && value.length > 0 && value.length < 2 ? 'First name must be at least 2 characters' : null),
      last_name: (value) => (value && value.length > 0 && value.length < 2 ? 'Last name must be at least 2 characters' : null),
    },
  });

  const handleSubmit = async (values: RegisterData) => {
    try {
      setError('');
      await register(values);
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="text-gradient">
        Join us today
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component={Link} to="/login">
          Sign in
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
              label="First Name"
              placeholder="Your first name"
              {...form.getInputProps('first_name')}
            />

            <TextInput
              label="Last Name"
              placeholder="Your last name"
              {...form.getInputProps('last_name')}
            />

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
              {...form.getInputProps('password')}
            />

            <Button 
              type="submit" 
              fullWidth 
              mt="xl" 
              loading={loading}
            >
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
