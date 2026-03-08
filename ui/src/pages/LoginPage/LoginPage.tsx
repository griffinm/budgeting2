import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { Button, TextInput, PasswordInput, Text, Anchor, Paper } from '@mantine/core';
import { login } from '@/api';
import { ErrorResponse, LoginResponse } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Errors } from '@/components/Errors/Errors';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { IconMail, IconLock } from '@tabler/icons-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ErrorResponse>({ messages: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(CurrentUserContext);

  useEffect(() => {
    document.title = urls.login.title();
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ messages: [] });
    setLoading(true);
    login({ email, password })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data as LoginResponse;
          setToken(data.token);
          setUser(data.user);
          navigate(urls.dashboard.path());
        } else if (response.status === 401) {
          setErrors(response.data as ErrorResponse);
        } else {
          setErrors({ messages: ["An unknown error occurred"] });
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        if (error.response) {
          if (error.response.status === 401) {
            setErrors(error.response.data as ErrorResponse);
          } else {
            setErrors({ messages: ["An error occurred. Please try again."] });
          }
        } else if (error.request) {
          setErrors({ messages: ["Unable to connect to server. Please check if the backend is running."] });
        } else {
          setErrors({ messages: ["An unexpected error occurred. Please try again."] });
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <Paper shadow="xl" radius="lg" p="xl" withBorder={false}
      className="dark:bg-[var(--mantine-color-dark-7)]"
    >
      <Text size="xl" fw={700} mb={4}>Welcome back</Text>
      <Text size="sm" c="dimmed" mb="lg">Sign in to your account</Text>

      <Errors errors={errors.messages || []} />

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftSection={<IconMail size={16} />}
          size="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftSection={<IconLock size={16} />}
          size="md"
        />
        <Button type="submit" fullWidth mt="xl" size="md" loading={loading}>
          Sign in
        </Button>
      </form>

      <Text size="sm" mt="lg" ta="center" c="dimmed">
        Don't have an account?{' '}
        <Anchor href={urls.signup.path()} underline="hover" fw={600}>
          Create one
        </Anchor>
      </Text>
    </Paper>
  )
}
