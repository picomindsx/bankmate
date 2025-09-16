import React, { useState } from 'react';
import { Building2, User, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useNetlifyAuth } from '../contexts/NetlifyAuthContext';
import ForgotPassword from './ForgotPassword';
import BSLogo from './BSLogo';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'owner' | 'staff'>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useNetlifyAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      
      if (loginType === 'owner') {
        // Owner login with hardcoded credentials
        success = await login('ajithcscpdm@gmail.com', credentials.password);
      } else {
        // Staff login via Netlify Identity
        success = await login(credentials.phone, credentials.password);
      }
      
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Company Logo and Name */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BSLogo size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bankmate Solutions Pvt. Ltd.
          </h1>
          <p className="text-gray-600">Cloud-Enabled Loan Management CRM</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Netlify Cloud Storage</span>
          </div>
        </div>

        {/* Login Type Selector */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('owner')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'owner'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Owner Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('staff')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'staff'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Staff Login
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginType === 'owner' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="ajithcscpdm@gmail.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Owner email: ajithcscpdm@gmail.com
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={credentials.phone}
                  onChange={(e) => setCredentials(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Staff members: Use your registered phone number
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {loginType === 'owner' && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Owner password: Ajith@6235
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <Lock className="w-4 h-4 mr-2 text-red-600" />
            <span>Cloud-secured with Netlify Identity & role-based access</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Data synced across all devices automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}