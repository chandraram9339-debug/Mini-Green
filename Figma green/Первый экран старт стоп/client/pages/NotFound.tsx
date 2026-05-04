import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="text-center">
        <h1 className="text-4xl font-outfit font-semibold text-brand-green mb-4">404</h1>
        <p className="text-xl font-outfit text-white/60 mb-6">Page not found</p>
        <a href="/" className="font-outfit text-brand-green underline underline-offset-4 hover:text-brand-green-2">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
