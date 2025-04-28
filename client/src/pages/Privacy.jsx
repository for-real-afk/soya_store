import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home } from "lucide-react";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/privacy">Privacy Policy</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-header">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to OrganicBeans. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">1. Information We Collect</h2>
          <p>
            We collect several types of information from and about users of our website, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <span className="font-semibold">Personal identifiers</span>: Name, email address, postal address, phone number.
            </li>
            <li>
              <span className="font-semibold">Account information</span>: Username and password.
            </li>
            <li>
              <span className="font-semibold">Transaction information</span>: Payment details, purchase history, and shipping information.
            </li>
            <li>
              <span className="font-semibold">Usage data</span>: Information about how you use our website and services.
            </li>
            <li>
              <span className="font-semibold">Technical data</span>: IP address, browser type and version, device information.
            </li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">2. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Processing and fulfilling your orders</li>
            <li>Managing your account</li>
            <li>Providing customer support</li>
            <li>Sending transactional emails (order confirmations, shipping updates)</li>
            <li>Marketing communications (with your consent)</li>
            <li>Improving our website and services</li>
            <li>Complying with legal obligations</li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">3. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and to store certain information. 
            Cookies are files with a small amount of data which may include an anonymous unique identifier. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p>
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <span className="font-semibold">Essential cookies</span>: Required for the operation of our website.
            </li>
            <li>
              <span className="font-semibold">Analytical/performance cookies</span>: Allow us to recognize and count the number of visitors.
            </li>
            <li>
              <span className="font-semibold">Functionality cookies</span>: Used to recognize you when you return to our website.
            </li>
            <li>
              <span className="font-semibold">Targeting cookies</span>: Record your visit to our website, the pages you have visited, and the links you have followed.
            </li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">4. Data Sharing and Disclosure</h2>
          <p>
            We may share your personal information with:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Service providers who perform services on our behalf</li>
            <li>Payment processors to process your payments</li>
            <li>Shipping companies to deliver your orders</li>
            <li>Legal authorities when required by law</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">5. Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
            used, or accessed in an unauthorized way. We limit access to your personal data to those employees, 
            agents, contractors, and other third parties who have a business need to know.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal data, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>The right to access your personal data</li>
            <li>The right to rectification of your personal data</li>
            <li>The right to erasure of your personal data</li>
            <li>The right to restrict processing of your personal data</li>
            <li>The right to data portability</li>
            <li>The right to object to processing of your personal data</li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last Updated" date at the top of this page.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>By email: privacy@organicbeans.com</li>
            <li>By phone: 1-800-ORG-BEAN</li>
            <li>By mail: 123 Farm Lane, Organic Valley, CA 90210</li>
          </ul>
          
          <Separator className="my-6" />
          
          <div className="text-center text-sm text-gray-500 mt-6">
            © {new Date().getFullYear()} OrganicBeans. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}