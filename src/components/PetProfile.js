import { useEffect, useState } from 'react';
import { firestore, storage} from '@/src/lib/firebase';
import { useRouter } from 'next/router';
import { useUserData, getUserIDfromUsername } from '@/src/lib/hooks'; // Import the useUser hook
import { formatDateWithWords } from '../lib/formats';
import Image from 'next/image';
import Modal from 'react-modal'; // Import the Modal component  
import toast from 'react-hot-toast'
import { basicModalStyle } from '../lib/modalstyle';

Modal.setAppElement('#root'); // Set the root element for accessibility

export default function PetProfile() {
    const router = useRouter();
    const { profileUsername, petId } = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);
    const [pet, setPet] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false); // State for controlling the modal
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);
    const [sex, setSex] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [birthplace, setBirthplace] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);
    const currentUser = useUserData(); // Get the logged-in user
    const currentUserID = getUserIDfromUsername(currentUser.username);

    useEffect(() => {
        let unsubscribe;

        if (petId && profileUserID) {
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);
        unsubscribe = petRef.onSnapshot((doc) => {
            if (doc.exists) {
            setPet({
                id: doc.id,
                ...doc.data()
            });
            setPetName(doc.data().petname);
            setAbout(doc.data().about);
            setFollowers(doc.data().followers);
            setFollowing(doc.data().following);
            setSex(doc.data().sex);
            setBirthdate(doc.data().birthdate);
            setBirthplace(doc.data().birthplace);
            } else {
            setPet(null);
            }
        });
        } else {
        setPet(null);
        }

        return unsubscribe;
    }, [petId, profileUserID]);

    const handleEdit = () => {
        if (currentUser && currentUserID === profileUserID) { // Check if the logged-in user is the owner of the pet
        setModalIsOpen(true); // Open the modal when editing starts
        }
    };

    const handleSave = async () => {
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);
        const batch = firestore.batch();
      
        try {
          const updateData = {
            petname: petName,
            about: about,
            sex: sex,
            birthdate: birthdate,
            birthplace: birthplace,
            photoURL: petPhotoURL ? await uploadPhotoAndGetURL() : pet.photoURL
          };
      
          batch.update(petRef, updateData);
      
          // Add more batch operations if needed
          // batch.update(anotherDocRef, anotherUpdateData);
      
          await batch.commit();
          setModalIsOpen(false);
          toast.success('Pet profile updated successfully!');
        } catch (error) {
          console.error('Error saving pet:', error);
        }
      };
      
      const uploadPhotoAndGetURL = async () => {
        const storageRef = storage.ref(`petProfilePictures/${petId}/profilePic`);
        await storageRef.put(petPhotoURL);
        return await storageRef.getDownloadURL();
      };
  
    const handleFollow = () => {
        const isFollowing = pet.followers && pet.followers.includes(currentUserID);
      
        const updatedFollowers = isFollowing
          ? pet.followers.filter(id => id !== currentUserID) // Remove currentUserID if already following
          : [...pet.followers, currentUserID]; // Add currentUserID if not already following
      
        firestore.collection('users').doc(profileUserID).collection('pets').doc(petId).update({
          followers: updatedFollowers
        })
        .then(() => {
          setPet(prevPet => ({
            ...prevPet,
            followers: updatedFollowers
          }));
          toast.success('Followed successfully!');
        })
        .catch(error => {
          console.error('Error updating followers:', error);
        });
      };

    if (!pet) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Pet Profile Page</h1>

            <p>Pet Name: {pet.petname}</p>
            <p>About: {pet.about}</p>
            <p>Followers: {pet.followers ? pet.followers.length : 0}</p>
            <p>Following: {pet.following ? pet.following.length : 0}</p>
            <p>Sex: {pet.sex}</p>
            <p>Birthday: {formatDateWithWords(pet.birthdate)}</p>
            <p>Place of Birth: {pet.birthplace}</p>
            <Image src={pet.photoURL} alt='pet profile picture' height={200} width={200}/>
            
            {currentUser && currentUserID === profileUserID ? ( // Edit pet profile button
                <button onClick={handleEdit}>Edit</button>
            ):(null)}
            
            {currentUser && currentUserID !== profileUserID ? (
            // Follow button
            <button onClick={handleFollow}>{pet.followers && pet.followers.includes(currentUserID) ? 'Following' : 'Follow'}</button>
            ) : null}


            {currentUser && currentUserID === profileUserID ? (// Pop-up for Editing
                <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={basicModalStyle}
                >
                <div>
                    <label htmlFor="petName">Pet Name:</label>
                    <input type="text" id="petName" value={petName} onChange={e => setPetName(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="about">About:</label>
                    <input type="text" id="about" value={about} onChange={e => setAbout(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="sex">Sex:</label>
                    <div>
                        <button
                        id="male"
                        className={`sex-button ${sex === 'Male' ? 'active' : ''}`}
                        onClick={() => setSex('Male')}
                        >
                        Male
                        </button>
                        <button
                        id="female"
                        className={`sex-button ${sex === 'Female' ? 'active' : ''}`}
                        onClick={() => setSex('Female')}
                        >
                        Female
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="birthdate">Birthday:</label>
                    <input type="date" id="birthdate" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="birthplace">Place of Birth:</label>
                    <input type="text" id="birthplace" value={birthplace} onChange={e => setBirthplace(e.target.value)} />
                </div>
                <div>
                    <Image src={pet.photoURL} alt='pet profile picture' height={200} width={200}/>
                    <label htmlFor="photo">Upload Photo:</label>
                    <input type="file" id="photo" onChange={e => setPetPhotoURL(e.target.files[0])} />
                </div>
                <button onClick={handleSave}>Save</button>
                </Modal>
                
            ) : (
                null
            )}
        </div>
    );
}
