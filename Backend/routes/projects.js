const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

console.log('🔧 Initializing projects routes...');

let Project;
try {
  Project = require('../models/Project');
  console.log('✅ Project model loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Project model:', error.message);
  Project = mongoose.model('Project');
}

// ✅ GET /projects/admin/all - Get all projects for admin
router.get('/admin/all', async (req, res) => {
  try {
    console.log('📡 GET /projects/admin/all - Fetching all projects...');
    const projects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${projects.length} projects`);
    
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

// ✅ POST /projects/admin/create - Create new project
router.post('/admin/create', async (req, res) => {
  try {
    console.log('📝 POST /projects/admin/create - Creating new project...');
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
      demoUrl: req.body.demoUrl || '', // ✅ Ensure demoUrl is included
      featured: req.body.featured || false,
      image: req.body.image || ''
    });

    const savedProject = await newProject.save();
    
    console.log('✅ Project created successfully:', savedProject.name);
    console.log('🔗 Project URLs:', {
      liveUrl: savedProject.liveUrl,
      githubUrl: savedProject.githubUrl,
      demoUrl: savedProject.demoUrl
    });
    
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

// ✅ PUT /projects/admin/update/:id - Update project
router.put('/admin/update/:id', async (req, res) => {
  try {
    console.log('✏️ PUT /projects/admin/update/', req.params.id);
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
      demoUrl: req.body.demoUrl || '', // ✅ Ensure demoUrl is included
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
      console.log('🔗 Updated URLs:', {
        liveUrl: updatedProject.liveUrl,
        githubUrl: updatedProject.githubUrl,
        demoUrl: updatedProject.demoUrl
      });
      
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

// ✅ DELETE /projects/admin/delete/:id - Delete project
router.delete('/admin/delete/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /projects/admin/delete/', req.params.id);
    
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
        deletedProject: {
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

// ✅ PATCH /projects/admin/fix-demo-urls - Fix existing projects missing demoUrl
router.patch('/admin/fix-demo-urls', async (req, res) => {
  try {
    console.log('🔧 PATCH: Fixing projects missing demoUrl field...');
    
    const projects = await Project.find({});
    let updatedCount = 0;
    
    for (let project of projects) {
      // Check if demoUrl is missing or undefined
      if (project.demoUrl === undefined || project.demoUrl === null) {
        // Set demoUrl to empty string if it's missing
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
    
    // Get updated projects to verify
    const updatedProjects = await Project.find({});
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} projects with demoUrl field`,
      updatedCount,
      projects: updatedProjects.map(p => ({
        name: p.name,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl
      }))
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

// ✅ PATCH /projects/admin/fix-all-urls - Force update all projects with missing URL fields
router.patch('/admin/fix-all-urls', async (req, res) => {
  try {
    console.log('🔧 FORCE FIX: Adding missing URL fields to all projects...');
    
    const projects = await Project.find({});
    let updatedCount = 0;
    
    for (let project of projects) {
      let needsUpdate = false;
      const updateData = {};
      
      // Check and fix demoUrl
      if (project.demoUrl === undefined || project.demoUrl === null) {
        updateData.demoUrl = '';
        needsUpdate = true;
        console.log(`📝 Adding demoUrl to: ${project.name}`);
      }
      
      // Check and fix liveUrl
      if (project.liveUrl === undefined || project.liveUrl === null) {
        updateData.liveUrl = '';
        needsUpdate = true;
        console.log(`📝 Adding liveUrl to: ${project.name}`);
      }
      
      // Check and fix githubUrl
      if (project.githubUrl === undefined || project.githubUrl === null) {
        updateData.githubUrl = '';
        needsUpdate = true;
        console.log(`📝 Adding githubUrl to: ${project.name}`);
      }
      
      if (needsUpdate) {
        await Project.findByIdAndUpdate(
          project._id,
          { $set: updateData },
          { new: true }
        );
        updatedCount++;
        console.log(`✅ Updated project: ${project.name}`);
      }
    }
    
    console.log(`🎉 Force fixed ${updatedCount} projects`);
    
    // Get updated projects to verify
    const updatedProjects = await Project.find({});
    
    res.json({
      success: true,
      message: `Force updated ${updatedCount} projects with missing URL fields`,
      updatedCount,
      projects: updatedProjects.map(p => ({
        name: p.name,
        liveUrl: p.liveUrl,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        hasLiveUrl: p.liveUrl !== undefined,
        hasGithubUrl: p.githubUrl !== undefined,
        hasDemoUrl: p.demoUrl !== undefined
      }))
    });
  } catch (error) {
    console.error('❌ Error force fixing URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Error force fixing URLs',
      error: error.message
    });
  }
});

// ✅ GET /projects/debug - Debug route to check project data
router.get('/debug', async (req, res) => {
  try {
    console.log('🐛 GET /projects/debug - Debugging projects data...');
    const projects = await Project.find({}).sort({ createdAt: -1 });
    
    console.log('🔍 ALL PROJECTS DATA:');
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1}:`, {
        name: project.name,
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        hasLiveUrl: !!project.liveUrl,
        hasGithubUrl: !!project.githubUrl,
        hasDemoUrl: !!project.demoUrl
      });
    });
    
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
        technologies: p.technologies,
        createdAt: p.createdAt
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

// ✅ API ROUTES (for /api/projects prefix)

// GET /api/projects - Get projects for public
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/projects - Fetching projects...');
    const projects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${projects.length} projects for frontend`);
    
    // Log URL data for debugging
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1} "${project.name}":`, {
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl
      });
    });
    
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

console.log('✅ Projects routes initialized');
module.exports = router;