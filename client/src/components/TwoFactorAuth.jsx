import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";

export default function TwoFactorAuth({ onSuccess, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // For demo purposes, we're using a simple code "123456"
  const handleVerify = () => {
    setIsVerifying(true);
    setError(null);
    
    // Simulate verification delay
    setTimeout(() => {
      if (code === "123456") {
        onSuccess();
      } else {
        setError("Invalid verification code. Please try again.");
        setIsVerifying(false);
      }
    }, 1500);
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              disabled={isVerifying}
            />
            {error && <FormMessage>{error}</FormMessage>}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Didn't receive a code?</p>
            <Button variant="link" className="p-0 h-auto" disabled={isVerifying}>
              Resend code
            </Button>
          </div>
          
          {/* Hint for demo purposes */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
            <p className="font-semibold">Demo Hint:</p>
            <p>Use code "123456" for successful verification</p>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={code.length !== 6 || isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}