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
  register: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<{ username: string } | null>(null);

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      return { success: true, message: data.message };
    } catch (error: any) {
      console.error("Error during registration:", error);
      return { success: false, message: error.message || "An error occurred." };
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

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      setUserId(payload.user_id);
      setUsername(payload.username);
      return { success: true, message: data.message };
    } catch (err) {
      console.error("Error during login:", err);
      return { success: false, message: err.message || "An error occurred." };
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
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
        register,
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
