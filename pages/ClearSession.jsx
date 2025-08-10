import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut } from "lucide-react";
import { createPageUrl } from "../utils";

export default function ClearSession() {
  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
  }, []);

  const handleGoToLogin = () => {
    window.location.href = createPageUrl("Auth");
  };

  const handleGoHome = () => {
    window.location.href = createPageUrl("Home");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Session Cleared</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 text-center">
            Your authentication session has been cleared. You can now sign in again with fresh credentials.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoToLogin}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Go to Sign In
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoHome}
              className="w-full"
            >
              Go to Home Page
            </Button>
          </div>
          
          <div className="text-xs text-slate-500 text-center">
            If you continue to experience issues, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
