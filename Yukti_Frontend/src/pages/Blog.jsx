import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/blog.css';

import heroImg from '../assets/concepts-hero.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = ['All', 'Images', 'Presentations', 'Articles'];

const CATEGORY_ROUTE_MAP = {
  Images: 'image',
  Articles: 'article',
  Presentations: 'presentation',
};

function getPostRoute(post) {
  const cat = CATEGORY_ROUTE_MAP[post.category] || 'article';
  return `/blog/${cat}/${post._id}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blog`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const selectedPost = id ? posts.find((p) => p._id === id) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const openPost = (post) => {
    navigate(getPostRoute(post));
  };

  const goBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <main className="blog-page">
        <div className="blog-status">Loading...</div>
      </main>
    );
  }

  const featured = posts[0];
  const gridPosts = posts.slice(1);
  const filtered =
    activeCategory === 'All'
      ? posts.length <= 1
        ? posts
        : gridPosts
      : posts.filter((p) => p.category === activeCategory);

  const isImageType = selectedPost?.category === 'Images';
  const isPresentationType = selectedPost?.category === 'Presentations';

  const explorePosts = selectedPost
    ? posts.filter((p) => p._id !== selectedPost._id).slice(0, 3)
    : [];

  // ─── Detail: Presentation type ───
  if (selectedPost && isPresentationType) {
    const rawSlides = [selectedPost.image, ...(selectedPost.slides || [])].filter(
      (s) => typeof s === 'string' && s.trim()
    );
    const seen = new Set();
    const slides = rawSlides.filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    return (
      <main className="blog-page blog-page--presentation-detail">
        <div className="blog-presentation-detail">
          <div className="blog-presentation-detail-container">
            <button className="blog-back-link" onClick={goBack}>
              &larr; Back to Our Concepts
            </button>
            <span className="blog-presentation-date">{formatDate(selectedPost.createdAt)}</span>
            <h1 className="blog-presentation-title">
              {selectedPost.detailTitle || selectedPost.title}
            </h1>
            <div className="blog-presentation-slides">
              {slides.map((slide, i) => (
                <div key={`${slide}-${i}`} className="blog-presentation-slide">
                  <img src={slide} alt={`Slide ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Detail: Image type ───
  if (selectedPost && isImageType) {
    const imgs = selectedPost.images?.length > 0 ? selectedPost.images : [selectedPost.image];
    const prevImg = () => setCarouselIndex((i) => (i === 0 ? imgs.length - 1 : i - 1));
    const nextImg = () => setCarouselIndex((i) => (i === imgs.length - 1 ? 0 : i + 1));
    const prevIdx = carouselIndex === 0 ? imgs.length - 1 : carouselIndex - 1;
    const nextIdx = carouselIndex === imgs.length - 1 ? 0 : carouselIndex + 1;

    return (
      <main className="blog-page">
        <div className="blog-carousel-section">
          <div className="blog-carousel">
            <div className="blog-carousel-side blog-carousel-left">
              <img src={imgs[prevIdx]} alt="" />
            </div>
            <div className="blog-carousel-main">
              <img src={imgs[carouselIndex]} alt={selectedPost.title} />
            </div>
            <div className="blog-carousel-side blog-carousel-right">
              <img src={imgs[nextIdx]} alt="" />
            </div>
          </div>
          <div className="blog-carousel-controls">
            <button className="blog-carousel-btn" onClick={prevImg}>&lsaquo;</button>
            <button className="blog-carousel-btn" onClick={nextImg}>&rsaquo;</button>
          </div>
        </div>

        <article className="blog-image-detail">
          <div className="blog-image-detail-container">
            <button className="blog-back-link" onClick={goBack}>
              &larr; Back to Our Concepts
            </button>
            <span className="blog-image-date">{formatDate(selectedPost.createdAt)}</span>
            <h1 className="blog-image-detail-title">
              {selectedPost.detailTitle || selectedPost.title}
            </h1>
            <p className="blog-image-detail-desc">{selectedPost.description}</p>
          </div>
        </article>

        <section className="blog-explore">
          <div className="blog-explore-container">
            <h2 className="blog-explore-heading">Explore more</h2>
            <div className="blog-explore-grid">
              {explorePosts.map((post) => (
                <article key={post._id} className="blog-card blog-card--three" onClick={() => openPost(post)}>
                  <div className="blog-card-img">
                    <img src={post.image} alt={post.title} />
                  </div>
                  <div className="blog-card-body">
                    <h3 className="blog-card-title">{post.shortTitle || post.title}</h3>
                    {post.images?.length > 0 && (
                      <span className="blog-card-count">{post.images.length}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ─── Detail: Article type ───
  if (selectedPost && !isImageType && !isPresentationType) {
    const articleExplorePosts = posts.filter(
      (p) => p._id !== selectedPost._id && p.category !== 'Images'
    ).slice(0, 2);

    return (
      <main className="blog-page">
        <div className="blog-article-detail">
          <div className="blog-article-detail-container">
            <button className="blog-back-link" onClick={goBack}>
              &larr; Back to Our Concepts
            </button>

            <div className="blog-article-image">
              <img src={selectedPost.image} alt={selectedPost.title} />
            </div>

            <div className="blog-article-content">
              <span className="blog-article-date">{formatDate(selectedPost.createdAt)}</span>
              <h1 className="blog-article-title">{selectedPost.title}</h1>
              {(selectedPost.content || []).map((para, i) => (
                <p key={i} className="blog-article-para">{para}</p>
              ))}
            </div>
          </div>
        </div>

        <section className="blog-explore blog-explore--article">
          <div className="blog-explore-container">
            <h2 className="blog-explore-heading">Explore more</h2>
            <div className="blog-explore-grid blog-explore-grid--two">
              {articleExplorePosts.map((post) => (
                <article key={post._id} className="blog-card" onClick={() => openPost(post)}>
                  <div className="blog-card-img">
                    <img src={post.image} alt={post.title} />
                  </div>
                  <div className="blog-card-body">
                    <h3 className="blog-card-title">{post.title}</h3>
                    {post.description && (
                      <p className="blog-card-desc">{post.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ─── Listing view ───
  if (!featured) {
    return (
      <main className="blog-page">
        <section className="blog-hero" aria-label="Our Concepts">
          <img src={heroImg} alt="" className="blog-hero-img" />
          <div className="blog-hero-overlay">
            <h1 className="blog-hero-tagline">Welcome to a world that inspires us</h1>
          </div>
        </section>
        <div className="blog-status">No posts yet. Check back soon!</div>
      </main>
    );
  }

  const isImageTab = activeCategory === 'Images';
  const isPresentationTab = activeCategory === 'Presentations';

  return (
    <main className="blog-page">
      <section className="blog-hero" aria-label="Our Concepts">
        <img src={heroImg} alt="" className="blog-hero-img" />
        {/* <div className="blog-hero-overlay">
          <h1 className="blog-hero-tagline">Welcome to a world that inspires us</h1>
        </div> */}
      </section>

      <section className="blog-featured" onClick={() => openPost(featured)}>
        <div className="blog-featured-container">
          <div className="blog-featured-img">
            <img src={featured.image} alt={featured.title} />
          </div>
          <div className="blog-featured-content">
            <div className="blog-featured-meta">
              <span className="blog-featured-tag">FEATURED</span>
              <span className="blog-featured-date">{formatDate(featured.createdAt)}</span>
            </div>
            <h2 className="blog-featured-title">{featured.title}</h2>
            <p className="blog-featured-desc">{featured.description}</p>
          </div>
        </div>
      </section>

      <div className="blog-filters">
        <div className="blog-filters-container">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`blog-filter-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="blog-posts">
        <div className="blog-posts-container">
          {filtered.length === 0 && (
            <p className="blog-status">No posts in this category.</p>
          )}
          <div className={`blog-grid ${isImageTab ? 'blog-grid--three' : ''}`}>
            {filtered.map((post) => (
              <article
                key={post._id}
                className={`blog-card ${isImageTab ? 'blog-card--image' : ''} ${isPresentationTab ? 'blog-card--presentation' : ''}`}
                onClick={() => openPost(post)}
              >
                <div className="blog-card-img">
                  <img src={post.image} alt={post.title} />
                  {isPresentationTab && post.coverText && (
                    <span className="blog-card-cover-text">
                      {post.coverText.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </span>
                  )}
                  {!isImageTab && !isPresentationTab && (
                    <span className="blog-card-badge">{post.category}</span>
                  )}
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-title-row">
                    <h3 className="blog-card-title">
                      {isImageTab ? (post.shortTitle || post.title) : post.title}
                    </h3>
                    {isImageTab && post.images?.length > 0 && (
                      <span className="blog-card-count">{post.images.length}</span>
                    )}
                  </div>
                  {!isImageTab && post.description && (
                    <p className="blog-card-desc">{post.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
