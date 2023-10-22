import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, storage, auth } from '@/src/lib/firebase';
import { useUserData, usePetData, getUserIDfromUsername } from '@/src/lib/hooks'

export default function UserProfile() {
    const router = useRouter();
    const currentUser = useUserData();
    const currentUserId = getUserIDfromUsername(currentUser.username);
    const { profileUsername} = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);
    const [username, setUsername] = useState(null);
    const [description, setDescription] = useState(null); // TODO: Add description to user profile
    const [displayName, setDisplayName] = useState(null); // TODO: Add display name to user profile
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const pets = usePetData(profileUserID);

    useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (profileUserID) {
        const userRef = firestore.collection('users').doc(profileUserID);
        unsubscribe = userRef.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
        setProfilePicUrl(doc.data()?.photoURL);
        setDescription(doc.data()?.description);
        setDisplayName(doc.data()?.displayName);
        });
    } else {
        setUsername(null);
        setProfilePicUrl(null);
        setDescription(null);
        setDisplayName(null);
    }

    return unsubscribe;
    }, [profileUserID]);

    const [showCreatePetForm, setShowCreatePetForm] = useState(false);
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [sex, setSex] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [birthplace, setBirthplace] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);

    const handleCreatePetProfile = async () => {
        try {
            if (profileUserID !== currentUserId) {
                toast.error("You can only create a pet profile for your own user profile.");
                return;
              }
            const petRef = firestore.collection('users').doc(profileUserID).collection('pets');

            // Create a new document with an auto-generated ID
            const newPetRef = petRef.doc();
            
            // Upload the photo file to Firebase Storage
            const storageRef = storage.ref(`petProfilePictures/${newPetRef.id}/profilePic`);
            await storageRef.put(petPhotoURL);
            // Get the download URL of the uploaded photo
            const photoURL = await storageRef.getDownloadURL();
            const petData = {
                petname: petName,
                about: about,
                sex: sex,
                birthdate: birthdate,
                birthplace: birthplace,
                photoURL: photoURL,
            };
            // Set the data for the new pet profile
            await newPetRef.set(petData);
            
            setShowCreatePetForm(false);
            setPetName('');
            setAbout('');
            setSex('');
            setBirthdate('');
            setBirthplace('');
            setPetPhotoURL('');
        } catch (error) {
             console.error('Error creating pet profile:', error);
        }
    };
    
    return (
        <div>
        <h1>User Profile Page</h1>

        <p>Display Name: {displayName}</p>
        <p>Username: {username}</p>
        <p>Email: test</p>
        <p>Description: {description}</p>

        <img src={profilePicUrl} alt='profile picture'/>
        
        {showCreatePetForm ? (
        <div>
            <h2>Create Pet Profile</h2>
            <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Pet Name" />
            <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="About" />
            <input type="text" value={sex} onChange={(e) => setSex(e.target.value)} placeholder="Sex" />
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} placeholder="Birthdate" />
            <input type="text" value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="Birthplace" />
            <label htmlFor="photo">Upload Photo:</label>
            <input type="file" id="photo" onChange={e => setPetPhotoURL(e.target.files[0])} />
            <button onClick={handleCreatePetProfile}>Create Pet Profile</button>
            </div>
        ) : (
            profileUserID === currentUserId ? (
                <button onClick={() => setShowCreatePetForm(true)}>Add Pet</button>
              ) : null
        )}
        <h2>Pets</h2>
        {pets.map((pet) => (
            <div key={pet.id}>
            <h3>Pet Name: {pet.petname}</h3>
            <p>About: {pet.about}</p>
            <Link href={`/user/${profileUsername}/pets/${pet.id}`}>
                <p>View Pet Profile</p>
            </Link>
            </div>
        ))}

        <div>
            <Link href="/Home">
            <p>Back to Home</p>
            </Link>
        </div>
        </div>
    )
}
