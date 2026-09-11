import { Application, Task, StudyPlan, Credential, UserProfile } from '../types/index.ts';
import { initialApplications, initialTasks, initialStudyPlans, initialCredentials, initialProfile } from './initialData.ts';

const STORAGE_KEYS = {
  APPLICATIONS: 'nextstep_applications_v2',
  TASKS: 'nextstep_tasks_v2',
  STUDY_PLANS: 'nextstep_study_plans_v2',
  CREDENTIALS: 'nextstep_credentials_v2',
  PROFILE: 'nextstep_profile_v2',
};

export function loadApplications(): Application[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!data) {
      saveApplications(initialApplications);
      return initialApplications;
    }
    return JSON.parse(data);
  } catch {
    return initialApplications;
  }
}

export function saveApplications(apps: Application[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save applications:', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      saveTasks(initialTasks);
      return initialTasks;
    }
    return JSON.parse(data);
  } catch {
    return initialTasks;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadStudyPlans(): StudyPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
    if (!data) {
      saveStudyPlans(initialStudyPlans);
      return initialStudyPlans;
    }
    return JSON.parse(data);
  } catch {
    return initialStudyPlans;
  }
}

export function saveStudyPlans(plans: StudyPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save study plans:', e);
  }
}

export function loadCredentials(): Credential[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!data) {
      saveCredentials(initialCredentials);
      return initialCredentials;
    }
    return JSON.parse(data);
  } catch {
    return initialCredentials;
  }
}

export function saveCredentials(creds: Credential[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      saveProfile(initialProfile);
      return initialProfile;
    }
    return JSON.parse(data);
  } catch {
    return initialProfile;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.STUDY_PLANS);
  localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}
