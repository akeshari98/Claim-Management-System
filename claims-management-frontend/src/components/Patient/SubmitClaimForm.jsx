import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/shared.css';

function SubmitClaimForm({ onClaimSubmitted }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    claimAmount: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('claimAmount', formData.claimAmount);
    data.append('description', formData.description);
    
    if (file) {
      data.append('file', file);
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to submit a claim');
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/claims`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Claim submitted successfully...:', response.data);
      setSuccessMessage('Claim submitted successfully!');
      onClaimSubmitted();
      setFormData({
        name: '',
        email: '',
        claimAmount: '',
        description: ''
      });
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError(error.response?.data?.message || 'Failed to submit claim. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '40px auto' }}>
        {/* <h2 className="section-title" style={{ marginTop: 0, textAlign: 'center' }}>Submit New Claim</h2> */}
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold' }}>Name:</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your full name"
              required 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold' }}>Email:</label>
            <input 
              name="email" 
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email"
              required 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold' }}>Claim Amount ($):</label>
            <input 
              name="claimAmount" 
              type="number" 
              min="0"
              step="0.01"
              value={formData.claimAmount} 
              onChange={handleChange} 
              placeholder="Enter claim amount"
              required 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold' }}>Description:</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Provide details about your claim"
              rows="4"
              required 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold' }}>Supporting Document:</label>
            <div style={{
              padding: '20px',
              border: '2px dashed #3498db',
              borderRadius: '4px',
              backgroundColor: '#f8fafc'
            }}>
              <input 
                type="file" 
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
                required 
                style={{ width: '100%' }}
              />
              <p style={{ margin: '8px 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                Accepted formats: PDF, JPG, PNG (max 5MB)
              </p>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="button button-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            Submit Claim
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitClaimForm;
