import { auth, storage, STATE_CHANGED, firestore } from '../lib/firebase';
import { UserContext } from '../lib/context';
import Image from 'next/image';
import Router from 'next/router';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';
import withAuth from '../components/withAuth';

function handleSignOut() {
    auth.signOut().then(() => {
        window.location.href = "/Login";
    });
}

function AccountSetup() {

    const { user } = useContext(UserContext)

    const [usernameFormValue, setUsernameFormValue] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [usernameValid, setUsernameValid] = useState(false);
    const [displayNameValid, setDisplayNameValid] = useState(false);
    const [availableUsername, setAvailableUsername] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = Router;

    const [userPhotoURL, setUserPhotoURL] = useState('/images/profilePictureHolder.jpg');
    const [coverPhotoURL, setCoverPhotoURL] = useState('/images/coverPhotoHolder.png');

    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                setPageLoading(false);
                
                // check if user has a username, path users/uid/username
                const userRef = firestore.doc(`users/${user.uid}`);
                
                userRef.get().then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        if (data.username) {
                            toast.error("You've already set up your account!")
                            router.push(`/Home`);
                        }
                    }
                });
            } else {
                // No user is signed in.
                setPageLoading(true);
            }
        });
    
    // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleUsernameVal = (val) => {
        const username = val.toLowerCase().trim();
        const regex = /^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/;

        setLoading(true);

        console.log(regex.test(username));
        if ((username.length >= 3 && username.length <= 15) && regex.test(username)) {
            setUsernameFormValue(username);
            setUsernameValid(true);
        } else if (username.length < 3 || username.length > 15) {
            setUsernameFormValue(username);
            setUsernameValid(false);
        } else if (!regex.test(username)) {
            setUsernameFormValue(username);
            setUsernameValid(false);
        }
    };

    const handleDisplayNameVal = (val) => {
        const displayname = val;

        if (displayname.startsWith(' ') || displayname.endsWith(' ') || displayname.includes('  ')) {
            setDisplayName(displayname);
            setDisplayNameValid(false);
        } else if ((displayname.length >= 1 && displayname.length <= 30)) {
            setDisplayName(displayname);
            setDisplayNameValid(true);
        } else if (displayname.length < 1 || displayname.length > 30) {
            setDisplayName(displayname);
            setDisplayNameValid(false);
        }
        
    };
    
    useEffect(() => {
        checkUsername(usernameFormValue);
    }, [usernameFormValue]);

    // Hit the database for username match after each debounced change, useCallback is required for debounce to work
    const checkUsername = useCallback (
        debounce(async (username) => {
        if (username.length >= 3) {
            const ref = firestore.doc(`usernames/${username}`);
            const { exists } = await ref.get();
            console.log('Firestore read executed!');
            setAvailableUsername(!exists);
            setLoading(false);
        }
        }, 1000),
        []
    );

    // Creates a Firebase Upload Task
    // const uploadFile = async (e) => {
    //     const userPhotoFile = Array.from(e.target.files)[0];
        
    //     // Check the file type
    //     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    //     if (!allowedTypes.includes(userPhotoFile.type)) {
    //       toast.error('Invalid file type. Please upload a JPG, PNG, or GIF file.');
    //       e.target.value = '';
    //       return;
    //     } else {
    //         const userPhotoURL = storage.ref(`profilePictures/${user.uid}/profilePic`);
    //         const userTask = userPhotoURL.put(userPhotoFile);
        
    //         // Listen to updates to upload task
    //         userTask.on(STATE_CHANGED, (snapshot) => {
    //         userTask
    //             .then((d) => userPhotoURL.getDownloadURL())
    //             .then((url) => { setUserPhotoURL(url); });
    //         });
    //     }
    //   };

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add more allowed types if needed
      
        if (file !== undefined && allowedTypes.includes(file.type)) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            event.target.value = null;
            setSelectedFile(null);
            setPreviewUrl(null);
            toast.error('Invalid file type. Only PNG, JPEG, and GIF allowed.')
        }
    };

    const [submitDisabled, setSubmitDisabled] = useState(true);

    const onSubmit = async (e) => {
        e.preventDefault();
        let URL;

        if (selectedFile) {
            setSubmitDisabled(true);
            toast.loading('Setting up your account...');

            const storagePath = `profilePictures/${user.uid}/profilePic`;
            const storageRef = storage.ref().child(storagePath);
            const uploadTask = storageRef.put(selectedFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Handle progress updates here
                    const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    // Update progress state if needed
                },
                (error) => {
                    // Handle error here
                    // console.error(error);
                    toast.error('Error uploading file.');
                },
                async () => {
                    // Handle successful upload here
                    toast.success('Photo uploaded successfully!');
                    URL = await uploadTask.snapshot.ref.getDownloadURL(); 
                    // Create refs for both documents
                    const userDoc = firestore.doc(`users/${user.uid}`);
                    const usernameDoc = firestore.doc(`usernames/${usernameFormValue}`);

                    const batch = firestore.batch();

                    batch.set(userDoc, {
                        username: usernameFormValue,
                        displayName: displayName,
                        photoURL: URL,
                        // displayName: document.querySelector("#display-name").value,
                        about: document.querySelector("#about").value,
                        email: user.email,
                        followers: [],
                        following: [],
                        hidden: [],
                        
                        // create a pet collections
                        pets: {},
                        
                        coverPhotoURL: coverPhotoURL,
                        gender: document.querySelector("#genderSelect").value,
                        birthdate: document.querySelector("#birthdate").value,
                        location: document.querySelector("#location").value,
                        phoneNumber: document.querySelector("#phone-number").value,
                    })

                    batch.set(usernameDoc, { uid: user.uid });

                    await batch.commit();
                                
                    toast.dismiss();
                    toast.success(`Welcome to BantayBuddy, ${usernameFormValue}!`)

                    // push to Profile
                    router.push(`/user/${usernameFormValue}`);
                }
            );
        } else {
            setSubmitDisabled(true);
            toast.loading('Setting up your account...');

            // Create refs for both documents
            const userDoc = firestore.doc(`users/${user.uid}`);
            const usernameDoc = firestore.doc(`usernames/${usernameFormValue}`);

            const batch = firestore.batch();

            batch.set(userDoc, {
                username: usernameFormValue,
                displayName: displayName,
                photoURL: userPhotoURL,
                // displayName: document.querySelector("#display-name").value,
                about: document.querySelector("#about").value,
                email: user.email,
                followers: [],
                following: [],
                hidden: [],
                
                // create a pet collections
                pets: {},
                
                coverPhotoURL: coverPhotoURL,
                gender: document.querySelector("#genderSelect").value,
                birthdate: document.querySelector("#birthdate").value,
                location: document.querySelector("#location").value,
                phoneNumber: document.querySelector("#phone-number").value,
            })

            batch.set(usernameDoc, { uid: user.uid });

            await batch.commit();
                
            toast.dismiss();
            toast.success(`Welcome to BantayBuddy, ${usernameFormValue}!`)
            
            // push to Profile
            router.push(`/user/${usernameFormValue}`);
        }

    };

    if (!pageLoading){
        return (
            <>
                <div className="bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center flex flex-col space-y-10 p-80
                    lg:flex-row lg:space-x-20 lg:py-10
                    md:space-x-14 md:py-10
                    sm:space-x-10 sm:py-10">
                    <form  
                        onSubmit={onSubmit}
                        className="bg-snow rounded-md p-8 pb-5 w-full">
                        <h1 className="font-bold">Welcome to Account Setup!</h1>

                        <div className='flex flex-row w-full gap-6 mt-4'>
                            {/* username */}
                            <div className="w-full">
                                <label htmlFor="username" className="block text-sm font-medium text-raisin_black">
                                    <span>Username</span>
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input type="text" id="username" value={usernameFormValue} className={`outline-none mt-2 p-2 border rounded-md w-full`} placeholder="Enter your username" required 
                                    maxLength={15}
                                    minLength={3}
                                    onChange={(e) => {handleUsernameVal(e.target.value)}}/>
                                <UsernameMessage username={usernameFormValue} usernameValid={usernameValid} availableUsername={availableUsername} loading={loading} />
                            </div>

                            {/* display name */}
                            <div className="w-full">
                                <label htmlFor="display-name" className="block text-sm font-medium text-raisin_black">
                                    <span>Display Name</span>
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input type="text" id='display-name' value={displayName} className={`outline-none mt-2 p-2 border rounded-md w-full`} placeholder="What would you like us to call you?" required
                                    maxLength={30}
                                    minLength={1}
                                    onChange={(e) => {handleDisplayNameVal(e.target.value)}}/>
                                <DisplayNameMessage displayName={displayName} displayNameValid={displayNameValid} />
                            </div>
                        </div>

                        <div className='flex flex-row w-full h-fit gap-6 mt-4'>
                            {/* profile picture */}
                            <div className="w-full">
                                <label className="flex gap-2 items-center text-sm font-medium text-gray-700">
                                    Profile Picture
                                    <span className="text-raisin_black text-xs">(JPG, PNG, or GIF).</span>
                                </label>
                                <div className="mt-2 w-full">
                                    <input type="file"  onChange={handleFileSelect} accept="image/x-png,image/gif,image/jpeg" className='text-sm mb-4'/>
                                    {!previewUrl && (
                                        <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                                            <Image src={'/images/profilePictureHolder.jpg'} alt="Profile Picture" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                                            <Image src={previewUrl} alt="Preview" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-col w-full'>
                                {/* about */}
                                <div className="w-full mb-1">
                                    <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                                    <textarea id='about' className="mt-2 p-2 border rounded-md w-full resize-none" rows="3" maxLength="100" placeholder="Tell us about yourself..." />
                                </div>

                                {/* gender */}
                                <div className="w-full mb-4">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                        <span>Gender</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <select id="genderSelect" name="gender" className="mt-1 p-2 text-md border rounded-md w-full" required>
                                        <option value="None">Prefer Not to Say</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* birthdate */}
                                <div className="w-full mb-4">
                                    <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                                        <span>Birthdate</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <input type="date" id="birthdate" name="birthdate" className="mt-1 p-2 border text-md rounded-md w-full" max="9999-12-31" required/>
                                </div>
                            </div>
                        </div>                        

                        <div className='flex flex-row w-full gap-6'>
                            {/* location */}
                            <div className="w-full">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                    <span>Location</span>
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input type="text" id="location" name="location" className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your Location" required />
                            </div>

                            {/* phone number */}
                            <div className="w-full">
                                <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                                    <span>Phone Number</span>
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input type="number" maxLength={11} id="phone-number" name="phone-number" className="mt-1 p-2 border rounded-md w-full" placeholder="ex. 09123456789" onInput={(e) => {
                                        if (e.target.value.length > 11) {
                                            e.target.value = e.target.value.slice(0, 11);
                                        }
                                    }}required />
                            </div>
                        </div>
                        
                        {/* buttons */}
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={handleSignOut} className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100">
                                Sign Out
                            </button>

                            <button type='submit' className={`py-2 px-4 rounded-md bg-pistachio text-white transition-all ${(usernameValid && displayNameValid) ? 'hover:scale-105 active:scale-100' : 'opacity-50'}`} disabled={!(usernameValid && displayNameValid)}>
                            Submit
                            </button>
                        </div>
                    </form>
                </div>
            </>
        )
    } else {
        return null;
    }
}

