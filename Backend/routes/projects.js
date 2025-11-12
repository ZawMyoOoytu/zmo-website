// backend/routes/projects.js - FIXED ROUTE STRUCTURE
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { adminAuth } = require('../middleware/auth'); // ✅ Add authentication

console.log('🔧 Initializing projects routes...');

let Project;
try {
  Project = require('../models/Project');
  console.log('✅ Project model loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Project model:', error.message);
  Project = mongoose.model('Project');
}

// 🔐 APPLY ADMIN AUTH MIDDLEWARE TO ADMIN ROUTES
router.use('/admin', adminAuth);

// ✅ GET /api/projects - Get all projects for PUBLIC (FIXED PATH)
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/projects - Fetching all projects for public...');
    const projects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${projects.length} projects for public`);
    
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// ✅ ADMIN ROUTES (require authentication)

// GET /api/projects/admin - Get all projects for admin (FIXED PATH)
router.get('/admin', async (req, res) => {
  try {
    console.log('📡 GET /api/projects/admin - Fetching all projects for admin...');
    console.log('👤 Request by admin:', req.user.email);
    
    const projects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${projects.length} projects for admin`);
    
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('❌ Error fetching projects for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// POST /api/projects/admin - Create new project (FIXED PATH)
router.post('/admin', async (req, res) => {
  try {
    console.log('📝 POST /api/projects/admin - Creating new project...');
    console.log('👤 Request by admin:', req.user.email);
    console.log('📦 Request body:', req.body);
    
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required fields'
      });
    }

    const newProject = new Project({
      name: req.body.name,
      description: req.body.description,
      technologies: req.body.technologies || [],
      githubUrl: req.body.githubUrl || '',
      liveUrl: req.body.liveUrl || '',
      demoUrl: req.body.demoUrl || '',
      featured: req.body.featured || false,
      image: req.body.image || ''
    });

    const savedProject = await newProject.save();
    
    console.log('✅ Project created successfully:', savedProject.name);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating project',
      error: error.message
    });
  }
});

// PUT /api/projects/admin/:id - Update project (FIXED PATH)
router.put('/admin/:id', async (req, res) => {
  try {
    console.log('✏️ PUT /api/projects/admin/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    console.log('📦 Update data:', req.body);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      technologies: req.body.technologies || [],
      githubUrl: req.body.githubUrl || '',
      liveUrl: req.body.liveUrl || '',
      demoUrl: req.body.demoUrl || '',
      featured: req.body.featured || false,
      image: req.body.image || ''
    };

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedProject) {
      console.log('✅ Project updated successfully:', updatedProject.name);
      
      res.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
  } catch (error) {
    console.error('❌ Error updating project:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
});

// DELETE /api/projects/admin/:id - Delete project (FIXED PATH)
router.delete('/admin/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/projects/admin/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (deletedProject) {
      console.log('✅ Project deleted successfully:', deletedProject.name);
      res.json({
        success: true,
        message: 'Project deleted successfully',
        data: {
          id: deletedProject._id,
          name: deletedProject.name
        }
      });
    } else {
      console.log('❌ Project not found for deletion:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
});

// KEEP YOUR EXISTING UTILITY ROUTES (they're fine)
// PATCH /api/projects/admin/fix-demo-urls - Fix existing projects missing demoUrl
router.patch('/admin/fix-demo-urls', async (req, res) => {
  try {
    console.log('🔧 PATCH: Fixing projects missing demoUrl field...');
    console.log('👤 Request by admin:', req.user.email);
    
    const projects = await Project.find({});
    let updatedCount = 0;
    
    for (let project of projects) {
      if (project.demoUrl === undefined || project.demoUrl === null) {
        await Project.findByIdAndUpdate(
          project._id,
          { $set: { demoUrl: '' } },
          { new: true }
        );
        updatedCount++;
        console.log(`✅ Fixed project: ${project.name}`);
      }
    }
    
    console.log(`🎉 Fixed ${updatedCount} projects`);
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} projects with demoUrl field`,
      updatedCount
    });
  } catch (error) {
    console.error('❌ Error fixing demo URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing demo URLs',
      error: error.message
    });
  }
});

// GET /api/projects/debug - Debug route (public)
router.get('/debug', async (req, res) => {
  try {
    console.log('🐛 GET /api/projects/debug - Debugging projects data...');
    const projects = await Project.find({}).sort({ createdAt: -1 });
    
    console.log(`🔍 Found ${projects.length} projects for debugging`);
    
    res.json({
      success: true,
      data: projects,
      count: projects.length,
      debug: projects.map(p => ({
        name: p.name,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        featured: p.featured,
        technologies: p.technologies
      }))
    });
  } catch (error) {
    console.error('❌ Error in debug route:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

console.log('✅ Projects routes initialized with proper API structure');
module.exports = router;