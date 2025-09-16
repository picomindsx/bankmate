import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { persistentStorage } from '../utils/storage';

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
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: Date;
  isRejected?: boolean;
  applicationStatus?: ApplicationStatus;
  assignedBank?: string;
  assignedBankBranch?: string;
  remarks?: string;
  createdAt: Date;
  lastUpdated: Date;
  followUpDate?: Date;
  documents?: DocumentStatus;
  documentFiles?: DocumentFile[];
  statusHistory?: ApplicationStatus[];
  pipelineSteps?: PipelineStep[];
  hasCoApplicant?: boolean;
  coApplicantName?: string;
  coApplicantMobile?: string;
  coApplicantEmail?: string;
  coApplicantDob?: string;
  coApplicantGender?: string;
  coApplicantRelationship?: string;
  coApplicantPan?: string;
  coApplicantAadhar?: string;
  coApplicantAddress?: string;
  coApplicantIncomeType?: string;
  coApplicantMonthlyIncome?: string;
  coApplicantEmployer?: string;
}

interface DocumentStatus {
  kyc: 'Pending' | 'Provided' | 'Verified';
  income: 'Pending' | 'Provided' | 'Verified';
  legal: 'Pending' | 'Provided' | 'Verified';
  additional: 'Pending' | 'Provided' | 'Verified';
}

interface DocumentFile {
  id: string;
  name: string;
  type: 'kyc' | 'income' | 'legal' | 'additional';
  url: string;
  uploadDate: Date;
  uploadedBy: string;
}

interface ApplicationStatus {
  status: 'Login' | 'Pending' | 'Sanctioned' | 'Rejected';
  updatedBy: string;
  updatedAt: Date;
  notes?: string;
}

interface PipelineStep {
  id: string;
  stepName: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  startDate?: Date;
  completedDate?: Date;
  lastUpdated: Date;
  updatedBy: string;
  notes?: string;
  duration?: number; // in hours
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

interface MetaLead {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'WhatsApp Business';
  campaignName: string;
  adSetName: string;
  formName: string;
  leadData: {
    fullName: string;
    phone: string;
    email?: string;
    city?: string;
    loanType?: string;
    loanAmount?: number;
    customFields?: Record<string, any>;
  };
  receivedAt: Date;
  processed: boolean;
  convertedToLead?: string; // Lead ID if converted
  source: 'Meta Ads' | 'Instagram Ads' | 'WhatsApp Business';
}

interface DataContextType {
  employees: Employee[];
  leads: Lead[];
  branches: Branch[];
  tasks: Task[];
  metaLeads: MetaLead[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  updateEmployeePassword: (id: string, newPassword: string) => void;
  deleteEmployee: (id: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  rejectLead: (leadId: string, reason: string, rejectedBy: string) => void;
  assignLead: (leadId: string, staffId: string, assignedBy: string) => void;
  updateLeadStatus: (leadId: string, status: string, updatedBy: string) => void;
  updateLeadDocuments: (leadId: string, documents: Partial<DocumentStatus>) => void;
  uploadDocument: (leadId: string, file: Omit<DocumentFile, 'id' | 'uploadDate'>) => void;
  updateApplicationStatus: (leadId: string, status: ApplicationStatus) => void;
  updateLeadDocumentCompletion: (leadId: string, isComplete: boolean) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  updateLeadAssignment: (leadId: string, staffId: string, bankName: string, bankBranch?: string, assignedBy?: string) => void;
  updatePipelineStep: (leadId: string, stepId: string, updates: Partial<PipelineStep>) => void;
  initializePipelineSteps: (leadId: string) => void;
  updateLeadAssignment: (leadId: string, staffId: string, bankName: string, bankBranch?: string, assignedBy?: string) => void;
  addMetaLead: (metaLead: Omit<MetaLead, 'id' | 'receivedAt'>) => void;
  convertMetaLeadToLead: (metaLeadId: string, additionalData?: Partial<Lead>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  deleteBranch: (id: string) => void;
  notifications: number;
  clearNotifications: () => void;
  getLeadsByBranch: (branchId: string) => Lead[];
  getLeadsByStaff: (staffId: string) => Lead[];
  getTasksByStaff: (staffId: string) => Task[];
  hasPermission: (userId: string, permission: keyof Employee['permissions']) => boolean;
  getUserRole: (userId: string) => 'admin' | 'manager' | 'staff' | null;
  getAssignedLeadsByStaff: (staffId: string) => Lead[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metaLeads, setMetaLeads] = useState<MetaLead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([
    { id: '1', name: 'Mumbai Branch', location: 'Mumbai, Maharashtra' },
    { id: '2', name: 'Delhi Branch', location: 'New Delhi, Delhi' },
    { id: '3', name: 'Bangalore Branch', location: 'Bangalore, Karnataka' },
    { id: '4', name: 'Kochi Branch', location: 'Kochi, Kerala' }
  ]);
  const [notifications, setNotifications] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await persistentStorage.init();
        
        const [savedEmployees, savedLeads, savedTasks, savedBranches, savedMetaLeads] = await Promise.all([
          persistentStorage.loadData('employees'),
          persistentStorage.loadData('leads'),
          persistentStorage.loadData('tasks'),
          persistentStorage.loadData('branches'),
          persistentStorage.loadData('metaLeads')
        ]);

        if (savedEmployees.length > 0) setEmployees(savedEmployees);
        if (savedLeads.length > 0) setLeads(savedLeads);
        if (savedTasks.length > 0) setTasks(savedTasks);
        if (savedBranches.length > 0) setBranches(savedBranches);
        if (savedMetaLeads.length > 0) setMetaLeads(savedMetaLeads);
        
        setIsDataLoaded(true);
        console.log('Data loaded successfully from persistent storage');
      } catch (error) {
        console.error('Failed to load data from persistent storage:', error);
        // Fallback to localStorage
        const savedEmployees = localStorage.getItem('bankmate_employees');
        const savedLeads = localStorage.getItem('bankmate_leads');
        const savedTasks = localStorage.getItem('bankmate_tasks');
        const savedBranches = localStorage.getItem('bankmate_branches');
        const savedMetaLeads = localStorage.getItem('bankmate_metaLeads');

        if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
        if (savedLeads) setLeads(JSON.parse(savedLeads));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedBranches) setBranches(JSON.parse(savedBranches));
        if (savedMetaLeads) setMetaLeads(JSON.parse(savedMetaLeads));
        
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      persistentStorage.saveData('employees', employees).catch(error => {
        console.error('Failed to save employees:', error);
        localStorage.setItem('bankmate_employees', JSON.stringify(employees));
      });
    }
  }, [employees]);

