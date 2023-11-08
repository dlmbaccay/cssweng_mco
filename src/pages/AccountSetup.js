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
        // const regex = /^[a-zA-Z0-9_.]*[a-zA-Z0-9](?:[a-zA-Z0-9_.]*[ ]?[a-zA-Z0-9_.])*[a-zA-Z0-9_.]$/;

        if (displayname.startsWith(' ') || displayname.endsWith(' ') || displayname.includes('  ')) {
            setDisplayName(displayname);
            setDisplayNameValid(false);
        } else if ((displayname.length >= 3 && displayname.length <= 30)) {
            setDisplayName(displayname);
            setDisplayNameValid(true);
        } else if (displayname.length < 3 || displayname.length > 30) {
            setDisplayName(displayname);
            setDisplayNameValid(false);
        }
        // } else if (!regex.test(displayname)) {
        //     setDisplayName(displayname);
        //     setDisplayNameValid(false);
        // }
    };
    
    useEffect(() => {
        checkUsername(usernameFormValue);
    }, [usernameFormValue]);

    // ANDRE - maybe change this? reading multiple times, instead read one time upon submission?

    // Hit the database for username match after each debounced change
    // useCallback is required for debounce to work
    const checkUsername = useCallback (
        debounce(async (username) => {
        if (username.length >= 3) {
            const ref = firestore.doc(`usernames/${username}`);
            const { exists } = await ref.get();
            console.log('Firestore read executed!');
            setAvailableUsername(!exists);
            setLoading(false);
        }
        }, 500),
        []
    );

    // Creates a Firebase Upload Task
    const uploadFile = async (e) => {
        const userPhotoFile = Array.from(e.target.files)[0];
        
        // Check the file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(userPhotoFile.type)) {
          toast.error('Invalid file type. Please upload a JPG, PNG, or GIF file.');
          e.target.value = '';
          return;
        } else {
            const userPhotoURL = storage.ref(`profilePictures/${user.uid}/profilePic`);
            const userTask = userPhotoURL.put(userPhotoFile);
        
            // Listen to updates to upload task
            userTask.on(STATE_CHANGED, (snapshot) => {
            userTask
                .then((d) => userPhotoURL.getDownloadURL())
                .then((url) => { setUserPhotoURL(url); });
            });
        }
      };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Create refs for both documents
        const userDoc = firestore.doc(`users/${user.uid}`);
        const usernameDoc = firestore.doc(`usernames/${usernameFormValue}`);

        const batch = firestore.batch();

        batch.set(userDoc, {
            username: usernameFormValue,
            displayName: displayName,
            photoURL: userPhotoURL,
            // displayName: document.querySelector("#display-name").value,
            description: document.querySelector("#description").value,
            email: user.email,
            followers: [],
            following: [],
            
            // create a pet collections
            pets: {},
            
            coverPhotoURL: coverPhotoURL,
            gender: document.querySelector("#genderSelect").value,
            birthdate: document.querySelector("#birthdate").value,
            location: document.querySelector("#location").value,
        })

        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();

        toast.success(user.uid + " is now registered!")

        // push to Profile
        router.push(`/user/${usernameFormValue}`);
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

                        {/* username */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 pt-5">
                                <span>Username</span>
                                <span className="text-red-500"> *</span>
                            </label>
                            <input type="text" id="username" value={usernameFormValue} className={`mt-1 p-2 border rounded-md w-full ${usernameValid ? 'border-green-300':''}`} placeholder="Enter your username" required 
                                maxLength={15}
                                minLength={3}
                                onChange={(e) => {handleUsernameVal(e.target.value)}}/>
                            <UsernameMessage username={usernameFormValue} usernameValid={usernameValid} availableUsername={availableUsername} loading={loading} />
                        </div>

                        {/* display name */}
                        <div className="mb-4">
                            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 pt-2">
                                <span>Display Name</span>
                                <span className="text-red-500"> *</span>
                            </label>
                            <input type="text" id='display-name' value={displayName} className={`mt-1 p-2 border rounded-md w-full ${displayNameValid ? 'border-green-300':''}`} placeholder="What would you like us to call you?" required
                                maxLength={30}
                                minLength={3}
                                onChange={(e) => {handleDisplayNameVal(e.target.value)}}/>
                        </div>
                            <DisplayNameMessage displayName={displayName} displayNameValid={displayNameValid} loading={loading} />

                        {/* profile picture */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            <input type="file" className="mt-1 p-2 border rounded-md w-full" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                            <p className="text-sm text-gray-500 mt-1">Upload a profile picture (JPG, PNG, or GIF).</p>
                        </div>

                        {/* bio */}
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea id='description' className="mt-1 p-2 border rounded-md w-full resize-none" rows="4" maxLength="100" placeholder="Tell us about yourself..." required />
                        </div>

                        {/* gender */}
                        <div className="mb-4">
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="genderSelect" name="gender" className="mt-1 p-2 border rounded-md w-full" required>
                                <option value="None">Prefer Not to Say</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* birthday */}
                        <div className="mb-4">
                            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthday</label>
                            <input type="date" id="birthdate" name="birthdate" className="mt-1 p-2 border rounded-md w-full" max="9999-12-31" required/>
                        </div>

                        {/* location */}
                        <div className="mb-4">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="location" name="location" className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your Location" required />
                        </div>

                        {/* buttons */}
                        <div className="flex justify-end">

                            <button type='submit' className={`py-2 px-4 rounded-md bg-pistachio text-white transition-all ${(usernameValid && displayNameValid) ? 'hover:scale-105 active:scale-100' : 'opacity-50'}`} disabled={!(usernameValid && displayNameValid)}>
                            Submit
                            </button>

                            <button onClick={handleSignOut} className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100">
                                Sign Out
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
  if (loading) {
    return <p className='mt-2 ml-2'>Checking...</p>;
  } else if (username === '') {
    return null;
  } else if (username.length < 3 || username.length > 15 && !usernameValid) {
    return <p className="mt-2 ml-2">Username should have 3-15 characters!</p>;
  } else if (availableUsername && usernameValid) {
    return <p className="mt-2 ml-2">{username} is available!</p>;
  } else if (!availableUsername && username) {
    return <p className="mt-2 ml-2">That username is taken!</p>;
  } else if (String(username).startsWith('_') || String(username).startsWith('.') || String(username).startsWith(' ') 
                || String(username).endsWith('_') || String(username).endsWith('.') || String(username).endsWith(' ')) {
    return <p className="mt-2 ml-2">No spaces, periods, or underscores allowed at either end.</p>;
  } else if (String(username).includes('__') || String(username).includes('..') || String(username).includes('._') || String(username).includes('_.')) {
    return <p className="mt-2 ml-2">Only one period or underscore allowed next to each other.</p>;
} else if (!usernameValid){
    return <p className="mt-2 ml-2">Only periods and underscores allowed for special characters.</p>;
  }
}

function DisplayNameMessage({ displayName, displayNameValid, loading }) {
    if (loading) {
      return <p className='mt-2 ml-2'>Checking...</p>;
    } else if (displayName === '') {
      return null;
    } else if (displayName.length < 3 || displayName.length > 30 && !displayNameValid) {
      return <p className="mt-2 ml-2">Display name should have 3-30 characters!</p>;
    } else if (String(displayName).includes('  ')) {
        return <p className="mt-2 ml-2">Please have only one space in-between.</p>;
    } else if ((String(displayName).startsWith(' ') || String(displayName).endsWith(' ')) && !displayNameValid) {
        return <p className="mt-2 ml-2">No spaces allowed at either end.</p>;
    } 
    // else if (!displayNameValid) {
    //     return <p className="mt-2 ml-2">Only periods and underscores allowed for special characters.</p>;
    // } 
  }

export default withAuth(AccountSetup);