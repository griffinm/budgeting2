import { createContext } from "react";
import { User } from "@/utils/types";

interface CurrentUserContextType {
  user: User | null;
  userLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: null,
  userLoading: true,
  setUser: () => {},
  setToken: () => {},
});
