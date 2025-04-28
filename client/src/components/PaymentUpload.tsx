import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Check, AlertCircle, X } from "lucide-react";

export default function PaymentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
      
      // Reset upload status
      setUploadSuccess(false);
    }
  };

  // Handle file upload
  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a payment slip to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process with a delay
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      toast({
        title: "Upload successful",
        description: "Your payment slip has been uploaded successfully.",
      });
    }, 1500);

    // In a real application, you would send the file to the server here
    // const formData = new FormData();
    // formData.append('file', file);
    // await fetch('/api/upload', { method: 'POST', body: formData });
  };

  // Clear selected file
  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Please upload a screenshot or photo of your payment slip. We accept bank transfer receipts, mobile payment screenshots, or any proof of payment.
      </div>

      {/* Upload Area */}
      <div className="grid gap-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            uploadSuccess ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-primary"
          }`}
        >
          {previewUrl ? (
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="absolute top-0 right-0 h-8 w-8 translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="aspect-video mx-auto overflow-hidden rounded-md">
                <img
                  src={previewUrl}
                  alt="Payment slip preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-2 text-sm font-medium">{file?.name}</div>
              <div className="text-xs text-muted-foreground">
                {(file?.size && (file?.size / 1024 / 1024).toFixed(2)) || 0} MB
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
              <div className="text-sm font-medium mb-1">Drag and drop your file here</div>
              <div className="text-xs text-muted-foreground mb-4">
                Supports: JPG, PNG, PDF (Max 5MB)
              </div>
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2"
              >
                Select File
                <Input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                />
              </Label>
            </div>
          )}
        </div>

        {uploadSuccess && (
          <Alert className="bg-green-50 border-green-500 text-green-800">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-800">
              Your payment slip has been uploaded successfully. We will process your payment within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        {previewUrl && !uploadSuccess && (
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Payment Slip"}
          </Button>
        )}
      </div>

      {/* Payment Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">Payment Instructions</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Make your payment to the following account:</p>
              <div className="bg-muted p-3 rounded text-xs font-mono">
                <div>Bank: OrganicBeans National Bank</div>
                <div>Account Name: OrganicBeans Inc.</div>
                <div>Account Number: 1234-5678-9012-3456</div>
                <div>Reference: Your Order Number</div>
              </div>
              <p>2. Take a screenshot or photo of your payment confirmation.</p>
              <p>3. Upload the image using the form above.</p>
              <p>4. We will verify your payment and process your order within 24 hours.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}