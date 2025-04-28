import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    // Add the current path to the redirect URL so user can be sent back after login
    const currentPath = window.location.pathname;
    return <Redirect to={`/login?redirect=${encodeURIComponent(currentPath)}`} />;
  }
  
  // If admin only route and user is not admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. This area is restricted to administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // If all checks pass, render the children
  return <>{children}</>;
}