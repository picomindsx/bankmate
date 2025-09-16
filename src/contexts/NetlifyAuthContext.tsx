import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { cloudStorage } from '../services/cloudStorage';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  designation?: string;
  phone?: string;
  assignedBranch?: string;
}

interface NetlifyAuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const NetlifyAuthContext = createContext<NetlifyAuthContextType | undefined>(undefined);

export function NetlifyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init({
      APIUrl: `${window.location.origin}/.netlify/identity`
    });

    // Check for existing user
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      const userData: User = {
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.user_metadata?.full_name || currentUser.email || '',
        role: currentUser.user_metadata?.role || 'staff',
        designation: currentUser.user_metadata?.designation,
        phone: currentUser.user_metadata?.phone,
        assignedBranch: currentUser.user_metadata?.assignedBranch
      };
      setUser(userData);
      cloudStorage.setUserId(currentUser.id);
      
      // Sync data from cloud
      cloudStorage.syncFromCloud();
    }

    // Listen for auth events
    netlifyIdentity.on('login', (user) => {
      const userData: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || '',
        role: user.user_metadata?.role || 'staff',
        designation: user.user_metadata?.designation,
        phone: user.user_metadata?.phone,
        assignedBranch: user.user_metadata?.assignedBranch
      };
      setUser(userData);
      cloudStorage.setUserId(user.id);
      cloudStorage.syncFromCloud();
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      cloudStorage.setUserId('');
    });

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For owner login, check against hardcoded credentials
      if (email === 'ajithcscpdm@gmail.com' && password === 'Ajith@6235') {
        const ownerUser: User = {
          id: 'owner-1',
          email: 'ajithcscpdm@gmail.com',
          name: 'Ajith Balachandran',
          role: 'owner'
        };
        setUser(ownerUser);
        cloudStorage.setUserId('owner-1');
        await cloudStorage.syncFromCloud();
        return true;
      }

      // For staff, use Netlify Identity
      netlifyIdentity.open('login');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, userData: any): Promise<boolean> => {
    try {
      netlifyIdentity.open('signup');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    if (user?.id === 'owner-1') {
      // Owner logout
      setUser(null);
      cloudStorage.setUserId('');
    } else {
      // Staff logout via Netlify Identity
      netlifyIdentity.logout();
    }
  };

  return (
    <NetlifyAuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </NetlifyAuthContext.Provider>
  );
}

export function useNetlifyAuth() {
  const context = useContext(NetlifyAuthContext);
  if (context === undefined) {
    throw new Error('useNetlifyAuth must be used within a NetlifyAuthProvider');
  }
  return context;
}