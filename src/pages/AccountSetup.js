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
    const [isValid, setIsValid] = useState(false);
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

    const onChange = (inputValue) => {
        // Force form value typed in form to match correct format
        const val = inputValue.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/; // restriction for username, only letters, numbers, periods, and underscores

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3 || val.length > 15) {
            setUsernameFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if (re.test(val)) {
            setUsernameFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    };
    
    useEffect(() => {
        checkUsername(usernameFormValue);
    }, [usernameFormValue]);

    // Hit the database for username match after each debounced change
    // useCallback is required for debounce to work
    const checkUsername = useCallback (
        debounce(async (username) => {
        if (username.length >= 3) {
            const ref = firestore.doc(`usernames/${username}`);
            const { exists } = await ref.get();
            console.log('Firestore read executed!');
            setIsValid(!exists);
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
            displayName: usernameFormValue,
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
                            <input type="text" id="username" value={usernameFormValue} className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your username" required 
                            maxLength={15}
                            minLength={3}
                            onChange={(e) => {
                                var formval = e.target.value.trim();
                                setUsernameFormValue(formval);
                                onChange(formval);
                            }}/>
                            <UsernameMessage username={usernameFormValue} isValid={isValid} loading={loading} />
                        </div>

                        {/* display name
                        <div className="mb-4">
                            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 pt-5">
                                <span>Display Name</span>
                                <span className="text-red-500"> *</span>
                            </label>
                            <input type="text" id='display-name' className="mt-1 p-2 border rounded-md w-full" placeholder="What would you like us to call you?" maxLength="20" required/>
                        </div> */}

                        {/* profile picture */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            <input type="file" className="mt-1 p-2 border rounded-md w-full" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                            <p className="text-sm text-gray-500 mt-1">Upload a profile picture (JPG, PNG, or GIF).</p>
                        </div>

                        {/* bio */}
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea id='description' className="mt-1 p-2 border rounded-md w-full resize-none" rows="4" maxLength="100" placeholder="Tell us about yourself..." />
                        </div>

                        {/* gender */}
                        <div className="mb-4">
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="genderSelect" name="gender" className="mt-1 p-2 border rounded-md w-full">
                                <option value="None">Prefer Not to Say</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* birthday */}
                        <div className="mb-4">
                            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthday</label>
                            <input type="date" id="birthdate" name="birthdate" className="mt-1 p-2 border rounded-md w-full" max="9999-12-31"/>
                        </div>

                        {/* location */}
                        <div className="mb-4">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="location" name="location" className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your Location" />
                        </div>

                        {/* buttons */}
                        <div className="flex justify-end">

                            <button type='submit' className={`py-2 px-4 rounded-md bg-pistachio text-white transition-all ${isValid ? 'hover:scale-105 active:scale-100' : 'opacity-50'}`} disabled={!isValid}>
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

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p className='mt-2 ml-2'>Checking...</p>;
  } else if (username === '') {
    return null;
  } else if (username.length < 3 || username.length > 15 && !isValid) {
    return <p className="mt-2 ml-2">Username should have 3-15 characters!</p>;
  } else if (isValid) {
    return <p className="mt-2 ml-2">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="mt-2 ml-2">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

export default withAuth(AccountSetup);