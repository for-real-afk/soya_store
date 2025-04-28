import React, { createContext, useState, useContext, useEffect } from 'react';

// Available languages
const languages = {
  en: {
    code: 'en',
    name: 'English',
    translations: {
      // Navigation
      home: 'Home',
      products: 'Products',
      cart: 'Cart',
      profile: 'Profile',
      orders: 'Orders',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      adminPanel: 'Admin Panel',
      
      // Product related
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      price: 'Price',
      quantity: 'Quantity',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      category: 'Category',
      rating: 'Rating',
      description: 'Description',
      featured: 'Featured Products',
      bestSellers: 'Best Sellers',
      
      // Cart related
      yourCart: 'Your Cart',
      emptyCart: 'Your cart is empty',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      
      // Checkout
      shipping: 'Shipping',
      payment: 'Payment',
      confirmation: 'Confirmation',
      placeOrder: 'Place Order',
      
      // Account
      welcome: 'Welcome',
      yourOrders: 'Your Orders',
      accountSettings: 'Account Settings',
      
      // Order status
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      
      // Chatbot
      chatWithUs: 'Chat with Us',
      howCanIHelp: 'How can I help you today?',
      typeMessage: 'Type your message...',
      send: 'Send',
      
      // Admin
      inventory: 'Inventory',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      uploadImage: 'Upload Image',
      orderManagement: 'Order Management',
      
      // Misc
      search: 'Search',
      recommendations: 'Recommendations for you',
      contactUs: 'Contact Us',
      aboutUs: 'About Us',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    translations: {
      // Navigation
      home: 'Inicio',
      products: 'Productos',
      cart: 'Carrito',
      profile: 'Perfil',
      orders: 'Pedidos',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      adminPanel: 'Panel de Administrador',
      
      // Product related
      addToCart: 'Añadir al Carrito',
      viewDetails: 'Ver Detalles',
      price: 'Precio',
      quantity: 'Cantidad',
      inStock: 'En Stock',
      outOfStock: 'Agotado',
      category: 'Categoría',
      rating: 'Valoración',
      description: 'Descripción',
      featured: 'Productos Destacados',
      bestSellers: 'Más Vendidos',
      
      // Cart related
      yourCart: 'Tu Carrito',
      emptyCart: 'Tu carrito está vacío',
      subtotal: 'Subtotal',
      checkout: 'Finalizar Compra',
      continueShopping: 'Seguir Comprando',
      remove: 'Eliminar',
      
      // Checkout
      shipping: 'Envío',
      payment: 'Pago',
      confirmation: 'Confirmación',
      placeOrder: 'Realizar Pedido',
      
      // Account
      welcome: 'Bienvenido',
      yourOrders: 'Tus Pedidos',
      accountSettings: 'Configuración de la Cuenta',
      
      // Order status
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      
      // Chatbot
      chatWithUs: 'Chatea con Nosotros',
      howCanIHelp: '¿Cómo puedo ayudarte hoy?',
      typeMessage: 'Escribe tu mensaje...',
      send: 'Enviar',
      
      // Admin
      inventory: 'Inventario',
      addProduct: 'Añadir Producto',
      editProduct: 'Editar Producto',
      uploadImage: 'Subir Imagen',
      orderManagement: 'Gestión de Pedidos',
      
      // Misc
      search: 'Buscar',
      recommendations: 'Recomendaciones para ti',
      contactUs: 'Contáctanos',
      aboutUs: 'Sobre Nosotros',
      termsOfService: 'Términos de Servicio',
      privacyPolicy: 'Política de Privacidad',
    }
  },
  fr: {
    code: 'fr',
    name: 'Français',
    translations: {
      // Navigation
      home: 'Accueil',
      products: 'Produits',
      cart: 'Panier',
      profile: 'Profil',
      orders: 'Commandes',
      login: 'Connexion',
      register: 'S\'inscrire',
      logout: 'Déconnexion',
      adminPanel: 'Panneau d\'Administration',
      
      // Product related
      addToCart: 'Ajouter au Panier',
      viewDetails: 'Voir Détails',
      price: 'Prix',
      quantity: 'Quantité',
      inStock: 'En Stock',
      outOfStock: 'Épuisé',
      category: 'Catégorie',
      rating: 'Évaluation',
      description: 'Description',
      featured: 'Produits Vedettes',
      bestSellers: 'Meilleures Ventes',
      
      // Cart related
      yourCart: 'Votre Panier',
      emptyCart: 'Votre panier est vide',
      subtotal: 'Sous-total',
      checkout: 'Commander',
      continueShopping: 'Continuer vos Achats',
      remove: 'Supprimer',
      
      // Checkout
      shipping: 'Livraison',
      payment: 'Paiement',
      confirmation: 'Confirmation',
      placeOrder: 'Passer Commande',
      
      // Account
      welcome: 'Bienvenue',
      yourOrders: 'Vos Commandes',
      accountSettings: 'Paramètres du Compte',
      
      // Order status
      pending: 'En Attente',
      processing: 'En Cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé',
      
      // Chatbot
      chatWithUs: 'Chattez avec Nous',
      howCanIHelp: 'Comment puis-je vous aider aujourd\'hui?',
      typeMessage: 'Tapez votre message...',
      send: 'Envoyer',
      
      // Admin
      inventory: 'Inventaire',
      addProduct: 'Ajouter Produit',
      editProduct: 'Modifier Produit',
      uploadImage: 'Télécharger Image',
      orderManagement: 'Gestion des Commandes',
      
      // Misc
      search: 'Rechercher',
      recommendations: 'Recommandations pour vous',
      contactUs: 'Contactez-nous',
      aboutUs: 'À Propos',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de Confidentialité',
    }
  }
};

// Create the context
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get language from localStorage or use English as default
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage && languages[savedLanguage] ? savedLanguage : 'en';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Change the language
  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  // Get a translation by key
  const t = (key) => {
    return languages[currentLanguage]?.translations[key] || languages.en.translations[key] || key;
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return Object.values(languages).map(lang => ({
      code: lang.code,
      name: lang.name
    }));
  };

  const contextValue = {
    currentLanguage,
    changeLanguage,
    t,
    getAvailableLanguages
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};