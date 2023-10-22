import { useEffect, useState } from 'react';
import { firestore, storage } from '@/src/lib/firebase';
import { useRouter } from 'next/router';
import { useUserData, getUserIDfromUsername } from '@/src/lib/hooks'; // Import the useUser hook
import { formatDateWithWords } from '../lib/formats';

export default function PetProfile() {
    const router = useRouter();
    const { profileUsername, petId } = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);
    const [pet, setPet] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);
    const [sex, setSex] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [birthplace, setBirthplace] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);
    const { user } = useUserData(); // Get the logged-in user

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
        if (user && user.uid === profileUserID) { // Check if the logged-in user is the owner of the pet
        setIsEditing(true);
        }
    };

    const handleSave = async () => {
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);

        if (petPhotoURL) {
        // Upload the photo file to Firebase Storage
            const storageRef = storage.ref(`petProfilePictures/${petId}/profilePic`);
            await storageRef.put(petPhotoURL);

            // Get the download URL of the uploaded photo
            const photoURL = await storageRef.getDownloadURL();

            petRef.update({
                petname: petName,
                about: about,
                sex: sex,
                birthdate: birthdate,
                birthplace: birthplace,
                photoURL: photoURL // Update the photoURL with the new URL
            });
        } else {
            petRef.update({
                petname: petName,
                about: about,
                sex: sex,
                birthdate: birthdate,
                birthplace: birthplace,
                photoURL: pet.photoURL // Keep the existing photoURL if no new file is uploaded
            });
        }

        setIsEditing(false);
    };

    if (!pet) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Pet Profile Page</h1>

            <p>Pet Name: {isEditing ? <input type="text" value={petName} onChange={e => setPetName(e.target.value)} /> : pet.petname}</p>
            <p>About: {isEditing ? <input type="text" value={about} onChange={e => setAbout(e.target.value)} /> : pet.about}</p>
            <p>Followers: {pet.followers ? pet.followers.length : 0}</p>
            <p>Following: {pet.following ? pet.following.length : 0}</p>
            <p>Sex: {isEditing ? <input type="text" value={sex} onChange={e => setSex(e.target.value)} /> : pet.sex}</p>
            <p>Birthday: {isEditing ? 
            <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} /> : formatDateWithWords(pet.birthdate)}</p>
            <p>Place of Birth: {isEditing ? <input type="text" value={birthplace} onChange={e => setBirthplace(e.target.value)} /> : pet.birthplace}</p>
            <img src={pet.photoURL} alt='pet profile picture' height={200} width={200}/>
            {isEditing ? (
            <div>
                <label htmlFor="photo">Upload Photo:</label>
                <input type="file" id="photo" onChange={e => setPetPhotoURL(e.target.files[0])} />
            </div>
            ) : null}   

            {user && user.uid === profileUserID ? ( // Check if the logged-in user is the owner of the pet
                isEditing ? (
                <button onClick={handleSave}>Save</button>
                ) : (
                <button onClick={handleEdit}>Edit</button>
                )
            ) : null}
        </div>
    );
}
