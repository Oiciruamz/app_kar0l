import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/auth';

export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  // Convert local file URI to blob (React Native/Expo)
  const response = await fetch(localUri);
  const blob = await response.blob();

  const fileRef = ref(storage, `profilePictures/${uid}.jpg`);
  await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
  const downloadURL = await getDownloadURL(fileRef);

  // Update Firestore user profile
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { photoURL: downloadURL });

  // Update local store profile for immediate UI refresh
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const { setProfile } = useAuthStore.getState();
      setProfile(snap.data() as any);
    }
  } catch {}

  return downloadURL;
}


