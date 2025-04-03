import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from '../components/DataTable/DataTable';

const TablePage = () => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Check for auth token and load entries
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadEntries();
    }
  }, [navigate]);
  
  // Load user's entries from database
  const loadEntries = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      const res = await axios.get('/api/table/user', config);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load entries');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
    setLoading(false);
  };
  
  // Process row submission
  const handleRowSubmit = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      const res = await axios.post('/api/table', formData, config);
      
      // Add new entry to the list
      setEntries([...entries, res.data]);
      
      return res.data.aiResponse || '';
    } catch (err) {
      console.error(err);
      throw new Error(err.response?.data?.message || 'Failed to submit entry');
    }
  };
  
  // Handle successful submission
  const handleSuccess = (message) => {
    setSuccess(message);
    setError('');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
    
    // Reload entries to ensure we have the latest data
    loadEntries();
  };
  
  // Handle submission error
  const handleError = (message) => {
    setError(message);
    setSuccess('');
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h1>Data Entry</h1>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {/* Data Entry Table */}
      <h2>Select Images</h2>
      <DataTable 
        onSuccess={handleSuccess}
        onError={handleError}
        onRowSubmit={handleRowSubmit}
      />
      
      {/* Display Entries */}
      <div className="entries-display">
        <h2>Your Entries</h2>
        {loading ? (
          <p>Loading entries...</p>
        ) : entries.length === 0 ? (
          <p>No entries yet. Add your entries using the form above.</p>
        ) : (
          <div className="entries-grid">
            {entries.map(entry => (
              <div className="entry-card" key={entry._id}>
                <div className="entry-image">
                  <img 
                    src={entry.imageUrl} 
                    alt={`Entry ${entry.serialNumber}`}
                  />
                </div>
                <div className="entry-content">
                  <h3>Entry #{entry.serialNumber}</h3>
                  {entry.aiResponse && (
                    <div className="ai-response">
                      <h4>AI Response:</h4>
                      <p>{entry.aiResponse}</p>
                    </div>
                  )}
                  <div className="entry-date">
                    <small>Created: {new Date(entry.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePage;