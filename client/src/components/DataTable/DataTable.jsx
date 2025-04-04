import { useState } from 'react';
import TableRow from '../TableRow/TableRow';
import './DataTable.css';

const DataTable = ({ onSuccess, onError, onRowSubmit }) => {
  const [tableData, setTableData] = useState(Array(11).fill().map(() => ({
    file: null,
    aiResponse: ''
  })));
  const [submitting, setSubmitting] = useState(false);

  const handleRowDataChange = (rowIndex, rowData) => {
    const newTableData = [...tableData];
    newTableData[rowIndex] = rowData;
    setTableData(newTableData);
  };

  // Handle individual row submission
  const handleRowSubmit = async (rowIndex, rowData) => {
    if (!rowData.file) {
      return Promise.reject(new Error('Please select an image first'));
    }
    
    try {
      const formData = new FormData();
      formData.append('image', rowData.file);
      
      // Call the parent component's submit handler with formData
      const response = await onRowSubmit(rowIndex, formData);
      return response;
    } catch (error) {
      console.error('Row submission error:', error);
      throw error;
    }
  };

  // Handle entire form submission for any pending rows
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get all rows that have files but haven't been submitted yet
    const pendingRows = tableData.filter(row => 
      row.file !== null && !row.aiResponse
    );
    
    if (pendingRows.length === 0) {
      onError('No pending images to submit');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Process all pending rows one by one
      for (const row of pendingRows) {
        await onRowSubmit(row.file);
      }
      
      // Reset all rows
      setTableData(Array(11).fill().map(() => ({
        file: null,
        aiResponse: ''
      })));
      
      onSuccess('All pending images have been submitted!');
    } catch (error) {
      onError(error.message || 'Failed to submit images');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="data-table">
      <form onSubmit={handleSubmit}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="serial-number-header">#</th>
              <th className="image-header">Image</th>
              <th className="action-header">Action</th>
              <th className="ai-header">AI Output</th>
            </tr>
          </thead>
          <tbody>
            {Array(11).fill().map((_, index) => (
              <TableRow 
                key={index} 
                rowIndex={index}
                onDataChange={handleRowDataChange}
                onRowSubmit={handleRowSubmit}
              />
            ))}
          </tbody>
        </table>
        
        <div className="submit-container">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Submit All Pending'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataTable;