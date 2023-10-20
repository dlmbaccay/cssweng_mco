import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState, storage } from 'react-firebase-hooks/auth';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import toast from 'react-hot-toast';
import { set } from 'react-hook-form';

// Custom hook to read auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);
  const [description, setDescription] = useState(null); // TODO: Add description to user profile
  const [displayName, setDisplayName] = useState(null); // TODO: Add display name to user profile
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
  // turn off realtime subscription
  let unsubscribe;

  if (user) {
    const userRef = firestore.collection('users').doc(user.uid);
    unsubscribe = userRef.onSnapshot((doc) => {
      setUsername(doc.data()?.username);
      setProfilePicUrl(doc.data()?.photoURL);
      setDescription(doc.data()?.description);
      setDisplayName(doc.data()?.displayName);
    });

    // // Create a reference to the storage location of the profile picture
    // const storage = getStorage();
    // const profilePicRef = ref(storage, `profilePictures/${user.uid}`);

    // // Get the download URL and set the state variable
    // getDownloadURL(profilePicRef)
    //   .then((url) => {
    //     setProfilePicUrl(url);
    //   })
    //   .catch((error) => {
    //     toast.error("Error getting profile picture URL: " + error);
    //     console.error("Error getting profile picture URL: ", error);
    //   });
  } else {
    setUsername(null);
    setProfilePicUrl(null);
    setDescription(null);
    setDisplayName(null);
  }

  return unsubscribe;
}, [user]);

  return { user, username, description, displayName, profilePicUrl };
}

export function getUserProfilePicture() {

}