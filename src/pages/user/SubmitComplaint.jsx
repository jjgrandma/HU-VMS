import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubmitComplaint.css';

const SubmitComplaint = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const categories = [
    'Vehicle Issue',
    'Driver Behavior',
    'Delay',
    'Billing Issue',
    'Route Problem',
    'Customer Service',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      if (onSubmit) {
        onSubmit({ ...formData, attachments: uploadedFiles });
      }
      alert('Complaint submitted successfully!');
      navigate('/user');
    } else {
      setErrors(newErrors);
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="complaint-form-page">
      <h1 className="page-title">Submit Complaint</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Complaint Category <span className="required">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="error-message">{errors.category}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Complaint Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              placeholder="Please describe your complaint in detail..."
              className={`form-textarea ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <p className="error-message">{errors.description}</p>}
            <p className="hint-text">Minimum 10 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label">Attachments (Optional)</label>
            <div className="upload-area">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="file-upload" className="upload-btn">
                <span className="upload-icon">📎</span>
                Upload Files
              </label>
              <p className="hint-text">Upload images, PDFs, or documents (Max 5 files)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="file-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Submit Complaint
            </button>
            <button type="button" onClick={() => navigate('/user')} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;