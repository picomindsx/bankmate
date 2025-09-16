import React, { useState } from 'react';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  MessageSquare,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface DetailedPipelineViewProps {
  leadId: string;
  leadName: string;
  onBack: () => void;
}

export default function DetailedPipelineView({ leadId, leadName, onBack }: DetailedPipelineViewProps) {
  const { leads, updatePipelineStep, employees } = useData();
  const { user } = useAuth();
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const lead = leads.find(l => l.id === leadId);
  if (!lead || !lead.pipelineSteps) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'On Hold': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5" />;
      case 'In Progress': return <Play className="w-5 h-5" />;
      case 'On Hold': return <Pause className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const handleStatusUpdate = (stepId: string, newStatus: string) => {
    updatePipelineStep(leadId, stepId, { 
      status: newStatus as any,
      updatedBy: user?.name || 'User'
    });
  };

  const handleNotesUpdate = (stepId: string) => {
    updatePipelineStep(leadId, stepId, { 
      notes: editNotes,
      updatedBy: user?.name || 'User'
    });
    setEditingStep(null);
    setEditNotes('');
  };

  const startEditingNotes = (stepId: string, currentNotes: string) => {
    setEditingStep(stepId);
    setEditNotes(currentNotes || '');
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const completedSteps = lead.pipelineSteps.filter(step => step.status === 'Completed').length;
  const totalSteps = lead.pipelineSteps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Detailed Pipeline View</h2>
          <p className="text-gray-600">{leadName} - {lead.loanType}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pipeline Progress</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{completedSteps}/{totalSteps}</div>
            <div className="text-sm text-gray-600">Steps Completed</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              progressPercentage === 100 ? 'bg-green-600' : 
              progressPercentage >= 50 ? 'bg-blue-600' : 'bg-yellow-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600">{progressPercentage}% Complete</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Completed ({completedSteps})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">In Progress ({lead.pipelineSteps.filter(s => s.status === 'In Progress').length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Not Started ({lead.pipelineSteps.filter(s => s.status === 'Not Started').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">🔄 Pipeline Steps</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {lead.pipelineSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < lead.pipelineSteps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-800">{step.stepName}</h4>
                      <div className="flex items-center space-x-2">
                        <select
                          value={step.status}
                          onChange={(e) => handleStatusUpdate(step.id, e.target.value)}
                          className={`px-3 py-1 border border-gray-300 rounded text-sm ${getStatusColor(step.status)}`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Step Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Started: {step.startDate ? new Date(step.startDate).toLocaleDateString() : 'Not started'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Completed: {step.completedDate ? new Date(step.completedDate).toLocaleDateString() : 'Not completed'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Duration: {step.duration ? formatDuration(step.duration) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Updated by: {step.updatedBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {new Date(step.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Notes Section */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        {editingStep !== step.id && (
                          <button
                            onClick={() => startEditingNotes(step.id, step.notes || '')}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      {editingStep === step.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                            rows={3}
                            placeholder="Add notes about this step..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleNotesUpdate(step.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingStep(null)}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center space-x-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {step.notes || 'No notes added yet'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const nextStep = lead.pipelineSteps.find(step => step.status === 'Not Started');
              if (nextStep) {
                handleStatusUpdate(nextStep.id, 'In Progress');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            ▶️ Start Next Step
          </button>
          <button
            onClick={() => {
              const inProgressSteps = lead.pipelineSteps.filter(step => step.status === 'In Progress');
              inProgressSteps.forEach(step => {
                handleStatusUpdate(step.id, 'Completed');
              });
            }}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
          >
            ✅ Complete In Progress
          </button>
          <button
            onClick={() => {
              const onHoldSteps = lead.pipelineSteps.filter(step => step.status === 'On Hold');
              onHoldSteps.forEach(step => {
                handleStatusUpdate(step.id, 'In Progress');
              });
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            🔄 Resume On Hold
          </button>
        </div>
      </div>
    </div>
  );
}