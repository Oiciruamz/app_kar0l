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
    if (data.role === 'doctor' && data.specialty) {
      (userProfile as any).specialty = data.specialty;
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
    console.error('🔴 Error Firebase:', error.code, error.message);
    
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Credenciales inválidas');
    }
    if (error.code === 'auth/quota-exceeded') {
      throw new Error('Se excedió el límite de intentos de Firebase. Espera 15-30 minutos o actualiza tu plan en Firebase Console.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Por favor espera unos minutos e intenta de nuevo.');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este correo. Regístrate primero.');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta');
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

