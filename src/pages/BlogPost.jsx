import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await contentAPI.getAll('blogs', { isActive: 'true', limit: 100 });
        if (response.data.success) {
          const post = response.data.data.find(
            (p) => (p.slug && p.slug === slug) || p._id === slug
          );
          if (post) {
            setPost(post);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-container-low rounded w-3/4"></div>
          <div className="aspect-[3/1] bg-surface-container-low rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-surface-container-low rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px] text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">error</span>
        <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">Article Not Found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Sorry, the article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/blog"
          className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
        >
          Back to Journal
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" to="/blog">Journal</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">{post.title}</span>
        </nav>
      </div>

      {post.image && (
        <div className="aspect-[3/1] md:aspect-[3/1] overflow-hidden rounded-lg mb-8">
          <img
            className="w-full h-full object-cover"
            alt={post.title}
            src={post.image}
            onError={(e) => { e.target.src = 'https://placehold.co/1200x400'; }}
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <h1 className="font-display-lg text-display-lg text-deep-emerald mb-6">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-8 pb-4 border-b border-outline-variant">
          <span>By {post.author || 'Admin'}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          {post.category && (
            <>
              <span>•</span>
              <span className="text-regal-gold font-label-caps text-label-caps">{post.category}</span>
            </>
          )}
        </div>

        <div
          className="prose prose-lg max-w-none text-on-surface font-body-md text-body-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-outline-variant">
            <span className="font-label-caps text-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-3 block">Tags</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-outline-variant text-center">
          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-deep-emerald text-deep-emerald px-10 py-4 font-label-caps text-label-caps uppercase tracking-wider rounded-full hover:bg-deep-emerald hover:text-surface-white transition-all duration-200 shadow-sm"
          >
            Back to Journal
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
