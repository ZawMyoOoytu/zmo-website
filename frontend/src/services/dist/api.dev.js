"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.contactAPI = exports.healthCheck = exports.mockProjectAPI = exports.mockBlogAPI = exports.projectsAPI = exports.blogAPI = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

var apiClient = _axios["default"].create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
}); // Blog API calls for Frontend


var blogAPI = {
  // Get all published blogs from backend
  getAllBlogs: function getAllBlogs() {
    var response;
    return regeneratorRuntime.async(function getAllBlogs$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(apiClient.get('/blog'));

          case 3:
            response = _context.sent;
            return _context.abrupt("return", response);

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            console.warn('Backend not available, using mock data');
            return _context.abrupt("return", mockBlogAPI.getAllBlogs());

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 7]]);
  },
  // Get single blog by ID
  getBlogById: function getBlogById(id) {
    var response;
    return regeneratorRuntime.async(function getBlogById$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return regeneratorRuntime.awrap(apiClient.get("/blog/".concat(id)));

          case 3:
            response = _context2.sent;
            return _context2.abrupt("return", response);

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            console.warn('Backend not available, using mock data');
            return _context2.abrupt("return", mockBlogAPI.getBlogById(id));

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[0, 7]]);
  }
}; // Projects API calls for Frontend

exports.blogAPI = blogAPI;
var projectsAPI = {
  // Get all projects from backend
  getAllProjects: function getAllProjects() {
    var response;
    return regeneratorRuntime.async(function getAllProjects$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return regeneratorRuntime.awrap(apiClient.get('/projects'));

          case 3:
            response = _context3.sent;
            return _context3.abrupt("return", response);

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            console.warn('Backend not available, using mock data');
            return _context3.abrupt("return", mockProjectAPI.getAllProjects());

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 7]]);
  },
  // Get single project by ID
  getProjectById: function getProjectById(id) {
    var response;
    return regeneratorRuntime.async(function getProjectById$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return regeneratorRuntime.awrap(apiClient.get("/projects/".concat(id)));

          case 3:
            response = _context4.sent;
            return _context4.abrupt("return", response);

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4["catch"](0);
            console.warn('Backend not available, using mock data');
            return _context4.abrupt("return", mockProjectAPI.getProjectById(id));

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[0, 7]]);
  }
}; // Mock data for development (fallback)

exports.projectsAPI = projectsAPI;
var mockBlogs = [{
  id: 1,
  title: 'Getting Started with React',
  content: 'Learn the basics of React development...',
  excerpt: 'A beginner-friendly introduction to React.js',
  image: 'https://via.placeholder.com/600x400/667eea/white?text=React+Blog',
  category: 'React',
  tags: ['react', 'javascript', 'frontend'],
  author: 'Admin User',
  createdAt: '2024-01-15',
  published: true
}];
var mockProjects = [{
  id: 1,
  name: 'E-Commerce Platform',
  description: 'Full-stack e-commerce solution with React and Node.js',
  status: 'completed',
  technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
  demoUrl: 'https://demo-ecommerce.example.com',
  githubUrl: 'https://github.com/username/ecommerce',
  image: 'https://via.placeholder.com/600x400/667eea/white?text=E-Commerce',
  featured: true,
  createdAt: '2024-01-12'
}]; // Mock functions for development

var mockBlogAPI = {
  getAllBlogs: function getAllBlogs() {
    return Promise.resolve({
      data: mockBlogs
    });
  },
  getBlogById: function getBlogById(id) {
    var blog = mockBlogs.find(function (blog) {
      return blog.id === parseInt(id);
    });
    return Promise.resolve({
      data: blog
    });
  }
};
exports.mockBlogAPI = mockBlogAPI;
var mockProjectAPI = {
  getAllProjects: function getAllProjects() {
    return Promise.resolve({
      data: mockProjects
    });
  },
  getProjectById: function getProjectById(id) {
    var project = mockProjects.find(function (project) {
      return project.id === parseInt(id);
    });
    return Promise.resolve({
      data: project
    });
  }
}; // Health check

exports.mockProjectAPI = mockProjectAPI;

var healthCheck = function healthCheck() {
  return apiClient.get('/health');
}; // Contact API


exports.healthCheck = healthCheck;
var contactAPI = {
  sendMessage: function sendMessage(messageData) {
    return apiClient.post('/contact', messageData);
  }
}; // Assign to variable before exporting as default

exports.contactAPI = contactAPI;
var exportedApiClient = apiClient;
var _default = exportedApiClient;
exports["default"] = _default;