import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserProfile } from '../types/auth';
import {
  getUserProfile,
  createActionerProfile,
  createManagementProfile,
  bootstrapInitialAdmin,
  checkInitialAdminStatus,
} from '../services/userService';
import { getAuthErrorMessage } from '../firebase/errors';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialAdminExists: boolean;
  isAdmin: boolean;
  isActioner: boolean;
  isManagement: boolean;
  isActive: boolean;
  refreshInitialAdminStatus: () => Promise<void>;
  registerActioner: (fullName: string, email: string, pass: string) => Promise<void>;
  registerManagement: (fullName: string, email: string, pass: string) => Promise<void>;
  registerInitialAdmin: (fullName: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialAdminExists, setInitialAdminExists] = useState<boolean>(true);

  const fetchAdminStatus = async () => {
    try {
      const status = await checkInitialAdminStatus();
      setInitialAdminExists(status.adminExists);
    } catch (err) {
      console.error('Failed to check admin status:', err);
    }
  };

  useEffect(() => {
    fetchAdminStatus();
  }, []);

  const loadUserProfile = async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setCurrentUser(null);
      return;
    }

    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile && fbUser.email) {
        const cleanEmail = fbUser.email.trim().toLowerCase();
        const fallbackName =
          fbUser.displayName?.trim() ||
          cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
          'Actioner';

        if (cleanEmail === 'sheq@spiralsystems.co.za') {
          try {
            profile = await bootstrapInitialAdmin(fbUser.uid, fallbackName, cleanEmail);
            setInitialAdminExists(true);
          } catch {
            profile = await getUserProfile(fbUser.uid);
          }
        } else if (
          cleanEmail.includes('management') ||
          cleanEmail.includes('director') ||
          cleanEmail.includes('executive') ||
          cleanEmail.includes('board')
        ) {
          try {
            profile = await createManagementProfile(fbUser.uid, fallbackName, cleanEmail);
          } catch {
            profile = await getUserProfile(fbUser.uid);
          }
        } else {
          try {
            profile = await createActionerProfile(fbUser.uid, fallbackName, cleanEmail);
          } catch {
            profile = await getUserProfile(fbUser.uid);
          }
        }
      }

      if (profile) {
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Failed to load user profile for UID:', fbUser.uid, error);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await loadUserProfile(fbUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerActioner = async (fullName: string, email: string, pass: string): Promise<void> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await createActionerProfile(cred.user.uid, fullName, email);
      setCurrentUser(profile);
      await fetchAdminStatus();
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const registerManagement = async (fullName: string, email: string, pass: string): Promise<void> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await createManagementProfile(cred.user.uid, fullName, email);
      setCurrentUser(profile);
      await fetchAdminStatus();
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const registerInitialAdmin = async (fullName: string, email: string, pass: string): Promise<void> => {
    try {
      const status = await checkInitialAdminStatus();
      if (status.adminExists) {
        throw new Error('Initial administrator setup has already been completed. Contact your administrator.');
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await bootstrapInitialAdmin(cred.user.uid, fullName, email);
      setCurrentUser(profile);
      setInitialAdminExists(true);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const login = async (email: string, pass: string): Promise<void> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await loadUserProfile(cred.user);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (firebaseUser) {
      await loadUserProfile(firebaseUser);
    }
  };

  const isAdmin = currentUser?.role === 'admin' && currentUser?.active === true;
  const isActioner = currentUser?.role === 'actioner' && currentUser?.active === true;
  const isManagement = currentUser?.role === 'management' && currentUser?.active === true;
  const isActive = currentUser?.active === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        initialAdminExists,
        isAdmin,
        isActioner,
        isManagement,
        isActive,
        refreshInitialAdminStatus: fetchAdminStatus,
        registerActioner,
        registerManagement,
        registerInitialAdmin,
        login,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
