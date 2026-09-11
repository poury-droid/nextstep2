import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ApplicationsPage } from './pages/ApplicationsPage.tsx';
import { DocumentAnalyzerPage } from './pages/DocumentAnalyzerPage.tsx';
import { StudyPlannerPage } from './pages/StudyPlannerPage.tsx';
import { CredentialsPage } from './pages/CredentialsPage.tsx';
import { ApplicationDetailModal } from './components/ApplicationDetailModal.tsx';
import { ApplicationFormModal } from './components/ApplicationFormModal.tsx';
import { Application } from './types/index.ts';

const MainAppContent: React.FC = () => {
  const { currentTab, applications, selectedAppId, setSelectedAppId } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  const selectedApp = applications.find(a => a.id === selectedAppId) || null;

  const handleOpenNewAppModal = () => {
    setEditingApplication(null);
    setIsFormModalOpen(true);
  };

  const handleEditApplication = (app: Application) => {
    setEditingApplication(app);
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenNewAppModal={handleOpenNewAppModal}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenNewAppModal={handleOpenNewAppModal}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onSelectApplication={id => setSelectedAppId(id)}
              onOpenNewAppModal={handleOpenNewAppModal}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsPage
              onSelectApplication={id => setSelectedAppId(id)}
              onOpenNewAppModal={handleOpenNewAppModal}
            />
          )}

          {currentTab === 'analyze' && <DocumentAnalyzerPage />}

          {currentTab === 'study' && <StudyPlannerPage />}

          {currentTab === 'credentials' && <CredentialsPage />}
        </main>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
          onEdit={app => {
            handleEditApplication(app);
          }}
        />
      )}

      {/* Application Create / Edit Form Modal */}
      {isFormModalOpen && (
        <ApplicationFormModal
          application={editingApplication}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
