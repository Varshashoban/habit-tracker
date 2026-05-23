import { useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../../../services/api/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
  });

  useEffect(() => {
    getCurrentUser()
      .then(({ user }) => setAuthState({ loading: false, user }))
      .catch(() => setAuthState({ loading: false, user: null }));
  }, []);

  const value = useMemo(
    () => ({
      loading: authState.loading,
      user: authState.user,
      login: async (credentials) => {
        const { user } = await loginUser(credentials);
        setAuthState({ loading: false, user });
        return user;
      },
      logout: async () => {
        await logoutUser();
        setAuthState({ loading: false, user: null });
      },
      signup: async (details) => {
        const { user } = await signupUser(details);
        setAuthState({ loading: false, user });
        return user;
      },
    }),
    [authState.loading, authState.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
