import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/apiService';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await registerUser({ name, email, password });
      login(response.data);
    } catch (err) {
      setError('Registration failed. Identifier may be in use.');
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,200,0.5)]">
            Veridian Flux
          </h1>
          <p className="text-cyan-200/70 mt-2">Establish New Data Conduit</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-center text-white mb-6">Identity Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-cyan-200/70 mb-2">Operator Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required
                />
              </div>
              <div>
                <label className="block text-cyan-200/70 mb-2">Identifier (Email)</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required
                />
              </div>
              <div>
                <label className="block text-cyan-200/70 mb-2">Passkey</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" required
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 font-bold text-black bg-emerald-400 rounded-md hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,200,0.4)] hover:shadow-[0_0_25px_rgba(0,255,200,0.7)] transition-all duration-300 disabled:bg-emerald-800/50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Initialize'}
                </button>
              </div>
            </form>
            <p className="text-center text-cyan-200/70 mt-6">
              Credentials authorized?{' '}
              <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Access System
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;