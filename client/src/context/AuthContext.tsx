import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface AuthContextType {
  userId: number | null;
  username: string | null;
  setUserId: (userId: number | null) => void;
  setUsername: (username: string | null) => void;
  checkAuthStatus: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<{ username: string } | null>(null);

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
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        setUserId(payload.user_id);
        console.log("user id: ", payload.user_id);
        setUsername(payload.username);
        console.log("username: ", payload.username);
      } else {
        console.error("Login failed:", data.error);
      }
    } catch (err) {
      console.error("Error during login:", err);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token"); // Remove token from storage
    setUserId(null);
    setUsername(null);
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserId(null);
      setUsername(null);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.logged_in) {
        setUserId(data.user_id);
        setUsername(data.username);
      } else {
        setUserId(null);
        setUsername(null);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        username,
        setUserId,
        setUsername,
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
