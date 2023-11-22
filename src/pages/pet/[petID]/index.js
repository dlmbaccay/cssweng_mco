import React, { useEffect, useState } from 'react';
import { STATE_CHANGED, firestore, storage } from '@/src/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';

import { useRouter } from 'next/router';
import { useUserData, useUserIDfromUsername } from '@/src/lib/hooks'; // Import the useUser hook
import { formatDateWithWords } from '../../../lib/formats';
import { editPetProfileStyle, phoneNavModalStyle } from '../../../lib/modalstyle';

import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast'
import Modal from 'react-modal'; // Import the Modal component  

import ExpandedNavBar from '@/src/components/ExpandedNavBar';
import PhoneNav from '@/src/components/PhoneNav';
import Loader from '@/src/components/Loader';
import CoverPhoto from '@/src/components/CoverPhoto';
import RoundIcon from '@/src/components/RoundIcon';
import PostSnippet from '@/src/components/Post/PostSnippet';
import withAuth from '@/src/components/withAuth';

function PetProfilePage() {

    useEffect(() => {
        if (document.getElementById('root')) {
            Modal.setAppElement('#root');
        }
    }, []);

    // variables for getting pet's information through current/profileIDs
    const router = useRouter();
    const { petID } = router.query;
    const currentUser = useUserData(); // Get the logged-in user
    const currentUserID = useUserIDfromUsername(currentUser.username);

    // variables for pet profile
    const [pet, setPet] = useState(null);
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [followers, setFollowers] = useState(null);
    // const [following, setFollowing] = useState(null);
    const [sex, setSex] = useState(null);
    const [breed, setBreed] = useState(null);
    const [birthYear, setBirthYear] = useState(null);
    const [birthPlace, setBirthPlace] = useState(null);
    const [favoriteFood, setFavoriteFood] = useState(null);
    const [hobbies, setHobbies] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);
    const [hidden, setHidden] = useState(null);

    const [activeTab, setActiveTab] = useState('Tagged Posts');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // variables for pet's owner profile
    const [petOwnerID, setPetOwnerID] = useState(null);
    const [petOwnerUsername, setPetOwnerUsername] = useState(null);
    const [petOwnerDisplayName, setPetOwnerDisplayName] = useState(null);
    const [petOwnerPhotoURL, setPetOwnerPhotoURL] = useState(null);
    const [petOwnerCoverPhotoURL, setPetOwnerCoverPhotoURL] = useState(null);

    // editing variables
    const [editedAbout, setEditedAbout] = useState(null);
    const [editedPetFavoriteFood, setEditedPetFavoriteFood] = useState(null);
    const [editedPetHobbies, setEditedPetHobbies] = useState(null);

    useEffect(() => {
        let unsubscribe;

        if (petID) {
            const petRef = firestore.collection('pets').doc(petID);
            unsubscribe = petRef.onSnapshot((doc) => {
                if (doc.exists) {
                    setPet({
                        id: doc.id,
                        ...doc.data()
                    });

                    setPetName(doc.data().petName);
                    setAbout(doc.data().about);
                    setFollowers(doc.data().followers);
                    setSex(doc.data().sex);
                    setBreed(doc.data().breed);
                    setPetPhotoURL(doc.data().photoURL);
                    setBirthYear(doc.data()?.birthYear);
                    setBirthPlace(doc.data()?.birthPlace);
                    setFavoriteFood(doc.data().favoriteFood);
                    setHobbies(doc.data().hobbies);
                    setHidden(doc.data()?.hidden);

                    setPetOwnerID(doc.data().petOwnerID);
                    setPetOwnerUsername(doc.data().petOwnerUsername);
                    setPetOwnerDisplayName(doc.data().petOwnerDisplayName);
                    setPetOwnerPhotoURL(doc.data().petOwnerPhotoURL);
                    setPetOwnerCoverPhotoURL(doc.data().petOwnerCoverPhotoURL);

                    setEditedPetName(doc.data().petName);
                    setEditedAbout(doc.data().about);
                    setEditedPetFavoriteFood(doc.data().favoriteFood);
                    setEditedPetHobbies(doc.data().hobbies);
                } else {
                    setPet(null);
                }
            });
        } else {
            setPet(null);
        }

        return unsubscribe;
    }, [petID]);

    const openEdit = () => {
        if (currentUser && currentUserID === petOwnerID) { // Check if the logged-in user is the owner of the pet
            setModalIsOpen(true); // Open the modal when editing starts
        }
    };

    const handleCancelEditProfile = () => {
        setModalIsOpen(false);

        // reset all edited values
        setEditedPetName(petName);
        setEditedAbout(about);
        setEditedPetFavoriteFood(favoriteFood);
        setEditedPetHobbies(hobbies);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const petRef = firestore.collection('pets').doc(petID);
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
                       const petRef = firestore.doc(`pets/${petID}`);
                       petRef.update({ [field]: url });
                    }
                );
            };

            if (selectedProfileFile) {
                await uploadFile(storage.ref(`petProfilePictures/${petID}/profilePic`), selectedProfileFile, 'photoURL');
            }

            const updateData = {
                petName: editedPetName,
                about: editedAbout,
                favoriteFood: editedPetFavoriteFood,
                hobbies: editedPetHobbies,
                // photoURL: petPhotoURL
            };

            batch.update(petRef, updateData);

            await batch.commit();
            setModalIsOpen(false);
            setSelectedProfileFile(null);
            setPreviewProfileUrl(null);
            toast.success(petName + '`s profile updated successfully!');
        } catch (error) {
            console.error('Error saving pet:', error);
        }
    };

    const [selectedProfileFile, setSelectedProfileFile] = useState(null);
    const [previewProfileUrl, setPreviewProfileUrl] = useState(null);

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

    const uploadPetProfilePictureFile = async (e) => {
        const file = Array.from(e.target.files)[0];
        const ref = storage.ref(`petProfilePictures/${petID}/profilePic`);
        const task = ref.put(file);

        task.on(STATE_CHANGED, (snapshot) => {
            task
                .then((d) => ref.getDownloadURL())
                .then((url) => {
                    setPetPhotoURL(url);

                    const petRef = firestore.collection('pets').doc(petID);
                    petRef.update({ photoURL: url });
                })
        })
    }

    const handleFollow = () => {
        const isFollowing = pet.followers && pet.followers.includes(currentUserID);

        const updatedFollowers = isFollowing
            ? pet.followers.filter(id => id !== currentUserID) // Remove currentUserID if already following
            : [...pet.followers, currentUserID]; // Add currentUserID if not already following

        firestore.collection('pets').doc(petID).update({
            followers: updatedFollowers
        })
            .then(() => {
                setPet(prevPet => ({
                    ...prevPet,
                    followers: updatedFollowers
                }));
                // Show toast notification based on whether the user was followed or unfollowed
                if (isFollowing) {
                    toast.success('Unfollowed successfully!');
                } else {
                    toast.success('Followed successfully!');
                }
            })
            .catch(error => {
                console.error('Error updating followers:', error);
            });
    };

    const handleTabEvent = (tabName) => {
        setActiveTab(tabName);
    };

    const [editedPetName, setEditedPetName] = useState(null);
    const [editPetNameValid, setEditPetNameValid] = useState(true);

    const handlePetNameVal = (val) => {
        const checkPetNameValue = val;

        if (checkPetNameValue.startsWith(' ') || checkPetNameValue.endsWith(' ') || checkPetNameValue.includes('  ')) {
            setEditedPetName(checkPetNameValue);
            setEditPetNameValid(false);
        } else if ((checkPetNameValue.length >= 3 && checkPetNameValue.length <= 15)) {
            setEditedPetName(checkPetNameValue);
            setEditPetNameValid(true);
        } else if (checkPetNameValue.length < 3 || checkPetNameValue.length > 15) {
            setEditedPetName(checkPetNameValue);
            setEditPetNameValid(false);
        }
    };

    const [taggedPosts, setTaggedPosts] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allTaggedPostsLoaded, setAllTaggedPostsLoaded] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (!petID) return;

        setLoading(true);

        const q = query(
            collection(firestore, "posts"),
            where("postPets", "array-contains", petID),
            orderBy("postDate", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newPosts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setTaggedPosts(newPosts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [petID]);

    const fetchMorePosts = async () => {
        if (!lastVisible || loading) return;

        setLoading(true);

        const nextQuery = query(
            collection(firestore, "posts"),
            where("postPets", "array-contains", petID),
            orderBy("postDate", "desc"),
            startAfter(lastVisible),
            limit(5)
        );

        const querySnapshot = await getDocs(nextQuery);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (newPosts.length === 0) {
            setAllTaggedPostsLoaded(true);
        } else {
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setTaggedPosts(prevPosts => [...prevPosts, ...newPosts]);
            setAllTaggedPostsLoaded(false);
        }

        setLoading(false);
    };

    const refreshPosts = async () => {
        setLoading(true);
        const refreshQuery = query(
            collection(firestore, "posts"),
            where("postPets", "array-contains", petID),
            orderBy("postDate", "desc"),
            limit(5)
        );

        const querySnapshot = await getDocs(refreshQuery);
        const refreshedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTaggedPosts(refreshedPosts);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAllTaggedPostsLoaded(false);
        setLoading(false);
    };
    
    const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);

    if (!pet) {
        return (
            <Loader />
        );
    }

    return (
        <div id="root" className='flex'>
            <div className='w-fit md:flex hidden'>
                {(petOwnerPhotoURL && petOwnerUsername) && <ExpandedNavBar 
                    props={{
                    userPhotoURL: petOwnerPhotoURL,
                    username: petOwnerUsername,
                    activePage: "Profile",
                    expanded: false
                    }}
                />}
            </div>

            {pet && currentUser &&
                <div className="h-screen w-full">

                    <nav className='w-full h-14 bg-snow flex justify-between items-center md:hidden drop-shadow-sm'>
                        <div className='h-full w-fit flex flex-row items-center gap-1'>
                            <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full'/>
                            <h1 className='font-shining text-4xl text-grass'>BantayBuddy</h1>
                        </div>
                        
                        <button onClick={() => setShowPhoneNavModal(true)}>
                            <i className='fa-solid fa-bars text-xl w-[56px] h-[56px] flex items-center justify-center'/>
                        </button>

                        <Modal 
                            isOpen={showPhoneNavModal}
                            onRequestClose={() => setShowPhoneNavModal(false)}
                            style={phoneNavModalStyle}
                        >
                            <PhoneNav 
                            props = {{
                                setShowPhoneNavModal: setShowPhoneNavModal,
                                currentUserUsername: currentUser.username,
                                currentUserPhotoURL: currentUser.userPhotoURL,
                            }}
                            />
                        </Modal>
                    </nav>

                    <div id='header-container' className='h-1/5 border-l border-neutral-300 hidden md:block'>
                        <CoverPhoto src={petOwnerCoverPhotoURL} alt={petOwnerUsername + " cover photo"} />
                    </div>

                    <div id='content-container' className='h-full md:h-4/5 flex flex-row'>

                        {/* Profile Picture */}
                        <div className="hidden md:flex absolute justify-center w-80 h-44">
                            <div className='rounded-full z-10
                                -translate-y-40 w-32 h-32 -translate-x-14
                                lg:w-44 lg:h-44 lg:-translate-y-24 lg:translate-x-0'>
                                <Image 
                                    src={petPhotoURL}
                                    alt={petName + " profile picture"}
                                    fill='fill'
                                    objectFit='cover'
                                    className='rounded-full shadow-lg'
                                />
                            </div>
                        </div>

                        {/* Left Panel */}
                        <div className="fixed hidden lg:flex flex-col lg:w-80 h-4/5 bg-snow border border-neutral-300 justify-start items-center">

                            {/* petName & owner */}
                            <div className="text-center mt-24 w-80">
                                <div className="text-xl mb-1 font-bold text-raisin_black ">
                                    {petName}
                                </div>

                                <Link href={'/user/' + petOwnerUsername} className='hover:text-grass text-md text-raisin_black hover:font-bold transition-all'>@{petOwnerUsername}</Link>
                            </div>

                            {currentUserID === petOwnerID ? (
                                // Edit pet profile button
                                <button
                                    onClick={() => setModalIsOpen(true)}
                                    className="text-center mt-4 w-20 px-2 py-1 bg-citron hover:bg-xanthous shadow-lg text-snow font-bold rounded-lg border-none"
                                >Edit</button>
                            ) :
                                // Follow button
                                <button
                                    onClick={handleFollow}
                                    className="text-center mt-4 w-32 px-2 py-1 bg-citron hover:bg-xanthous shadow-lg text-snow font-bold rounded-lg border-none"
                                >
                                    {followers.includes(currentUserID) ? 'Following' : 'Follow'}
                                </button>
                            }

                            {/* Profile Edit Pop-up */}
                            {modalIsOpen && (
                                <Modal
                                    isOpen={modalIsOpen}
                                    onRequestClose={() => setModalIsOpen(false)}
                                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  w-full h-full md:w-[70%] lg:w-[50%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow '
                                    style={{
                                        overlay: {
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1000,

                                        }
                                    }}
                                >

                                    <form
                                        onSubmit={handleSave}
                                        className="flex flex-col h-full w-full"
                                    >
                                        
                                        <div className='flex flex-row items-center justify-between'>
                                            <h1 className='font-bold text-xl'>Edit {petName}`s Profile</h1>
                                            <i className='fa-solid fa-xmark' onClick={handleCancelEditProfile}/>
                                        </div>

                                        <div className='flex flex-col md:flex-row w-full h-full justify-center items-center'>
                                            <div className='flex flex-col justify-evenly items-center w-full md:w-[50%] mt-8 md:mt-0'>
                                                <div className="w-full flex flex-col justify-center items-center">
                                                    <h1 className='font-medium mb-2'>Change Profile Picture</h1>
                                                    <div>
                                                        <label htmlFor='pet-profile-pic'>
                                                            <div className='relative mx-auto w-full cursor-pointer' style={{height: '175px', width: '175px'}}>
                                                                {previewProfileUrl ? (
                                                                    <Image src={previewProfileUrl} alt="Preview" layout='fill' className='object-cover rounded-full'/>
                                                                ): (petPhotoURL && <Image src={petPhotoURL} alt={petName + " cover photo"} layout='fill' className='object-cover rounded-full'/>)}
                                                            </div>
                                                        </label>
                                                    </div>

                                                    <input
                                                        type="file"
                                                        id='pet-profile-pic'
                                                        className="hidden"
                                                        onChange={handleProfileFileSelect}
                                                    />
                                                </div>
                                                
                                                <div className='mt-7 w-full md:w-[65%] flex flex-col justify-evenly items-center p-4 mb-4 rounded-lg font-semibold gap-4'>

                                                    <div className='flex flex-row items-center gap-8 justify-center w-full'>
                                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                                            <i className='fa-solid fa-venus-mars' />
                                                            <p>{sex}</p>
                                                        </div>

                                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                                            <i className='fa-solid fa-bread-slice' />
                                                            <p>{breed}</p>
                                                        </div>
                                                    </div>

                                                    <div className='flex flex-row items-center gap-8 justify-center w-full'>
                                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                                            <i className='fa-solid fa-cake-candles' />
                                                            <p>{birthYear}</p>
                                                        </div>

                                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                                            <i className='fa-solid fa-map-marker-alt' />
                                                            <p>{birthPlace}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex flex-col justify-center items-center h-full w-full md:w-[50%]'>
                                                <div className='w-full pl-8 md:pl-0 pr-8'>

                                                    <div className="mb-4 w-full">
                                                        <label
                                                            htmlFor="username"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            <span>Pet Name</span>
                                                        </label>

                                                        <input
                                                            type="text"
                                                            id="pet-name"
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            minLength={3}
                                                            maxLength={15}
                                                            value={editedPetName}
                                                            placeholder='What`s your pet`s name?'
                                                            onChange={(e) => handlePetNameVal(e.target.value)}
                                                            required
                                                        />

                                                        <PetNameMessage petName={editedPetName} petNameValid={editPetNameValid} loading={false} />
                                                    </div>

                                                    {/* About */}
                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="about"
                                                            className="mt-2 block text-sm font-medium text-gray-700"
                                                        >
                                                            About
                                                        </label>
                                                        <textarea
                                                            id="bio"
                                                            className="mt-1 p-2 border rounded-md w-full resize-none"
                                                            rows="4"
                                                            maxLength={100}
                                                            value={editedAbout}
                                                            placeholder='Tell us about your pet!'
                                                            onChange={(e) => setEditedAbout(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Hobbies */}
                                                    <div className="mb-4 w-full">
                                                        <label
                                                            htmlFor="hobbies"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            <span>Hobbies</span>
                                                        </label>

                                                        <input
                                                            type="text"
                                                            id="hobbies"
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            maxLength="50"
                                                            value={editedPetHobbies}
                                                            placeholder='What`s your pet`s hobbies?'
                                                            onChange={(e) => setEditedPetHobbies(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Favorite Food */}
                                                    <div className="mb-4 w-full">
                                                        <label
                                                            htmlFor="faveFood"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            <span>Favorite Food</span>
                                                        </label>

                                                        <input
                                                            type="text"
                                                            id="faveFood"
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            maxLength="30"
                                                            value={editedPetFavoriteFood}
                                                            placeholder='What`s your pet`s favorite food?'
                                                            onChange={(e) => setEditedPetFavoriteFood(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mt-4 pb-8 md:pb-0 flex justify-end gap-4'>
                                            <button
                                                type="button"
                                                onClick={handleCancelEditProfile}
                                                className="w-20 h-10 font-semibold rounded-md ml-5 transition-all transform hover:bg-raisin_black hover:text-white"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={!editPetNameValid}
                                                className={`w-20 h-10 font-semibold rounded-md bg-xanthous text-white transition-all ${editPetNameValid ? 'hover:bg-pistachio' : 'opacity-50'}`}>
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </Modal>
                            )}

                            {/* Followers and Following */}
                            <div className="text-center mt-6 flex flex-row gap-10 w-80 items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-raisin_black font-bold"> {pet.followers ? pet.followers.length : 0}</span>
                                    <span className="text-grass font-bold text-sm">Followers</span>
                                </div>
                            </div>

                            {/* About */}
                            <div className="text-center mt-6 flex flex-col gap-2 w-full max-w-full">
                                <div className="text-lg font-bold text-raisin_black">About</div>
                                <div className="text-base text-raisin_black pl-6 pr-6 whitespace-normal break-all w-full max-w-full">
                                    {about}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="mt-4 mb-2 flex flex-col items-center w-full gap-2">
                                {hidden && !hidden.includes('breed') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-bread-slice"></i>
                                        <p>{breed}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('sex') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-venus-mars"></i>
                                        <p>{sex}</p>
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('birthdate') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-cake-candles"></i>
                                        <p>{birthYear}</p>  
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('birthplace') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-map-marker-alt"></i>
                                        <p>{birthPlace}</p> 
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('favoriteFood') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-utensils"></i>
                                        <p>{favoriteFood}</p> 
                                    </div>
                                ) : ''}

                                {hidden && !hidden.includes('hobbies') ? (
                                    <div id="icons" className='flex flex-row gap-2 items-center'>
                                        <i className="fa-solid fa-heart"></i>
                                        <p>{hobbies}</p> 
                                    </div>
                                ) : ''}
                            </div>

                        </div>

                        <div id='main-content-container' className='overflow-hidden flex flex-col lg:translate-x-80 lg:w-[calc(100%-20rem)] w-full'>
                            
                            <div id='flex-profile-details' className='lg:hidden w-full h-24 md:h-12 bg-snow flex flex-row items-center md:pl-10 gap-4 md:justify-start justify-center'>

                                <Image src={petPhotoURL} alt={petName + " profile picture"} width={45} height={45} className='rounded-full drop-shadow-sm' />

                                <div className='flex flex-col h-fit items-center md:flex-row md:gap-2'>
                                    <p className='font-bold'>
                                        {petName}
                                    </p>
                                    <p className='font-bold md:flex hidden'>·</p>
                                        @{petOwnerUsername}
                                    <p className='font'>
                                    </p>
                                </div>

                                <div className='flex flex-row gap-2 mr-2 md:mr-0'>
                                    {/* followers */}
                                    <div className='flex flex-col-reverse md:flex-row md:gap-2 items-center'>
                                        <p className='font-semibold text-sm'>{pet.followers.length}</p>
                                        <p className='text-grass font-bold text-sm'>Followers</p>
                                    </div>
                                </div>

                                { currentUserID === petOwnerID ? 
                                    (<button 
                                        onClick={() => setModalIsOpen(true)}
                                        className='text-sm font-semibold text-white bg-citron w-12 md:h-6 h-8 rounded-md'
                                    >
                                        Edit
                                    </button>) : 
                                    (
                                        <button 
                                            onClick={handleFollow}
                                            className='text-sm font-semibold text-white bg-citron w-16 md:h-6 h-8 rounded-md'
                                        >
                                            {followers.includes(currentUserID) ? 'Following' : 'Follow'}
                                        </button>
                                    )
                                }
                            </div>

                            <div id="tab-actions" className='flex flex-row h-12 font-shining bg-snow divide-x divide-neutral-300 border-b border-t border-neutral-300 drop-shadow-sm md:justify-start justify-between'>
                                <button
                                    className={`w-1/3 md:w-fit text-sm md:text-base md:px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Tagged Posts' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Tagged Posts')}>
                                    Tagged Posts
                                </button>

                                <button
                                    className={`w-1/3 md:w-fit text-sm md:text-base md:px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Milestones' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Milestones')}>
                                    Milestones
                                </button>

                                <button
                                    className={`w-1/3 md:w-fit text-sm md:text-base  md:px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${activeTab === 'Media' ? 'bg-citron text-white' : ''
                                        }`}
                                    onClick={() => handleTabEvent('Media')}>
                                    Media
                                </button>
                            </div>

                            <div id="tab-container" className='overflow-y-scroll h-full bg-[#FAFAFA]'>

                                {/* Tagged Posts */}
                                {activeTab === 'Tagged Posts' && (
                                    <div className="flex justify-center w-full">
                                        { taggedPosts.length === 0 && (
                                            <div className="w-full pt-20 pl-24 pr-24 flex justify-center">

                                                {/* if no media... */}
                                                <div className='flex flex-col items-center justify-center h-full w-full'>
                                                    <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                                    <div className='mt-2 font-bold text-grass text-sm md:text-base'>Nothing to see here yet...</div>
                                                </div>

                                            </div>
                                        )}

                                        { taggedPosts.length > 0 && (
                                            <div className='flex flex-col mt-8 mb-8 gap-8 items-center'>
                                                {taggedPosts.map((post, index) => (
                                                    <div key={post.id}>
                                                        <PostSnippet
                                                            props={{
                                                                currentUserID: currentUserID,
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
                                                ))}

                                                {loading && <div>Loading...</div>}

                                                {allTaggedPostsLoaded ? (
                                                    <button
                                                        className='px-4 py-2 text-white bg-grass rounded-lg w-fit text-sm hover:bg-raisin_black transition-all'
                                                        onClick={refreshPosts}
                                                    >
                                                        Refresh Posts
                                                    </button>
                                                ) : (
                                                    <button
                                                        className='px-4 py-2 text-white bg-grass rounded-lg w-fit text-sm hover:bg-raisin_black transition-all'
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

                                {/* Milestones */}
                                {activeTab === 'Milestones' && (
                                    <div className="flex justify-center w-full pt-8">
                                        
                                        {/* if no milestones */}
                                        
                                        {taggedPosts.filter(post => post.postCategory === 'Milestones').length === 0 && (
                                            <div className="w-full pt-12 pl-24 pr-24 flex justify-center">
                                            <div className='flex flex-col items-center justify-center h-full w-full'>
                                                <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                            <div className='mt-2 font-bold text-grass text-sm md:text-base'>Nothing to see here yet...</div>
                                            </div>
                                        </div>
                                        )}

                                        {taggedPosts.filter(post => post.postCategory === 'Milestones').map((post, index) => (
                                            <div key={post.id}>
                                                <PostSnippet
                                                    props={{
                                                        currentUserID: currentUserID,
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
                                        ))}

                                        
                                    </div>

                                )}

                                {/* Media */}
                                {activeTab === 'Media' && (
                                    <div className="w-full pt-20 pl-24 pr-24 flex justify-center">

                                        {/* if no media... */}
                                        <div className='flex flex-col items-center justify-center h-full w-full'>
                                            <i className="fa-solid fa-hippo text-8xl text-grass"></i>
                                            <div className='mt-2 font-bold text-grass text-sm md:text-base'>Nothing to see here yet...</div>
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

export default withAuth(PetProfilePage);