  useEffect(() => {
    if (isDataLoaded) {
      persistentStorage.saveData('leads', leads).catch(error => {
        console.error('Failed to save leads:', error);
        localStorage.setItem('bankmate_leads', JSON.stringify(leads));
      });
    }
  }, [leads]);

  useEffect(() => {
    if (isDataLoaded) {
      persistentStorage.saveData('tasks', tasks).catch(error => {
        console.error('Failed to save tasks:', error);
        localStorage.setItem('bankmate_tasks', JSON.stringify(tasks));
      });
    }
  }, [tasks]);

  useEffect(() => {
    if (isDataLoaded) {
      persistentStorage.saveData('branches', branches).catch(error => {
        console.error('Failed to save branches:', error);
        localStorage.setItem('bankmate_branches', JSON.stringify(branches));
      });
    }
  }, [branches]);

  useEffect(() => {
    if (isDataLoaded) {
      persistentStorage.saveData('metaLeads', metaLeads).catch(error => {
        console.error('Failed to save metaLeads:', error);
        localStorage.setItem('bankmate_metaLeads', JSON.stringify(metaLeads));
      });
    }
  }, [metaLeads]);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    // Determine permissions based on role/designation
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
        canUpdateDocuments: true, // All can update documents
        canRejectLeads: isAdmin || isOwner, // Only admin and owner can reject
        canDeleteLeads: isAdmin || isOwner, // Only admin and owner can delete
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
    
