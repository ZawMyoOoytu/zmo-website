// frontend/src/components/BlogCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {blog.image && (
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
          {blog.title}
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt || blog.content.substring(0, 150) + '...'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags && blog.tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <Link 
            to={`/blog/${blog._id}`}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;