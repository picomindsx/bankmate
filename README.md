# 🏦 Bankmate Solutions - Cloud-Enabled Loan Management CRM

## 🌟 Overview
A comprehensive loan management CRM system with **Netlify Cloud Storage** for multi-device access and real-time data synchronization.

## ☁️ **Cloud Features**
- **Netlify Identity**: Secure user authentication
- **Cloud Storage**: Access data from anywhere
- **Real-time Sync**: Automatic data synchronization
- **Offline Support**: Works offline with auto-sync when online
- **Multi-device Access**: Login from any device, anywhere

## 🚀 **Technology Stack**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: Netlify Identity
- **Cloud Storage**: Netlify Functions + MongoDB
- **Deployment**: Netlify
- **Local Storage**: IndexedDB + localStorage (fallback)

## 🔐 **Authentication**
- **Owner Login**: ajithcscpdm@gmail.com / Ajith@6235
- **Staff Login**: Netlify Identity (phone/email + password)

## 📱 **Features**
- ✅ Multi-branch management
- ✅ Staff role-based access control
- ✅ Lead generation and tracking
- ✅ Document management
- ✅ Pipeline tracking
- ✅ Real-time notifications
- ✅ Cloud data synchronization
- ✅ Offline functionality
- ✅ Mobile responsive design

## 🛠️ **Setup Instructions**

### 1. Clone and Install
```bash
git clone <repository-url>
cd bankmate-solutions
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Update .env with your Netlify site URL and MongoDB connection
```

### 3. Netlify Identity Setup
1. Deploy to Netlify
2. Enable Netlify Identity in site settings
3. Configure identity settings (email confirmation, etc.)
4. Add custom user metadata fields for roles

### 4. MongoDB Setup (Optional)
1. Create MongoDB Atlas account
2. Create database cluster
3. Get connection string
4. Add to environment variables

### 5. Development
```bash
npm run dev
```

### 6. Production Deployment
```bash
npm run build
# Deploy to Netlify (automatic via Git integration)
```

## 🌐 **Cloud Storage Benefits**
- **Universal Access**: Login from any device, anywhere
- **Data Persistence**: Never lose your data
- **Team Collaboration**: Real-time updates across team
- **Automatic Backup**: Cloud storage with redundancy
- **Scalability**: Handles growing business needs

## 📊 **User Roles**
- **Owner**: Full system access, staff management, all reports
- **Manager/Branch Head**: Branch management, lead assignment, staff oversight
- **Staff**: Assigned leads, document management, status updates

## 🔄 **Data Synchronization**
- **Automatic**: Every 5 minutes when online
- **Manual**: Click sync button anytime
- **Offline**: Works offline, syncs when connection restored
- **Conflict Resolution**: Last update wins strategy

## 🛡️ **Security**
- **Netlify Identity**: Enterprise-grade authentication
- **Role-based Access**: Granular permission system
- **Data Encryption**: All data encrypted in transit and at rest
- **Audit Trail**: Complete activity logging

## 📞 **Support**
For technical support or feature requests, contact the development team.

---
**Powered by Netlify Cloud Infrastructure** ☁️✨
