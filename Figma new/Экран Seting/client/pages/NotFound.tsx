import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tg-bg px-4 font-sans">
      <div className="text-center">
        <p className="text-[80px] font-medium leading-none text-tg-line">404</p>
        <h1 className="mt-3 text-[22px] font-medium text-tg-black">Page not found</h1>
        <p className="mt-2 text-[16px] text-tg-grey">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-tg-green px-5 py-3 text-[16px] font-medium text-white transition-opacity active:opacity-80"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
