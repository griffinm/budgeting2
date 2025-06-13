import { useContext, useEffect } from 'react';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { urls } from '@/utils/urls';

export default function DashboardPage() {
  const { user } = useContext(CurrentUserContext);

  useEffect(() => {
    document.title = urls.dashboard.title();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}</p>
    </div>
  );
}
