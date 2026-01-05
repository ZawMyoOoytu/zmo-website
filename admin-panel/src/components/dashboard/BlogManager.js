// src/components/dashboard/BlogManager.js
import React, { useState } from 'react';

const BlogManager = () => {
  const [blogs] = useState([
    {
      id: 1,
      title: 'Advanced Blog Management System',
      excerpt: 'Welcome to the advanced blog management dashboard',
      category: 'technology',
      tags: ['react', 'dashboard', 'admin'],
      status: 'published',
      author: 'Admin',
      views: 1234,
      createdAt: '2023-11-15',
    }
  ]);

  return (
    <div style={{
      padding: '30px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚀 Advanced Blog Manager
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '30px'
          }}>
            Feature-rich blog management with advanced controls
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}>
              + Create New Blog
            </button>
            <button style={{
              padding: '12px 30px',
              background: '#f8f9fa',
              color: '#333',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              📊 View Analytics
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#343a40' }}>✨ Advanced Features</h3>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #f8f9fa' }}>✅ Bulk operations</li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #f8f9fa' }}>✅ Advanced filtering</li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #f8f9fa' }}>✅ Tag management</li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #f8f9fa' }}>✅ SEO optimization</li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid #f8f9fa' }}>✅ Analytics dashboard</li>
              <li style={{ padding: '8px 0' }}>✅ Export functionality</li>
            </ul>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#343a40' }}>📈 Quick Stats</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{
                background: '#e7f3ff',
                padding: '15px',
                borderRadius: '10px',
                borderLeft: '4px solid #007bff'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#007bff' }}>1</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Blog Posts</div>
              </div>
              <div style={{
                background: '#d4edda',
                padding: '15px',
                borderRadius: '10px',
                borderLeft: '4px solid #28a745'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#28a745' }}>1</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Published</div>
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#343a40' }}>🔗 Quick Links</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <a href="/admin/blogs" style={{
                display: 'block',
                padding: '12px 20px',
                background: '#f8f9fa',
                color: '#495057',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}>
                📝 Go to Simple Blog List
              </a>
              <a href="/admin/dashboard" style={{
                display: 'block',
                padding: '12px 20px',
                background: '#f8f9fa',
                color: '#495057',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}>
                📊 Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Blog Preview */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#343a40' }}>📋 Blog Posts Preview</h3>
          {blogs.map(blog => (
            <div key={blog.id} style={{
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '20px',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <h4 style={{
                  margin: '0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#212529'
                }}>
                  {blog.title}
                </h4>
                <span style={{
                  background: blog.status === 'published' ? '#d4edda' : '#fff3cd',
                  color: blog.status === 'published' ? '#155724' : '#856404',
                  padding: '6px 15px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {blog.status}
                </span>
              </div>
              
              <p style={{
                margin: '0 0 20px 0',
                color: '#6c757d',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {blog.excerpt}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {blog.tags.map((tag, idx) => (
                    <span key={idx} style={{
                      background: '#e9ecef',
                      color: '#495057',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '20px', color: '#6c757d' }}>
                  <span>By {blog.author}</span>
                  <span>📅 {blog.createdAt}</span>
                  <span>👁 {blog.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          padding: '25px',
          marginTop: '30px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '16px' }}>
            <strong>💡 Tip:</strong> This is the advanced Blog Manager. 
            For simple blog listing, visit <a href="/admin/blogs" style={{ color: 'white', fontWeight: '600' }}>/admin/blogs</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogManager;