import React from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, storage, STATE_CHANGED} from '@/src/lib/firebase';
import { useUserData, usePetData, getUserIDfromUsername } from '@/src/lib/hooks'
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { basicModalStyle } from '../lib/modalstyle';
import Loader from '../components/Loader';

// Modal.setAppElement('#root'); // Set the root element for accessibility

export default function UserProfile() {
    const router = useRouter();
    const getCurrentUser = useUserData();
    const currentUserID = getUserIDfromUsername(getCurrentUser.username);
    const { profileUsername } = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    
    useEffect(() => {
        const fetchUserData = async () => {
        try {
            const currentUserDoc = await firestore.collection('users').doc(currentUserID).get();
            const profileUserDoc = await firestore.collection('users').doc(profileUserID).get();

            setCurrentUser(currentUserDoc.data());
            setProfileUser(profileUserDoc.data());
            console.log(currentUser)
            console.log(profileUser)
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
    }, [currentUserID, profileUserID]);

    const [username, setUsername] = useState(null);
    const [description, setDescription] = useState(null); 
    const [displayName, setDisplayName] = useState(null); 
    const [email, setEmail] = useState(null);
    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const [coverPhotoURL, setCoverPhotoURL] = useState(null);

    const [gender, setGender] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [location, setLocation] = useState(null);
    
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);

    const pets = usePetData(profileUserID);

    const [editedDisplayName, setEditedDisplayName] = useState(displayName);
    const [editedDescription, setEditedDescription] = useState(description);
    const [editedLocation, setEditedLocation] = useState(location);

    useEffect(() => { // for
    // turn off realtime subscription
    let unsubscribe;
    
    if (profileUserID) {
        const userRef = firestore.collection('users').doc(profileUserID);
        unsubscribe = userRef.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
        setDescription(doc.data()?.description);
        setDisplayName(doc.data()?.displayName);
        setEmail(doc.data()?.email);
        setUserPhotoURL(doc.data()?.photoURL);
        setCoverPhotoURL(doc.data()?.coverPhotoURL);
        setGender(doc.data()?.gender);
        setBirthdate(doc.data()?.birthdate);
        setLocation(doc.data()?.location);

        setFollowers(doc.data()?.followers);
        setFollowing(doc.data()?.following);
        
        setEditedDisplayName(doc.data()?.displayName);
        setEditedDescription(doc.data()?.description);
        setEditedLocation(doc.data()?.location);
    });
    } else {
        setUsername(null);
        setDescription(null);
        setDisplayName(null);
        setEmail(null);
        setUserPhotoURL(null);
        setCoverPhotoURL(null);
        setGender(null);
        setBirthdate(null);
        setLocation(null);
        
        setFollowers(null);
        setFollowing(null);

        setEditedDisplayName(null);
        setEditedDescription(null);
        setEditedLocation(null);
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
    const [petBreed, setPetBreed] = useState(null);
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
            breed: petBreed,
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
            setPetBreed('');
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
        if (getCurrentUser && currentUserID === profileUserID) { // check if this is the owner of the profile
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
                photoURL: userPhotoURL,
                location: editedLocation
            };

            batch.update(userRef, updateData);

            await batch.commit();
            setModalIsOpen(false);
            toast.success('User profile updated successfully!');

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
            task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
                setUserPhotoURL(url);

                const userRef = firestore.doc(`users/${currentUserID}`);
                userRef.update({ photoURL: url });
            });
        });
    }

    const uploadCoverPhotoFile = async (e) => {
        const file = Array.from(e.target.files)[0];

        const ref = storage.ref(`coverPictures/${profileUserID}/coverPic`);

        const task = ref.put(file);

        task.on(STATE_CHANGED, (snapshot) => {
            task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
                setCoverPhotoURL(url);
                const userRef = firestore.doc(`users/${currentUserID}`);
                userRef.update({ coverPhotoURL: url });
            });
        });
    }

    const handleFollow = async () => {
        const isFollowing = currentUser.following && currentUser.following.includes(profileUserID);
      
        const updatedFollowing = isFollowing
          ? currentUser.following.filter(id => id !== profileUserID) // Remove profileUserID if already following
          : [...currentUser.following, profileUserID]; // Add profileUserID if not already following
      
        const updatedFollowers = isFollowing
          ? profileUser.followers.filter(id => id !== currentUserID) // Remove currentUserID if already a follower
          : [...profileUser.followers, currentUserID]; // Add currentUserID if not already a follower
      
        try {
            // Update following for currentUser
            await firestore.collection('users').doc(currentUserID).update({
                following: updatedFollowing
            });
            setCurrentUser(prevUser => ({
                ...prevUser,
                following: updatedFollowing
            }));
            toast.success('Followed user successfully!');
        
            // Update followers for profileUser
            await firestore.collection('users').doc(profileUserID).update({
                followers: updatedFollowers
            });
            setProfileUser(prevUser => ({
                ...prevUser,
                followers: updatedFollowers
            }));
        
            // Follow all pets of profileUser
            if (!isFollowing) {
                const petsSnapshot = await firestore.collection('users').doc(profileUserID).collection('pets').get();
                const petIds = petsSnapshot.docs.map(doc => doc.id);
                const petRef = firestore.collection('users').doc(profileUserID).collection('pets');
            
                petIds.forEach(petId => {
                    const petDocRef = petRef.doc(petId);
                
                    petDocRef.get().then(doc => {
                        const petData = doc.data();
                        const isFollowingPet = petData.followers && petData.followers.includes(currentUserID);
                
                        if (!isFollowingPet) {
                        petData.followers = [...petData.followers, currentUserID];
                
                        petDocRef.set(petData)
                            .then(() => {
                            toast.success('Followed successfully!');
                            })
                            .catch(error => {
                            console.error('Error updating followers:', error);
                            });
                        }
                    });
                });
            
                console.log('Followed all pets successfully!');
            }
  
        } catch (error) {
          console.error('Error:', error);
        }
    };

    return (
        <div>
        <h1>User Profile Page</h1>
        {/* following users */}
        {getCurrentUser && currentUserID !== profileUserID && profileUser ? (
        // Follow button
        <button onClick={handleFollow}>
            {profileUser.followers && profileUser.followers.includes(currentUserID)
            ? 'Following'
            : 'Follow'}
        </button>
        ) : null}


        {coverPhotoURL && <Image src={coverPhotoURL} alt='cover picture' height={200} width={200}/>}

        <p>Display Name: {displayName}</p>
        <p>Username: {username}</p>
        <p>Email: {email}</p>
        <p>Description: {description}</p>
    
        <p>Followers: {followers && followers.length}</p>
        <p>Following: {following && following.length}</p>
    
        <p>Gender: {gender}</p>
        <p>Birthdate: {birthdate}</p>
        <p>Location: {location}</p>

        {userPhotoURL && <Image src={userPhotoURL} alt='profile picture' height={200} width={200}/>}
        
        {/* delete pet profile confirmation modal */}
        {getCurrentUser && currentUserID === profileUserID ? (
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
        
        {/* show all pets (should be in a container later on) */}
        <h2>Pets</h2>
        {pets.map((pet) => (
            <div key={pet.id}>
            <Link href={`/user/${profileUsername}/pets/${pet.id}`}>
                {/* <Image src={pet.photoURL} alt='pet profile picture' height={100} width={100}/> */}
                {pet.photoURL && <Image src={pet.photoURL} alt='pet profile picture' height={100} width={100}/>}
            </Link>
            {getCurrentUser && currentUserID === profileUserID ? (
                <button onClick={() => handleDeletePetProfile(pet.id)}>Delete Pet Profile</button>
            ): null}
            </div>
        ))}

        {/* create pet profile modal */}
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
                <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="Breed" />
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
        { getCurrentUser && currentUserID == profileUserID ? (
            <div>
                <button onClick={handleEdit}>Edit Profile</button>
            </div>
        ) : null }
        

        {/* edit user profile modal */}
        {getCurrentUser && currentUserID === profileUserID ? (// Pop-up for Editing
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={basicModalStyle}
            >
                {/* cover photo */}
                <div>
                    <h1>Cover Photo</h1>
                    <label htmlFor="coverPhoto">
                        {coverPhotoURL && <Image src={coverPhotoURL} alt='cover photo picture' height={200} width={200} className="cursor-pointer hover:opacity-50"/>}
                    </label>
                    <input type="file" id="coverPhoto" onChange={uploadCoverPhotoFile} className="hidden"/>
                </div>
                
                
                {/* display name */}
                <div>
                    <br/>
                    <label htmlFor="display-name">Display Name: </label>
                    <input type="text" id='display-name' placeholder='New Display Name' maxLength="20" value={editedDisplayName} onChange={e => setEditedDisplayName(e.target.value)} />
                </div>


                {/* description */}
                <div>
                    <br/>
                    <label htmlFor="description">Description: </label>
                    <input type="text" id='description' placeholder='New Description' value={editedDescription} onChange={e => setEditedDescription(e.target.value)} />
                </div>
            

                {/* profile picture */}
                <div>
                    <br/>
                    <h1>Profile Picture</h1>
                    <label htmlFor="userPhoto">
                        {userPhotoURL && <Image src={userPhotoURL} alt='profile picture' height={200} width={200} className="cursor-pointer hover:opacity-50"/>}
                    </label>
                    <input type="file" id="userPhoto" onChange={uploadUserProfilePicFile} className='hidden'/>
                </div>
                
                {/* gender not editable */}
                <div>
                    <br />
                    <p>Gender: {gender}</p>
                </div>

                {/* birthdate not editable */}
                <div>
                    <br />
                    <p>Birthdate: {birthdate}</p>
                </div>

                {/* location */}
                <div>
                    <br/>
                    <label htmlFor="location">Location: </label>
                    <input type="text" id='location' placeholder='New Location' value={editedLocation} onChange={e => setEditedLocation(e.target.value)} />
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
