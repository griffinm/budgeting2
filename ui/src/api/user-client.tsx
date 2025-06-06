import baseClient from './base-client';
import { User, LoginResponse, ErrorResponse } from '@/utils/types';
import { AxiosResponse } from 'axios';

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AxiosResponse<LoginResponse | ErrorResponse>> => {
  return baseClient.post('/users/login', { email, password });
};

export const fetchCurrentUser = async (): Promise<AxiosResponse<User>> => {
  const response = await baseClient.get<User>('/users/current');
  return response;
};
