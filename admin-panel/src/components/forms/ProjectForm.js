// admin-panel/src/components/forms/ProjectForm.js
import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../services/api';

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    featuredImage: '',
    tags: '',
    status: 'draft',
    link: ''
  });
  const [loading, setLoading] = useState(false);

  // Populate form if editing an existing project
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        featuredImage: project.featuredImage || '',
        tags: project.tags ? project.tags.join(', ') : '',
        status: project.status || 'draft',
        link: project.link || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      };

      if (project) {
        await projectAPI.update(project._id, submitData);
      } else {
        await projectAPI.create(submitData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="6"
          required
        />
      </div>

      <div className="form-group">
        <label>Link</label>
        <input
          type="text"
          name="link"
          value={formData.link}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Tags (comma separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
