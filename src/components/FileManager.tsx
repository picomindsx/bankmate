import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  File, 
  Folder, 
  Trash2, 
  Eye, 
  Search,
  Plus,
  FolderPlus,
  MoreVertical
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  uploadDate: Date;
  url?: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Lead Templates',
      type: 'folder',
      uploadDate: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Staff Documents',
      type: 'folder',
      uploadDate: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Company Policies.pdf',
      type: 'file',
      size: 2048000,
      uploadDate: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'Training Manual.docx',
      type: 'file',
      size: 5120000,
      uploadDate: new Date('2024-01-18')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    const newFiles: FileItem[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      name: file.name,
      type: 'file',
      size: file.size,
      uploadDate: new Date(),
      url: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setShowUploadModal(false);
    // Files uploaded successfully - UI updates automatically
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: folderName.trim(),
        type: 'folder',
        uploadDate: new Date()
      };
      setFiles(prev => [...prev, newFolder]);
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    } else {
      alert('File download will be implemented with actual file storage.');
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">File Manager</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCreateFolder}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* File Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Files & Folders ({filteredFiles.length})
            </h3>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={() => {
                    selectedFiles.forEach(fileId => handleDeleteFile(fileId));
                    setSelectedFiles([]);
                  }}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedFiles.includes(file.id) ? 'bg-red-50 border-red-300' : ''
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {file.type === 'folder' ? (
                        <Folder className="w-8 h-8 text-blue-600" />
                      ) : (
                        <File className="w-8 h-8 text-gray-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {file.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {file.size && (
                    <p className="text-xs text-gray-500 mb-3">
                      {formatFileSize(file.size)}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    {file.type === 'file' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(file);
                          }}
                          className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('File preview will be implemented.');
                          }}
                          className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </>
                    )}
                    {file.type === 'folder' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Folder navigation will be implemented.');
                        }}
                        className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Open</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No files found</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Files</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Choose files to upload or drag and drop them here
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Choose Files</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Storage Info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Cloud Storage</h4>
        <p className="text-sm text-blue-700">
          All files are securely stored in the cloud and can be accessed from anywhere. 
          Your data is automatically backed up and synchronized across all devices.
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm text-blue-600">
          <span>Storage Used: 2.3 GB / 100 GB</span>
          <div className="flex-1 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '2.3%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}