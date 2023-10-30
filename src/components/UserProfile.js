import React from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore, storage, STATE_CHANGED} from '@/src/lib/firebase';
import { useUserData, usePetData, getUserIDfromUsername } from '@/src/lib/hooks'
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { basicModalStyle, confirmationModalStyle } from '../lib/modalstyle';
import NavBar from '../components/NavBar';
import RoundIcon from '../components/RoundIcon';
import CoverPhoto from '../components/CoverPhoto';
import Post from '../components/Post';

// Modal.setAppElement('#root'); // Set the root element for accessibility

export default function UserProfile() {

    // variables for user profile
    const router = useRouter();
    const getCurrentUser = useUserData();
    const currentUserID = getUserIDfromUsername(getCurrentUser.username);
    
    const { profileUsername } = router.query; // username of the user whose profile is being viewed
    
    const profileUserID = getUserIDfromUsername(profileUsername);
    
    const [currentUser, setCurrentUser] = useState(null); // Current user data
    const [profileUser, setProfileUser] = useState(null); // Profile user data
    const [pets, setPets] = useState([]); // pets of the profile user
    
    // variables for user profile
    const [username, setUsername] = useState(null);
    const [description, setDescription] = useState(null); 
    const [displayName, setDisplayName] = useState(null); 
    const [email, setEmail] = useState(null);
    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const [coverPhotoURL, setCoverPhotoURL] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);
    const [gender, setGender] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [location, setLocation] = useState(null);

    // variables for editing user profile
    const [editedDisplayName, setEditedDisplayName] = useState(displayName);
    const [editedDescription, setEditedDescription] = useState(description);
    const [editedLocation, setEditedLocation] = useState(location);

    // variables for creating pet profile
    const [showCreatePetForm, setShowCreatePetForm] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [deletingPetName, setDeletingPetName] = useState(null);
    const [deletingPetPicture, setDeletingPetPicture] = useState(null);
    const [petName, setPetName] = useState(null);
    const [petAbout, setPetAbout] = useState(null);
    const [petSex, setPetSex] = useState(null);
    const [petBirthdate, setPetBirthdate] = useState(null);
    const [petBirthplace, setPetBirthplace] = useState(null);
    const [petBreed, setPetBreed] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);

    // misc variables
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('Posts');

    useEffect(() => {
      const fetchUserData = async () => {
        try {
            const currentUserDoc = await firestore.collection('users').doc(currentUserID).get();
            const profileUserDoc = await firestore.collection('users').doc(profileUserID).get();

            setCurrentUser(currentUserDoc.data());
            setProfileUser(profileUserDoc.data());
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
        
    }, [currentUserID, profileUserID]);

    useEffect(() => {
      let unsubscribe;
      
      if (profileUserID) { // info of the user whose profile is being viewed

          const userRef = firestore.collection('users').doc(profileUserID);
          unsubscribe = userRef.onSnapshot((doc) => {
          setProfileUser({
              id: doc.id,
              ...doc.data()
          });
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

          // Fetch the 'pets' collection
          const petsCollectionRef = userRef.collection('pets');
          petsCollectionRef.get().then((querySnapshot) => {
            const petsData = [];
            querySnapshot.forEach((doc) => {
              petsData.push({
                id: doc.id,
                ...doc.data()
              });
            });
            setPets(petsData);
          });
      });
      } else {
          setProfileUser(null);
          setUsername(null);
          setDescription(null);
          setDisplayName(null);
          setEmail(null);
          setUserPhotoURL(null);
          setCoverPhotoURL(null);
          setGender(null);
          setBirthdate(null);
          setLocation(null);
          setEditedDisplayName(null);
          setEditedDescription(null);
          setEditedLocation(null);
          setPets([])
      }

      return unsubscribe;
    }, [profileUserID])

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

        // reload window
        window.location.reload();
    } catch (error) {
        toast.error('Error creating pet profile: ' + error.message);
    }
    };
    
    const handleDeletePetProfile = async (petId) => {
        setDeletingPetId(petId);

        // Fetch the pet's document from Firestore
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);
        const petDoc = await petRef.get();
        const petData = petDoc.data();
        
        setDeletingPetName(petData.petname);
        setDeletingPetPicture(petData.photoURL);

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

            // reload window
            window.location.reload();

            toast.success("The pet profile was deleted successfully");
        } catch (error) {
            console.error('Error deleting pet profile:', error);
        }
    };
    
    const handleEditProfile = () => {
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
        setIsUploadingCoverPhoto(true);

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
            })
            .finally(() => {
              setIsUploadingCoverPhoto(false); // Set back to false after the upload is done
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

    const handleTabEvent = (tabName) => {
        setActiveTab(tabName);
    };

    return (
    <div className="flex h-screen">
      <NavBar />

      { profileUser  &&

        <div className="flex-1 h-screen">
          <div id='header-container' className='h-1/5 border-l border-neutral-300'>
              <CoverPhoto src={profileUser.coverPhotoURL} alt={profileUser.username + " cover photo"} />
          </div>

          <div id='content-container' className='h-4/5 flex flex-row'>
              {/* Left Panel */}
              <div className="fixed flex flex-col w-80 h-screen bg-snow border border-neutral-300 justify-start items-center">

                  <div className="flex justify-center w-48 h-48 absolute -translate-y-24 shadow-lg rounded-full"> 
                    <RoundIcon src={userPhotoURL} alt={username + " profile picture"} />
                  </div>
                  
                  {/* Display Name & Username */}
                  <div className="text-center mt-32 w-80">
                    <div className="text-2xl font-bold text-raisin_black ">
                      {displayName}
                    </div>

                    <div className='text-lg text-raisin_black'>
                      @{username}
                    </div>
                  </div>

                  {/* Edit button */}
                  {currentUserID === profileUserID ? (
                    <button
                      onClick={handleEditProfile}
                      className="text-center mt-4 w-20 h-8 bg-citron hover:bg-xanthous shadow-lg text-snow font-bold rounded-lg border-none"
                    >
                      Edit
                  </button>
                  ) : 
                    // Follow Button
                    <button 
                      onClick={handleFollow}
                      className="text-center mt-4 w-32 h-8 bg-citron hover:bg-xanthous shadow-lg text-snow font-bold rounded-lg border-none"
                    >
                      {profileUser.followers.includes(currentUserID) ? 'Following' : 'Follow'}
                    </button>
                  }

                  {/* Followers and Following */}
                  {profileUser ? (
                    <div className="text-center mt-8 flex flex-row gap-10 w-80 items-center justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-raisin_black text-xl font-bold">{followers.length}</span>
                        <span className="text-grass font-bold text-sm">Followers</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-raisin_black text-xl font-bold">{following.length}</span>
                        <span className="text-grass font-bold text-sm">Following</span>
                      </div>
                    </div>
                  ) : (null)}

                  {/* About */}
                  <div className="text-center mt-10 flex flex-col gap-2">
                    <div className="text-lg font-bold text-raisin_black">About</div>
                      <div className="text-base text-raisin_black pl-6 pr-6">
                        {description}
                      </div>
                  </div>
              </div>

              <div id='main-content-container' className='flex flex-col translate-x-80 w-[calc(100%-20rem)]'>
                  <div id="tab-actions" className="flex flex-row bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300">
                        <button 
                        className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                                    activeTab === 'Posts' ? 'bg-citron text-white' : ''
                                    }`}
                        onClick={() => handleTabEvent('Posts')}>
                        Posts
                        </button>
                        <button 
                        className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                                    activeTab === 'Pets' ? 'bg-citron text-white' : ''
                                    }`}
                        onClick={() => handleTabEvent('Pets')}>
                        Pets
                        </button>
                        <button 
                        className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                                    activeTab === 'Media' ? 'bg-citron text-white' : ''
                                    }`}
                        onClick={() => handleTabEvent('Media')}>
                        Media
                        </button>
                        <button 
                        className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                                    activeTab === 'Lost Pets' ? 'bg-citron text-white' : ''
                                    }`}
                        onClick={() => handleTabEvent('Lost Pets')}>
                        Lost Pets
                        </button>
                  </div>

                  <div id="tab-container" className='overflow-y-scroll'>
                      {/* Posts */}
                      {activeTab === 'Posts' && (
                        <div 
                          id="showcase" 
                          className="flex justify-center w-full"
                        >
                          <div className="flex mt-10 flex-col gap-10">
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                              username={username} 
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src={userPhotoURL}
                              post_img_src='/images/post1-image.png'
                            />
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                              username={username} 
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src={userPhotoURL}
                              post_img_src='/images/post1-image.png'
                            />
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                                username={username} 
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src={userPhotoURL}
                                post_img_src='/images/post1-image.png'
                              />
                            <Post 
                              username={username} 
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src={userPhotoURL}
                              post_img_src='/images/post1-image.png'
                            />
                          </div>
                        </div>
                      )}

                      {/* Pets */}
                      {activeTab === 'Pets' && (
                        <div className="w-full h-full p-14 pl-16">
                            {
                              (profileUserID !== currentUserID && pets.length === 0) ? (
                                <div className='flex flex-col items-center justify-center h-full p-0'>
                                  <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                  <div className='mt-2 font-bold text-grass'>Nothing to see here yet...</div>
                                </div>
                              ) : (                   
                                <div className="grid grid-cols-6 gap-12">
                                  {pets.map((pet) => (
                                    <div key={pet.id} className="w-36 h-36 rounded-xl">
                                      <Link href={`/user/${profileUser.username}/pets/${pet.id}`} className='rounded-lg hover:opacity-80 flex flex-col'>
                                          <RoundIcon 
                                            src={pet.photoURL} 
                                            alt='pet profile picture' 
                                            height={144} 
                                            width={144}
                                            />
                                      </Link>

                                      <div className='mt-2 flex flex-row items-center justify-center'>
                                          <div className='text-center text-lg font-bold'>
                                            {pet.petname}
                                          </div>
                                          <div>
                                            {currentUserID === profileUserID ? (
                                              <button 
                                                className='text-sm rounded-lg ml-2 justify-center items-center hover:text-red-600'
                                                onClick={() => handleDeletePetProfile(pet.id)}>
                                                  <i class="fa-solid fa-trash"></i>
                                                </button>
                                            ): null}
                                          </div>
                                      </div>
                                    </div> 
                                  ))}

                                  {/* delete pet profile confirmation modal */}
                                  {getCurrentUser && currentUserID === profileUserID ? (
                                      <Modal
                                      isOpen={showConfirmation}
                                      onRequestClose={() => setShowConfirmation(false)}
                                      contentLabel="Delete Confirmation"
                                      style={confirmationModalStyle}
                                      >
                                          <div className='flex flex-col gap-6 items-center justify-center h-full w-full'>
                                            <div className='text-center text-md'>
                                              Are you sure you want to delete <span className='font-bold'>{deletingPetName}`s</span> profile?
                                            </div>

                                            <div className='flex flex-row items-center'>
                                                <Image src={deletingPetPicture} alt="pet profile picture" width={100} height={100} className='rounded-full shadow-lg h-[125px] w-[125px]' />
                                            </div>

                                            <div className='flex flex-row items-center gap-4'>
                                              <button 
                                                onClick={confirmDeletePetProfile}
                                                className='bg-black text-white rounded-lg pl-2 pr-2 pt-1 pb-1 hover:opacity-80 hover:bg-red-600 font-bold'
                                              >
                                                  Delete</button>
                                              <button 
                                                onClick={() => setShowConfirmation(false)}
                                                className='rounded-lg pl-2 pr-2 pt-1 pb-1 hover:opacity-80 hover:bg-black hover:text-white font-bold'
                                              >
                                                Cancel</button>
                                            </div>
                                          </div>  
                                      </Modal>
                                  ): null}

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
                                          <div className="flex flex-col w-36">
                                            <button onClick={() => setShowCreatePetForm(true)}>
                                              <i 
                                                className="fa-solid fa-paw text-white rounded-full 
                                                  w-36 h-36 bg-pale_yellow flex items-center justify-center text-7xl hover:bg-pistachio hover:text-pale_yellow" ></i></button>
                                              <p
                                                className='text-center text-lg font-bold mt-2 flex flex-row items-center justify-center'
                                              >Add New Pet</p>
                                          </div>
                                      ) : null
                                  )}
                                </div>
                              )
                            }
                          </div>
                      )}

                      {/* Media */}
                      {activeTab === 'Media' && (
                        <div className="w-full p-14 pl-16">
                          
                          {/* if no media... */}
                          <div className='flex flex-col items-center justify-center h-full w-full'>
                            <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                            <div className='mt-2 font-bold text-grass'>Nothing to see here yet...</div>
                          </div>

                          {/* if w/ media */}
                          {/* <div className="grid grid-cols-8">
                            <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                            <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                            <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
                          </div> */}
                        </div>
                      )}

                      {/* Lost Pets */}
                      {activeTab === 'Lost Pets' && (
                        <div 
                          id="showcase" 
                          className="flex justify-center w-full"
                        >
                            <div className="flex mt-10 flex-col gap-10">
                                <Post 
                                    username={username} 
                                    publish_date='Sept 6 at 4:30 PM'    
                                    desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                        Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                        🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                    user_img_src={userPhotoURL}
                                    post_img_src='/images/post1-image.png'
                                  />
                                <Post 
                                    username={username} 
                                    publish_date='Sept 6 at 4:30 PM'    
                                    desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                        Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                        🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                    user_img_src={userPhotoURL}
                                    post_img_src='/images/post1-image.png'
                                  />
                                <Post 
                                  username={username} 
                                  publish_date='Sept 6 at 4:30 PM'    
                                  desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                      Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                      🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                  user_img_src={userPhotoURL}
                                  post_img_src='/images/post1-image.png'
                                />
                            </div>
                        </div>
                      )}

                      {/* edit user profile modal */}
                      {currentUserID === profileUserID ? (
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={() => setModalIsOpen(false)}
                            style={basicModalStyle}
                        >
                            {/* cover photo */}
                            <div>
                                <h1>Cover Photo</h1>
                                <label htmlFor="coverPhoto">
                                    {profileUser.coverPhotoURL && <Image src={profileUser.coverPhotoURL} alt='cover photo picture' height={200} width={200} className="cursor-pointer hover:opacity-50"/>}
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
                                  <div className="flex justify-center w-48 h-48 cursor-pointer"> 
                                    <RoundIcon src={profileUser.photoURL} alt={profileUser.username + " profile picture"}/>
                                  </div>
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

                            <button onClick={handleSave} disabled={isUploadingCoverPhoto}>Save</button>

                        </Modal>
                      ) : ( null )}
                  </div>
              </div>
          </div>
        </div>
      }
    </div>
  );
}
