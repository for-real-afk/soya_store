import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-header text-xl font-bold mb-4">OrganicBeans</h3>
            <p className="text-white/70 mb-4">
              Premium organic soybean products for healthier living and sustainable agriculture.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          {/* Column 2 */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seeds" className="text-white/70 hover:text-white">
                  Soybean Seeds
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-white">
                  Food Products
                </Link>
              </li>
              <li>
                <Link href="/products?subcategory=oil" className="text-white/70 hover:text-white">
                  Oils & Extracts
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-white/70 hover:text-white">
                  Wholesale
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-white/70 hover:text-white">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/farming" className="text-white/70 hover:text-white">
                  Farming Practices
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-white/70 hover:text-white">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="text-white/70 hover:text-white">
                  Certifications
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4 */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-white/70 hover:text-white">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-white/70 hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-white/70 hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} OrganicBeans. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Payment Icons */}
              <div className="h-6 w-10 bg-white/80 rounded"></div>
              <div className="h-6 w-10 bg-white/80 rounded"></div>
              <div className="h-6 w-10 bg-white/80 rounded"></div>
              <div className="h-6 w-10 bg-white/80 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
