import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await contentAPI.getAll('blogs', {
          isActive: 'true',
          page: currentPage,
          limit: 9,
        });
        if (response.data.success) {
          setPosts(response.data.data || []);
          setTotalPages(response.data.pages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage]);

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">Journal</span>
        </nav>
        <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">Our Journal</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Stories, insights, and inspiration from the world of fine jewellery craftsmanship.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-outline-variant/20"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-outline-variant/20 rounded"></div>
                <div className="h-4 bg-outline-variant/20 rounded w-3/4"></div>
                <div className="h-3 bg-outline-variant/20 rounded"></div>
                <div className="h-3 bg-outline-variant/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">article</span>
          <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">No Articles Yet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Check back soon for the latest stories and insights.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post.slug || post._id}`}
                className="block group bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {post.image && (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={post.title}
                      src={post.image}
                      onError={(e) => { e.target.src = 'https://placehold.co/600x400'; }}
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col">
                  <span className="font-label-caps text-label-caps text-xs text-regal-gold uppercase tracking-wider mb-3">
                    {post.category || 'Jewellery'}
                  </span>
                  <h3 className="font-headline-md text-headline-md text-deep-emerald mb-2 group-hover:text-regal-gold transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2 flex-1">
                    {post.excerpt || post.content?.slice(0, 120) + '...'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-auto">
                    <span>By {post.author || 'Admin'}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-on-surface-variant">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
