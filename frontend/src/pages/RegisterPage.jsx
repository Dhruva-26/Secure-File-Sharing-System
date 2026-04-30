import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import OtpModal from '../components/OtpModal';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });
  const [showOtp, setShowOtp] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: '' });

    try {
      await api.post('/auth/register', form);
      await api.post('/auth/send-otp', { email: form.email, purpose: 'register' });
      setShowOtp(true);
      setStatus({ loading: false, message: 'Registration done. OTP sent to email.', error: '' });
    } catch (error) {
      setStatus({ loading: false, message: '', error: error.response?.data?.message || 'Registration failed' });
    }
  };

  const verifyOtp = async (otp) => {
    setStatus({ loading: true, message: '', error: '' });
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp, purpose: 'register' });
      setStatus({ loading: false, message: 'OTP verified. Please login.', error: '' });
      setShowOtp(false);
      navigate('/login');
    } catch (error) {
      setStatus({ loading: false, message: '', error: error.response?.data?.message || 'OTP verification failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" placeholder="Name" required onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input name="password" type="password" placeholder="Password (min 8)" required onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <button disabled={status.loading} className="w-full bg-indigo-600 text-white rounded-lg py-2">
            {status.loading ? 'Please wait...' : 'Register'}
          </button>
        </form>
        {status.message && <p className="text-green-600 text-sm">{status.message}</p>}
        {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
        <p className="text-sm">
          Have an account? <Link to="/login" className="text-indigo-600">Login here</Link>
        </p>
      </div>
      <OtpModal open={showOtp} onClose={() => setShowOtp(false)} onVerify={verifyOtp} loading={status.loading} />
    </div>
  );
};

export default RegisterPage;
