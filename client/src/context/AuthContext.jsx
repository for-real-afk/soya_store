import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES } from "@shared/schema";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const login = async (username, password) => {
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

  const register = async (username, password, email, name, role = USER_ROLES.CUSTOMER) => {
    try {
      const response = await apiRequest("POST", "/api/users/register", { 
        username, 
        password, 
        email,
        name,
        role 
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

  // Role check helper functions
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || user.role === USER_ROLES.ADMIN;
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    isAdminView,
    toggleAdminView,
    login,
    register,
    logout,
    // Role-specific getters
    isSeedManager: hasRole(USER_ROLES.SEED_MANAGER),
    isProductManager: hasRole(USER_ROLES.PRODUCT_MANAGER),
    // Permission checks
    canManageSeeds: !!user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SEED_MANAGER),
    canManageProducts: !!user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.PRODUCT_MANAGER),
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