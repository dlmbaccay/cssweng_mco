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

    const [isProfileEditVisible, setProfileEditVisible] = useState(false);


    const openProfileEdit = () => {
        setProfileEditVisible(true);
    };

    const closeProfileEdit = () => {
        setProfileEditVisible(false);
    };

    return (
    <div className="flex">
      <NavBar />

      <div className="flex-1">
        {/* circle */}
        <div className="absolute left-40 top-32 w-32 h-32 rounded-full bg-citron mb-4 z-10">
          <RoundIcon src="/images/user0-image.png" />
        </div>

        {/* Header Picture Rectangle */}
        <div className="relative left-0 top-0 w-full h-48 bg-gray-300">
          <CoverPhoto src="/images/cover0-image.png" />
        </div>

        {/* Posts */}
        {activeTab === 'Posts' && (
          <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border border-neutral-300 ml-36">
          <div 
                  id="showcase" 
                  className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                  style={{ scrollSnapType: 'y mandatory' }}
              >
                  <div class="flex flex-col h-fit max-h-[510px]">
                      <Post 
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                  </div>
              </div>
          </div>
        )}

        {/* Pets */}
        {activeTab === 'Pets' && (
          <div className="absolute top-64 left-64 h-800 w-859 p-2 ml-36">
            <div className="grid grid-cols-6 gap-7">
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow flex items-center justify-center text-8xl font-extrabold">
                <span className="inline-block align-middle mb-6 text-white">+</span>
              </div>
            </div>
          </div>
        )}

        {/* Media */}
        {activeTab === 'Media' && (
          <div className="absolute top-64 left-64 h-800 w-859 p-2 ml-36">
            <div className="grid grid-cols-7 gap-2">
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
            </div>
          </div>
        )}

        {/* Lost Pets */}
        {activeTab === 'Lost Pets' && (
          <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border border-neutral-300 ml-36">
          <div 
                  id="showcase" 
                  className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                  style={{ scrollSnapType: 'y mandatory' }}
              >
                  <div class="flex flex-col h-fit max-h-[510px]">
                      <Post 
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Contact me if u found my dog! 🐾🐾🐾🐾 
                              0917 123 4567'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Contact me if u found my cat! 🐾🐾🐾🐾 
                              0917 123 4567'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Still couldnt find them. :('
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                  </div>
              </div>
          </div>
        )}

        {/* Left Panel */}
        <div className="absolute -ml-8 top-48 left-24 h-5/6 w-80 bg-snow p-2 border border-neutral-300">
          <div className="absolute inset-y-0 left-0 w-16 ..."></div>

          {/* Edit button */}
          <button
            onClick={openProfileEdit}
            className="absolute top-0 right-0 mt-4 mr-4 w-16 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-snow font-bold rounded-lg border-none"
          >
            Edit
          </button>

          {/* Profile Edit Pop-up */}
          {isProfileEditVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white max-w-[1534px] w-4/5 h-4/5 m-auto rounded-lg p-4 overflow-auto">
                <form
                  onSubmit={handleSubmit}
                  className="bg-snow rounded-md p-8 pb-5 w-full"
                >
                  <h1 className="font-bold">Edit Profile</h1>

                  {/* display name */}
                  <div className="mb-0">
                    <label
                      htmlFor="display-name"
                      className="block text-sm font-medium text-gray-700 pt-5"
                    >
                      <span>Display Name</span>
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      id="display-name"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="What would you like us to call you?"
                      maxLength="20"
                      value=""
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 pt-5"
                    >
                      <span>Username</span>
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      id="display-name"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="Enter your username"
                      maxLength="20"
                      value=""
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  {/* profile picture */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      className="mt-1 p-2 border rounded-md w-full"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a profile picture (JPG, PNG, or GIF).
                    </p>
                  </div>

                  {/* cover photo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Cover Photo
                    </label>
                    <input
                      type="file"
                      className="mt-1 p-2 border rounded-md w-full"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a covoer photo (JPG, PNG, or GIF).
                    </p>
                  </div>

                  {/* bio */}
                  <div className="mb-4">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      className="mt-1 p-2 border rounded-md w-full resize-none"
                      rows="4"
                      placeholder="Tell us about yourself..."
                      value=""
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  {/* gender */}
                  <div className="mb-4">
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 p-2 border rounded-md w-full"
                      value="test"
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="None">Prefer Not to Say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* birthdate */}
                  <div className="mb-4">
                    <label
                      htmlFor="birthdate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Birthday
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      className="mt-1 p-2 border rounded-md w-full"
                      value="test"
                      onChange={(e) => setBirthdate(e.target.value)}
                    />
                  </div>

                  {/* location */}
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="Enter your Location"
                      value=""
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {/* buttons */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-pistachio text-white py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={closeProfileEdit}
                      className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Username */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-2xl font-bold text-raisin_black">
              petwhisperer
            </span>
          </div>

          {/* Followers and Following */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-32 text-center mt-4 flex">
            <div className="flex flex-col items-center mr-14">
              <span className="text-raisin_black text-lg font-bold">123</span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-raisin_black text-lg font-bold">69</span>
              <span className="text-gray-500 text-sm">Following</span>
            </div>
          </div>

          {/* About */}
          <div className="absolute top-48 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-lg font-bold text-raisin_black">About</span>
          </div>

          <div className="relative top-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-base text-raisin_black">
              <p>
                🐾 Cat Lover Extraordinaire 🐾 Proud human to a purrfect furball
                🐱 Crazy about all things feline
              </p>
            </span>
          </div>
        </div>

        <div className="absolute mt-0 top-48 left-24 ml-72 flex flex-row mr-4 w-10/12 bg-snow divide-x divide-neutral-300">
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
      </div>
    </div>
  );
}
