import { usePageTitle } from "@/hooks/usePageTitle";
import { urls } from "@/utils/urls";
import { Alert, Button, Card, Select, SegmentedControl, Switch, Text, TextInput, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState, useContext, useCallback } from "react";
import { CurrentUserContext } from "@/providers/CurrentUser/CurrentUserContext";
import { Errors } from "@/components/Errors";
import { updateCurrentUser, UpdateCurrentUserParams } from "@/api";
import { ErrorResponse, LoginResponse } from "@/utils/types";

export default function ProfilePage() {
  const { user, setUser, setToken } = useContext(CurrentUserContext);
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reportEnabled, setReportEnabled] = useState(user?.reportEnabled ?? true);
  const [reportFrequency, setReportFrequency] = useState(user?.reportFrequency || 'daily');
  const [reportDayOfWeek, setReportDayOfWeek] = useState<string | null>(user?.reportDayOfWeek?.toString() ?? null);
  const [error, setError] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveEmailPreferences = useCallback((params: UpdateCurrentUserParams) => {
    updateCurrentUser({ params })
      .then((response: LoginResponse | ErrorResponse) => {
        if ('user' in response) {
          setUser(response.user);
          setToken(response.token);
        }
      });
  }, [setUser, setToken]);

  const setTitle = usePageTitle();
  useEffect(() => {
    setTitle(urls.profile.title());
  }, [setTitle]);

  const handleColorSchemeChange = (value: string) => {
    const scheme = value as 'light' | 'dark' | 'auto';
    setColorScheme(scheme);
    document.cookie = `mantine-color-scheme=${scheme};path=/;max-age=34560000`;
  };

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
    <div className="flex flex-col gap-4">
      <Card className="max-w-sm">
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
      </Card>

      <Card className="max-w-sm">
        <Text fw={500} mb="xs">Appearance</Text>
        <SegmentedControl
          value={colorScheme}
          onChange={handleColorSchemeChange}
          data={[
            { label: 'System', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
        />
      </Card>

      <Card className="max-w-sm">
        <Text fw={500} mb="xs">Email Preferences</Text>
        <div className="flex flex-col gap-3 w-full md:max-w-xs">
          <Switch
            label="Enable report emails"
            checked={reportEnabled}
            onChange={(e) => {
              const enabled = e.currentTarget.checked;
              setReportEnabled(enabled);
              saveEmailPreferences({
                reportEnabled: enabled,
                reportFrequency: reportFrequency as 'daily' | 'weekly' | 'monthly',
                reportDayOfWeek: reportDayOfWeek !== null ? parseInt(reportDayOfWeek) : null,
              });
            }}
          />
          {reportEnabled && (
            <>
              <Select
                label="Report Frequency"
                value={reportFrequency}
                onChange={(value) => {
                  const freq = value || 'daily';
                  const day = freq === 'daily' ? null : reportDayOfWeek;
                  setReportFrequency(freq);
                  if (freq === 'daily') setReportDayOfWeek(null);
                  saveEmailPreferences({
                    reportEnabled,
                    reportFrequency: freq as 'daily' | 'weekly' | 'monthly',
                    reportDayOfWeek: day !== null ? parseInt(day) : null,
                  });
                }}
                data={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                ]}
              />
              {reportFrequency !== 'daily' && (
                <Select
                  label={reportFrequency === 'weekly' ? 'Day of Week' : 'First Occurrence of Day'}
                  value={reportDayOfWeek}
                  onChange={(value) => {
                    setReportDayOfWeek(value);
                    saveEmailPreferences({
                      reportEnabled,
                      reportFrequency: reportFrequency as 'daily' | 'weekly' | 'monthly',
                      reportDayOfWeek: value !== null ? parseInt(value) : null,
                    });
                  }}
                  data={[
                    { label: 'Sunday', value: '0' },
                    { label: 'Monday', value: '1' },
                    { label: 'Tuesday', value: '2' },
                    { label: 'Wednesday', value: '3' },
                    { label: 'Thursday', value: '4' },
                    { label: 'Friday', value: '5' },
                    { label: 'Saturday', value: '6' },
                  ]}
                />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
