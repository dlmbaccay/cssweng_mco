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
    const [description, setDescription] = useState(null); 
    const [displayName, setDisplayName] = useState(null); 
    const [email, setEmail] = useState(null);
    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const pets = usePetData(profileUserID);

    useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (profileUserID) {
        const userRef = firestore.collection('users').doc(profileUserID);
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
    const [modalIsOpen, setModalIsOpen] = useState(false); // State for controlling the modal

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
      
    const handleEdit = () => {
        if (currentUser && currentUserID === profileUserID) { // check if this is the owner of the profile
            setModalIsOpen(true); // open the modal when editing starts
        }
    }

    const handleSave = async () => {
        const userRef = firestore.collection('users').doc(profileUserID);
        
        try {
            const updateData = {
                displayName: displayName,
                description: description,
                photoURL: userPhotoURL ? await uploadPhotoAndGetURL() : user.photoURL
            };
        
            await userRef.update(updateData);
            setModalIsOpen(false);
            toast.success('User Profile updated successfully!');
        } catch (error) {
            toast.error('Error saving profile:', error);
            console.error('Error saving profile:', error);
        }
    }

    const uploadPhotoAndGetURL = async () => {
        const storageRef = storage.ref(`profilePictures/${profileUserID}/profilePic`);
        await storageRef.put(userPhotoURL);
        return await storageRef.getDownloadURL();
    };
    
    return (
        <div>
        <h1>User Profile Page</h1>

        <p>Display Name: {displayName}</p>
        <p>Username: {username}</p>
        <p>Email: {email}</p>
        <p>Description: {description}</p>
        <Image src={userPhotoURL} alt='profile picture' height={200} width={200}/>
        
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
                <Image src={pet.photoURL} alt='pet profile picture' height={100} width={100}/>
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
                <div>
                    <button onClick={() => setShowCreatePetForm(true)}>Add Pet Profile</button>
                </div>
              ) : null
        )}

        {/* editing user profile */}

            { currentUser && currentUserID == profileUserID ? (
                <div>
                    <button onClick={handleEdit}>Edit Profile</button>
                </div>
            ) : null }

            {/* edit user profile modal */}

            {currentUser && currentUserID === profileUserID ? (// Pop-up for Editing
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    style={basicModalStyle}
                >
                
                {/* display name */}
                <div>
                    <label htmlFor="display-name">Display Name:</label>
                    <input type="text" id='display-name' placeholder='New Display Name' maxLength="20" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>

                {/* description */}
                <div>
                    <label htmlFor="description">Description:</label>
                    <input type="text" id='description' placeholder='New Description' value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                {/* profile picture */}
                <div>
                    <img src={userPhotoURL} alt='profile picture' height={200} width={200}/>
                    <label htmlFor="photo">Upload Photo:</label>
                    <input type="file" id="photo" onChange={e => setUserPhotoURL(e.target.files[0])} />
                </div>
                
                <button onClick={handleSave}>Save</button>

                </Modal>
                
            ) : (
                null
            )}

        <div>
            <Link href="/Home">
            <p>Back to Home</p>
            </Link>
        </div>
        </div>
    )
}
