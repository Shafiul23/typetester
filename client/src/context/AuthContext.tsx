import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  userId: number | null;
  username: string | null;
  setUserId: (userId: number | null) => void;
  setUsername: (username: string | null) => void;
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
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.user_id);
        setUsername(payload.username);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

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
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );
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

  return (
    <AuthContext.Provider
      value={{
        userId,
        username,
        setUserId,
        setUsername,
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
