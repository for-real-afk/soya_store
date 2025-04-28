import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminView: boolean;
  toggleAdminView: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email: string, name?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const { toast } = useToast();

  // Initialize user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/users/login", { username, password });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name || userData.username}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (username: string, password: string, email: string, name?: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/users/register", { 
        username, 
        password, 
        email,
        name 
      });
      
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        title: "Registration failed",
        description: "Failed to create account. Username may already exist.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setIsAdminView(false);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const toggleAdminView = () => {
    if (user?.isAdmin) {
      setIsAdminView(prev => !prev);
      
      toast({
        title: isAdminView ? "Switched to Customer View" : "Switched to Admin View",
        description: isAdminView 
          ? "You are now viewing the site as a customer." 
          : "You now have admin access.",
      });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    isAdminView,
    toggleAdminView,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
