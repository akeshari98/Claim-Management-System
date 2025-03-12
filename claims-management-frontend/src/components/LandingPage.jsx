import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/shared.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Claims Management System</h1>
        <p className="landing-subtitle">
          Streamline your insurance claims process with our secure and efficient platform.
          Submit, track, and manage claims with ease.
        </p>
      </div>
      
      <div className="auth-box">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => navigate('/signup')}
            className="auth-button auth-button-primary"
          >
            Get Started - Sign Up
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="auth-button auth-button-success"
          >
            Already Have an Account? Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 