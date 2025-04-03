import { useState } from 'react';
import './TableRow.css';

const TableRow = ({ rowIndex, onDataChange, onRowSubmit }) => {
  const [rowData, setRowData] = useState({
    file: null,
    aiResponse: ''
  });
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      const updatedData = { ...rowData, file };
      setRowData(updatedData);
      onDataChange(rowIndex, updatedData);
    }
  };

  const handleSubmit = async () => {
    if (!rowData.file) {
      alert('Please select an image first');
      return;
    }

    setSubmitting(true);
    
    try {
      // Call parent submission handler
      const aiResponse = await onRowSubmit(rowIndex, rowData);
      
      // Update state with AI response
      const updatedData = { ...rowData, aiResponse };
      setRowData(updatedData);
      onDataChange(rowIndex, updatedData);
      
      // Reset file input after successful submission
      setFileName('');
      document.getElementById(`file-${rowIndex}`).value = '';
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <tr>
      <td className="serial-number">{rowIndex + 1}</td>
      <td className="file-cell">
        <div className="file-input-container">
          <input
            type="file"
            id={`file-${rowIndex}`}
            onChange={handleFileChange}
            accept="image/*"
            className="file-input"
            disabled={submitting}
          />
          <label htmlFor={`file-${rowIndex}`} className="file-label">
            {fileName || 'Choose image'}
          </label>
        </div>
      </td>
      <td className="submit-cell">
        <button 
          type="button" 
          className="btn btn-sm btn-primary row-submit-btn" 
          onClick={handleSubmit}
          disabled={submitting || !rowData.file}
        >
          {submitting ? 'Processing...' : 'Submit'}
        </button>
      </td>
      <td className="ai-response-cell">
        {rowData.aiResponse ? (
          <div className="ai-response-text">{rowData.aiResponse}</div>
        ) : (
          <span className="no-response">No response yet</span>
        )}
      </td>
    </tr>
  );
};

export default TableRow;