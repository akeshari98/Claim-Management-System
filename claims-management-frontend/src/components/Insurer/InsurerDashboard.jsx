import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ManageClaim from './ManageClaim';
import '../../styles/shared.css';

function InsurerDashboard() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

  const handleViewDocument = async (claimId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const fileUrl = `${API_BASE_URL}/claims/file/${claimId}`;
      const urlWithToken = `${fileUrl}?token=${encodeURIComponent(token)}`;
      
      await axios.head(urlWithToken);
      
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
      <h2 className="page-title">Insurer Dashboard</h2>
      
      <div className="card">
        <h3 className="section-title">All Claims</h3>
        {error && <div className="error-message">{error}</div>}

        {claims.length === 0 ? (
          <p>No claims to review.</p>
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
                  <th>Action</th>
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
                          onClick={() => handleViewDocument(claim._id)}
                          className="button button-primary"
                        >
                          View Document
                        </button>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedClaim(claim)}
                        className={`button ${claim.status === 'Pending' ? 'button-primary' : 'button-success'}`}
                      >
                        {claim.status === 'Pending' ? 'Review' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedClaim && (
        <div className="card">
          <h3 className="section-title">Review Claim</h3>
          <ManageClaim claim={selectedClaim} onUpdate={getClaims} />
        </div>
      )}
    </div>
  );
}

export default InsurerDashboard;
