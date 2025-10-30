import { useContext, useEffect, useState } from 'react';
import { urls } from '@/utils/urls';
import { Card, Button, TextInput, Text, Anchor } from '@mantine/core';
import { signup } from '@/api';
import { ErrorResponse, SignupResponse } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Errors } from '@/components/Errors/Errors';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(CurrentUserContext);

  useEffect(() => {
    document.title = urls.signup.title();
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    if (password.length < 8) {
      setErrors(['Password must be at least 8 characters']);
      return;
    }

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
  }

  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <Card shadow='sm' padding='lg' radius='md' withBorder miw={400}>
        <Text size="xl" fw={700} mb="md">Create your account</Text>
        <Errors errors={errors} />
        <form onSubmit={handleSubmit}>
          <TextInput
            label='First Name'
            placeholder='John'
            mt="md"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            label='Last Name'
            placeholder='Doe'
            mt="md"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextInput
            label='Email'
            placeholder='john@example.com'
            type="email"
            mt="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            label='Password'
            placeholder='At least 8 characters'
            mt="md"
            required
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextInput
            label='Confirm Password'
            placeholder='Re-enter your password'
            mt="md"
            required
            value={confirmPassword}
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end mt-5">
            <Button type="submit">Sign Up</Button>
          </div>
        </form>
        <Text size="sm" mt="md" ta="center">
          Already have an account?{' '}
          <Anchor href={urls.login.path()} underline="always">
            Log in
          </Anchor>
        </Text>
      </Card>
    </div>
  )
}

