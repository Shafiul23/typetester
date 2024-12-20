import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserId: (userId: number | null) => void;
  checkAuthStatus: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/status", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.logged_in) {
        setIsLoggedIn(true);
        setUserId(data.user_id);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setUserId(data.user_id);
        console.log("user id: ", data.user_id);
      } else {
        console.error("Login failed:", data.error);
      }
    } catch (err) {
      console.error("Error during login:", err);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://127.0.0.1:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      setUserId(null);
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        setIsLoggedIn,
        setUserId,
        checkAuthStatus,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
