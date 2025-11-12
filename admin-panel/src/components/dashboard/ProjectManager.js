import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';

export default function ProjectManager({ onUpdate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardAPI.getProjects();
      setProjects(data);

      // Notify parent dashboard to update counts
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createTestProject = async () => {
    try {
      const response = await dashboardAPI.createTestProject();
      if (response.success) {
        await loadProjects();
        alert('✅ Test project created successfully!');
      }
    } catch (err) {
      console.error('Failed to create test project:', err);
      alert('❌ Failed to create test project. Check console.');
    }
  };

  return (
    <div className="project-manager">
      <h3>Project Manager</h3>
      <button onClick={createTestProject} className="btn btn-success">
        ➕ Create Test Project
      </button>

      {loading && <p>Loading projects...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              {project.title} - {project.status || 'Unknown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
