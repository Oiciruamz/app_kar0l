import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole, UserProfile } from '@/lib/types';

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: UserRole;
  specialty?: string; // for doctors
  bio?: string; // optional for doctors
}

export async function registerUser(data: RegisterData): Promise<UserProfile> {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: data.displayName
    });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      phone: data.phone,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Add specialty for doctors
    if (data.role === 'doctor') {
      if (data.specialty) (userProfile as any).specialty = data.specialty;
      if (data.bio) (userProfile as any).bio = data.bio;
    }

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    throw new Error(error.message || 'Error al registrar usuario');
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Credenciales inválidas');
    }
    throw new Error(error.message || 'Error al iniciar sesión');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Error al cerrar sesión');
  }
}

