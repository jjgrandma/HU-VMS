import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  Car,
  Route,
  User,
  MoreVertical
} from 'lucide-react';
import './TransportComplaints.css';

const TransportComplaints = () => {
  const [complaints, setComplaints] = useState([
    {
      id: 'COMP-001',
      submittedBy: 'Dr. Ahmed Hassan',
      type: 'Vehicle Issue',
      description: 'Air conditioning not working properly in HU-VH-001.',
      date: '2024-03-14',
      status: 'Open',
      priority: 'Medium',
      assignedTo: 'Maintenance Team'
    },
    {
      id: 'COMP-002',
      submittedBy: 'Ato Mulugeta (Driver)',
      type: 'Route Issue',
      description: 'Road construction causing significant delays on Dire Dawa route.',
      date: '2024-03-13',
      status: 'In Progress',
      priority: 'High',
      assignedTo: 'Transport Officer'
    },
    {
      id: 'COMP-003',
      submittedBy: 'Prof. Sarah Johnson',
      type: 'Service Quality',
      description: 'Driver was late for scheduled pickup without notification.',
      date: '2024-03-12',
      status: 'Resolved',
      priority: 'Low',
      assignedTo: 'HR Department'
    },
    {
      id: 'COMP-004',
      submittedBy: 'W/ro Hanan (Driver)',
      type: 'Safety Concern',
      description: 'Brake system needs immediate attention in HU-VH-002.',
      date: '2024-03-11',
      status: 'Escalated',
      priority: 'Critical',
      assignedTo: 'Admin'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'All' || complaint.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'status') setStatusFilter(value);
    if (filterType === 'type') setTypeFilter(value);
    if (filterType === 'search') setSearchTerm(value);
  };

  const handleResolve = (complaintId) => {
    setComplaints(complaints.map(comp => 
      comp.id === complaintId ? { ...comp, status: 'Resolved' } : comp
    ));
  };

  const handleEscalate = (complaintId) => {
    setComplaints(complaints.map(comp => 
      comp.id === complaintId ? { ...comp, status: 'Escalated', assignedTo: 'Admin', priority: 'Critical' } : comp
    ));
  };

  const openResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const handleRespond = () => {
    if (response.trim()) {
      setComplaints(complaints.map(comp => 
        comp.id === selectedComplaint.id ? { 
          ...comp, 
          status: 'In Progress',
          response: response,
          responseDate: new Date().toISOString().split('T')[0]
        } : comp
      ));
      setResponse('');
      setShowModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'var(--text-secondary)';
      case 'In Progress': return 'var(--status-pending)';
      case 'Resolved': return 'var(--primary-color)';
      case 'Escalated': return 'var(--status-complaint)';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#dc2626';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Vehicle Issue': return <Car size={16} />;
      case 'Route Issue': return <Route size={16} />;
      case 'Service Quality': return <User size={16} />;
      case 'Safety Concern': return <ShieldAlert size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    escalated: complaints.filter(c => c.status === 'Escalated').length
  };

  return (
    <div className="transport-complaints-page">
      <div className="page-header">
        <div>
          <h1>Issues & Feedback</h1>
          <p>Monitor and resolve transport complaints</p>
        </div>
        <button className="btn btn-primary">
          + Log Issue
        </button>
      </div>

      <div className="complaints-stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><MessageSquare size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Logs</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon open"><AlertCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Needs Action</span>
            <span className="stat-value">{stats.open}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon escalated"><ShieldAlert size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Escalated</span>
            <span className="stat-value">{stats.escalated}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{stats.resolved}</span>
          </div>
        </div>
      </div>

      <div className="table-workspace">
        <div className="table-toolbar">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, name, or keyword..."
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-select">
              <Filter size={16} className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>
            <div className="filter-select">
              <select 
                value={typeFilter} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Vehicle Issue">Vehicle Issue</option>
                <option value="Route Issue">Route Issue</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Safety Concern">Safety Concern</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Issue Details</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Timeline</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>
                    <div className="td-content">
                      <span className="text-primary-bold">{complaint.id}</span>
                      <span className="text-desc" title={complaint.description}>
                        {complaint.description.length > 45 
                          ? `${complaint.description.substring(0, 45)}...` 
                          : complaint.description}
                      </span>
                      <span className="text-sub">From: {complaint.submittedBy}</span>
                    </div>
                  </td>
                  <td>
                    <div className="category-tag">
                      <span className="cat-icon">{getTypeIcon(complaint.type)}</span>
                      <span>{complaint.type}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="priority-dot-badge"
                      style={{ color: getPriorityColor(complaint.priority) }}
                    >
                      <span className="dot" style={{ backgroundColor: getPriorityColor(complaint.priority) }}></span>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <div className="td-content">
                      <span className="text-standard">{complaint.date}</span>
                      <span className="text-sub mt-1">Assignee: {complaint.assignedTo}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-pill"
                      style={{ 
                        backgroundColor: `${getStatusColor(complaint.status)}15`,
                        color: getStatusColor(complaint.status)
                      }}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      {complaint.status === 'Open' && (
                        <>
                          <button 
                            className="btn-text primary"
                            onClick={() => openResponseModal(complaint)}
                          >
                            Respond
                          </button>
                          <button 
                            className="btn-text danger"
                            onClick={() => handleEscalate(complaint.id)}
                            title="Escalate Issue"
                          >
                            <ArrowUpRight size={16} />  
                          </button>
                        </>
                      )}
                      {(complaint.status === 'Open' || complaint.status === 'In Progress') && (
                        <button 
                          className="btn-icon check"
                          onClick={() => handleResolve(complaint.id)}
                          title="Mark as Resolved"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button className="btn-icon ghost">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentComplaints.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <CheckCircle2 size={32} />
                    <p>No complaints found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing <span className="fw-600">{startIndex + 1}</span> to <span className="fw-600">{Math.min(endIndex, filteredComplaints.length)}</span> of <span className="fw-600">{filteredComplaints.length}</span> issues
            </span>
            <div className="pagination-controls">
              <button 
                className="btn-page"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`btn-page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className="btn-page"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Respond to Issue</h3>
            <div className="issue-summary-box">
              <div className="isb-row">
                <span className="isb-label">ID</span>
                <span className="isb-val text-primary-bold">{selectedComplaint?.id}</span>
              </div>
              <div className="isb-row">
                <span className="isb-label">Reporter</span>
                <span className="isb-val">{selectedComplaint?.submittedBy}</span>
              </div>
              <div className="isb-row desc">
                <span className="isb-label">Description</span>
                <span className="isb-val">{selectedComplaint?.description}</span>
              </div>
            </div>
            
            <div className="modal-form">
              <label>Your Response</label>
              <textarea
                placeholder="Detail action taken or message to reporter..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleRespond}
                disabled={!response.trim()}
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportComplaints;