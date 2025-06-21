import { usePageTitle } from "@/hooks/usePageTitle";
import { urls } from "@/utils/urls";
import { Alert, Button, TextInput } from "@mantine/core";
import { useEffect, useState, useContext } from "react";
import { CurrentUserContext } from "@/providers/CurrentUser/CurrentUserContext";
import { Errors } from "@/components/Errors";
import { updateCurrentUser, UpdateCurrentUserParams } from "@/api";
import { ErrorResponse, LoginResponse } from "@/utils/types";

export default function ProfilePage() {
  const { user, setUser, setToken } = useContext(CurrentUserContext);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const setTitle = usePageTitle();
  useEffect(() => {
    setTitle(urls.profile.title());
  }, [setTitle]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword && password.length > 0) {
      setError(['Passwords do not match']);
      return;
    } else {
      setError([]);
    }
    const params: UpdateCurrentUserParams = {
      firstName,
      lastName,
      email,
      password: password.length > 0 ? password : undefined,
    }
    setLoading(true);
    setSuccess(false);
    updateCurrentUser({ params })
      .then((response: LoginResponse | ErrorResponse) => {
        if ('user' in response) {
          setUser(response.user);
          setToken(response.token);
          setError([]);
          setSuccess(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(response.messages || []);
          setSuccess(false);
        }
      })
      .catch((error) => {
        setError(error.response.data.errors);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Profile</h1>
      <Errors errors={error} />
      {success && <Alert color="green" title="Success">Profile updated successfully</Alert>}
      <form className="flex flex-col gap-4 w-full md:max-w-xs" onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <TextInput
          label="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
        />
        <TextInput
          label="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
        />
        <TextInput
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} disabled={loading}
        />
        <TextInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button disabled={loading} type="submit">Save</Button>
      </form>
    </div>
  );
}