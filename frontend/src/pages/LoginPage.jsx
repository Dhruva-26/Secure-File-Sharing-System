import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import OtpModal from '../components/OtpModal';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });
  const [showOtp, setShowOtp] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: '' });

    try {
      await api.post('/auth/send-otp', { email: form.email, purpose: 'login' });
      setShowOtp(true);
      setStatus({ loading: false, message: 'OTP sent to your email.', error: '' });
    } catch (error) {
      setStatus({ loading: false, message: '', error: error.response?.data?.message || 'Login failed' });
    }
  };

  const verifyOtpAndLogin = async (otp) => {
    setStatus({ loading: true, message: '', error: '' });
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp, purpose: 'login' });
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/');
    } catch (error) {
      setStatus({ loading: false, message: '', error: error.response?.data?.message || 'OTP/login failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <button disabled={status.loading} className="w-full bg-indigo-600 text-white rounded-lg py-2">
            {status.loading ? 'Please wait...' : 'Send OTP & Login'}
          </button>
        </form>
        {status.message && <p className="text-green-600 text-sm">{status.message}</p>}
        {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
        <p className="text-sm">
          No account? <Link to="/register" className="text-indigo-600">Register here</Link>
        </p>
      </div>
      <OtpModal open={showOtp} onClose={() => setShowOtp(false)} onVerify={verifyOtpAndLogin} loading={status.loading} />
    </div>
  );
};

export default LoginPage;
