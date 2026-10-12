import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, ExternalLink } from 'lucide-react';
import '../styles/catalogues.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

function resolvePdfUrl(item) {
  if (!item?.pdfUrl) return `${API_BASE_URL}/catalogues/${item._id}/file`;
  if (item.pdfUrl.startsWith('http')) return item.pdfUrl;
  if (item.pdfUrl.startsWith('/api/')) {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}${item.pdfUrl}`;
  }
  return item.pdfUrl;
}

const LOCAL_FALLBACK = {
  _id: 'local-horizon',
  title: 'Yukti Horizon Catalogue',
  description: 'Our current collection of products and services.',
  pdfUrl: '/Yukti-Horizon-Catalogue.pdf',
  coverUrl: '',
};

export default function Catalogues() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/catalogues`);
        const data = res.ok ? await res.json() : [];
        setItems(Array.isArray(data) && data.length ? data : [LOCAL_FALLBACK]);
      } catch (err) {
        console.error('Failed to fetch catalogues:', err);
        setItems([LOCAL_FALLBACK]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = id ? items.find((item) => item._id === id) : null;

  if (loading) {
    return (
      <main className="catalogues-page">
        <div className="catalogues-status">Loading catalogues…</div>
      </main>
    );
  }

  if (id && !selected) {
    return (
      <main className="catalogues-page">
        <div className="catalogues-status">
          <p>This catalogue is not available.</p>
          <button type="button" className="catalogues-back" onClick={() => navigate('/catalogues')}>
            Back to catalogues
          </button>
        </div>
      </main>
    );
  }

  if (selected) {
    const pdfUrl = resolvePdfUrl(selected);
    return (
      <main className="catalogues-page catalogues-page--viewer">
        <header className="catalogues-viewer-bar">
          <button type="button" className="catalogues-back" onClick={() => navigate('/catalogues')}>
            <ArrowLeft size={16} strokeWidth={2} />
            All catalogues
          </button>
          <div className="catalogues-viewer-title">
            <h1>{selected.title}</h1>
            {selected.description && <p>{selected.description}</p>}
          </div>
          <div className="catalogues-viewer-actions">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="catalogues-action"
            >
              <ExternalLink size={15} />
              Open
            </a>
            <a
              href={pdfUrl}
              download={selected.fileName || 'catalogue.pdf'}
              className="catalogues-action catalogues-action--solid"
            >
              <Download size={15} />
              Download
            </a>
          </div>
        </header>
        <div className="catalogues-viewer-frame-wrap">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="catalogues-viewer-frame"
          >
            <iframe
              title={selected.title}
              src={pdfUrl}
              className="catalogues-viewer-frame"
            />
          </object>
        </div>
      </main>
    );
  }

  return (
    <main className="catalogues-page">
      <header className="catalogues-hero">
        <p className="catalogues-kicker">Yukti Horizon</p>
        <h1>Our Catalogues</h1>
        <p className="catalogues-lead">
          Open a catalogue to browse the collection. New PDFs uploaded from admin appear here.
        </p>
      </header>

      <section className="catalogues-grid" aria-label="Catalogue list">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/catalogues/${item._id}`}
            className="catalogue-card"
          >
            <div className="catalogue-card-cover">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" />
              ) : (
                <span className="catalogue-card-glyph">
                  <BookOpen size={28} strokeWidth={1.6} />
                </span>
              )}
            </div>
            <div className="catalogue-card-body">
              <h2>{item.title}</h2>
              {item.description && <p>{item.description}</p>}
              <span className="catalogue-card-cta">View PDF</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
