// admin-panel/src/components/common/ApiDebugger.js
import React, { useState, useEffect } from 'react';
import { blogAPI, getToken } from '../../services/api';

const ApiDebugger = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBlogsAPI = async () => {
    try {
      setLoading(true);
      setDebugInfo('Testing blogs API...');
      
      console.log('🔧 DEBUG: Starting API test...');
      console.log('🔧 DEBUG: Token:', getToken() ? 'Present' : 'Missing');
      console.log('🔧 DEBUG: API URL:', process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com/api');
      
      // Test 1: Direct fetch to see raw response
      setDebugInfo('Testing direct fetch...');
      const directResponse = await fetch('https://zmo-backend.onrender.com/api/blogs');
      const directData = await directResponse.json();
      console.log('🔧 DEBUG: Direct fetch result:', directData);
      
      // Test 2: Using blogAPI
      setDebugInfo('Testing blogAPI...');
      const result = await blogAPI.getAll();
      console.log('🔧 DEBUG: blogAPI result:', result);
      
      setApiResponse({
        directFetch: directData,
        blogAPI: result,
        timestamp: new Date().toISOString()
      });
      
      setDebugInfo('✅ API test completed! Check console for details.');
      
    } catch (error) {
      console.error('🔧 DEBUG: API test failed:', error);
      setDebugInfo(`❌ API test failed: ${error.message}`);
      setApiResponse({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateBlog = async () => {
    try {
      setDebugInfo('Creating test blog...');
      
      const testBlog = {
        title: `Test Blog ${new Date().toLocaleTimeString()}`,
        excerpt: 'This is a test blog created from debugger',
        content: 'This is test content for debugging purposes.',
        author: 'Debug Admin',
        published: true,
        tags: ['test', 'debug'],
        readTime: 2
      };
      
      const result = await blogAPI.create(testBlog);
      console.log('🔧 DEBUG: Create result:', result);
      
      if (result.success) {
        setDebugInfo(`✅ Blog created! ID: ${result.data?._id}`);
        // Test fetching again to see if it appears
        setTimeout(() => testBlogsAPI(), 2000);
      } else {
        setDebugInfo(`❌ Create failed: ${result.message}`);
      }
    } catch (error) {
      setDebugInfo(`💥 Create error: ${error.message}`);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testBlogsAPI();
  }, []);

  return (
    <div style={{
      background: '#f8f9fa',
      border: '2px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      fontSize: '14px'
    }}>
      <h4 style={{ marginBottom: '15px', color: '#495057' }}>
        🔧 API Debugger
      </h4>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={testBlogsAPI}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? 'Testing...' : 'Test Blogs API'}
        </button>
        
        <button
          onClick={testCreateBlog}
          className="btn btn-success btn-sm"
        >
          Create Test Blog
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline-secondary btn-sm"
        >
          Refresh Page
        </button>
      </div>
      
      <div style={{
        padding: '10px',
        background: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <strong>Status:</strong> {debugInfo}
      </div>
      
      {apiResponse && (
        <div>
          <h5>API Response Details:</h5>
          <div style={{ 
            background: '#fff', 
            border: '1px solid #dee2e6', 
            borderRadius: '4px', 
            padding: '15px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontSize: '12px'
          }}>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;