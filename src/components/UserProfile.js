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
import NavBar from '../components/NavBar';
import RoundIcon from '../components/RoundIcon';
import CoverPhoto from '../components/CoverPhoto';
import Post from '../components/Post';

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
    }, [currentUserID, profileUserID, currentUser, profileUser]);

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

    // tab functionality
    const [activeTab, setActiveTab] = useState('Posts');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
    <div className="flex">
      <NavBar />

      <div className="flex-1">

        {/* Cover Photo Container */}
        <div id='header-container' className='h-1/5 overflow-clip'>
          {/* Header Picture Rectangle */}
            {coverPhotoURL && <CoverPhoto src={coverPhotoURL} alt={username + "cover photo"} />}
        </div>

        <div id='content-container' className='h-4/5 flex flex-row overflow-clip'>
          {/* Left Panel */}
          <div className="flex flex-col w-80 bg-snow border border-neutral-300 items-center justify-start">

            <div className="flex rounded-full items-center justify-center w-[200px] h-[200px] absolute -translate-y-28"> 
              {userPhotoURL && <RoundIcon src={userPhotoURL} alt={username + "profile picture"} />}
            </div>

            {/* Edit button */}
            <button
              onClick={handleEdit}
              className="mt-6 ml-4 w-16 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-snow font-bold rounded-lg border-none"
            >
              Edit
            </button>

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

            {/* Username */}
            <div className="text-center mt-14 w-80">
              <span className="text-2xl font-bold text-raisin_black ">
                {username}
              </span>
            </div>

            {/* Followers and Following */}
            <div className="text-center mt-8 flex flex-row gap-10 w-80 items-center justify-center ">
              <div className="flex flex-col items-center">
                <span className="text-raisin_black text-lg font-bold">{followers ? 0 : followers}</span>
                <span className="text-gray-500 text-sm">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-raisin_black text-lg font-bold">{following ? 0 : following}</span>
                <span className="text-gray-500 text-sm">Following</span>
              </div>
            </div>

            {/* About */}
            <div className="text-center mt-10 ">
              <span className="text-lg font-bold text-raisin_black">About</span>
            </div>

            <div className="text-center mt-10">
              <span className="text-base text-raisin_black">
                <p>
                  {description}
                </p>
              </span>
            </div>
          </div>

          {/* Container */}
          <div id='tab-container' className='w-full'>
          <div className="flex flex-row w-full bg-snow divide-x divide-neutral-300">
            <button 
              className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                          activeTab === 'Posts' ? 'bg-citron text-white' : ''
                        }`}
              onClick={() => handleTabClick('Posts')}>
              Posts
            </button>
            <button 
              className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                          activeTab === 'Pets' ? 'bg-citron text-white' : ''
                        }`}
              onClick={() => handleTabClick('Pets')}>
              Pets
            </button>
            <button 
              className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                          activeTab === 'Media' ? 'bg-citron text-white' : ''
                        }`}
              onClick={() => handleTabClick('Media')}>
              Media
            </button>
            <button 
              className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                          activeTab === 'Lost Pets' ? 'bg-citron text-white' : ''
                        }`}
              onClick={() => handleTabClick('Lost Pets')}>
              Lost Pets
            </button>
          </div>

            {/* Posts */}
            {activeTab === 'Posts' && (
              <div 
                id="showcase" 
                className="flex justify-center h-[700px] w-full overflow-y-scroll"
              >
                  <div className="flex mt-10 flex-col gap-10">
                      <Post 
                          username={username}
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                          post_img_src='/images/post1-image.png'
                        />
                      <Post 
                          username={username}
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                          post_img_src='/images/post1-image.png'
                        />
                      <Post 
                          username={username}
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                          post_img_src='/images/post1-image.png'
                        />
                  </div>
              </div>
            )}

            {/* Pets */}
            {activeTab === 'Pets' && (
              <div className="h-800 w-859 pl-10 pr-10 pt-8 pb-8">
                <div className="grid grid-cols-6 gap-7">
                  {pets.map((pet) => (
                    <div key={pet.id} className="w-36 h-36 rounded-xl bg-pale_yellow">
                    <Link href={`/user/${profileUsername}/pets/${pet.id}`}>
                        {pet.photoURL && <Image src={pet.photoURL} alt='pet profile picture' height={144} width={144} className='rounded-lg hover:opacity-80'/>}
                    </Link>
                    {/* {getCurrentUser && currentUserID === profileUserID ? (
                        <button 
                          className='bg-black text-white text-sm rounded-lg p-1 mt-2 justify-center items-center w-[144px]'
                          onClick={() => handleDeletePetProfile(pet.id)}>
                          Delete Pet Profile</button>
                    ): null} */}
                    </div>
                ))}

                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow flex items-center justify-center text-8xl font-extrabold">
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
                            // <div>
                            <button onClick={() => setShowCreatePetForm(true)}><i className="fa-solid fa-plus inline-block align-middle text-white w-fit h-fit" ></i></button>
                            // </div>
                        ) : null
                    )}
                    {/* <button onClick={handleCreatePetProfile}>
                      <i className="fa-solid fa-plus inline-block align-middle  text-white" ></i>
                    </button> */}
                  </div>
                </div>
              </div>
            )}

            {/* Media */}
            {activeTab === 'Media' && (
              <div className="h-800 w-859 pl-10 pr-10 pt-8 pb-8">
                <div className="grid grid-cols-7 gap-2">
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                  <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                </div>
              </div>
            )}

            {/* Lost Pets */}
            {activeTab === 'Lost Pets' && (
              <div 
                id="showcase" 
                className="flex justify-center h-[700px] w-full overflow-y-scroll"
              >
                  <div className="flex mt-10 flex-col gap-10">
                      <Post 
                              username={username}
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Contact me if u found my dog! 🐾🐾🐾🐾 
                                  0917 123 4567'
                              user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                              post_img_src='/images/post1-image.png'
                            />
                      <Post
                          username={username}
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Contact me if u found my cat! 🐾🐾🐾🐾 
                              0917 123 4567'
                          user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                          post_img_src='/images/post1-image.png'
                        />
                      <Post
                          username={username}
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Still couldnt find them. :('
                          user_img_src={userPhotoURL ? userPhotoURL: '/images/user1-image.png'}
                          post_img_src='/images/post1-image.png'
                        />
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
