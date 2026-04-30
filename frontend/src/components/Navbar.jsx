import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-indigo-600">Secure File Sharing System</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button onClick={handleLogout} className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