    // Force immediate save to persistent storage
    setTimeout(() => {
      persistentStorage.saveData('employees', [...employees, newEmployee]).catch(error => {
        console.error('Failed to save new employee:', error);
        localStorage.setItem('bankmate_employees', JSON.stringify([...employees, newEmployee]));
      });
    }, 100);
  };

  const updateEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
    // Update permissions if designation changes
    if (updatedEmployee.designation) {
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
      
      updatedEmployee.permissions = getPermissions(updatedEmployee.designation);
    }

    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, ...updatedEmployee } : emp
    );
    setEmployees(updatedEmployees);
    
    // Force immediate save to persistent storage
    setTimeout(() => {
      persistentStorage.saveData('employees', updatedEmployees).catch(error => {
        console.error('Failed to update employee:', error);
        localStorage.setItem('bankmate_employees', JSON.stringify(updatedEmployees));
      });
    }, 100);
    
    // If employee role is updated to manager, update their role
    if (updatedEmployee.designation === 'Branch Head' || updatedEmployee.designation === 'Manager') {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, role: 'manager' } : emp
      ));
    }
  };

  const updateEmployeePassword = (id: string, newPassword: string) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, password: newPassword } : emp
    );
    setEmployees(updatedEmployees);
    
    // Force immediate save to persistent storage
    setTimeout(() => {
      persistentStorage.saveData('employees', updatedEmployees).catch(error => {
        console.error('Failed to update employee password:', error);
        localStorage.setItem('bankmate_employees', JSON.stringify(updatedEmployees));
      });
    }, 100);
  };

  const deleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    
    // Force immediate save to persistent storage
    setTimeout(() => {
      persistentStorage.saveData('employees', updatedEmployees).catch(error => {
        console.error('Failed to delete employee:', error);
        localStorage.setItem('bankmate_employees', JSON.stringify(updatedEmployees));
      });
    }, 100);
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => {
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
      },
      documentFiles: [],
      statusHistory: [],
      pipelineSteps: [],
      applicationStatus: {
        status: 'Login',
        updatedBy: 'System',
        updatedAt: new Date()
      }
    };
    setLeads(prev => [...prev, newLead]);
    // Initialize pipeline steps
    setTimeout(() => initializePipelineSteps(newLead.id), 100);
    setNotifications(prev => prev + 1);
  };

  const initializePipelineSteps = (leadId: string) => {
    const defaultSteps: Omit<PipelineStep, 'id'>[] = [
      { stepName: 'Lead Capture', status: 'Completed', startDate: new Date(), completedDate: new Date(), lastUpdated: new Date(), updatedBy: 'System', notes: 'Lead captured successfully' },
      { stepName: 'Initial Contact', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Document Collection', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'KYC Verification', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Income Verification', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Legal Verification', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Bank Assignment', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Application Submission', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Bank Processing', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Sanction', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' },
      { stepName: 'Disbursement', status: 'Not Started', lastUpdated: new Date(), updatedBy: 'System' }
    ];

    const stepsWithIds = defaultSteps.map((step, index) => ({
      ...step,
      id: `${leadId}_step_${index + 1}`
    }));

    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, pipelineSteps: stepsWithIds } : lead
    ));
  };

  const updatePipelineStep = (leadId: string, stepId: string, updates: Partial<PipelineStep>) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId && lead.pipelineSteps) {
        const updatedSteps = lead.pipelineSteps.map(step => {
          if (step.id === stepId) {
            const updatedStep = { ...step, ...updates, lastUpdated: new Date() };
            
            // Auto-set dates based on status
            if (updates.status === 'In Progress' && !step.startDate) {
              updatedStep.startDate = new Date();
            }
            if (updates.status === 'Completed' && !step.completedDate) {
              updatedStep.completedDate = new Date();
              if (step.startDate) {
                updatedStep.duration = Math.round((new Date().getTime() - step.startDate.getTime()) / (1000 * 60 * 60));
              }
            }
            
            return updatedStep;
          }
          return step;
        });
        
        return { ...lead, pipelineSteps: updatedSteps, lastUpdated: new Date() };
      }
      return lead;
    }));
  };

  const addMetaLead = (metaLead: Omit<MetaLead, 'id' | 'receivedAt'>) => {
    const newMetaLead: MetaLead = {
      ...metaLead,
      id: Date.now().toString(),
      receivedAt: new Date(),
      processed: false
    };
    setMetaLeads(prev => [...prev, newMetaLead]);
    setNotifications(prev => prev + 1);
  };

  const convertMetaLeadToLead = (metaLeadId: string, additionalData?: Partial<Lead>) => {
    const metaLead = metaLeads.find(ml => ml.id === metaLeadId);
    if (!metaLead) return;

    const newLead: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'> = {
      fullName: metaLead.leadData.fullName,
      phone: metaLead.leadData.phone,
      email: metaLead.leadData.email,
      loanType: (metaLead.leadData.loanType as any) || 'Personal Loan',
      loanAmount: metaLead.leadData.loanAmount || 0,
      branch: additionalData?.branch || '',
      leadSource: metaLead.source,
      status: 'New',
      ...additionalData
    };

    addLead(newLead);
    
    // Mark meta lead as processed
    setMetaLeads(prev => prev.map(ml => 
      ml.id === metaLeadId ? { ...ml, processed: true, convertedToLead: Date.now().toString() } : ml
    ));
  };

  const updateLead = (id: string, updatedLead: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updatedLead, lastUpdated: new Date() } : lead
    ));
  };

  const updateLeadDocuments = (leadId: string, documents: Partial<DocumentStatus>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        documents: { ...lead.documents, ...documents },
        lastUpdated: new Date() 
      } : lead
    ));
  };

  const uploadDocument = (leadId: string, file: Omit<DocumentFile, 'id' | 'uploadDate'>) => {
    const newFile: DocumentFile = {
      ...file,
      id: Date.now().toString(),
      uploadDate: new Date()
    };
    
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        documentFiles: [...(lead.documentFiles || []), newFile],
        lastUpdated: new Date() 
      } : lead
    ));
  };

  const updateApplicationStatus = (leadId: string, status: ApplicationStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        applicationStatus: status,
        statusHistory: [...(lead.statusHistory || []), status],
        lastUpdated: new Date() 
      } : lead
    ));
  };

  const updateLeadDocumentCompletion = (leadId: string, isComplete: boolean) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        documentComplete: isComplete,
        lastUpdated: new Date() 
      } : lead
    ));
  };
  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };

  const rejectLead = (leadId: string, reason: string, rejectedBy: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        isRejected: true,
        rejectionReason: reason,
        rejectedBy,
        rejectedAt: new Date(),
        status: 'Closed',
        lastUpdated: new Date() 
      } : lead
    ));
  };

  const assignLead = (leadId: string, staffId: string, assignedBy: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead, 
        assignedStaff: staffId,
        status: 'Contacted', // Update status when assigned
        lastUpdated: new Date(),
        remarks: (lead.remarks || '') + `\n[${new Date().toLocaleString()}] Assigned by ${assignedBy}`
      } : lead
    ));
  };

  const updateLeadAssignment = (leadId: string, staffId: string, bankName: string, bankBranch?: string, assignedBy?: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead,
        assignedStaff: staffId,
        assignedBank: bankName,
        assignedBankBranch: bankBranch,
        status: 'Contacted',
        lastUpdated: new Date(),
        remarks: (lead.remarks || '') + `\n[${new Date().toLocaleString()}] Assigned to staff and bank by ${assignedBy || 'System'}`
      } : lead
    ));
  };

  const updateLeadStatus = (leadId: string, status: string, updatedBy: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { 
        ...lead,
        status: status as any,
        lastUpdated: new Date(),
        remarks: (lead.remarks || '') + `\n[${new Date().toLocaleString()}] Status updated to ${status} by ${updatedBy}`
      } : lead
    ));
  };

  const getAssignedLeadsByStaff = (staffId: string): Lead[] => {
    return leads.filter(lead => lead.assignedStaff === staffId && lead.assignedBank);
  };

  const hasPermission = (userId: string, permission: keyof Employee['permissions']): boolean => {
    // Owner always has all permissions
    if (userId === 'owner-1') return true;
    
    const employee = employees.find(emp => emp.id === userId);
    return employee?.permissions?.[permission] || false;
  };

  const getUserRole = (userId: string): 'admin' | 'manager' | 'staff' | null => {
    // Owner role
    if (userId === 'owner-1') return 'admin';
    
    const employee = employees.find(emp => emp.id === userId);
    if (!employee) return null;
    
    if (employee.designation === 'Admin') return 'admin';
    if (employee.designation === 'Branch Head' || employee.designation === 'Manager' || employee.designation === 'Owner') return 'manager';
    return 'staff';
  };
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
  };

  const updateBranch = (id: string, updatedBranch: Partial<Branch>) => {
    setBranches(prev => prev.map(branch => 
      branch.id === id ? { ...branch, ...updatedBranch } : branch
    ));
  };

  const addBranch = (branch: Omit<Branch, 'id'>) => {
    const newBranch = { ...branch, id: Date.now().toString() };
    setBranches(prev => [...prev, newBranch]);
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== id));
    // Also remove leads and reassign staff from deleted branch
    setLeads(prev => prev.filter(lead => lead.branch !== id));
    setEmployees(prev => prev.map(emp => 
      emp.assignedBranch === id ? { ...emp, assignedBranch: '' } : emp
    ));
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

  return (
    <DataContext.Provider value={{
      employees,
      leads,
      branches,
      tasks,
      metaLeads,
      addEmployee,
      updateEmployee,
      updateEmployeePassword,
      deleteEmployee,
      addLead,
      updateLead,
      deleteLead,
      rejectLead,
      assignLead,
      updateLeadStatus,
      updateLeadDocuments,
      uploadDocument,
      updateApplicationStatus,
      updateLeadDocumentCompletion,
      addTask,
      updateTask,
      updatePipelineStep,
      initializePipelineSteps,
      updateLeadAssignment,
      addMetaLead,
      convertMetaLeadToLead,
      updateBranch,
      addBranch,
      deleteBranch,
      notifications,
      clearNotifications,
      getLeadsByBranch,
      getLeadsByStaff,
      getTasksByStaff,
      hasPermission,
      getUserRole,
      getAssignedLeadsByStaff
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}