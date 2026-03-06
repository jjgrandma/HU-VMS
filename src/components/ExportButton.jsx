import { useState } from 'react';
import { FileDown } from 'lucide-react';
import './ExportButton.css';

const ExportButton = ({ onExport, disabled = false, label = 'Export to PDF' }) => {
  const [showRecipientMenu, setShowRecipientMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (recipient) => {
    setExporting(true);
    setShowRecipientMenu(false);

    try {
      await onExport(recipient);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="export-button"
        onClick={() => setShowRecipientMenu(!showRecipientMenu)}
        disabled={disabled || exporting}
      >
        <FileDown size={18} />
        <span>{exporting ? 'Exporting...' : label}</span>
      </button>

      {showRecipientMenu && (
        <div className="recipient-menu">
          <div className="recipient-menu-header">Send PDF to:</div>
          <button
            className="recipient-option"
            onClick={() => handleExport('Admin')}
          >
            <div className="recipient-icon">👤</div>
            <div className="recipient-info">
              <div className="recipient-name">Administration Office</div>
              <div className="recipient-dept">University Administration</div>
            </div>
          </button>
          <button
            className="recipient-option"
            onClick={() => handleExport('Transport')}
          >
            <div className="recipient-icon">🚗</div>
            <div className="recipient-info">
              <div className="recipient-name">Transport Office</div>
              <div className="recipient-dept">Transport Management</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
