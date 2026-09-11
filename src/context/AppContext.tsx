import React, { createContext, useContext, useState, useEffect } from 'react';
import { Application, Task, StudyPlan, Credential, UserProfile, ApplicationStage } from '../types/index.ts';
import {
  loadApplications,
  saveApplications,
  loadTasks,
  saveTasks,
  loadStudyPlans,
  saveStudyPlans,
  loadCredentials,
  saveCredentials,
  loadProfile,
  saveProfile,
  resetAllData
} from '../utils/storage.ts';

interface AppContextType {
  applications: Application[];
  tasks: Task[];
  studyPlans: StudyPlan[];
  credentials: Credential[];
  profile: UserProfile;
  currentTab: 'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials';
  setCurrentTab: (tab: 'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials') => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  
  // Application Actions
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage) => void;
  toggleRequiredDoc: (appId: string, docIndex: number) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Study Plan Actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleStudyBlock: (planId: string, blockId: string) => void;
  deleteStudyPlan: (id: string) => void;

  // Credential Actions
  addCredential: (cred: Omit<Credential, 'id'>) => void;
  deleteCredential: (id: string) => void;

  // Reset demo
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(loadStudyPlans);
  const [credentials, setCredentials] = useState<Credential[]>(loadCredentials);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials'>('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStudyPlans(studyPlans);
  }, [studyPlans]);

  useEffect(() => {
    saveCredentials(credentials);
  }, [credentials]);

  const addApplication = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application => {
    const newApp: Application = {
      ...appData,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setApplications(prev => [newApp, ...prev]);

    // Automatically generate basic milestone tasks for the application
    if (newApp.deadline) {
      addTask({
        applicationId: newApp.id,
        applicationName: newApp.company,
        title: `[${newApp.company}] 서류 최종 검토 및 마감 전 제출`,
        category: '서류',
        dueDate: newApp.deadline,
        completed: false,
        priority: 'high',
      });
    }
    if (newApp.writtenTestDate) {
      addTask({
        applicationId: newApp.id,
        applicationName: newApp.company,
        title: `[${newApp.company}] 코딩테스트/필기시험 응시 및 환경 점검`,
        category: '필기',
        dueDate: newApp.writtenTestDate,
        completed: false,
        priority: 'high',
      });
    }

    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : app
      )
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    setTasks(prev => prev.filter(t => t.applicationId !== id));
    setStudyPlans(prev => prev.filter(sp => sp.applicationId !== id));
    if (selectedAppId === id) setSelectedAppId(null);
  };

  const updateApplicationStage = (id: string, stage: ApplicationStage) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, stage, updatedAt: new Date().toISOString().split('T')[0] } : app))
    );
  };

  const toggleRequiredDoc = (appId: string, docIndex: number) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const newDocs = [...app.requiredDocuments];
        if (newDocs[docIndex]) {
          newDocs[docIndex] = { ...newDocs[docIndex], checked: !newDocs[docIndex].checked };
        }
        return { ...app, requiredDocuments: newDocs };
      })
    );
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addStudyPlan = (planData: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: StudyPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setStudyPlans(prev => [newPlan, ...prev]);
  };

  const toggleStudyBlock = (planId: string, blockId: string) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        let blockFound = false;
        const newDays = plan.days.map(day => {
          const newBlocks = day.blocks.map(b => {
            if (b.id === blockId) {
              blockFound = true;
              return { ...b, completed: !b.completed };
            }
            return b;
          });
          return { ...day, blocks: newBlocks };
        });
        if (!blockFound) return plan;
        return { ...plan, days: newDays };
      })
    );
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const addCredential = (credData: Omit<Credential, 'id'>) => {
    const newCred: Credential = {
      ...credData,
      id: `cred-${Date.now()}`,
    };
    setCredentials(prev => [...prev, newCred]);
  };

  const deleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  const resetData = () => {
    resetAllData();
    setApplications(loadApplications());
    setTasks(loadTasks());
    setStudyPlans(loadStudyPlans());
    setCredentials(loadCredentials());
    setProfile(loadProfile());
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        tasks,
        studyPlans,
        credentials,
        profile,
        currentTab,
        setCurrentTab,
        selectedAppId,
        setSelectedAppId,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStage,
        toggleRequiredDoc,
        addTask,
        toggleTask,
        deleteTask,
        addStudyPlan,
        toggleStudyBlock,
        deleteStudyPlan,
        addCredential,
        deleteCredential,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
