import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import CookieConsent from "@/components/CookieConsent";
import { useShop } from "@/context/ShopContext";

export default function Layout({ children }) {
  const { isCartOpen } = useShop();
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      setShowCookieConsent(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowCookieConsent(false);
  };

  const handleCustomizeCookies = () => {
    // In a real app, this would open a cookie preferences modal
    localStorage.setItem("cookiesAccepted", "true");
    setShowCookieConsent(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light font-body text-dark">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      {showCookieConsent && (
        <CookieConsent 
          onAccept={handleAcceptCookies} 
          onCustomize={handleCustomizeCookies} 
        />
      )}
    </div>
  );
}