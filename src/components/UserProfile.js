import React from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, storage, STATE_CHANGED } from '@/src/lib/firebase';
import { useUserData, usePetData, getUserIDfromUsername } from '@/src/lib/hooks'
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { basicModalStyle } from '../lib/modalstyle';
import Loader from '../components/Loader';

// Modal.setAppElement('#root'); // Set the root element for accessibility

export default function UserProfile() {
    const router = useRouter();
    const currentUser = useUserData();
    const currentUserID = getUserIDfromUsername(currentUser.username);
    const { profileUsername } = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);

    const [username, setUsername] = useState(null);
    const [description, setDescription] = useState(null); 
    const [displayName, setDisplayName] = useState(null); 
    const [email, setEmail] = useState(null);
    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const [coverPhotoURL, setCoverPhotoURL] = useState(null);

    const pets = usePetData(profileUserID);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const [editedDisplayName, setEditedDisplayName] = useState(displayName);
    const [editedDescription, setEditedDescription] = useState(description);

    useEffect(() => { // for
    // turn off realtime subscription
    let unsubscribe;

    if (profileUserID) {
        const userRef = firestore.collection('users').doc(profileUserID);
        unsubscribe = userRef.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
        setUserPhotoURL(doc.data()?.photoURL);
        setDescription(doc.data()?.description);
        setEditedDescription(doc.data()?.description);
        setDisplayName(doc.data()?.displayName);
        setEditedDisplayName(doc.data()?.displayName);
        setCoverPhotoURL(doc.data()?.coverPhotoURL);
        setEmail(doc.data()?.email);
        });
    } else {
        setUsername(null);
        setUserPhotoURL(null);
        setDescription(null);
        setEditedDescription(null);
        setDisplayName(null);
        setEditedDisplayName(null);
        setCoverPhotoURL(null);
        setEmail(null);
    }

    return unsubscribe;
    }, [profileUserID]);

    const [showCreatePetForm, setShowCreatePetForm] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [petName, setPetName] = useState(null);

    // add prefix pet to all pet states
    const [petAbout, setPetAbout] = useState(null);
    const [petSex, setPetSex] = useState(null);
    const [petBirthdate, setPetBirthdate] = useState(null);
    const [petBirthplace, setPetBirthplace] = useState(null);
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
        
          const batch = firestore.batch();
        
          batch.set(newPetRef, {
            petname: petName,
            about: petAbout,
            sex: petSex,
            birthdate: petBirthdate,
            birthplace: petBirthplace,
            followers: [],
            following: []
          });
        
          const uploadTask = storageRef.put(petPhotoURL);
        
          await uploadTask;
        
          const photoURL = await storageRef.getDownloadURL();
        
          if (!photoURL) {
            throw new Error('File not found in Firebase Storage.');
          }
        
          batch.update(newPetRef, { photoURL });
        
          batch.commit();
        
          toast.success("Pet profile created successfully!");
          setShowCreatePetForm(false);
          setPetName('');
          setPetAbout('');
          setPetSex('');
          setPetBirthdate('');
          setPetBirthplace('');
          setPetPhotoURL('');
        } catch (error) {
          toast.error('Error creating pet profile: ' + error.message);
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
        const batch = firestore.batch();
        
        try {
            const updateData = {
                displayName: editedDisplayName,
                description: editedDescription,
                coverPhotoURL: coverPhotoURL,
                photoURL: userPhotoURL
            };

            batch.update(userRef, updateData);

            await batch.commit();
            setModalIsOpen(false);
            toast.success('User profile updated successfully!');

            // await userRef.update(updateData);
            // setModalIsOpen(false);
        } catch (error) {
            toast.error('Error saving profile:', error);
            console.error('Error saving profile:', error);
        }
    }

    const uploadUserProfilePicFile = async (e) => {
        const file = Array.from(e.target.files)[0];

        const ref = storage.ref(`profilePictures/${profileUserID}/profilePic`);

        const task = ref.put(file);

        task.on(STATE_CHANGED, (snapshot) => {
            const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
            setProgress(pct);

            task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
                setUserPhotoURL(url);
                setUploading(false);

                const userRef = firestore.doc(`users/${currentUserID}`);
                userRef.update({ photoURL: url });
            });
        });
    }

    const uploadCoverPhotoFile = async (e) => {
        const file = Array.from(e.target.files)[0];

        const ref = storage.ref(`coverPhotos/${profileUserID}/coverPhoto`);

        const task = ref.put(file);

        task.on(STATE_CHANGED, (snapshot) => {
            const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
            setProgress(pct);

            task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
                setCoverPhotoURL(url);
                setUploading(false);

                const userRef = firestore.doc(`users/${currentUserID}`);
                userRef.update({ coverPhotoURL: url });
            });
        });
    }

    return (
        <div>
        <h1>User Profile Page</h1>

        {coverPhotoURL && <Image src={coverPhotoURL} alt='cover picture' height={200} width={200}/>}

        <p>Display Name: {displayName}</p>
        <p>Username: {username}</p>
        <p>Email: {email}</p>
        <p>Description: {description}</p>

        {userPhotoURL && <Image src={userPhotoURL} alt='profile picture' height={200} width={200}/>}
        
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
                {/* <Image src={pet.photoURL} alt='pet profile picture' height={100} width={100}/> */}
                {pet.photoURL && <Image src={pet.photoURL} alt='pet profile picture' height={100} width={100}/>}
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
                <input type="text" value={petAbout} onChange={(e) => setPetAbout(e.target.value)} placeholder="About" />
                <label htmlFor="sex">Sex:</label>
                <div>
                    <button
                    id="male"
                    className={`sex-button ${petSex === 'Male' ? 'active' : ''}`}
                    onClick={() => setPetSex('Male')}
                    >
                    Male
                    </button>
                    <button
                    id="female"
                    className={`sex-button ${petSex === 'Female' ? 'active' : ''}`}
                    onClick={() => setPetSex('Female')}
                    >
                    Female
                    </button>
                </div>
                <input type="date" value={petBirthdate} onChange={(e) => setPetBirthdate(e.target.value)} placeholder="Birthdate" />
                <input type="text" value={petBirthplace} onChange={(e) => setPetBirthplace(e.target.value)} placeholder="Birthplace" />
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

            {/* cover photo */}
            <div>
                <Loader show={uploading} />
                {uploading && <h3>{progress}%</h3>}

                {!uploading && (
                    <>
                        <label htmlFor="photo">Upload Photo:</label>
                        <input type="file" id="photo" onChange={uploadCoverPhotoFile} />
                    </>
                )}

                {coverPhotoURL && <Image src={coverPhotoURL} alt='cover photo picture' height={200} width={200}/>}
            </div>
            
            {/* display name */}
            <div>
                <label htmlFor="display-name">Display Name:</label>
                <input type="text" id='display-name' placeholder='New Display Name' maxLength="20" value={editedDisplayName} onChange={e => setEditedDisplayName(e.target.value)} />
            </div>

            {/* description */}
            <div>
                <label htmlFor="description">Description:</label>
                <input type="text" id='description' placeholder='New Description' value={editedDescription} onChange={e => setEditedDescription(e.target.value)} />
            </div>

            {/* profile picture */}
            <div>
                <Loader show={uploading} />
                {uploading && <h3>{progress}%</h3>}

                {!uploading && (
                    <>
                        <label htmlFor="photo">Upload Photo:</label>
                        <input type="file" id="photo" onChange={uploadUserProfilePicFile} />
                    </>
                )}

                {userPhotoURL && <Image src={userPhotoURL} alt='profile picture' height={200} width={200}/>}
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
