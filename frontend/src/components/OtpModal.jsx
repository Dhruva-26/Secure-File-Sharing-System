import { useState } from 'react';

const OtpModal = ({ open, onClose, onVerify, loading }) => {
  const [otp, setOtp] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Verify OTP</h2>
        <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to your email.</p>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="123456"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300">Cancel</button>
          <button
            onClick={() => onVerify(otp)}
            disabled={loading || otp.length !== 6}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
