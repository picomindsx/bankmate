import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database helper functions
export const dbHelpers = {
  // Employees
  async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createEmployee(employee: any) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateEmployee(id: string, updates: any) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Leads
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createLead(lead: any) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateLead(id: string, updates: any) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Branches
  async getBranches() {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createBranch(branch: any) {
    const { data, error } = await supabase
      .from('branches')
      .insert([branch])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateBranch(id: string, updates: any) {
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteBranch(id: string) {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createTask(task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateTask(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToLeads(callback: (payload: any) => void) {
    return supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        callback
      )
      .subscribe()
  },

  subscribeToEmployees(callback: (payload: any) => void) {
    return supabase
      .channel('employees-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' }, 
        callback
      )
      .subscribe()
  },

  subscribeToTasks(callback: (payload: any) => void) {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        callback
      )
      .subscribe()
  }
}