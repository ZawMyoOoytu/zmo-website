// frontend/src/pages/BlogDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogById } from '../services/blogService';
import Layout from '../components/Layout';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams(); // Get blog ID from URL
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await getBlogById(id);
        setBlog(data);
      } catch (err) {
        setError('Failed to load blog');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!blog) return <div className="not-found">Blog not found</div>;

  return (
    <Layout>
      <div className="blog-detail-container">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Back to Blogs
        </button>

        <article className="blog-content">
          <header className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-meta">
              <span className="blog-author">
                <i className="fas fa-user"></i> By {blog.author}
              </span>
              <span className="blog-date">
                <i className="fas fa-calendar"></i> 
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="blog-category">
                <i className="fas fa-folder"></i> {blog.category}
              </span>
            </div>
            <img 
              src={blog.featuredImage || '/default-blog.jpg'} 
              alt={blog.title}
              className="blog-featured-image"
            />
          </header>

          <div className="blog-body">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          <footer className="blog-footer">
            <div className="blog-tags">
              {blog.tags?.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            
            <div className="share-buttons">
              <button className="share-btn">Share</button>
              <button className="save-btn">Save</button>
            </div>
          </footer>
        </article>

        {/* Optional: Related Blogs */}
        <div className="related-blogs">
          <h3>Related Articles</h3>
          {/* Add related blogs component here */}
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;