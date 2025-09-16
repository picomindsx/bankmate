import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cloudStorage } from '../services/cloudStorage';
import { useNetlifyAuth } from './NetlifyAuthContext';

interface Employee {
  id: string;
  name: string;
  phone: string;
  password: string;
  designation: string;
  email: string;
  photo?: string;
  role: 'manager' | 'staff';
  assignedBranch: string;
  permissions: {
    canAssignLeads: boolean;
    canUpdateStatus: boolean;
    canViewPipeline: boolean;
    canUpdateDocuments: boolean;
    canRejectLeads: boolean;
    canDeleteLeads: boolean;
    canManageStaff: boolean;
    canViewReports: boolean;
    canManageBranches: boolean;
    canViewAllLeads: boolean;
    canExportData: boolean;
  };
}

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  loanType: 'Home Loan' | 'Personal Loan' | 'Business Loan' | 'Education Loan' | 'Vehicle Loan' | 'Mortgage Loan';
  loanAmount: number;
  branch: string;
  leadSource: 'Meta Ads' | 'Website' | 'Referral' | 'Walk-in' | 'WhatsApp' | 'Others' | 'Staff Generated';
  assignedStaff?: string;
  status: 'New' | 'Contacted' | 'Docs Pending' | 'Sent to Bank' | 'Sanctioned' | 'Disbursed' | 'Closed';
  assignedBank?: string;
  assignedBankBranch?: string;
  remarks?: string;
  createdAt: Date;
  lastUpdated: Date;
  documents?: {
    kyc: 'Pending' | 'Provided' | 'Verified';
    income: 'Pending' | 'Provided' | 'Verified';
    legal: 'Pending' | 'Provided' | 'Verified';
    additional: 'Pending' | 'Provided' | 'Verified';
  };
}

interface Branch {
  id: string;
  name: string;
  location: string;
  manager?: string;
}

interface Task {
  id: string;
  leadId: string;
  assignedTo: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

interface CloudDataContextType {
  employees: Employee[];
  leads: Lead[];
  branches: Branch[];
  tasks: Task[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  syncData: () => Promise<void>;
  isOnline: boolean;
  lastSync: Date | null;
  notifications: number;
  clearNotifications: () => void;
  getLeadsByBranch: (branchId: string) => Lead[];
  getLeadsByStaff: (staffId: string) => Lead[];
  getTasksByStaff: (staffId: string) => Task[];
  hasPermission: (userId: string, permission: keyof Employee['permissions']) => boolean;
  getUserRole: (userId: string) => 'admin' | 'manager' | 'staff' | null;
  getAssignedLeadsByStaff: (staffId: string) => Lead[];
  updateLeadStatus: (leadId: string, status: string, updatedBy: string) => Promise<void>;
  updateLeadAssignment: (leadId: string, staffId: string, bankName: string, bankBranch?: string, assignedBy?: string) => Promise<void>;
}

const CloudDataContext = createContext<CloudDataContextType | undefined>(undefined);

export function CloudDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([
    { id: '1', name: 'Mumbai Branch', location: 'Mumbai, Maharashtra' },
    { id: '2', name: 'Delhi Branch', location: 'New Delhi, Delhi' },
    { id: '3', name: 'Bangalore Branch', location: 'Bangalore, Karnataka' },
    { id: '4', name: 'Kochi Branch', location: 'Kochi, Kerala' }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(0);

  const { user } = useNetlifyAuth();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      cloudStorage.setUserId(user.id);
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      const [employeesData, leadsData, branchesData, tasksData] = await Promise.all([
        cloudStorage.loadData('employees'),
        cloudStorage.loadData('leads'),
        cloudStorage.loadData('branches'),
        cloudStorage.loadData('tasks')
      ]);

      if (employeesData.length > 0) setEmployees(employeesData);
      if (leadsData.length > 0) setLeads(leadsData);
      if (branchesData.length > 0) setBranches(branchesData);
      if (tasksData.length > 0) setTasks(tasksData);

      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to load data from cloud:', error);
    }
  };

  const syncData = async () => {
    if (!user || !isOnline) return;

    try {
      await Promise.all([
        cloudStorage.saveData('employees', employees),
        cloudStorage.saveData('leads', leads),
        cloudStorage.saveData('branches', branches),
        cloudStorage.saveData('tasks', tasks)
      ]);
      
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  };

  // Auto-sync data every 5 minutes when online
  useEffect(() => {
    if (!isOnline || !user) return;

    const interval = setInterval(syncData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [isOnline, user, employees, leads, branches, tasks]);

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const getPermissions = (designation: string) => {
      const isAdmin = designation === 'Admin';
      const isBranchHead = designation === 'Branch Head';
      const isManager = designation === 'Manager';
      const isOwner = designation === 'Owner';
      const hasFullAccess = isAdmin || isBranchHead || isManager || isOwner;
      
      return {
        canAssignLeads: hasFullAccess,
        canUpdateStatus: hasFullAccess,
        canViewPipeline: hasFullAccess,
        canUpdateDocuments: true,
        canRejectLeads: isAdmin || isOwner,
        canDeleteLeads: isAdmin || isOwner,
        canManageStaff: hasFullAccess,
        canViewReports: hasFullAccess,
        canManageBranches: hasFullAccess,
        canViewAllLeads: hasFullAccess,
        canExportData: hasFullAccess
      };
    };

    const newEmployee = { 
      ...employee, 
      id: Date.now().toString(),
      role: employee.designation === 'Branch Head' || employee.designation === 'Manager' ? 'manager' : 'staff',
      permissions: getPermissions(employee.designation)
    };

    setEmployees(prev => [...prev, newEmployee]);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('employees', [...employees, newEmployee]);
      } catch (error) {
        console.error('Failed to save employee to cloud:', error);
      }
    }
  };

