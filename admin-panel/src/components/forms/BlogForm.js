import React, { useState, useEffect } from 'react';
import './BlogForm.css';

const BlogForm = ({ blog, onSubmit, onCancel }) => {
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [imageFile, setImageFile] = useState(null); // Fixed: marked as intentionally unused
  const [imagePreview, setImagePreview] = useState('');
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [loading, setLoading] = useState(false);

  // Additional fields
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('Admin User');
  const [readTime, setReadTime] = useState(5);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with blog data if editing
  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setContent(blog.content || '');
      setImageUrl(blog.imageUrl || '');
      setImagePreview(blog.imageUrl || '');
      setExcerpt(blog.excerpt || '');
      setAuthor(blog.author || 'Admin User');
      setReadTime(blog.readTime || 5);
      setTags(blog.tags || []);
      setStatus(blog.status || 'draft');
      setFeatured(blog.featured || false);
    }
  }, [blog]);

  // Character limit constants
  const CHAR_LIMITS = {
    title: 100,
    excerpt: 200
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > CHAR_LIMITS.title) newErrors.title = `Title must be less than ${CHAR_LIMITS.title} characters`;
    
    if (!excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (excerpt.length > CHAR_LIMITS.excerpt) newErrors.excerpt = `Excerpt must be less than ${CHAR_LIMITS.excerpt} characters`;
    
    if (!content.trim()) newErrors.content = 'Content is required';
    if (content.length < 50) newErrors.content = 'Content must be at least 50 characters';
    
    if (!author.trim()) newErrors.author = 'Author is required';
    
    if (!readTime || readTime < 1 || readTime > 60) newErrors.readTime = 'Read time must be between 1 and 60 minutes';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tag management functions
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      
      if (!tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
      }
      
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  // Clear error when user starts typing
  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Image handling functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file (JPEG, PNG, GIF, etc.)' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setUseImageUrl(false);
      setErrors(prev => ({ ...prev, image: '' }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setUseImageUrl(true);
    setImageFile(null);
    setErrors(prev => ({ ...prev, image: '' }));
    
    if (e.target.value) {
      setImagePreview(e.target.value);
    } else {
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setUseImageUrl(false);
    setErrors(prev => ({ ...prev, image: '' }));
    
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  // Fixed submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed', errors);
      return;
    }
    console.log('✅ Form validation passed');

    setLoading(true);
    console.log('⏳ Loading state set to true');

    try {
      // Prepare data for blogService
      const blogData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        author: author.trim(),
        readTime: parseInt(readTime),
        tags: tags,
        status: status,
        featured: featured,
        imageUrl: useImageUrl ? imageUrl.trim() : (imagePreview || '')
      };

      console.log('📦 Prepared blogData:', blogData);

      // Call onSubmit prop with the prepared data
      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit(blogData);
        console.log('🎉 onSubmit completed successfully');
      } else {
        console.error('❌ onSubmit is not a function:', onSubmit);
        setErrors(prev => ({ 
          ...prev, 
          submit: 'Form submission handler is not available.' 
        }));
      }
      
    } catch (error) {
      console.error('💥 Error in handleSubmit:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to submit form. Please try again.' 
      }));
    } finally {
      setLoading(false);
      console.log('🔚 Loading state set to false');
    }
  };

  // Calculate character count classes
  const getCharCountClass = (currentLength, maxLength) => {
    return `blog-form__char-count ${
      currentLength > maxLength ? 'blog-form__char-count--warning' : ''
    }`;
  };

  return (
    <div className="blog-form">
      <div className="blog-form__header">
        <h3 className="blog-form__title">
          {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h3>
        <p className="blog-form__subtitle">
          {blog ? 'Update your blog post details' : 'Fill in the details to create a new blog post'}
        </p>
      </div>

      <form className="blog-form__form" onSubmit={handleSubmit}>
        {/* Title Field */}
        <div className="blog-form__field">
          <label className="blog-form__label" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            className={`blog-form__input ${errors.title ? 'blog-form__input--error' : ''}`}
            type="text"
            placeholder="Enter blog post title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            required
          />
          <div className={getCharCountClass(title.length, CHAR_LIMITS.title)}>
            {title.length}/{CHAR_LIMITS.title} characters
          </div>
          {errors.title && <span className="blog-form__error">{errors.title}</span>}
        </div>

        {/* Excerpt Field */}
        <div className="blog-form__field">
          <label className="blog-form__label" htmlFor="excerpt">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            className={`blog-form__textarea ${errors.excerpt ? 'blog-form__input--error' : ''}`}
            placeholder="Brief description of your post"
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              clearError('excerpt');
            }}
            rows="3"
            required
          />
          <div className={getCharCountClass(excerpt.length, CHAR_LIMITS.excerpt)}>
            {excerpt.length}/{CHAR_LIMITS.excerpt} characters
          </div>
          {errors.excerpt && <span className="blog-form__error">{errors.excerpt}</span>}
        </div>

        {/* Content Field */}
        <div className="blog-form__field">
          <label className="blog-form__label" htmlFor="content">
            Content *
          </label>
          <textarea
            id="content"
            className={`blog-form__textarea blog-form__textarea--large ${errors.content ? 'blog-form__input--error' : ''}`}
            placeholder="Write your blog post content here..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              clearError('content');
            }}
            rows="8"
            required
          />
          <div className="blog-form__char-count">
            {content.length} characters {content.length < 50 && '(minimum 50 required)'}
          </div>
          {errors.content && <span className="blog-form__error">{errors.content}</span>}
        </div>

        {/* Two-column layout for Author and Read Time */}
        <div className="blog-form__row">
          <div className="blog-form__field blog-form__field--half">
            <label className="blog-form__label" htmlFor="author">
              Author *
            </label>
            <input
              id="author"
              className={`blog-form__input ${errors.author ? 'blog-form__input--error' : ''}`}
              type="text"
              placeholder="Author name"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                clearError('author');
              }}
              required
            />
            {errors.author && <span className="blog-form__error">{errors.author}</span>}
          </div>

          <div className="blog-form__field blog-form__field--half">
            <label className="blog-form__label" htmlFor="readTime">
              Read Time (minutes) *
            </label>
            <input
              id="readTime"
              className={`blog-form__input ${errors.readTime ? 'blog-form__input--error' : ''}`}
              type="number"
              min="1"
              max="60"
              placeholder="5"
              value={readTime}
              onChange={(e) => {
                setReadTime(e.target.value);
                clearError('readTime');
              }}
              required
            />
            {errors.readTime && <span className="blog-form__error">{errors.readTime}</span>}
          </div>
        </div>

        {/* Tags Field */}
        <div className="blog-form__field">
          <label className="blog-form__label">
            Tags
          </label>
          <div className="blog-form__tags-input">
            {tags.map(tag => (
              <span key={tag} className="blog-form__tag">
                {tag}
                <button 
                  type="button" 
                  className="blog-form__tag-remove"
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="blog-form__tag-input"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInput}
              placeholder="Type a tag and press Enter"
            />
          </div>
          <div className="blog-form__char-count">
            Press Enter to add tags
          </div>
          {errors.tags && <span className="blog-form__error">{errors.tags}</span>}
        </div>

        {/* Two-column layout for Status and Featured */}
        <div className="blog-form__row">
          <div className="blog-form__field blog-form__field--half">
            <label className="blog-form__label" htmlFor="status">
              Status *
            </label>
            <select
              id="status"
              className="blog-form__select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="blog-form__field blog-form__field--half">
            <label className="blog-form__label" htmlFor="featured">
              Featured Post
            </label>
            <select
              id="featured"
              className="blog-form__select"
              value={featured ? 'yes' : 'no'}
              onChange={(e) => setFeatured(e.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="blog-form__field">
          <label className="blog-form__label">
            Featured Image
          </label>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="blog-form__image-preview">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="blog-form__image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  setErrors(prev => ({ ...prev, image: 'Failed to load image from URL' }));
                }}
              />
              <button
                type="button"
                className="blog-form__image-remove"
                onClick={removeImage}
              >
                Remove Image
              </button>
            </div>
          )}

          {/* Upload Method Toggle */}
          <div className="blog-form__upload-method">
            <label className="blog-form__radio-label">
              <input
                type="radio"
                name="uploadMethod"
                checked={!useImageUrl}
                onChange={() => setUseImageUrl(false)}
              />
              Upload Image
            </label>
            <label className="blog-form__radio-label">
              <input
                type="radio"
                name="uploadMethod"
                checked={useImageUrl}
                onChange={() => setUseImageUrl(true)}
              />
              Use Image URL
            </label>
          </div>

          {/* File Upload */}
          {!useImageUrl && (
            <div className="blog-form__file-upload">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="blog-form__file-input"
              />
              <label htmlFor="image-upload" className="blog-form__file-label">
                Choose Image File
              </label>
              <p className="blog-form__file-hint">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </p>
            </div>
          )}

          {/* Image URL Input */}
          {useImageUrl && (
            <div className="blog-form__url-upload">
              <input
                type="url"
                className="blog-form__input"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleImageUrlChange}
              />
              <p className="blog-form__url-hint">
                Enter the full URL of the image
              </p>
            </div>
          )}
          
          {errors.image && <span className="blog-form__error">{errors.image}</span>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="blog-form__error blog-form__error--submit">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="blog-form__actions">
          <button
            type="button"
            className="blog-form__button blog-form__button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="blog-form__button blog-form__button--primary"
            disabled={loading}
          >
            {loading && <span className="blog-form__spinner"></span>}
            {blog ? 'Update Post' : status === 'published' ? 'Publish Now' : 'Save as Draft'}
          </button>
        </div>

        {/* DEBUG PANEL - Remove this after testing */}
        <div style={{ 
          padding: '15px', 
          border: '2px dashed #4CAF50', 
          margin: '20px 0',
          background: '#f0f8f0',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🐛 DEBUG INFO</h4>
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            <div>Title: {title.length}/100</div>
            <div>Excerpt: {excerpt.length}/200</div>
            <div>Content: {content.length} chars</div>
            <div>Validation: {validateForm() ? '✅ PASS' : '❌ FAIL'}</div>
            <div>Loading: {loading ? '⏳ YES' : '✅ NO'}</div>
            <div>Image Preview: {imagePreview ? '✅ SET' : '❌ NOT SET'}</div>
            <div>Tags: {tags.length} tags</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;