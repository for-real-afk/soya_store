import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Admin Test Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Simple Admin Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a simple test of the admin page.</p>
        </CardContent>
      </Card>
    </div>
  );
}