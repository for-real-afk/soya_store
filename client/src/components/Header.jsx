import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Globe, User, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, cartItemCount } = useShop();
  const { user, isAuthenticated, isAdmin, isAdminView, toggleAdminView, logout } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-header font-bold text-primary">OrganicBeans</span>
          </Link>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`${location === '/' ? 'text-primary font-semibold' : 'text-dark hover:text-primary'}`}>
              Home
            </Link>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-dark hover:text-primary flex items-center">
                  Seeds <ChevronDown size={16} className="ml-1" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Link href="/seeds?subcategory=organic" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Organic Seeds
                </Link>
                <Link href="/seeds?subcategory=non-gmo" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Non-GMO Seeds
                </Link>
                <Link href="/seeds?subcategory=heirloom" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Heirloom Seeds
                </Link>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-dark hover:text-primary flex items-center">
                  Products <ChevronDown size={16} className="ml-1" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Link href="/products?subcategory=oil" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Soybean Oil
                </Link>
                <Link href="/products?subcategory=tofu" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Tofu & Tempeh
                </Link>
                <Link href="/products?subcategory=milk" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Soy Milk
                </Link>
                <Link href="/products?subcategory=flour" onClick={closeMobileMenu} className="block px-4 py-2 hover:bg-light rounded-md">
                  Soy Flour
                </Link>
              </PopoverContent>
            </Popover>
            
            <Link href="/about" className={`${location === '/about' ? 'text-primary font-semibold' : 'text-dark hover:text-primary'}`}>
              About
            </Link>
            <Link href="/contact" className={`${location === '/contact' ? 'text-primary font-semibold' : 'text-dark hover:text-primary'}`}>
              Contact
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center text-dark hover:text-primary">
                    <Globe size={18} className="mr-1" /> EN
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-24 p-2">
                  <button className="block w-full text-left px-3 py-1 hover:bg-light rounded-md">English</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-light rounded-md">Español</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-light rounded-md">中文</button>
                  <button className="block w-full text-left px-3 py-1 hover:bg-light rounded-md">日本語</button>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* User Profile */}
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-dark hover:text-primary">
                    <User size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold mb-2">{user?.name || user?.username}</div>
                      <Link href="/profile" className="block px-3 py-2 hover:bg-light rounded-md text-sm">
                        <i className="fas fa-user mr-2"></i> My Profile
                      </Link>
                      <Link href="/orders" className="block px-3 py-2 hover:bg-light rounded-md text-sm">
                        <i className="fas fa-box mr-2"></i> Order Tracking
                      </Link>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-3 py-2 hover:bg-light rounded-md text-sm"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                      </button>
                      {isAdmin && (
                        <>
                          <hr className="my-2" />
                          <button 
                            onClick={toggleAdminView}
                            className="block w-full text-left px-3 py-2 hover:bg-light rounded-md text-sm text-warning"
                          >
                            <i className="fas fa-user-shield mr-2"></i> 
                            {isAdminView ? "Customer View" : "Admin View"}
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold mb-2">Guest User</div>
                      <Link href="/login" className="block px-3 py-2 hover:bg-light rounded-md text-sm">
                        <i className="fas fa-sign-in-alt mr-2"></i> Sign In
                      </Link>
                      <Link href="/register" className="block px-3 py-2 hover:bg-light rounded-md text-sm">
                        <i className="fas fa-user-plus mr-2"></i> Create Account
                      </Link>
                      <Link href="/orders" className="block px-3 py-2 hover:bg-light rounded-md text-sm">
                        <i className="fas fa-box mr-2"></i> Order Tracking
                      </Link>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Cart */}
            <div className="relative">
              <button 
                onClick={toggleCart}
                className="text-dark hover:text-primary relative"
              >
                <ShoppingCart size={18} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-dark hover:text-primary" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <nav className="space-y-4 py-2">
              <Link href="/" onClick={closeMobileMenu} className={`block py-2 ${location === '/' ? 'text-primary font-semibold' : ''}`}>
                Home
              </Link>
              
              <div className="py-2">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => {
                    const submenu = document.getElementById('seedsSubmenu');
                    submenu?.classList.toggle('hidden');
                  }}
                >
                  Seeds <ChevronDown size={16} className="ml-1" />
                </button>
                <div id="seedsSubmenu" className="hidden pl-4 mt-2 space-y-2">
                  <Link href="/seeds?subcategory=organic" onClick={closeMobileMenu} className="block py-1">
                    Organic Seeds
                  </Link>
                  <Link href="/seeds?subcategory=non-gmo" onClick={closeMobileMenu} className="block py-1">
                    Non-GMO Seeds
                  </Link>
                  <Link href="/seeds?subcategory=heirloom" onClick={closeMobileMenu} className="block py-1">
                    Heirloom Seeds
                  </Link>
                </div>
              </div>
              
              <div className="py-2">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => {
                    const submenu = document.getElementById('productsSubmenu');
                    submenu?.classList.toggle('hidden');
                  }}
                >
                  Products <ChevronDown size={16} className="ml-1" />
                </button>
                <div id="productsSubmenu" className="hidden pl-4 mt-2 space-y-2">
                  <Link href="/products?subcategory=oil" onClick={closeMobileMenu} className="block py-1">
                    Soybean Oil
                  </Link>
                  <Link href="/products?subcategory=tofu" onClick={closeMobileMenu} className="block py-1">
                    Tofu & Tempeh
                  </Link>
                  <Link href="/products?subcategory=milk" onClick={closeMobileMenu} className="block py-1">
                    Soy Milk
                  </Link>
                  <Link href="/products?subcategory=flour" onClick={closeMobileMenu} className="block py-1">
                    Soy Flour
                  </Link>
                </div>
              </div>
              
              <Link href="/about" onClick={closeMobileMenu} className="block py-2">
                About
              </Link>
              <Link href="/contact" onClick={closeMobileMenu} className="block py-2">
                Contact
              </Link>
              
              <div className="py-2">
                <button className="flex items-center">
                  <Globe size={18} className="mr-2" /> Language: English
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}