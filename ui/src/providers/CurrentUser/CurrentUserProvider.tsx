import React, { useState, useEffect } from 'react';
import { User } from '@/utils/types';
import { fetchCurrentUser, updateAllPlaidAccounts } from '@/api';
import { CurrentUserContext } from './CurrentUserContext';
import { urls } from '@/utils/urls';
import { AUTH_TOKEN_STORAGE_KEY } from '@/utils/constants';
import { Loading } from '@/components/Loading';

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (window.location.pathname === urls.login.path()) {
      setUserLoading(false);
      return;
    }

    fetchCurrentUser().then((response) => {
      if (response.status === 200) {
        setUser(response.data);
      } else {
        setUser(null);
      }
      setUserLoading(false);

      // Once the current user is fetched send a command to sync all plaid accounts
      updateAllPlaidAccounts();
    });
  }, []);

  const deleteToken = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  const setToken = (token: string) => {
    if (!token) {
      return
    }
    
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  };

  return (
    <CurrentUserContext.Provider value={{ 
      user,
      userLoading,
      setUser,
      setToken,
      deleteToken,
    }}>
      {userLoading ? (
        <Loading />
      ) : (
        children
      )}
    </CurrentUserContext.Provider>
  );
}; 
