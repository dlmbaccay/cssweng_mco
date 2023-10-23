import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, storage } from '@/src/lib/firebase';
import { useUserData, usePetData, getUserIDfromUsername } from '@/src/lib/hooks'
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { basicModalStyle } from '../lib/modalstyle';

Modal.setAppElement('#root'); // Set the root element for accessibility

export default function UserProfile() {
    const router = useRouter();
    const currentUser = useUserData();
    const currentUserID = getUserIDfromUsername(currentUser.username);
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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [sex, setSex] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [birthplace, setBirthplace] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);

    const handleCreatePetProfile = async () => {
        try {
            if (profileUserID !== currentUserID) {
                toast.error("You can only create a pet profile for your own user profile.");
                return;
            }
        
            const petRef = firestore.collection('users').doc(profileUserID).collection('pets');
        
            const newPetRef = petRef.doc();
            const storageRef = storage.ref(`petProfilePictures/${newPetRef.id}/profilePic`);
        
            await Promise.all([
                storageRef.put(petPhotoURL),
                newPetRef.set({
                    petname: petName,
                    about: about,
                    sex: sex,
                    birthdate: birthdate,
                    birthplace: birthplace,
                    photoURL: await storageRef.getDownloadURL(),
                    followers: [],
                    following: []
                })
            ]);

            toast.success("Pet profile created successfully!");
            setShowCreatePetForm(false);
            setPetName('');
            setAbout('');
            setSex('');
            setBirthdate('');
            setBirthplace('');
            setPetPhotoURL('');
        } catch (error) {
            toast.error('Error creating pet profile.');
        }
    };
    
    const handleDeletePetProfile = async (petId) => {
        setDeletingPetId(petId);
        setShowConfirmation(true);
    };
    
    const confirmDeletePetProfile = async () => {
        try {
            if (profileUserID !== currentUserID) {
            toast.error("You can only delete a pet profile from your own user profile.");
            return;
            }

            const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(deletingPetId);

            // Delete the pet's profile picture from storage
            const storageRef = storage.ref(`petProfilePictures/${deletingPetId}/profilePic`);
            await storageRef.delete();

            // Delete the pet's document from Firestore
            await petRef.delete();

            // Close the confirmation popup
            setShowConfirmation(false);
            toast.success("The pet profile was deleted successfully");
        } catch (error) {
            console.error('Error deleting pet profile:', error);
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
        {currentUser && currentUserID === profileUserID ? (
            <Modal
            isOpen={showConfirmation}
            onRequestClose={() => setShowConfirmation(false)}
            contentLabel="Delete Confirmation"
            style={basicModalStyle}
            >
                <p>Are you sure you want to delete this pet profile?</p>
                <button onClick={confirmDeletePetProfile}>Yes</button>
                <button onClick={() => setShowConfirmation(false)}>No</button>
            </Modal>
        ): null}
        
        <h2>Pets</h2>
        {pets.map((pet) => (
            <div key={pet.id}>
            <Link href={`/user/${profileUsername}/pets/${pet.id}`}>
                <img src={pet.photoURL} alt='pet profile picture' height={100} width={100}/>
            </Link>
            {currentUser && currentUserID === profileUserID ? (
                <button onClick={() => handleDeletePetProfile(pet.id)}>Delete Pet Profile</button>
            ): null}
            </div>
        ))}

        {showCreatePetForm ? (
            <Modal
                isOpen={showCreatePetForm}
                onRequestClose={() => setShowCreatePetForm(false)}
                contentLabel="Create Pet Profile Label"
                style={basicModalStyle}
            >
                <h2>Create Pet Profile Label</h2>
                <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Pet Name" />
                <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="About" />
                <input type="text" value={sex} onChange={(e) => setSex(e.target.value)} placeholder="Sex" />
                <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} placeholder="Birthdate" />
                <input type="text" value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="Birthplace" />
                <label htmlFor="photo">Upload Photo:</label>
                <input type="file" id="photo" onChange={e => setPetPhotoURL(e.target.files[0])} />
                <button onClick={handleCreatePetProfile}>Create Pet Profile</button>
            </Modal>
        ) : (
            profileUserID === currentUserID ? (
                <button onClick={() => setShowCreatePetForm(true)}>Add Pet Profile</button>
              ) : null
        )}

        <div>
            <Link href="/Home">
            <p>Back to Home</p>
            </Link>
        </div>
        </div>
    )
}
