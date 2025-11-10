// admin-panel/src/components/forms/BlogForm.js
import React, { useState, useEffect } from 'react';
import './BlogForm.css';

const BlogForm = ({ blog, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setContent(blog.content || '');
      setImageUrl(blog.imageUrl || '');
      setImagePreview(blog.imageUrl || '');
    }
  }, [blog]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setUseImageUrl(false);

      // Create preview
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
    
    // Clear file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // If a local file is selected, you would upload it here
      if (imageFile && !useImageUrl) {
        // In a real app, you would upload the file to your server
        // For now, we'll use the data URL as a placeholder
        finalImageUrl = imagePreview;
        
        // Example of actual upload implementation:
        // const formData = new FormData();
        // formData.append('image', imageFile);
        // const uploadResponse = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const uploadData = await uploadResponse.json();
        // finalImageUrl = uploadData.url;
      }

      const formData = {
        title,
        content,
        imageUrl: finalImageUrl,
        // Include the file if you want to handle upload separately
        ...(imageFile && { imageFile })
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="blog-form__field">
          <label className="blog-form__label" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            className="blog-form__input"
            type="text"
            placeholder="Enter blog post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
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
        </div>

        <div className="blog-form__field">
          <label className="blog-form__label" htmlFor="content">
            Content *
          </label>
          <textarea
            id="content"
            className="blog-form__textarea blog-form__textarea--large"
            placeholder="Write your blog post content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          <div className="blog-form__char-count">
            {content.length} characters
          </div>
        </div>

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
            {blog ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;