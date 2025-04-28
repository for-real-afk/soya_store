import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, User, ShoppingCart, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import NotificationButton from "@/components/NotificationButton";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, cartItemCount } = useShop();
  const { user, isAuthenticated, isAdmin, isAdminView, toggleAdminView, logout } = useAuth();
  const [location] = useLocation();
  
  // Debug admin status
  console.log("User:", user);
  console.log("Is user admin?", user?.isAdmin);
  console.log("isAdmin context value:", isAdmin);
  console.log("isAdminView context value:", isAdminView);

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
            {/* Language Selector - Temporary version until API key is added */}
            <div className="relative hidden md:block">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-1 px-2 text-dark hover:text-primary hover:bg-transparent"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="text-sm">EN</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-0">
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      className="flex justify-start items-center w-full px-2 py-1.5 text-sm bg-muted font-medium"
                    >
                      <span>English</span>
                      <span className="ml-auto text-primary text-xs">✓</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex justify-start items-center w-full px-2 py-1.5 text-sm"
                      disabled={true}
                      title="Google Translate API key required"
                    >
                      <span>Español</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex justify-start items-center w-full px-2 py-1.5 text-sm"
                      disabled={true}
                      title="Google Translate API key required"
                    >
                      <span>中文</span>
                    </Button>
                  </div>
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
                      {user?.isAdmin && (
                        <>
                          <hr className="my-2" />
                          <button 
                            onClick={toggleAdminView}
                            className="block w-full text-left px-3 py-2 hover:bg-light rounded-md text-sm text-warning"
                          >
                            <i className="fas fa-user-shield mr-2"></i> 
                            {isAdminView ? "Customer View" : "Admin View"}
                          </button>
                          <Link href="/admin" className="block px-3 py-2 hover:bg-light rounded-md text-sm text-warning">
                            <i className="fas fa-cog mr-2"></i> Admin Dashboard
                          </Link>
                        </>
                      )}
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-3 py-2 hover:bg-light rounded-md text-sm"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                      </button>
                      
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
            
            {/* Notifications - Only show for authenticated users */}
            {isAuthenticated && (
              <div className="relative">
                <NotificationButton />
              </div>
            )}
            
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
                <div className="flex items-center">
                  <Globe size={18} className="mr-2" /> 
                  <span>English (EN)</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}