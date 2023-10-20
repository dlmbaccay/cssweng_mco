import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState, storage } from 'react-firebase-hooks/auth';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import toast from 'react-hot-toast';

// Custom hook to read auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
  // turn off realtime subscription
  let unsubscribe;

  if (user) {
    const userRef = firestore.collection('users').doc(user.uid);
    unsubscribe = userRef.onSnapshot((doc) => {
      setUsername(doc.data()?.username);
    });

    // Create a reference to the storage location of the profile picture
    const storage = getStorage();
    const profilePicRef = ref(storage, `profilePictures/${user.uid}`);

    // Get the download URL and set the state variable
    getDownloadURL(profilePicRef)
      .then((url) => {
        setProfilePicUrl(url);
      })
      .catch((error) => {
        toast.error("Error getting profile picture URL: " + error);
        console.error("Error getting profile picture URL: ", error);
      });
  } else {
    setUsername(null);
    setProfilePicUrl(null);
  }

  return unsubscribe;
}, [user]);

  // useEffect(() => {
  //   // turn off realtime subscription
  //   let unsubscribe;

  //   if (user) {
  //     const ref = firestore.collection('users').doc(user.uid);
  //     unsubscribe = ref.onSnapshot((doc) => {
  //       setUsername(doc.data()?.username);
  //     });
  //   } else {
  //     setUsername(null);
  //   }

  //   return unsubscribe;
  // }, [user]);

  return { user, username, profilePicUrl };
}

export function getUserProfilePicture() {

}