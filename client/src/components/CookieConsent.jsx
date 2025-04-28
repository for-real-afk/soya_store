export default function CookieConsent({ onAccept, onCustomize }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark text-white p-4 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 md:mr-8">
            <p className="text-sm">
              We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
              <a href="/privacy" className="underline ml-1">Learn more</a>
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onAccept}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Accept All
            </button>
            <button 
              onClick={onCustomize}
              className="bg-transparent border border-white/30 hover:border-white text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Customize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}