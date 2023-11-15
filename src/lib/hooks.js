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
  const [description, setDescription] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [email, setEmail] = useState(null); 

  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [coverPhotoURL, setCoverPhotoURL] = useState(null);

  const [gender, setGender] = useState(null);
  const [birthdate, setBirthdate] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
  // turn off realtime subscription
  let unsubscribe;

  if (user) {
    const userRef = firestore.collection('users').doc(user.uid);
    unsubscribe = userRef.onSnapshot((doc) => {
      setUsername(doc.data()?.username);
      setUserPhotoURL(doc.data()?.photoURL);
      setDescription(doc.data()?.description);
      setDisplayName(doc.data()?.displayName);
      setEmail(doc.data()?.email);
    });

  } else {
    setUsername(null);
    setUserPhotoURL(null);
    setDescription(null);
    setDisplayName(null);
    setEmail(null);
  }

  return unsubscribe;
}, [user]);

  return { user, username, description, email, displayName, userPhotoURL };
}

export function usePetData(userId) {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    let unsubscribe;

    if (userId) {
      const petRef = firestore.collection('users').doc(userId).collection('pets');
      unsubscribe = petRef.onSnapshot((snapshot) => {
        const petData = [];
        snapshot.docs.forEach((doc) => {
          petData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setPets(petData);
      });
    } else {
      setPets([]);
    }

    return unsubscribe;
  }, [userId]);

  return pets;
}

export function useUserIDfromUsername(username) {
  
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let unsubscribe;

    if (username){
      const nameRef = firestore.collection('usernames').doc(username);
      unsubscribe = nameRef.onSnapshot((doc) => {
        setCurrentUserId(doc.data().uid)
        });
    } else{
      setCurrentUserId(null);
    }
    return unsubscribe;
  }, [username]);
  return currentUserId;
}

export function useAllUsersAndPets() {
  const [allUsers, setAllUsers] = useState([]);
  const [allPets, setAllPets] = useState([]);

  useEffect(() => {
    let unsubscribe;

    const userRef = firestore.collection('users');
    unsubscribe = userRef.onSnapshot((snapshot) => {
      const userData = [];
      snapshot.docs.forEach((doc) => {
        userData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAllUsers(userData);
    });

    const petRef = firestore.collectionGroup('pets');
    unsubscribe = petRef.onSnapshot((snapshot) => {
      const petData = [];
      snapshot.docs.forEach((doc) => {
        petData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAllPets(petData);
    });

    return unsubscribe;
  }, []);

  return { allUsers, allPets };
}

export async function useAllPosts() {
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    let unsubscribe;

    const postsCollectionRef = firestore.collection('posts');
    postsCollectionRef.get().then((querySnapshot) => {
        const postData = [];
        querySnapshot.forEach((doc) => {
            postData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        setAllPosts(postData);
    }, [postsCollectionRef]);

    return unsubscribe;
  });

  return allPosts;
}

export async function useCurrentUserPets(user) {
  const [userPets, setUserPets] = useState([]);
  
  // fetch all pets of the profile user
  useEffect(() => {
    let unsubscribe;

    const petsCollectionRef = firestore.collection('pets').where("petOwnerID", "==", user.uid);
    petsCollectionRef.get().then((querySnapshot) => {
        const petsData = [];
        querySnapshot.forEach((doc) => {
            petsData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        setUserPets(petsData);
    });

    return unsubscribe;
  }, [user]);

  return userPets;
}