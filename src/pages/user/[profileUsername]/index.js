import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { useRouter } from 'next/router';

import { firestore, storage, STATE_CHANGED } from '@/src/lib/firebase';
import { useUserData, usePetData, useUserIDfromUsername, useAllUserPosts } from '@/src/lib/hooks'
import { createPetModalStyle, confirmationModalStyle, createPostModalStyle, editUserProfileStyle } from '../../../lib/modalstyle';

import NavBar from '@/src/components/NavBar';
import RoundIcon from '@/src/components/RoundIcon';
import CoverPhoto from '@/src/components/CoverPhoto';
import PostSnippet from '@/src/components/PostSnippet';
import CreatePost from '@/src/components/CreatePost';
import withAuth from '@/src/components/withAuth';
import { arrayUnion } from 'firebase/firestore';
import { set } from 'react-hook-form';

function UserProfilePage() {

    useEffect(() => {
        Modal.setAppElement('#root')
    }, []);

    // variables for user profile
    const router = useRouter();
    const getCurrentUser = useUserData();
    const currentUserID = useUserIDfromUsername(getCurrentUser.username);

    const { profileUsername } = router.query; // username of the user whose profile is being viewed

    const profileUserID = useUserIDfromUsername(profileUsername);

    const [currentUser, setCurrentUser] = useState(null); // Current user data
    const [profileUser, setProfileUser] = useState(null); // Profile user data
    const [pets, setPets] = useState([]); // pets of the profile user
    const [petIDs, setPetIDs] = useState([]); // pet IDs of the profile user
    const [postIDs, setPostIDs] = useState([]); // post IDs of the profile user
    const [posts, setPosts] = useState([]); // posts of the profile user

    // variables for user profile
    const [username, setUsername] = useState(null);
    const [about, setAbout] = useState(null);
    const [displayName, setDisplayName] = useState(null);
    const [email, setEmail] = useState(null);
    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const [coverPhotoURL, setCoverPhotoURL] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);
    const [gender, setGender] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [location, setLocation] = useState(null);
    const [hidden, setHidden] = useState(null);

    // variables for editing user profile
    const [editedDisplayName, setEditedDisplayName] = useState(null);
    const [editedAbout, setEditedAbout] = useState(null);
    const [editedLocation, setEditedLocation] = useState(null);

    // variables for pet profile and pet deletion
    const [showCreatePetForm, setShowCreatePetForm] = useState(false);
    const [showPetDeleteConfirmation, setShowPetDeleteConfirmation] = useState(false);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [deletingPetName, setDeletingPetName] = useState(null);
    const [deletingPetPicture, setDeletingPetPicture] = useState(null);

    // misc variables
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('Posts');
    const [loading, setLoading] = useState(false);
    const [editedDisplayNameValid, setEditedDisplayNameValid] = useState(true);

    // create post variables
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);

    // fetch current and profile user data
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

    // fetch profile user's data
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
                setAbout(doc.data()?.about);
                setDisplayName(doc.data()?.displayName);
                setEmail(doc.data()?.email);
                setUserPhotoURL(doc.data()?.photoURL);
                setCoverPhotoURL(doc.data()?.coverPhotoURL);
                setGender(doc.data()?.gender);
                setBirthdate(doc.data()?.birthdate);
                setLocation(doc.data()?.location);
                setHidden(doc.data()?.hidden);
                setPetIDs(doc.data()?.pets);

                setFollowers(doc.data()?.followers);
                setFollowing(doc.data()?.following);

                setEditedDisplayName(doc.data()?.displayName);
                setEditedAbout(doc.data()?.about);
                setEditedLocation(doc.data()?.location);
            });
        } else {
            setProfileUser(null);
            setUsername(null);
            setAbout(null);
            setDisplayName(null);
            setEmail(null);
            setUserPhotoURL(null);
            setCoverPhotoURL(null);
            setGender(null);
            setBirthdate(null);
            setLocation(null);
            setHidden(null);
            setEditedDisplayName(null);
            setEditedAbout(null);
            setEditedLocation(null);
        }

        return unsubscribe;
    }, [profileUserID]);
       
    // fetch all posts of the profile user
    useEffect(() => {
        let unsubscribe;

        if (profileUserID) {
            const postsCollectionRef = firestore.collection('posts').where("authorID", "==", profileUserID);
            unsubscribe = postsCollectionRef.onSnapshot((querySnapshot) => {
                const postsData = [];

                querySnapshot.forEach((doc) => {
                    postsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setPosts(postsData);
            });
        } else {
            setPosts([]);
        }
        
        return unsubscribe;
    }, [profileUserID]);

    // fetch all pets of the profile user
    useEffect(() => {
        let unsubscribe;

        if (profileUserID) {
            const petsCollectionRef = firestore.collection('pets').where("petOwnerID", "==", profileUserID);
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
        } else {
            setPets([]);
        }

        return unsubscribe;
    }, [profileUserID]);

    const handleDeletePetProfile = async (petId) => {
        setDeletingPetId(petId);

        // Fetch the pet's document from Firestore
        const petRef = firestore.collection('pets').doc(petId);
        const petDoc = await petRef.get();
        const petData = petDoc.data();

        setDeletingPetName(petData.petName);
        setDeletingPetPicture(petData.photoURL);

        setShowPetDeleteConfirmation(true);
    };

    const confirmDeletePetProfile = async () => {
        try {
            if (profileUserID !== currentUserID) {
                toast.error("You can only delete a pet profile from your own user profile.");
                return;
            }

            const petRef = firestore.collection('pets').doc(deletingPetId);

            // Delete the pet's profile picture from storage, if it exists
            if (deletingPetPicture) {
                const storageRef = storage.refFromURL(deletingPetPicture);
                await storageRef.delete();
            }

            // Remove the pet from the user's pets array
            const userRef = firestore.collection('users').doc(currentUserID);
            const userDoc = await userRef.get();
            const userData = userDoc.data();

            const updatedPets = userData.pets.filter(id => id !== deletingPetId);

            await userRef.update({
                pets: updatedPets
            });

            // Remove the pet from the user's posts
            const postsSnapshot = await firestore.collection('posts').where('authorID', '==', currentUserID).get();
            const postIds = postsSnapshot.docs.map(doc => doc.id);
            const postRef = firestore.collection('posts');

            postIds.forEach(postId => {
                const postDocRef = postRef.doc(postId);

                postDocRef.get().then(doc => {
                    const postData = doc.data();
                    const updatedPostPets = postData.postPets.filter(id => id !== deletingPetId);

                    postDocRef.update({
                        postPets: updatedPostPets
                    });
                });
            });

            // Delete the pet's document from Firestore
            await petRef.delete();

            // Close the confirmation popup
            setShowPetDeleteConfirmation(false);

            // reload window
            window.location.reload();

            toast.success("The pet profile was deleted successfully");
        } catch (error) {
            toast.error('Error deleting pet profile:', error.message);
            console.error('Error deleting pet profile:', error);
        }
    };

    const handleEditProfile = () => {
        if (getCurrentUser && currentUserID === profileUserID) { // check if this is the owner of the profile
            setShowEditProfile(true); // open the modal when editing starts
        }
    }

    const handleEditProfileSave = async () => {
        const userRef = firestore.collection('users').doc(profileUserID);
        const batch = firestore.batch();

        try {
            const updateData = {
                displayName: editedDisplayName,
                about: editedAbout,
                coverPhotoURL: coverPhotoURL,
                photoURL: userPhotoURL,
                location: editedLocation
            };

            batch.update(userRef, updateData);

            await batch.commit();
            setShowEditProfile(false);
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
                const petsSnapshot = await firestore.collection('pets').where('petOwnerID', '==', profileUserID).get();
                const petIds = petsSnapshot.docs.map(doc => doc.id);
                const petRef = firestore.collection('pets');

                petIds.forEach(petId => {
                    const petDocRef = petRef.doc(petId);

                    petDocRef.get().then(doc => {
                        const petData = doc.data();
                        const isFollowingPet = petData.followers && petData.followers.includes(currentUserID);

                        if (!isFollowingPet) {
                            petData.followers = [...petData.followers, currentUserID];

                            petDocRef.set(petData)
                                .then(() => {
                                    toast.success('Followed all pets successfully!');
                                })
                                .catch(error => {
                                    toast.error('Error updating followers:', error);
                                });
                        }
                    });
                });
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTabEvent = (tabName) => {
        setActiveTab(tabName);
    };

    const handleDisplayNameVal = (val) => {
        const checkDisplayNameVal = val;
        // const regex = /^[a-zA-Z0-9_.]*[a-zA-Z0-9](?:[a-zA-Z0-9_.]*[ ]?[a-zA-Z0-9_.])*[a-zA-Z0-9_.]$/;

        if (checkDisplayNameVal.startsWith(' ') || checkDisplayNameVal.endsWith(' ') || checkDisplayNameVal.includes('  ')) {
            setEditedDisplayName(checkDisplayNameVal);
            setEditedDisplayNameValid(false);
        } else if ((checkDisplayNameVal.length >= 1 && checkDisplayNameVal.length <= 30)) {
            setEditedDisplayName(checkDisplayNameVal);
            setEditedDisplayNameValid(true);
        } else if (checkDisplayNameVal.length < 1 || checkDisplayNameVal.length > 30) {
            setEditedDisplayName(checkDisplayNameVal);
            setEditedDisplayNameValid(false);
        }
        // } else if (!regex.test(displayname)) {
        //     setDisplayName(displayname);
        //     setDisplayNameValid(false);
        // }
    };

    const handleBack = () => {
        router.push('/Homepage');
    };

    return (
        <div id="root" className='flex h-screen'>
            <NavBar />

            {profileUser &&

                <div className="flex-1 h-screen">
                    <div id='header-container' className='h-1/5 border-l border-neutral-300'>
                        <CoverPhoto src={profileUser.coverPhotoURL} alt={profileUser.username + " cover photo"} />
                    </div>

                    <div id='content-container' className='h-4/5 flex flex-row'>
                        
                        {/* Profile Picture */}
                        <div className="flex justify-center w-48 h-48 absolute -translate-y-24 shadow-lg rounded-full ml-16 z-10">
                            <RoundIcon src={userPhotoURL} alt={username + " profile picture"} />
                        </div>

                        {/* Left Panel */}
                        <div className="fixed flex flex-col w-80 h-4/5 bg-snow border border-neutral-300 justify-start items-center overflow-y-auto overflow-x-hidden">

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

                            {/* edit user profile modal */}
                            {currentUserID === profileUserID ? (
                                <Modal
                                    isOpen={showEditProfile}
                                    onRequestClose={() => setShowEditProfile(false)}
                                    style={editUserProfileStyle}
                                >
                                    <div className='w-full h-full flex flex-col justify-between'>
                                        <h1 className="font-bold text-lg">Edit {username}`s Profile</h1>

                                        <div className='flex flex-row items-start justify-evenly p-4 rounded-lg h-fit'>
                                            {/* profile picture */}
                                            <div className="items-center justify-center">
                                                <h1 className='font-medium mb-2 text-center'>Change Profile Picture</h1>
                                                <label htmlFor="userPhoto">
                                                    <div className="flex justify-center w-48 h-48 cursor-pointer rounded-full shadow-lg hover:opacity-50">
                                                        <RoundIcon src={profileUser.photoURL} alt={profileUser.username + " profile picture"} />
                                                    </div>
                                                </label>
                                                <input type="file" id="userPhoto" onChange={uploadUserProfilePicFile} className='hidden' />
                                            </div>

                                            {/* cover photo */}
                                            <div>
                                                <h1 className='font-medium mb-2 text-center'>Change Cover Photo</h1>
                                                <label htmlFor="coverPhoto">
                                                    {profileUser.coverPhotoURL && <Image src={profileUser.coverPhotoURL} alt='cover photo picture' height={200} width={350} className="cursor-pointer hover:opacity-50 h-48 shadow-lg rounded-lg" />}
                                                </label>
                                                <input type="file" id="coverPhoto" onChange={uploadCoverPhotoFile} className="hidden" />
                                            </div>
                                        </div>

                                        <div className='flex flex-row w-full gap-16 bg-snow p-4'>
                                            {/* Display Name */}
                                            <div className="w-full">
                                                <label
                                                    htmlFor="display-name"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    <span>Display Name</span>
                                                    <span className="text-red-500"> *</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id='display-name'
                                                    className="p-2 border rounded-md w-full"
                                                    placeholder="Enter your username"
                                                    maxLength={30}
                                                    minLength={1}
                                                    value={editedDisplayName}
                                                    onChange={(e) => { handleDisplayNameVal(e.target.value) }}
                                                    required
                                                />

                                                <DisplayNameMessage editedDisplayName={editedDisplayName} editedDisplayNameValid={editedDisplayNameValid} />
                                            </div>

                                            {/* location */}
                                            <div className="w-full">
                                                <label
                                                    htmlFor="location"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    id='location'
                                                    name="location"
                                                    className="p-2 border rounded-md w-full"
                                                    placeholder="Enter your Location"
                                                    value={editedLocation}
                                                    onChange={(e) => setEditedLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* about */}
                                        <div className="bg-snow p-4">
                                            <label
                                                htmlFor="about"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                About
                                            </label>
                                            <textarea
                                                id='about'
                                                className="mt-1 p-2 border rounded-lg w-full resize-none"
                                                rows="3"
                                                placeholder="Tell us about yourself..."
                                                value={editedAbout}
                                                onChange={e => setEditedAbout(e.target.value)}
                                            />
                                        </div>

                                        <div className='flex flex-row w-full justify-evenly'>
                                            {/* gender not editable */}
                                            <div className='font-medium'>
                                                <p>Gender: {gender}</p>
                                            </div>

                                            {/* birthdate not editable */}
                                            <div className="font-medium">
                                                <p>Birthdate: {birthdate}</p>
                                            </div>
                                        </div>


                                        {/* TODO: Add functionality for Cancel button */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleEditProfileSave} disabled={!editedDisplayNameValid}
                                                type="submit"
                                                className={`py-2 px-4 rounded-md bg-pistachio text-white transition-all ${(!isUploadingCoverPhoto && editedDisplayNameValid) ? 'hover:scale-105 active:scale-100' : 'opacity-50'}`}
                                            >
                                                Save
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setShowEditProfile(false)}
                                                className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </Modal>
                            ) : (null)}

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
                            <div className="text-center mt-10 flex flex-col gap-2 w-full max-w-full">
                                <div className="text-lg font-bold text-raisin_black">About</div>
                                <div className="text-base text-raisin_black pl-6 pr-6 whitespace-normal break-all w-full max-w-full">
                                    {about}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="mt-6 flex flex-col items-center w-full gap-4">
                                {hidden && !hidden.includes('location') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <p>{location}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('gender') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-venus-mars"></i>
                                        <p>{gender}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('contactNumber') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-phone"></i>
                                        <p>096969696969</p>{/* I just put a hardcoded value for now since di pa defined */}
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('email') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-envelope"></i>
                                        <p>placeholder@email.com</p> {/* I just put a hardcoded value for now since di pa defined */}
                                    </div>
                                ) : ''}
                            </div>

                        </div>

                        <div id='main-content-container' className='flex flex-col translate-x-80 w-[calc(100%-20rem)]'>
                            <div id="tab-actions" className="flex flex-row bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300">
                                <button
                                    className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Posts' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Posts')}>
                                    Posts
                                </button>
                                <button
                                    className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Pets' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Pets')}>
                                    Pets
                                </button>
                                <button
                                    className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Media' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Media')}>
                                    Media
                                </button>
                                <button
                                    className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Lost Pets' ? 'bg-citron text-white' : ''
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
                                        className="flex flex-col items-center justify-center w-full"
                                    >

                                        {currentUserID === profileUserID ? (
                                            <div id='create-post' className='mt-10 shadow-sm bg-snow w-[800px] h-[100px] rounded-3xl p-6 flex flex-col'>

                                                <div className='flex flex-row w-full h-full items-center'>
                                                    <div className='h-[50px] w-[50px] flex items-center'>
                                                        <RoundIcon src={userPhotoURL} alt={username + " profile picture"} />
                                                    </div>

                                                    <button className='flex flex-col w-full h-full ml-4'>
                                                        <div
                                                            className='w-full h-full text-raisin_black text-md bg-white rounded-2xl p-2 pl-4 focus:outline-none flex items-center hover:bg-neutral-50 hover:cursor-pointer'
                                                            onClick={() => setShowCreatePostForm(true)}
                                                        >
                                                            What`s on your mind?
                                                        </div>
                                                    </button>
                                                </div>

                                                <Modal
                                                    isOpen={showCreatePostForm}
                                                    onRequestClose={() => setShowCreatePostForm(false)}
                                                    style={createPostModalStyle}
                                                >
                                                    <CreatePost 
                                                        props={{
                                                            currentUserID: currentUserID,
                                                            pets: pets,
                                                            displayName: displayName,
                                                            username: username,
                                                            userPhotoURL: userPhotoURL,
                                                            setShowCreatePostForm: setShowCreatePostForm
                                                        }}
                                                    />
                                                </Modal>
                                            </div>
                                        ) : null}

                                        <div className="flex mt-10 mb-10 flex-col gap-10">
                                            {posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate))
                                                .map((post) => (
                                                    <PostSnippet key={post.id} 
                                                        props={{
                                                            currentUserID: currentUserID,
                                                            postID: post.id,
                                                            postBody: post.postBody,
                                                            postCategory: post.postCategory,
                                                            postPets: post.postPets,
                                                            postDate: post.postDate,
                                                            imageUrls: post.imageUrls,
                                                            authorID: post.authorID,
                                                            authorDisplayName: post.authorDisplayName,
                                                            authorUsername: post.authorUsername,
                                                            authorPhotoURL: post.authorPhotoURL,
                                                            likes: post.likes,
                                                            comments: post.comments,
                                                        }} 
                                                    />
                                                ))
                                            }
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
                                                <div className="grid grid-cols-4 gap-12">
                                                    {pets.map((pet) => (
                                                        <div key={pet.id} className="w-36 h-36 rounded-xl">
                                                            <Link href={`/pet/${pet.id}`} className='rounded-lg hover:opacity-80 flex flex-col'>
                                                                <RoundIcon
                                                                    src={pet.photoURL}
                                                                    alt='pet profile picture'
                                                                    height={144}
                                                                    width={144}
                                                                />
                                                            </Link>

                                                            <div className='mt-2 flex flex-row items-center justify-center'>
                                                                <div className='text-center text-lg font-bold'>
                                                                    {pet.petName}
                                                                </div>
                                                                <div>
                                                                    {currentUserID === profileUserID ? (
                                                                        <button
                                                                            className='text-sm rounded-lg ml-2 justify-center items-center hover:text-red-600'
                                                                            onClick={() => handleDeletePetProfile(pet.id)}>
                                                                            <i class="fa-solid fa-trash"></i>
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )).reverse()}

                                                    {/* delete pet profile confirmation modal */}
                                                    {getCurrentUser && currentUserID === profileUserID ? (
                                                        <Modal
                                                            isOpen={showPetDeleteConfirmation}
                                                            onRequestClose={() => setShowPetDeleteConfirmation(false)}
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
                                                                        onClick={() => setShowPetDeleteConfirmation(false)}
                                                                        className='rounded-lg pl-2 pr-2 pt-1 pb-1 hover:opacity-80 hover:bg-black hover:text-white font-bold'
                                                                    >
                                                                        Cancel</button>
                                                                </div>
                                                            </div>
                                                        </Modal>
                                                    ) : null}

                                                    {/* create pet profile modal */}
                                                    {showCreatePetForm ? (
                                                        <Modal
                                                            isOpen={showCreatePetForm}
                                                            onRequestClose={() => setShowCreatePetForm(false)}
                                                            contentLabel="Create Pet Profile Label"
                                                            style={createPetModalStyle}
                                                        >
                                                            <PetAccountSetup
                                                                props={{
                                                                    profileUserID: profileUserID,
                                                                    currentUserID: currentUserID,
                                                                    username: username,
                                                                    displayName: displayName,
                                                                    userPhotoURL: userPhotoURL,
                                                                    coverPhotoURL: coverPhotoURL,
                                                                    location: location,
                                                                    setShowCreatePetForm: setShowCreatePetForm
                                                                }}
                                                            />
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

function DisplayNameMessage({ editedDisplayName, editedDisplayNameValid, loading }) {
    if (loading) {
        return <p className='mt-2 ml-2'>Checking...</p>;
    } else if (editedDisplayName === '') {
        return null;
    } else if (editedDisplayName.length < 1 || editedDisplayName.length > 30 && !editedDisplayNameValid) {
        return <p className="mt-2 ml-2">Display name should have 1-30 characters!</p>;
    } else if (String(editedDisplayName).includes('  ')) {
        return <p className="mt-2 ml-2">Please have only one space in-between.</p>;
    } else if ((String(editedDisplayName).startsWith(' ') || String(editedDisplayName).endsWith(' ')) && !editedDisplayNameValid) {
        return <p className="mt-2 ml-2">No spaces allowed at either end.</p>;
    }
    // else if (!displayNameValid) {
    //     return <p className="mt-2 ml-2">Only periods and underscores allowed for special characters.</p>;
    // } 
}

function PetNameMessage({ petName, petNameValid, loading }) {
    if (loading) {
        return <p className='mt-2 ml-2'>Checking...</p>;
    } else if (petName === '') {
        return null;
    } else if (String(petName).length < 3 && String(petName).length > 15 && !petNameValid) {
        return <p className='mt-2 ml-2'>Pet name should have 3-15 characters!</p>;
    } else if (String(petName).includes('  ')) {
        return <p className="mt-2 ml-2">Please have only one space in-between.</p>;
    } else if ((String(petName).startsWith(' ') || String(petName).endsWith(' ')) && !petNameValid) {
        return <p className="mt-2 ml-2">No spaces allowed at either end.</p>;
    } else if (!petNameValid) {
        return <p className="mt-2 ml-2">Only periods and underscores allowed for special characters.</p>;
    }
}

function PetAccountSetup({ props }) {

    const {
        profileUserID, currentUserID, username,
        displayName, location,
        userPhotoURL, coverPhotoURL,
        setShowCreatePetForm
    } = props;

    const [petName, setPetName] = useState(null);
    const [petNameValid, setPetNameValid] = useState(false);
    const [petAbout, setPetAbout] = useState(null);
    const [petSex, setPetSex] = useState(null);
    const [petBirthdate, setPetBirthdate] = useState(null);
    const [petBirthplace, setPetBirthplace] = useState(location);
    const [petBreed, setPetBreed] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);

    const handleCreatePetProfile = async (e) => {
        e.preventDefault();

        try {
            if (profileUserID !== currentUserID) {
                toast.error("You can only create a pet profile for your own user profile.");
                return;
            }

            const petRef = firestore.collection('pets');
            const newPetRef = petRef.doc();
            const storageRef = storage.ref(`petProfilePictures/${newPetRef.id}/profilePic`);

            const batch = firestore.batch();

            batch.set(newPetRef, {
                petOwnerID: currentUserID,
                petOwnerUsername: username,
                petOwnerDisplayName: displayName,
                petOwnerPhotoURL: userPhotoURL,
                petOwnerCoverPhotoURL: coverPhotoURL,

                petName: petName,
                about: petAbout,
                sex: petSex,
                breed: petBreed,
                birthdate: petBirthdate,
                birthplace: petBirthplace,
                followers: [],
                following: []
            });

            // add petID reference to user's pets array
            const userRef = firestore.collection('users').doc(currentUserID);
            batch.update(userRef, {
                pets: arrayUnion(newPetRef.id)
            });

            const uploadTask = storageRef.put(petPhotoURL);
            await uploadTask;

            const downloadURL = await storageRef.getDownloadURL();

            if (!downloadURL) {
                throw new Error('No download URL!');
            }

            batch.update(newPetRef, {
                photoURL: downloadURL
            });

            await batch.commit();

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
            window.location.href = "/pet/" + newPetRef.id;
        } catch (error) {
            toast.error('Error creating pet profile: ' + error.message);
        }
    };

    const handlePetDisplayNameVal = (val) => {
        const checkDisplayNameVal = val;
        const regex = /^[a-zA-Z0-9_.]*[a-zA-Z0-9](?:[a-zA-Z0-9_.]*[ ]?[a-zA-Z0-9_.])*[a-zA-Z0-9_.]$/;

        if (checkDisplayNameVal.startsWith(' ') || checkDisplayNameVal.endsWith(' ')) {
            setPetName(checkDisplayNameVal);
            setPetNameValid(false);
        } else if (checkDisplayNameVal.length >= 3 && checkDisplayNameVal.length <= 15) {
            setPetName(checkDisplayNameVal);
            setPetNameValid(true);
        } else if (checkDisplayNameVal.length < 3 || checkDisplayNameVal.length > 15) {
            setPetName(checkDisplayNameVal);
            setPetNameValid(false);
        } else if (!regex.test(checkDisplayNameVal)) {
            setDisplayName(checkDisplayNameVal);
            setPetNameValid(false);
        }
    };

    return (
        <form onSubmit={handleCreatePetProfile} className='flex flex-col h-fit justify-between'>
            <h2 className="font-bold text-xl gap-2 flex flex-row items-center">
                <i className='fa-solid fa-paw'></i>
                Add a New Pet
            </h2>

            <div className='h-full flex flex-col justify-start'>
                {/* Display Name */}
                <div className="mb-4">
                    <label
                        htmlFor="displayname"
                        className="block text-sm font-medium text-gray-700 pt-5"
                    >
                        <span>Display Name</span>
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        type="text"
                        id="display-name"
                        className="mt-1 p-2 border rounded-md w-full"
                        placeholder="Enter your pet's name"
                        maxLength={15}
                        value={petName}
                        onChange={(e) => { handlePetDisplayNameVal(e.target.value) }}
                        required
                    />

                    <PetNameMessage petName={petName} petNameValid={petNameValid} />
                </div>

                {/* Breed */}
                <div className="mb-4">
                    <label
                        htmlFor="breed"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Breed
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        type="text"
                        className="mt-1 p-2 border rounded-md w-full"
                        placeholder="Enter your pet's breed"
                        value={petBreed}
                        maxLength={50}
                        onChange={(e) => setPetBreed(e.target.value)}
                        required
                    />
                </div>

                {/* Photo */}
                <div className='mb-4'>
                    <label htmlFor="photo" className='block text-sm font-medium text-gray-700 mb-1'>
                        Upload Photo
                        <span className="text-red-500"> *</span>
                    </label>
                    <input type="file" id="photo" onChange={e => setPetPhotoURL(e.target.files[0])} required />
                </div>

                {/* About */}
                <div className="mb-3">
                    <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700"
                    >
                        About
                        <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                        id="bio"
                        className="mt-1 p-2 border rounded-md w-full resize-none"
                        rows="4"
                        placeholder="Tell us about your pet..."
                        value={petAbout}
                        maxLength={100}
                        onChange={(e) => setPetAbout(e.target.value)}
                        required
                    />
                </div>

                {/* sex, birthdate, birthplace */}
                <div className='flex flex-row gap-4 w-full'>
                    {/* Sex */}
                    <div className="mb-4 w-full">
                        <label
                            htmlFor="sex"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Sex
                            <span className="text-red-500"> *</span>
                        </label>
                        <select
                            id="sex"
                            name="sex"
                            className="mt-1 p-2 h-10 border rounded-md w-full"
                            value={petSex}
                            onChange={(e) => setPetSex(e.target.value)}
                            required
                        >
                            <option value="Prefer Not to Say">Prefer Not to Say</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    {/* Birthdate */}
                    <div className="mb-4 w-full">
                        <label
                            htmlFor="birthdate"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Year of Birth
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="text"
                            id="birthyear"
                            name="birthyear"
                            placeholder='2023'
                            minLength={4}
                            maxLength={4}
                            className="mt-1 p-2 h-10 border rounded-md w-full"
                            value={petBirthdate}
                            onChange={(e) => setPetBirthdate(e.target.value)}
                            required
                        />
                    </div>

                    {/* place of birth */}
                    <div className="mb-4 w-full">
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Place of Birth
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="text"
                            className="mt-1 p-2 h-10 border rounded-md w-full"
                            placeholder={petBirthplace}
                            value={petBirthplace}
                            onChange={(e) => setPetBirthplace(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* form button controls */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!petNameValid}
                    className={`py-2 px-4 rounded-md bg-pistachio text-white transition-all ${petNameValid ? 'hover:scale-105 active:scale-100' : 'opacity-50'}`}>
                    Create Pet Profile
                </button>

                <button
                    type="button"
                    className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                    onClick={() => setShowCreatePetForm(false)}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default withAuth(UserProfilePage);