function UsernameMessage({ username, usernameValid, availableUsername, loading }) {
    let message = '';

    if (loading) 
        message = 'Checking...';
    else if (username === '')
        message = '';
    else if (username.length < 3 || username.length > 15 && !usernameValid) 
        message = 'Username should have 3-15 characters!';
    else if (availableUsername && usernameValid) 
        message = `${username} is available!`;
    else if (!availableUsername && username) 
        message = 'That username is taken!';
    else if (String(username).startsWith('_') || String(username).startsWith('.') || String(username).startsWith(' ') 
                || String(username).endsWith('_') || String(username).endsWith('.') || String(username).endsWith(' ')) 
        message = 'No spaces, periods, or underscores allowed at either end.';
    else if (String(username).includes('__') || String(username).includes('..') || String(username).includes('._') || String(username).includes('_.'))
        message = 'Only one period or underscore allowed next to each other.';
    else if (!usernameValid)
        message = 'Only periods and underscores allowed for special characters.';

    return <p className='mt-2 ml-2 text-sm'>{message}</p>;
}

function DisplayNameMessage({ displayName, displayNameValid }) {
    let message;

    if (displayName === '')
        message = '';
    else if (displayNameValid) 
        message = 'Display name is valid!';
    else if (displayName.length < 1 || displayName.length > 30 && !displayNameValid)
        message = 'Display name should have 1-30 characters!';
    else if (String(displayName).includes('  ')) 
        message = 'Please have only one space in-between.';
    else if ((String(displayName).startsWith(' ') || String(displayName).endsWith(' ')) && !displayNameValid) 
        message = 'No spaces allowed at either end.';

    return <p className='mt-2 ml-2 text-sm'>{message}</p>
}

export default withAuth(AccountSetup);