  const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, ...updatedEmployee } : emp
    );
    setEmployees(updatedEmployees);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('employees', updatedEmployees);
      } catch (error) {
        console.error('Failed to update employee in cloud:', error);
      }
    }
  };

  const deleteEmployee = async (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('employees', updatedEmployees);
      } catch (error) {
        console.error('Failed to delete employee from cloud:', error);
      }
    }
  };

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newLead = { 
      ...lead, 
      id: Date.now().toString(), 
      createdAt: new Date(),
      lastUpdated: new Date(),
      documents: {
        kyc: 'Pending',
        income: 'Pending',
        legal: 'Pending',
        additional: 'Pending'
      }
    };
    
    setLeads(prev => [...prev, newLead]);
    setNotifications(prev => prev + 1);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('leads', [...leads, newLead]);
      } catch (error) {
        console.error('Failed to save lead to cloud:', error);
      }
    }
  };

  const updateLead = async (id: string, updatedLead: Partial<Lead>) => {
    const updatedLeads = leads.map(lead => 
      lead.id === id ? { ...lead, ...updatedLead, lastUpdated: new Date() } : lead
    );
    setLeads(updatedLeads);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('leads', updatedLeads);
      } catch (error) {
        console.error('Failed to update lead in cloud:', error);
      }
    }
  };

  const deleteLead = async (id: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== id);
    setLeads(updatedLeads);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('leads', updatedLeads);
      } catch (error) {
        console.error('Failed to delete lead from cloud:', error);
      }
    }
  };

  const addBranch = async (branch: Omit<Branch, 'id'>) => {
    const newBranch = { ...branch, id: Date.now().toString() };
    setBranches(prev => [...prev, newBranch]);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('branches', [...branches, newBranch]);
      } catch (error) {
        console.error('Failed to save branch to cloud:', error);
      }
    }
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    const updatedBranches = branches.map(branch => 
      branch.id === id ? { ...branch, ...updates } : branch
    );
    setBranches(updatedBranches);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('branches', updatedBranches);
      } catch (error) {
        console.error('Failed to update branch in cloud:', error);
      }
    }
  };

  const deleteBranch = async (id: string) => {
    const updatedBranches = branches.filter(branch => branch.id !== id);
    setBranches(updatedBranches);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('branches', updatedBranches);
      } catch (error) {
        console.error('Failed to delete branch from cloud:', error);
      }
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks(prev => [...prev, newTask]);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('tasks', [...tasks, newTask]);
      } catch (error) {
        console.error('Failed to save task to cloud:', error);
      }
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    );
    setTasks(updatedTasks);
    
    if (isOnline) {
      try {
        await cloudStorage.saveData('tasks', updatedTasks);
      } catch (error) {
        console.error('Failed to update task in cloud:', error);
      }
    }
  };

  const updateLeadStatus = async (leadId: string, status: string, updatedBy: string) => {
    await updateLead(leadId, {
      status: status as any,
      remarks: (leads.find(l => l.id === leadId)?.remarks || '') + 
               `\n[${new Date().toLocaleString()}] Status updated to ${status} by ${updatedBy}`
    });
  };

  const updateLeadAssignment = async (leadId: string, staffId: string, bankName: string, bankBranch?: string, assignedBy?: string) => {
    await updateLead(leadId, {
      assignedStaff: staffId,
      assignedBank: bankName,
      assignedBankBranch: bankBranch,
      status: 'Contacted',
      remarks: (leads.find(l => l.id === leadId)?.remarks || '') + 
               `\n[${new Date().toLocaleString()}] Assigned to staff and bank by ${assignedBy || 'System'}`
    });
  };

  const clearNotifications = () => {
    setNotifications(0);
  };

  const getLeadsByBranch = (branchId: string) => {
    return leads.filter(lead => lead.branch === branchId);
  };

  const getLeadsByStaff = (staffId: string) => {
    return leads.filter(lead => lead.assignedStaff === staffId);
  };

  const getTasksByStaff = (staffId: string) => {
    return tasks.filter(task => task.assignedTo === staffId);
  };

  const getAssignedLeadsByStaff = (staffId: string): Lead[] => {
    return leads.filter(lead => lead.assignedStaff === staffId && lead.assignedBank);
  };

  const hasPermission = (userId: string, permission: keyof Employee['permissions']): boolean => {
    if (userId === 'owner-1') return true;
    
    const employee = employees.find(emp => emp.id === userId);
    return employee?.permissions?.[permission] || false;
  };

  const getUserRole = (userId: string): 'admin' | 'manager' | 'staff' | null => {
    if (userId === 'owner-1') return 'admin';
    
    const employee = employees.find(emp => emp.id === userId);
    if (!employee) return null;
    
    if (employee.designation === 'Admin') return 'admin';
    if (employee.designation === 'Branch Head' || employee.designation === 'Manager' || employee.designation === 'Owner') return 'manager';
    return 'staff';
  };

  return (
    <CloudDataContext.Provider value={{
      employees,
      leads,
      branches,
      tasks,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLead,
      updateLead,
      deleteLead,
      addBranch,
      updateBranch,
      deleteBranch,
      addTask,
      updateTask,
      syncData,
      isOnline,
      lastSync,
      notifications,
      clearNotifications,
      getLeadsByBranch,
      getLeadsByStaff,
      getTasksByStaff,
      hasPermission,
      getUserRole,
      getAssignedLeadsByStaff,
      updateLeadStatus,
      updateLeadAssignment
    }}>
      {children}
    </CloudDataContext.Provider>
  );
}

export function useCloudData() {
  const context = useContext(CloudDataContext);
  if (context === undefined) {
    throw new Error('useCloudData must be used within a CloudDataProvider');
  }
  return context;
}