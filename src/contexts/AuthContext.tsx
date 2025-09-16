import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username?: string;
  phone?: string;
  role: 'owner' | 'manager' | 'staff';
  name?: string;
  designation?: string;
  email?: string;
  photo?: string;
  assignedBranch?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any, role: 'owner' | 'manager' | 'staff') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<boolean>;
  sendEmailOTP: (email: string) => Promise<boolean>;
  resetPasswordEmail: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('bankmate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any, role: 'owner' | 'manager' | 'staff'): Promise<boolean> => {
    if (role === 'owner') {
      // Check for updated owner credentials first
      const savedOwnerData = localStorage.getItem('bankmate_owner_credentials');
      let ownerCredentials = {
        username: 'Ajith6235',
        password: 'Ajith@6235',
        email: 'ajithcscpdm@gmail.com',
        phone: '8281032914'
      };
      
      if (savedOwnerData) {
        ownerCredentials = JSON.parse(savedOwnerData);
      }
      
      if (credentials.username === ownerCredentials.username && credentials.password === ownerCredentials.password) {
        const ownerUser: User = {
          id: 'owner-1',
          username: ownerCredentials.username,
          role: 'owner',
          name: 'Ajith Balachandran',
          email: ownerCredentials.email
        };
        setUser(ownerUser);
        localStorage.setItem('bankmate_user', JSON.stringify(ownerUser));
        return true;
      }
    } else {
      // Staff/Manager login - check against stored employees
      const employees = JSON.parse(localStorage.getItem('bankmate_employees') || '[]');
      console.log('Available employees for login:', employees); // Debug log
      const employee = employees.find((emp: any) => 
        emp.phone === credentials.phone && emp.password === credentials.password
      );
      
      console.log('Found employee:', employee); // Debug log
      
      if (employee) {
        const employeeUser: User = {
          id: employee.id,
          phone: employee.phone,
          role: employee.role || 'staff',
          name: employee.name,
          designation: employee.designation,
          email: employee.email,
          photo: employee.photo,
          assignedBranch: employee.assignedBranch
        };
        setUser(employeeUser);
        localStorage.setItem('bankmate_user', JSON.stringify(employeeUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bankmate_user');
  };

  const sendOTP = async (phone: string): Promise<boolean> => {
    // Special handling for owner's security phone
    if (phone === '8281032914') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp_${phone}`, otp);
      // In production, integrate with SMS gateway
      console.log(`🔐 OWNER SECURITY OTP: ${otp} sent to ${phone}`);
      alert(`🔐 Security OTP sent to ${phone}: ${otp}\n(In production, this will be sent via SMS)`);
      return true;
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${phone}`, otp);
    // In production, integrate with SMS gateway
    console.log(`OTP ${otp} would be sent to ${phone}`);
    return true;
  };

  const sendEmailOTP = async (email: string): Promise<boolean> => {
    // Special handling for owner's security email
    if (email === 'ajithcscpdm@gmail.com') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`email_otp_${email}`, otp);
      // In production, integrate with email service
      console.log(`🔐 OWNER SECURITY EMAIL OTP: ${otp} sent to ${email}`);
      alert(`🔐 Security OTP sent to ${email}: ${otp}\n(In production, this will be sent via email)`);
      return true;
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`email_otp_${email}`, otp);
    // In production, integrate with email service
    console.log(`OTP ${otp} would be sent to ${email}`);
    return true;
  };

  const resetPassword = async (phone: string, otp: string, newPassword: string): Promise<boolean> => {
    const storedOTP = localStorage.getItem(`otp_${phone}`);
    if (storedOTP === otp) {
      // Special handling for owner's security phone
      if (phone === '8281032914') {
        // Update owner password in a secure way
        const ownerData = {
          username: 'Ajith6235',
          password: newPassword,
          email: 'ajithcscpdm@gmail.com',
          phone: '8281032914'
        };
        localStorage.setItem('bankmate_owner_credentials', JSON.stringify(ownerData));
        localStorage.removeItem(`otp_${phone}`);
        return true;
      } else {
        // Update password in employees data
        const employees = JSON.parse(localStorage.getItem('bankmate_employees') || '[]');
        const updatedEmployees = employees.map((emp: any) => 
          emp.phone === phone ? { ...emp, password: newPassword } : emp
        );
        localStorage.setItem('bankmate_employees', JSON.stringify(updatedEmployees));
      }
      localStorage.removeItem(`otp_${phone}`);
      return true;
    }
    return false;
  };

  const resetPasswordEmail = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    const storedOTP = localStorage.getItem(`email_otp_${email}`);
    if (storedOTP === otp) {
      // Special handling for owner's security email
      if (email === 'ajithcscpdm@gmail.com') {
        // Update owner password in a secure way
        const ownerData = {
          username: 'Ajith6235',
          password: newPassword,
          email: 'ajithcscpdm@gmail.com',
          phone: '8281032914'
        };
        localStorage.setItem('bankmate_owner_credentials', JSON.stringify(ownerData));
        localStorage.removeItem(`email_otp_${email}`);
        return true;
      } else {
        // Update password in employees data
        const employees = JSON.parse(localStorage.getItem('bankmate_employees') || '[]');
        const updatedEmployees = employees.map((emp: any) => 
          emp.email === email ? { ...emp, password: newPassword } : emp
        );
        localStorage.setItem('bankmate_employees', JSON.stringify(updatedEmployees));
      }
      localStorage.removeItem(`email_otp_${email}`);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      resetPassword, 
      sendOTP, 
      sendEmailOTP, 
      resetPasswordEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}