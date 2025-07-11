import { baseClient } from './base-client';
import { User, LoginResponse, ErrorResponse } from '@/utils/types';
import { AxiosResponse } from 'axios';

type UserOmitFields = 'account' | 'createdAt' | 'updatedAt' | 'accountId' | 'id';
export interface UpdateCurrentUserParams extends Partial<Omit<User, UserOmitFields>> {
  password?: string;
}

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


export const updateCurrentUser = async ({
  params,
}: {
  params: UpdateCurrentUserParams;
}): Promise<LoginResponse | ErrorResponse> => {
  const response = await baseClient.patch(`/users/current`, { user: params });
  return response.data;
};