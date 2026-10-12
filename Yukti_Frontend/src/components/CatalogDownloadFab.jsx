import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import "../styles/catalogFab.css";

export default function CatalogDownloadFab() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/catalogues")) return null;

  return (
    <Link
      to="/catalogues"
      className="catalog-fab"
      aria-label="Our catalogues"
    >
      <span className="catalog-fab__ring" aria-hidden="true" />
      <span className="catalog-fab__ring catalog-fab__ring--delay" aria-hidden="true" />
      <span className="catalog-fab__icon">
        <BookOpen size={22} strokeWidth={2.25} />
      </span>
      <span className="catalog-fab__label">Catalogues</span>
      <span className="catalog-fab__hint">Our Catalogues</span>
    </Link>
  );
}
