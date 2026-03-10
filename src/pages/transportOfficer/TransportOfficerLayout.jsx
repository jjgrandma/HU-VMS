import { Outlet } from 'react-router-dom';
import TransportSidebar from './TransportSidebar';
import TransportHeader from './TransportHeader';
import './TransportOfficerLayout.css';

const TransportOfficerLayout = ({ onLogout }) => {
  return (
    <div className="app">
      <TransportSidebar onLogout={onLogout} />
      <div className="main-content">
        <TransportHeader />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TransportOfficerLayout;