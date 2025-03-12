import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/shared.css';

function ManageClaim({ claim, onUpdate }) {
  const [fileUrl, setFileUrl] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [comments, setComments] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (claim?._id) {
      console.log('Claim data:', claim);
      // Set the file URL with token
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}/claims/file/${claim._id}`;
      console.log('Setting file URL:', url);
      setFileUrl(url);
      
      // Get file information
      const fetchFileInfo = async () => {
        try {
          setFileError(null);
          console.log('Fetching file info for claim:', claim._id);
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication required');
          }

          const response = await axios.get(`${API_BASE_URL}/claims/${claim._id}/file-info`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('File info response:', response.data);
          setFileInfo(response.data);
        } catch (error) {
          console.error('Error fetching file info:', error.response?.data || error.message);
          setFileError(error.response?.data?.message || 'Could not load file information');
          setFileInfo(null);
        }
      };
      
      fetchFileInfo();
    }
  }, [claim, API_BASE_URL]);

  if (!claim) {
    return <p>Select a claim to review.</p>;
  }

  const handleApprove = async () => {
    if (!approvedAmount) {
      alert('Please enter the approved amount');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.patch(`${API_BASE_URL}/claims/${claim._id}`, {
        status: 'Approved',
        approvedAmount: parseFloat(approvedAmount),
        insurerComments: comments || 'Approved'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Claim approved!');
      setApprovedAmount('');
      setComments('');
      onUpdate();
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Error approving claim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async () => {
    if (!comments) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.patch(`${API_BASE_URL}/claims/${claim._id}`, {
        status: 'Rejected',
        approvedAmount: 0,
        insurerComments: comments
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Claim rejected!');
      setApprovedAmount('');
      setComments('');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Error rejecting claim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Opening document URL:', fileUrl);
      
      // Create a URL with the token in the query params
      const urlWithToken = `${fileUrl}?token=${encodeURIComponent(token)}`;
      console.log('URL with token:', urlWithToken);
      
      // First verify the file exists
      const response = await axios.head(urlWithToken);
      console.log('File verification response:', response);
      
      // Open in a new window/tab
      window.open(urlWithToken, '_blank');
    } catch (error) {
      console.error('Error accessing document:', error);
      alert('Error accessing document: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="card">
      <div className="form-group">
        <p><strong>Name:</strong> {claim.name}</p>
        <p><strong>Email:</strong> {claim.email}</p>
        <p><strong>Requested Amount:</strong> ${claim.claimAmount}</p>
        <p><strong>Description:</strong> {claim.description}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`status-${claim.status.toLowerCase()}`}>
            {claim.status}
          </span>
        </p>
        {claim.approvedAmount !== undefined && (
          <p><strong>Approved Amount:</strong> ${claim.approvedAmount}</p>
        )}
        {claim.insurerComments && (
          <p><strong>Comments:</strong> {claim.insurerComments}</p>
        )}
      </div>

      <div className="card">
        <h4 className="section-title">Supporting Documents</h4>
        
        {fileError && (
          <div className="error-message">
            {fileError}
          </div>
        )}
        
        {fileInfo && (
          <div className="form-group">
            <p><strong>File Name:</strong> {fileInfo.originalName}</p>
            <p><strong>File Type:</strong> {fileInfo.mimeType}</p>
            <p><strong>File Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB</p>
            <p><strong>Uploaded:</strong> {new Date(fileInfo.createdAt).toLocaleString()}</p>
          </div>
        )}
        
        <button 
          onClick={handleViewDocument}
          className="button button-primary"
          disabled={!fileInfo}
        >
          View Document
        </button>
      </div>

      {claim.status === 'Pending' && (
        <div className="form-group">
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
              Approved Amount:
            </label>
            <input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              placeholder="Enter approved amount"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#2c3e50'
              }}
            />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#2c3e50', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
              Comments:
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter comments or reason for rejection"
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#2c3e50',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
          </div>
        </div>
      )}

      {claim.status === 'Pending' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleApprove} 
            className="button button-success"
          >
            Approve
          </button>
          <button 
            onClick={handleReject} 
            className="button button-danger"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageClaim;
