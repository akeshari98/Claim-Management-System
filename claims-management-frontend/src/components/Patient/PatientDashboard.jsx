import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SubmitClaimForm from './SubmitClaimForm';
import '../../styles/shared.css';

function PatientDashboard() {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Fetch all claims (for this user)
  const getClaims = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/claims`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Fetched claims:', response.data);
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError(error.response?.data?.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (claim) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const fileUrl = `${API_BASE_URL}/claims/file/${claim._id}`;
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

  useEffect(() => {
    getClaims();
  }, []);

  if (loading) {
    return <div className="container">Loading claims...</div>;
  }

  return (
    <div className="container">
      <h2 className="page-title">Patient Dashboard</h2>
      
      <div className="card">
        <h3 className="section-title">Submit New Claim</h3>
        <SubmitClaimForm onClaimSubmitted={getClaims} />
      </div>
      
      <div className="card">
        <h3 className="section-title">My Claims</h3>
        {error && <div className="error-message">{error}</div>}
        
        {claims.length === 0 ? (
          <p>No claims submitted yet.</p>
        ) : (
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Claim Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Approved Amount</th>
                  <th>Submission Date</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id}>
                    <td>{claim.name}</td>
                    <td>{claim.email}</td>
                    <td>${claim.claimAmount.toLocaleString()}</td>
                    <td>{claim.description}</td>
                    <td className={`status-${claim.status.toLowerCase()}`}>
                      {claim.status}
                    </td>
                    <td>{claim.approvedAmount ? `$${claim.approvedAmount.toLocaleString()}` : '-'}</td>
                    <td>{new Date(claim.submissionDate).toLocaleString()}</td>
                    <td>
                      {claim.filePath && (
                        <button
                          onClick={() => handleViewDocument(claim)}
                          className="button button-primary"
                        >
                          View Document
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
