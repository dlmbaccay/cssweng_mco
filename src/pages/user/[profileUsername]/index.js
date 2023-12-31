import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { useRouter } from 'next/router';

import { firestore, storage, STATE_CHANGED } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';
import { useUserData, usePetData, useUserIDfromUsername, useAllUserPosts } from '@/src/lib/hooks'
import { createPetModalStyle, confirmationModalStyle, createPostModalStyle, editUserProfileStyle, phoneNavModalStyle } from '../../../lib/modalstyle';

import ExpandedNavBar from '@/src/components/ExpandedNavBar';
import PhoneNav from '@/src/components/PhoneNav';
import RoundIcon from '@/src/components/RoundIcon';
import CoverPhoto from '@/src/components/CoverPhoto';
import PostSnippet from '@/src/components/Post/PostSnippet';
import CreatePost from '@/src/components/Post/CreatePost';
import RepostSnippet from '@/src/components/Post/RepostSnippet';
import withAuth from '@/src/components/withAuth';
import { arrayUnion } from 'firebase/firestore';
import Loader from '@/src/components/Loader';


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

    // variables for user profile
    const [username, setUsername] = useState(null);
    const [about, setAbout] = useState(null);
    const [displayName, setDisplayName] = useState(null);
    const [email, setEmail] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
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
    const [editedPhoneNumber, setEditedPhoneNumber] = useState(null);

    // variables for pet profile and pet deletion
    const [showCreatePetForm, setShowCreatePetForm] = useState(false);
    const [showPetDeleteConfirmation, setShowPetDeleteConfirmation] = useState(false);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [deletingPetName, setDeletingPetName] = useState(null);
    const [deletingPetPicture, setDeletingPetPicture] = useState(null);

    // misc variables
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
    const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('Posts');
    const [editedDisplayNameValid, setEditedDisplayNameValid] = useState(true);

    // create post variables
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);

    const [currentUserUsername, setCurrentUserUsername] = useState(null);
    const [currentUserPhotoURL, setCurrentUserPhotoURL] = useState(null);

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

    }, []);

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
                setUserPhotoURL(doc.data()?.photoURL);
                setCoverPhotoURL(doc.data()?.coverPhotoURL);
                setHidden(doc.data()?.hidden);

                setFollowers(doc.data()?.followers);
                setFollowing(doc.data()?.following);

                setBirthdate(doc.data()?.birthdate);
                setGender(doc.data()?.gender);
                setEmail(doc.data()?.email);
                setPhoneNumber(doc.data()?.phoneNumber);
                setLocation(doc.data()?.location);

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

        if (currentUserID) { // info of the current user
            const userRef = firestore.collection('users').doc(currentUserID);
            unsubscribe = userRef.onSnapshot((doc) => {
                setCurrentUser({
                    id: doc.id,
                    ...doc.data()
                });
                setCurrentUserUsername(doc.data()?.username);
                setCurrentUserPhotoURL(doc.data()?.photoURL);
            });
        } else {
            setCurrentUser(null);
            setCurrentUserUsername(null);
            setCurrentUserPhotoURL(null);
        }

        return unsubscribe;
    }, [currentUserID, profileUserID]);

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

    const handleCancelEditProfile = () => {
        setShowEditProfile(false);

        // Reset the edited values to the current values
        setEditedDisplayName(displayName);
        setEditedAbout(about);
        setEditedLocation(location);
    }

    const handleEditProfileSave = async () => {
        const userRef = firestore.collection('users').doc(profileUserID);
        const batch = firestore.batch();

        try {
            const uploadFile = async (ref, file, field) => {
                const task = ref.put(file);
                task.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                    },
                    (error) => {
                        toast.error('Error uploading file.');
                    },
                    async () => {
                        toast.success('Photo uploaded successfully!');
                        let url = await task.snapshot.ref.getDownloadURL();
                        const userRef = firestore.doc(`users/${currentUserID}`);
                        userRef.update({ [field]: url });
                    }
                );
            };

            if (selectedCoverFile) {
                await uploadFile(storage.ref(`profilePictures/${profileUserID}/coverPic`), selectedCoverFile, 'coverPhotoURL');
            }
            if (selectedProfileFile) {
                await uploadFile(storage.ref(`profilePictures/${profileUserID}/profilePic`), selectedProfileFile, 'photoURL');
            }



            const updateData = {
                displayName: editedDisplayName,
                about: editedAbout,
                location: editedLocation
            };

            batch.update(userRef, updateData);

            await batch.commit();
            setShowEditProfile(false);
            setSelectedProfileFile(null);
            setSelectedCoverFile(null);
            setPreviewCoverUrl(null);
            setPreviewProfileUrl(null);
            toast.success('User profile updated successfully!');

        } catch (error) {
            toast.error('Error saving profile:' + error);
        }
    }

    const [selectedProfileFile, setSelectedProfileFile] = useState(null);
    const [previewProfileUrl, setPreviewProfileUrl] = useState(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState(null);
    const [previewCoverUrl, setPreviewCoverUrl] = useState(null);

    const handleProfileFileSelect = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add more allowed types if needed

        if (file !== undefined && allowedTypes.includes(file.type)) {
            setSelectedProfileFile(file);
            setPreviewProfileUrl(URL.createObjectURL(file));
        } else {
            event.target.value = null;
            setSelectedProfileFile(null);
            setPreviewProfileUrl(null);
            toast.error('Invalid file type. Only PNG, JPEG, and GIF allowed.')
        }
    };

    const handleCoverFileSelect = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add more allowed types if needed

        if (file !== undefined && allowedTypes.includes(file.type)) {
            setSelectedCoverFile(file);
            setPreviewCoverUrl(URL.createObjectURL(file));
        } else {
            event.target.value = null;
            setSelectedCoverFile(null);
            setPreviewCoverUrl(null);
            toast.error('Invalid file type. Only PNG, JPEG, and GIF allowed.')
        }
    };

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
            // Show toast notification based on whether the user was followed or unfollowed
            if (isFollowing) {
                toast.success('Unfollowed successfully!');
            } else {
                toast.success('Followed successfully!');
            }

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

    const [posts, setPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allPostsLoaded, setAllPostsLoaded] = useState(false);

    useEffect(() => {
        setLoading(true);

        const q = query(
            collection(firestore, "posts"),
            where("authorID", "==", profileUserID),
            orderBy("postDate", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setPosts(newPosts);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [profileUserID]);

    const fetchMorePosts = async () => {
        if (!lastVisible || loading) return;

        setLoading(true);
        const nextQuery = query(
            collection(firestore, "posts"),
            where("authorID", "==", profileUserID),
            orderBy("postDate", "desc"),
            startAfter(lastVisible),
            limit(5)
        );

        const querySnapshot = await getDocs(nextQuery);
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (newPosts.length === 0) {
            setAllPostsLoaded(true);
        } else {
            setLastVisible(newLastVisible);
            setPosts(prevPosts => [...prevPosts, ...newPosts]);
            setAllPostsLoaded(false);
        }

        setLoading(false);
    };

    const refreshPosts = async () => {
        setLoading(true);
        const refreshQuery = query(
            collection(firestore, "posts"),
            where("authorID", "==", profileUserID),
            orderBy("postDate", "desc"),
            limit(5)
        );

        const querySnapshot = await getDocs(refreshQuery);
        const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(refreshedPosts);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAllPostsLoaded(false);
        setLoading(false);
    };

    const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);

    const isUser = currentUserID == profileUserID;

    return (
        
        <div id="root" className='flex flex-row h-screen'>
            {loading ? <Loader show={loading}/> : 
            (<>
            <div className='w-fit md:flex hidden'>
                <ExpandedNavBar
                    props={{
                        userPhotoURL: currentUserPhotoURL,
                        username: currentUserUsername,
                        activePage: "Profile",
                        expanded: false,
                        notifications: getCurrentUser.notifications,
                        lostPetPostsCount: getCurrentUser.lostPetPostsCount
                    }}
                />
            </div>

            {profileUser &&

                <div className="h-screen w-full overflow-hidden">

                    <nav className='w-full h-14 bg-snow flex justify-between items-center md:hidden drop-shadow-sm'>
                        <div className='h-full w-fit flex flex-row items-center gap-1'>
                            <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full' />
                            <h1 className='font-shining text-4xl text-grass'>BantayBuddy</h1>
                        </div>

                        <button onClick={() => setShowPhoneNavModal(true)}>
                            <i className='fa-solid fa-bars text-xl w-[56px] h-[56px] flex items-center justify-center' />
                        </button>

                        <Modal
                            isOpen={showPhoneNavModal}
                            onRequestClose={() => setShowPhoneNavModal(false)}
                            style={phoneNavModalStyle}
                        >
                            <PhoneNav
                                props={{
                                    setShowPhoneNavModal: setShowPhoneNavModal,
                                    currentUserUsername: currentUserUsername,
                                    currentUserPhotoURL: currentUserPhotoURL,
                                    notifications: getCurrentUser.notifications,
                                    lostPetPostsCount: getCurrentUser.lostPetPostsCount,
                                }}
                            />
                        </Modal>
                    </nav>

                    <div id='header-container' className='h-1/5 border-l border-neutral-300 hidden md:block'>
                        <CoverPhoto src={profileUser.coverPhotoURL} alt={profileUser.username + " cover photo"} />
                    </div>

                    <div id='content-container' className='h-full md:h-4/5 flex flex-row'>

                        {/* Profile Picture */}
                        <div className="hidden md:flex absolute justify-center w-80 h-44">
                            <div className='rounded-full z-10
                                -translate-y-40 w-32 h-32 -translate-x-14
                                lg:w-44 lg:h-44 lg:-translate-y-24 lg:translate-x-0'>
                                <Image
                                    src={userPhotoURL}
                                    alt={username + " profile picture"}
                                    fill='fill'
                                    objectFit='cover'
                                    className='rounded-full shadow-lg aspect-square object-cover'
                                />
                            </div>
                        </div>

                        {/* Left Panel */}
                        <div className="fixed hidden lg:flex flex-col lg:w-80 h-4/5 bg-snow border border-neutral-300 justify-start items-center">

                            {/* Display Name & Username */}
                            <div className="text-center mt-24 w-80">
                                <div className="text-xl font-bold text-raisin_black ">
                                    {displayName}
                                </div>

                                <div className='text-md text-raisin_black'>
                                    @{username}
                                </div>
                            </div>

                            {/* Edit button */}
                            {currentUserID === profileUserID ? (
                                <button
                                    onClick={handleEditProfile}
                                    className="text-center mt-4 w-20 px-2 py-1 bg-citron hover:bg-xanthous transition-all shadow-lg text-snow font-bold rounded-lg border-none"
                                >
                                    Edit
                                </button>
                            ) :
                                // Follow Button
                                <button
                                    onClick={handleFollow}
                                    className="text-center mt-4 w-32 px-2 py-1 bg-citron hover:bg-xanthous transition-all shadow-lg text-snow font-bold rounded-lg border-none"
                                >
                                    {profileUser.followers.includes(currentUserID) ? 'Following' : 'Follow'}
                                </button>
                            }

                            {/* edit user profile modal */}
                            {currentUserID === profileUserID ? (
                                <Modal
                                    isOpen={showEditProfile}
                                    onRequestClose={() => setShowEditProfile(false)}
                                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full h-full md:w-[70%] lg:w-[50%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow '
                                    style={{
                                        overlay: {
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1000,

                                        }
                                    }}
                                >
                                    <div className='w-full h-full flex flex-col justify-between pr-2'>
                                        <div className='flex flex-row items-center justify-between'>
                                            <h1 className="font-bold text-lg">Edit {username}`s Profile</h1>
                                            <i className='fa-solid fa-xmark md:hidden' onClick={handleCancelEditProfile} />
                                        </div>

                                        <div className='flex flex-col md:flex-row w-full h-fit gap-6 justify-evenly'>
                                            <div className='flex flex-col items-center justify-evenly p-4 gap-8 rounded-lg h-full'>
                                                {/* profile picture */}
                                                <div className="items-center justify-center">
                                                    <h1 className='font-medium mb-2 text-center'>Change Profile Picture</h1>
                                                    <label htmlFor="userPhoto">
                                                        <div className="flex justify-center w-40 h-40 cursor-pointer rounded-full shadow-lg hover:opacity-50">
                                                            {previewProfileUrl ? (<RoundIcon src={previewProfileUrl} alt={"Preview"} />) :
                                                                (<RoundIcon src={profileUser.photoURL} alt={profileUser.username + " profile picture"} />)}
                                                        </div>
                                                    </label>
                                                    <input type="file" id="userPhoto" onChange={handleProfileFileSelect} className='hidden' />
                                                </div>

                                                {/* cover photo */}
                                                <div>
                                                    <h1 className='font-medium mb-2 text-center'>Change Cover Photo</h1>
                                                    <label htmlFor="coverPhoto">
                                                        <div className='relative mx-auto w-full' style={{ height: '150px', width: '250px' }}>
                                                            {previewCoverUrl ? (
                                                                <Image src={previewCoverUrl} alt="Preview" layout='fill' className='object-cover rounded-lg' />
                                                            ) : (profileUser.coverPhotoURL && <Image src={profileUser.coverPhotoURL} alt={profileUser.username + " cover photo"} layout='fill' className='object-cover rounded-lg' />)}
                                                        </div>
                                                    </label>
                                                    <input type="file" id="coverPhoto" onChange={handleCoverFileSelect} className="hidden" />
                                                </div>
                                            </div>

                                            <div className='flex flex-col md:w-[50%] w-full gap-4 h-full rounded-lg justify-center items-center mb-6 md:mb-0 pr-8 pl-8 md:pr-0 md:pl-0'>
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

                                                {/* Location */}
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

                                                {/* About */}
                                                <div className="w-full">
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
                                                        maxLength={100}
                                                        onChange={e => setEditedAbout(e.target.value)}
                                                    />
                                                </div>

                                                <div className='flex flex-col w-full items-center h-full gap-4 rounded-lg'>
                                                    <div className='flex flex-row gap-2 items-center'>
                                                        <i className="fa-solid fa-phone"></i>
                                                        <p>{phoneNumber}</p>
                                                    </div>

                                                    <div className='flex flex-row gap-2 items-center'>
                                                        <i className="fa-solid fa-envelope"></i>
                                                        <p>{email}</p>
                                                    </div>

                                                    <div className='flex flex-row w-full justify-evenly'>
                                                        <div className='flex flex-row gap-2 items-center'>
                                                            <i className="fa-solid fa-calendar"></i>
                                                            <p>{birthdate}</p>
                                                        </div>

                                                        <div className='flex flex-row gap-2 items-center'>
                                                            <i className="fa-solid fa-venus-mars"></i>
                                                            <p>{gender}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex w-full justify-end gap-4 pb-6 md:pb-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEditProfile}
                                                className="w-20  h-10 rounded-md ml-5 transition-all hover:bg-raisin_black hover:text-white font-semibold"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={handleEditProfileSave} disabled={!editedDisplayNameValid}
                                                type="submit"
                                                className={`w-20 h-10 rounded-md bg-xanthous font-semibold text-white transition-all ${(!isUploadingCoverPhoto && editedDisplayNameValid) ? 'hover:bg-pistachio' : 'opacity-50'}`}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </Modal>
                            ) : (null)}

                            {/* Followers and Following */}
                            {profileUser ? (
                                <div className="text-center mt-6 flex flex-row gap-10 w-80 items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-raisin_black font-bold">{followers.length}</span>
                                        <span className="text-grass font-bold text-sm">Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-raisin_black font-bold">{following.length}</span>
                                        <span className="text-grass font-bold text-sm">Following</span>
                                    </div>
                                </div>
                            ) : (null)}

                            {/* About */}
                            <div className="text-center mt-6 flex flex-col gap-2 w-full max-w-full">
                                <div className="text-lg font-bold text-raisin_black">About</div>
                                <div className="text-base text-raisin_black pl-6 pr-6 whitespace-normal break-all w-full max-w-full">
                                    {about}
                                </div>
                            </div>

                            {/* Details */}
                            <div className='mt-4 mb-2 flex flex-col w-full gap-2 items-center' alt>
                                {hidden && !hidden.includes('location') ? (
                                    <div id="icons" className='group flex flex-row gap-2 items-center text-sm'>
                                        <i className="fa-solid fa-location-dot"></i>
                                        <span class="group-hover:opacity-100 transition-opacity text-white bg-black px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -translate-y-full opacity-0 m-4 mx-auto">Location</span>
                                        <p>{location}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('gender') ? (
                                    <div id="icons" className='group flex flex-row gap-2 items-center text-sm'>
                                        <i className="fa-solid fa-venus-mars"></i>
                                        <span class="group-hover:opacity-100 transition-opacity text-white bg-black px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -translate-y-full opacity-0 m-4 mx-auto">Gender</span>
                                        <p>{gender}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('birthdate') ? (
                                    <div id="icons" className='group flex flex-row gap-2 items-center text-sm'>
                                        <i className="fa-solid fa-calendar "></i>
                                        <span class="group-hover:opacity-100 transition-opacity text-white bg-black px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -translate-y-full opacity-0 m-4 mx-auto">Birthdate</span>
                                        <p>{birthdate}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('contactNumber') ? (
                                    <div id="icons" className='group flex flex-row gap-2 items-center text-sm'>
                                        <i className="fa-solid fa-phone"></i>
                                        <span class="group-hover:opacity-100 transition-opacity text-white bg-black px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -translate-y-full opacity-0 m-4 mx-auto">Number</span>
                                        <p>{phoneNumber}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('email') ? (
                                    <div id="icons" className='group flex flex-row gap-2 items-center text-sm'>
                                        <i className="fa-solid fa-envelope "></i>
                                            <span class="group-hover:opacity-100 transition-opacity text-white bg-black px-1 text-sm text-gray-100 rounded-md absolute left-1/2 -translate-x-1/2 -translate-y-full opacity-0 m-4 mx-auto">E-mail</span>
                                        <p>{email}</p>
                                    </div>
                                ) : ''}
                            </div>

                        </div>

                        {/* Main Container */}
                        <div id='main-content-container' className='overflow-hidden flex flex-col lg:translate-x-80 lg:w-[calc(100%-20rem)] w-full'>
                            <div id='flex-profile-details' className='lg:hidden w-full h-20 md:h-12 bg-snow flex flex-row items-center md:pl-10 gap-8 md:justify-start justify-center'>
                                <div className='flex flex-col h-fit items-center md:flex-row md:gap-2'>
                                    <p className='font-bold'>
                                        {profileUser.displayName}
                                    </p>
                                    <p className='font-bold md:flex hidden'>·</p>
                                    <p className='font'>
                                        @{profileUser.username}
                                    </p>
                                </div>

                                <div className='flex flex-col h-fit items-center md:flex-row md:gap-2 gap-1'>
                                    {/* followers */}
                                    <div className='flex flex-row gap-2 items-center'>
                                        <p className='font-semibold text-sm'>{profileUser.followers.length}</p>
                                        <p className='text-grass font-bold text-sm'>Followers</p>
                                    </div>

                                    <div className='flex flex-row gap-2 items-center'>
                                        <p className='font-semibold text-sm'>{profileUser.following.length}</p>
                                        <p className='text-grass font-bold text-sm'>Following</p>
                                    </div>
                                </div>

                                {profileUserID === currentUserID ?
                                    (<button
                                        onClick={() => setShowEditProfile(true)}
                                        className='text-sm font-semibold text-white bg-citron w-12 md:h-6 h-8 rounded-md'
                                    >
                                        Edit
                                    </button>) :
                                    (
                                        <button
                                            onClick={handleFollow}
                                            className='text-sm font-semibold text-white bg-citron w-20 md:h-6 h-8 rounded-md'
                                        >
                                            {profileUser.followers.includes(currentUserID) ? 'Following' : 'Follow'}
                                        </button>
                                    )
                                }
                            </div>

                            <div id="tab-actions" className="flex flex-row h-12 font-shining bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300 drop-shadow-sm md:justify-start justify-between">
                                <button
                                    className={`w-1/2 md:w-fit text-sm md:text-base px-14 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Posts' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Posts')}>
                                    Posts
                                </button>
                                <button
                                    className={`w-1/2 md:w-fit text-sm md:text-base px-14 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Pets' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Pets')}>
                                    Pets
                                </button>
                            </div>

                            <div id="tab-container" className='overflow-y-scroll h-full bg-[#FAFAFA]'>
                                {/* Posts */}
                                {activeTab === 'Posts' && (
                                    <div
                                        id="showcase"
                                        className="flex flex-col items-center justify-start w-full "
                                    >
                                        {/* if no posts yets */}
                                        {((currentUserID !== profileUserID) && (posts.length === 0)) && (
                                            <div className="w-full p-20 pl-24 pr-24 flex justify-center">

                                                {/* if no media... */}
                                                <div className='flex flex-col items-center justify-center h-full w-full'>
                                                    <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                                    <div className='mt-2 font-bold text-grass text-sm md:text-base'>Nothing to see here yet...</div>
                                                </div>

                                            </div>
                                        )}

                                        {currentUserID === profileUserID ? (
                                            <div
                                                className='group flex flex-row w-screen md:w-[650px] md:h-[80px] bg-snow drop-shadow-sm rounded-lg justify-evenly items-center hover:drop-shadow-md p-3 md:p-2 gap-2 md:mt-8'>

                                                {userPhotoURL && <Image
                                                    src={userPhotoURL}
                                                    alt="user photo"
                                                    width={100}
                                                    height={100}
                                                    onClick={() => router.push(`/user/${username}`)}
                                                    className='rounded-full h-[50px] w-[50px] hover:opacity-95 transition-all cursor-pointer aspect-square object-cover'
                                                />}

                                                <button onClick={() => setShowCreatePostForm(true)} className='h-[50px] w-[75%] bg-white rounded-md text-left md:pl-4 pl-4 pr-4 text-[11px] lg:text-sm text-raisin_black hover:opacity-60 transition-all'>
                                                    <p>What&apos;s on your mind, {displayName}?</p>
                                                </button>

                                                <button onClick={() => setShowCreatePostForm(true)} className='min-h-[50px] min-w-[50px] bg-white rounded-full text-left text-lg text-raisin_black hover:bg-grass hover:text-pale_yellow transition-all flex items-center justify-center'>
                                                    <i className='fa-solid fa-image' />
                                                </button>

                                                <Modal
                                                    isOpen={showCreatePostForm}
                                                    onRequestClose={() => setShowCreatePostForm(false)}
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full h-full md:w-[70%] lg:w-[50%] md:h-[80%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow"
                                                    style={{
                                                        overlay: {
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            zIndex: 1000,

                                                        }
                                                    }}
                                                >
                                                    <CreatePost
                                                        props={{
                                                            createType: 'original',
                                                            currentUserID: currentUserID,
                                                            reportCount: getCurrentUser.reportCount,
                                                            displayName: displayName,
                                                            username: username,
                                                            userPhotoURL: userPhotoURL,
                                                            setShowCreatePostForm: setShowCreatePostForm,
                                                        }}
                                                    />
                                                </Modal>
                                            </div>
                                        ) : null}

                                        {posts.length > 0 && (
                                            <div className="flex mt-8 mb-20 md:mb-8 flex-col gap-8 justify-start items-center">
                                                {posts.map((post, index) => {
                                                    console.log(`Processing post ${index} with postType: ${post.postType}`);

                                                    if (post.postType === "original") {
                                                        return (
                                                            <div key={post.id}>
                                                                <PostSnippet
                                                                    props={{
                                                                        currentUserID: currentUserID,
                                                                        currentUserPhotoURL: getCurrentUser.userPhotoURL, 
                                                                        currentUserDisplayName: getCurrentUser.displayName, 
                                                                        currentUserName: getCurrentUser.username,
                                                                        postID: post.id,
                                                                        postBody: post.postBody,
                                                                        postCategory: post.postCategory,
                                                                        postTrackerLocation: post.postTrackerLocation,
                                                                        postPets: post.postPets,
                                                                        postDate: post.postDate,
                                                                        imageUrls: post.imageUrls,
                                                                        authorID: post.authorID,
                                                                        authorDisplayName: post.authorDisplayName,
                                                                        authorUsername: post.authorUsername,
                                                                        authorPhotoURL: post.authorPhotoURL,
                                                                        isEdited: post.isEdited,
                                                                        postType: post.postType,
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    } else if (post.postType === 'repost') {
                                                        return (
                                                            <div key={post.id}>
                                                                <RepostSnippet
                                                                    props={{
                                                                        currentUserID: currentUserID,
                                                                        currentUserPhotoURL: getCurrentUser.userPhotoURL, 
                                                                        currentUserDisplayName: getCurrentUser.displayName, 
                                                                        currentUserName: getCurrentUser.username,
                                                                        authorID: post.authorID,
                                                                        authorDisplayName: post.authorDisplayName,
                                                                        authorUsername: post.authorUsername,
                                                                        authorPhotoURL: post.authorPhotoURL,
                                                                        postID: post.id,
                                                                        postDate: post.postDate,
                                                                        postType: 'repost',
                                                                        postBody: post.postBody,
                                                                        isEdited: post.isEdited,
                                                                        repostID: post.repostID,
                                                                        repostBody: post.repostBody,
                                                                        repostCategory: post.repostCategory,
                                                                        repostPets: post.repostPets,
                                                                        repostDate: post.repostDate,
                                                                        repostImageUrls: post.repostImageUrls,
                                                                        repostAuthorID: post.repostAuthorID,
                                                                        repostAuthorDisplayName: post.repostAuthorDisplayName,
                                                                        repostAuthorUsername: post.repostAuthorUsername,
                                                                        repostAuthorPhotoURL: post.repostAuthorPhotoURL,
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                })}

                                                {loading && <div>Loading...</div>}

                                                {allPostsLoaded ? (
                                                    <button
                                                        className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                                                        onClick={refreshPosts}
                                                    >
                                                        Refresh Posts
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all ${loading ? 'hidden' : 'flex'}`}
                                                        onClick={fetchMorePosts}
                                                        disabled={loading}
                                                    >
                                                        Load More
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pets */}
                                {activeTab === 'Pets' && (
                                    <div className="w-full flex justify-center">
                                        {
                                            (profileUserID !== currentUserID && pets.length === 0) ? (
                                                <div className='flex flex-col pt-20 items-center justify-center h-full w-full'>
                                                    <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                                    <div className='mt-2 font-bold text-grass text-sm md:text-base'>Nothing to see here yet...</div>
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col md:flex-row gap-12 items-center justify-start 
                                                    pt-10 pl-10 pr-10 pb-28  
                                                    lg:pl-20 lg:pt-16 lg:pr-20 lg:pb-16  
                                                ">
                                                    {pets.map((pet) => (
                                                        <div key={pet.id} className="rounded-xl">
                                                            <Link href={`/pet/${pet.id}`} className='rounded-full hover:opacity-80 flex flex-col'>
                                                                <Image
                                                                    src={pet.photoURL}
                                                                    alt={pet.petName + " profile picture"}
                                                                    width={144}
                                                                    height={144}
                                                                    className='rounded-full shadow-lg aspect-square object-cover'
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
                                                    ))}

                                                    {profileUserID === currentUserID && (
                                                        <div className="flex flex-col">
                                                            <button onClick={() => setShowCreatePetForm(true)}
                                                                className=''>
                                                                <i className="
                                                                            fa-solid fa-paw text-white rounded-full 
                                                                            md:w-36 md:h-36 p-6 responsive bg-pale_yellow flex items-center
                                                                            justify-center transition-all
                                                                            md:text-7xl text-6xl hover:bg-grass hover:text-pale_yellow" />
                                                            </button>
                                                            <p className='text-center mt-2 text-lg font-bold flex flex-row items-center justify-center'
                                                            >Add Pet</p>
                                                        </div>
                                                    )}

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
                                                                    <Image src={deletingPetPicture} alt="pet profile picture" width={100} height={100} className='rounded-full shadow-lg h-[125px] w-[125px] aspect-square object-cover' />
                                                                </div>

                                                                <div className='flex flex-row items-center gap-4'>

                                                                    <button
                                                                        onClick={() => setShowPetDeleteConfirmation(false)}
                                                                        className='rounded-lg pl-2 pr-2 pt-1 pb-1 hover:opacity-80 hover:bg-black hover:text-white font-bold'
                                                                    >
                                                                        Cancel</button>

                                                                    <button
                                                                        onClick={confirmDeletePetProfile}
                                                                        className='bg-black text-white rounded-lg pl-2 pr-2 pt-1 pb-1 hover:opacity-80 hover:bg-red-600 font-bold'
                                                                    >
                                                                        Delete</button>
                                                                </div>
                                                            </div>
                                                        </Modal>
                                                    ) : null}

                                                    {/* create pet profile modal */}
                                                    {showCreatePetForm && (
                                                        <Modal
                                                            isOpen={showCreatePetForm}
                                                            onRequestClose={() => setShowCreatePetForm(false)}
                                                            contentLabel="Create Pet Profile Label"
                                                            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full h-full md:w-[70%] lg:w-[50%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow '
                                                            style={{
                                                                overlay: {
                                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                                    zIndex: 1000,

                                                                }
                                                            }}
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
                                                    )}
                                                </div>
                                            )
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            }
            </>)}
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
}

function PetNameMessage({ petName, petNameValid, loading }) {
    if (loading) {
        return <p className='mt-2 ml-2 text-xs'>Checking...</p>;
    } else if (petName === '') {
        return null;
    } else if (String(petName).length < 3 && String(petName).length > 15 && !petNameValid) {
        return <p className='mt-2 ml-2 text-xs'>Pet name should have 3-15 characters!</p>;
    } else if (String(petName).includes('  ')) {
        return <p className="mt-2 ml-2 text-xs">Please have only one space in-between.</p>;
    } else if ((String(petName).startsWith(' ') || String(petName).endsWith(' ')) && !petNameValid) {
        return <p className="mt-2 ml-2 text-xs">No spaces allowed at either end.</p>;
    } else if (!petNameValid) {
        return <p className="mt-2 ml-2 text-xs">Only periods and underscores allowed for special characters.</p>;
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
    const [petBirthYear, setPetBirthYear] = useState(null);
    const [petBirthPlace, setPetBirthPlace] = useState(location);
    const [petBreed, setPetBreed] = useState(null);
    const [petFaveFood, setPetFaveFood] = useState(null);
    const [petHobbies, setPetHobbies] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);

    const [selectedPetProfile, setSelectedPetProfile] = useState(null);
    const [previewPetProfile, setPreviewPetProfile] = useState(null);

    const [submitDisabled, setSubmitDisabled] = useState(true);

    const handlePetProfileSelect = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add more allowed types if needed

        if (file !== undefined && allowedTypes.includes(file.type)) {
            setPetPhotoURL(file);
            setPreviewPetProfile(URL.createObjectURL(file));
        } else {
            event.target.value = null;
            setPetPhotoURL(null);
            setPreviewPetProfile(null);
            toast.error('Invalid file type. Only PNG, JPEG, and GIF allowed.')
        }
    };

    const handleCreatePetProfile = async (e) => {
        e.preventDefault();

        setSubmitDisabled(true);
        toast.loading('Creating pet profile...');

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
                birthYear: petBirthYear,
                birthPlace: petBirthPlace,
                followers: [],
                following: [],
                favoriteFood: petFaveFood,
                hobbies: petHobbies,
                hidden: [],
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


            setShowCreatePetForm(false);
            setPetName('');
            setPetAbout('');
            setPetSex('');
            setPetBreed('');
            setPetBirthYear('');
            setPetBirthPlace('');
            setPetPhotoURL('');

            // reload window
            window.location.href = "/pet/" + newPetRef.id;

            toast.dismiss();
            toast.success(`Pet profile created successfully!`)
        } catch (error) {
            toast.dismiss();
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
            setPetName(checkDisplayNameVal);
            setPetNameValid(false);
        }
    };

    return (
        <form onSubmit={handleCreatePetProfile} className='flex flex-col h-fit justify-between'>

            <div className="md:hidden font-bold text-xl gap-2 flex-row items-center h-10 mb-4 flex w-full justify-between">
                <div className='flex gap-2'>
                    <i className='fa-solid fa-paw'></i>
                    <p className='text-sm'>Create A Pet</p>
                </div>

                <i className='fa-solid fa-xmark' onClick={() => setShowCreatePetForm(false)} />
            </div>

            <div className='h-full flex flex-col justify-start'>
                <div className='flex flex-col md:flex-row w-full justify-evenly items-start gap-4 mb-4'>
                    {/* Display Name */}
                    <div className="w-full">
                        <label
                            htmlFor="displayname"
                            className="block text-sm font-medium text-gray-700"
                        >
                            <span>Display Name</span>
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="text"
                            id="display-name"
                            className="mt-1 p-2 border rounded-md w-full"
                            placeholder="Enter your pet's name"
                            minLength={3}
                            maxLength={15}
                            value={petName}
                            onChange={(e) => { handlePetDisplayNameVal(e.target.value) }}
                            required
                        />

                        <PetNameMessage petName={petName} petNameValid={petNameValid} />
                    </div>

                    {/* Breed */}
                    <div className="w-full">
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
                </div>

                <div className='flex flex-col md:flex-row w-full h-fit justify-evenly items-start gap-4 mb-4'>
                    {/* Photo */}
                    <div className='w-full h-full flex flex-col justify-center items-center'>
                        <label htmlFor="photo" className='text-start w-full text-sm font-medium text-gray-700 mb-2'>
                            Upload Photo
                            <span className="text-red-500"> *</span>
                        </label>
                        <input type="file" id="photo" onChange={e => handlePetProfileSelect(e)} required className='mb-4 text-start w-full' />
                        <div className="flex justify-center w-48 h-48 cursor-pointer rounded-full hover:opacity-50">
                            {previewPetProfile ? (<RoundIcon src={previewPetProfile} alt={"Preview"} />) : null}
                        </div>
                    </div>

                    <div className='flex flex-col w-full h-full'>
                        {/* About */}
                        <div className='w-full h-full mb-1'>
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
                                placeholder="Tell us about your pet..."
                                rows={3}
                                value={petAbout}
                                maxLength={100}
                                onChange={(e) => setPetAbout(e.target.value)}
                                required
                            />
                        </div>

                        {/* Favorite Food */}
                        <div className="w-full mb-2">
                            <label
                                htmlFor="favoriteFood"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Favorite Food
                                <span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                className="mt-1 p-2 border rounded-md w-full"
                                placeholder="Enter your pet's favorite food"
                                value={petFaveFood}
                                maxLength={30}
                                onChange={(e) => setPetFaveFood(e.target.value)}
                                required
                            />
                        </div>

                        {/* Hobbies */}
                        <div className="w-full">
                            <label
                                htmlFor="hobbies"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Hobbies
                                <span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                className="mt-1 p-2 border rounded-md w-full"
                                placeholder="Enter your pet's hobbies"
                                value={petHobbies}
                                maxLength={50}
                                onChange={(e) => setPetHobbies(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* sex, birthdate, birthplace */}
                <div className='flex flex-col md:flex-row gap-2 md:gap-4 w-full'>
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
                            value={petBirthYear}
                            onChange={(e) => setPetBirthYear(e.target.value)}
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
                            placeholder={petBirthPlace}
                            value={petBirthPlace}
                            onChange={(e) => setPetBirthPlace(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* form button controls */}
            <div className="flex justify-end md:justify-between items-center pt-2 pb-4 mt-8 md:mt-0 md:pb-0 w-full">

                <h2 className="hidden md:flex font-bold text-xl gap-2 flex-row items-center h-10 ">
                    <i className='fa-solid fa-paw'></i>
                    <p className='text-sm'>Create A Pet</p>
                </h2>

                <div className='flex flex-row gap-4'>
                    <button
                        type="button"
                        className="font-semibold text-sm md:text-base h-10 px-4 rounded-md transition-all hover:bg-raisin_black hover:text-white"
                        onClick={() => setShowCreatePetForm(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!petNameValid}
                        className={`font-semibold text-sm md:text-base h-10 px-4 rounded-md bg-xanthous text-white transition-all ${petNameValid ? 'hover:bg-pistachio' : 'opacity-50'}`}>
                        Create Pet
                    </button>
                </div>
            </div>
        </form>
    )
}

export default withAuth(UserProfilePage);