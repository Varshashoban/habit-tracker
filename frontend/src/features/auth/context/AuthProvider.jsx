import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../../../services/api/auth";
import { getSettings } from "../../../services/api/settings";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    settings: null,
    user: null,
  });

  useEffect(() => {
    getCurrentUser()
      .then(async ({ user }) => {
        const { settings } = await getSettings();
        setAuthState({ loading: false, settings, user });
      })
      .catch(() => setAuthState({ loading: false, settings: null, user: null }));
  }, []);

  useEffect(() => {
    if (!authState.settings?.account) {
      return;
    }

    document.documentElement.dataset.theme = authState.settings.account.darkMode
      ? "dark"
      : "light";
  }, [authState.settings]);

  const loadSettingsForUser = useCallback(async (user) => {
    const { settings } = await getSettings();
    setAuthState({ loading: false, settings, user });
    return { settings, user };
  }, []);

  const value = useMemo(
    () => ({
      loading: authState.loading,
      settings: authState.settings,
      user: authState.user,
      login: async (credentials) => {
        const { user } = await loginUser(credentials);
        await loadSettingsForUser(user);
        return user;
      },
      logout: async () => {
        await logoutUser();
        setAuthState({ loading: false, settings: null, user: null });
      },
      signup: async (details) => {
        const { user } = await signupUser(details);
        await loadSettingsForUser(user);
        return user;
      },
      updateSettings: (settings) => {
        setAuthState((currentState) => ({
          ...currentState,
          loading: false,
          settings,
        }));
      },
      updateUser: (user) => {
        setAuthState((currentState) => ({
          ...currentState,
          loading: false,
          user,
        }));
      },
    }),
    [authState.loading, authState.settings, authState.user, loadSettingsForUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
