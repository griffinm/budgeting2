import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { Card, Button, TextInput, Text, Anchor } from '@mantine/core';
import { login } from '@/api';
import { ErrorResponse, LoginResponse } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Errors } from '@/components/Errors/Errors';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ErrorResponse>({ messages: [] });
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(CurrentUserContext);

  useEffect(() => {
    document.title = urls.login.title();
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ messages: [] });
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
  }

  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <Card shadow='sm' padding='lg' radius='md' withBorder miw={300}>
        <Errors errors={errors.messages || []} />
        <form onSubmit={handleSubmit}>
          <TextInput
            label='Email'
            placeholder='Email'
            mt="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            label='Password'
            placeholder='Password'
            mt="md"
            required
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end mt-5">
            <Button type="submit">Login</Button>
          </div>
        </form>
        <Text size="sm" mt="md" ta="center">
          Don't have an account?{' '}
          <Anchor href={urls.signup.path()} underline="always">
            Sign up
          </Anchor>
        </Text>
      </Card>
    </div>
  )
}
