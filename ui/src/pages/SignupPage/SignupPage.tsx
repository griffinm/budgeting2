import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { Button, TextInput, PasswordInput, Text, Anchor, Paper, SimpleGrid } from '@mantine/core';
import { signup } from '@/api';
import { ErrorResponse, SignupResponse } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Errors } from '@/components/Errors/Errors';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { IconMail, IconLock, IconUser } from '@tabler/icons-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(CurrentUserContext);

  useEffect(() => {
    document.title = urls.signup.title();
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    if (password.length < 8) {
      setErrors(['Password must be at least 8 characters']);
      return;
    }

    setLoading(true);
    signup({ email, firstName, lastName, password })
      .then((response) => {
        if (response.status === 201) {
          const data = response.data as SignupResponse;
          setToken(data.token);
          setUser(data.user);
          navigate(urls.dashboard.path());
        } else if (response.status === 422) {
          const errorData = response.data as ErrorResponse;
          setErrors(errorData.errors || ['An error occurred during signup']);
        } else {
          setErrors(['An unknown error occurred']);
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors(['An error occurred during signup']);
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <Paper shadow="xl" radius="lg" p="xl" withBorder={false}
      className="dark:bg-[var(--mantine-color-dark-7)]"
    >
      <Text size="xl" fw={700} mb={4}>Create your account</Text>
      <Text size="sm" c="dimmed" mb="lg">Start tracking your finances today</Text>

      <Errors errors={errors} />

      <form onSubmit={handleSubmit}>
        <SimpleGrid cols={2}>
          <TextInput
            label="First Name"
            placeholder="John"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            leftSection={<IconUser size={16} />}
            size="md"
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            size="md"
          />
        </SimpleGrid>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          mt="md"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftSection={<IconMail size={16} />}
          size="md"
        />
        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          mt="md"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftSection={<IconLock size={16} />}
          size="md"
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          mt="md"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftSection={<IconLock size={16} />}
          size="md"
        />
        <Button type="submit" fullWidth mt="xl" size="md" loading={loading}>
          Create account
        </Button>
      </form>

      <Text size="sm" mt="lg" ta="center" c="dimmed">
        Already have an account?{' '}
        <Anchor href={urls.login.path()} underline="hover" fw={600}>
          Sign in
        </Anchor>
      </Text>
    </Paper>
  )
}
