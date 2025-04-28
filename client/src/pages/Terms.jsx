import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home } from "lucide-react";

export default function Terms() {
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
            <BreadcrumbLink href="/terms">Terms & Conditions</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-header">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to OrganicBeans. These terms and conditions outline the rules and regulations for the use of 
            our website. By accessing this website, we assume you accept these terms and conditions in full. 
            Do not continue to use OrganicBeans if you do not accept all of the terms and conditions stated on this page.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">1. License to Use</h2>
          <p>
            Unless otherwise stated, OrganicBeans and/or its licensors own the intellectual property rights for all material on this website. 
            All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use subject 
            to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Republish material from this website</li>
            <li>Sell, rent, or sub-license material from this website</li>
            <li>Reproduce, duplicate, or copy material from this website</li>
            <li>Redistribute content from OrganicBeans (unless content is specifically made for redistribution)</li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">2. User Account</h2>
          <p>
            When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. 
            Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on our website.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of 
            access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your 
            account and/or password.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">3. Product Orders and Payments</h2>
          <p>
            By placing an order with us, you represent and warrant that you are authorized to use the designated payment method and that you authorize 
            us to charge your order to that payment method. If your payment method cannot be verified, is invalid, or is otherwise not acceptable, 
            your order may be suspended or cancelled.
          </p>
          <p>
            We reserve the right to refuse or cancel your order at any time for reasons including but not limited to product or service availability, 
            errors in the description or price of the product or service, error in your order, or other reasons.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">4. Product Descriptions and Pricing</h2>
          <p>
            We strive to be as accurate as possible with our product descriptions and pricing. However, we do not warrant that product descriptions, 
            pricing, or other content on this website is accurate, complete, reliable, current, or error-free. If a product offered by us is not as 
            described, your sole remedy is to return it in unused condition.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">5. Shipping and Delivery</h2>
          <p>
            We will make every effort to ship your order according to the estimated delivery times provided at checkout. OrganicBeans is not responsible 
            for delivery delays that are beyond our control, such as delays due to shipping carrier, weather, or other factors.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">6. Returns and Refunds</h2>
          <p>
            We offer a 30-day return policy for most items. To be eligible for a return, your item must be unused and in the same condition that you 
            received it, and it must be in the original packaging. Please contact our customer service team to initiate a return.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">7. Prohibited Uses</h2>
          <p>
            You are prohibited from using the website or its content:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>For any unlawful purpose</li>
            <li>To solicit others to perform or participate in any unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To interfere with or circumvent the security features of the website</li>
          </ul>
          
          <h2 className="font-header text-xl font-semibold mt-6">8. Limitation of Liability</h2>
          <p>
            OrganicBeans shall not be liable for any direct, indirect, incidental, consequential, or punitive damages related to your use of our 
            website or products. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses resulting from 
            the use or the inability to use the materials on our website.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold OrganicBeans and its affiliates, officers, agents, employees, and partners harmless from and against any 
            claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or 
            in any way connected with your access to or use of the website or your violation of these Terms.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will alert you about any changes by updating the "Last Updated" date of these 
            Terms and Conditions. It is your responsibility to periodically review these Terms to stay informed of updates.
          </p>
          
          <h2 className="font-header text-xl font-semibold mt-6">11. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>By email: terms@organicbeans.com</li>
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