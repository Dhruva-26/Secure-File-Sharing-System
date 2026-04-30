import { useEffect, useState } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { formatDateTime } from '../utils/format';

const DashboardPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [share, setShare] = useState({ fileId: '', email: '' });
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data.files || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files');
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('File uploaded successfully');
      setSelectedFile(null);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const shareFile = async (e) => {
    e.preventDefault();
    try {
      await api.post('/files/share', share);
      setMessage('File shared successfully');
      setShare({ fileId: '', email: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Share failed');
    }
  };

  const downloadFile = async (fileId, name) => {
    try {
      const res = await api.get(`/files/download?fileId=${fileId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6 grid lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <h2 className="font-semibold mb-3">Upload File</h2>
          <form onSubmit={uploadFile} className="space-y-3">
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full text-sm" />
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">Upload</button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 lg:col-span-2">
          <h2 className="font-semibold mb-3">Share File</h2>
          <form onSubmit={shareFile} className="grid md:grid-cols-3 gap-3">
            <select value={share.fileId} onChange={(e) => setShare((p) => ({ ...p, fileId: e.target.value }))} className="border rounded-lg px-3 py-2" required>
              <option value="">Select file</option>
              {files.map((f) => (
                <option key={f._id} value={f._id}>{f.originalName}</option>
              ))}
            </select>
            <input type="email" placeholder="Recipient email" value={share.email} onChange={(e) => setShare((p) => ({ ...p, email: e.target.value }))} className="border rounded-lg px-3 py-2" required />
            <button className="bg-slate-900 text-white rounded-lg px-4 py-2">Share</button>
          </form>
        </section>
      </main>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 font-semibold">My Accessible Files</div>
          <div className="divide-y divide-slate-200">
            {files.map((file) => (
              <div key={file._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-sm text-slate-600">
                    Owner: {file.owner?.email} • Expires: {formatDateTime(file.expiresAt)}
                  </p>
                </div>
                <button onClick={() => downloadFile(file._id, file.originalName)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Download</button>
              </div>
            ))}
            {!files.length && <p className="p-4 text-slate-500">No files yet.</p>}
          </div>
        </div>
        {message && <p className="text-green-600 mt-3">{message}</p>}
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </section>
    </div>
  );
};

export default DashboardPage;
