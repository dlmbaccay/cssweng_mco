import { auth, storage, STATE_CHANGED, firestore } from '../lib/firebase';
import { UserContext } from '../lib/context';
import Image from 'next/image';
import Router from 'next/router';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';

function handleSignOut() {
    auth.signOut().then(() => {
        window.location.href = "/Login";
    });
}

export default function AccountSetup() {

    const { user } = useContext(UserContext)

    const [usernameFormValue, setUsernameFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = Router;

    const [userPhotoURL, setUserPhotoURL] = useState(null);
    const [coverPhotoURL, setCoverPhotoURL] = useState(null);

    const onChange = (e) => {
        // Force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/; // restriction for username, only letters, numbers, periods, and underscores

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
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
    const checkUsername = useCallback(
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
        const userPhotoURL = storage.ref(`profilePictures/${user.uid}/profilePic`);
        const userTask = userPhotoURL.put(userPhotoFile);

        const coverPhotoFile = await fetch('/images/coverPhotoHolder.png').then(res => res.blob());
        const coverPhotoURL = storage.ref(`coverPictures/${user.uid}/coverPic`);
        const coverTask = coverPhotoURL.put(coverPhotoFile);

        // Listen to updates to upload task
        userTask.on(STATE_CHANGED, (snapshot) => {
            userTask
            .then((d) => userPhotoURL.getDownloadURL())
            .then((url) => { setUserPhotoURL(url); });
            
            coverTask
            .then((d) => coverPhotoURL.getDownloadURL())
            .then((url) => {
                setCoverPhotoURL(url);
            });
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Create refs for both documents
        const userDoc = firestore.doc(`users/${user.uid}`);
        const usernameDoc = firestore.doc(`usernames/${usernameFormValue}`);

        const batch = firestore.batch();

        batch.set(userDoc, {
            username: usernameFormValue,
            photoURL: userPhotoURL,
            displayName: document.querySelector("#display-name").value,
            description: document.querySelector("#description").value,
            email: user.email,
            followers: [],
            following: [],
            
            // pets: [],
            
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

    return (
        <>

            Hello Mofo!

            Welcome to Account Setup!

            <form onSubmit={onSubmit}>
                <div>
                {/* username */}
                    <p> <label htmlFor="username"> Be creative! </label> </p>
                    <input id="username" placeholder="Select Username" value={usernameFormValue} onChange={onChange} required/>
                    <UsernameMessage username={usernameFormValue} isValid={isValid} loading={loading} />
                </div>

                <div>
                    <p> <label htmlFor="display-name">What would you like us to call you?</label></p>
                    <input type="text" id='display-name' placeholder='Select Display Name' maxLength="20" required/>
                </div>

                <div>
                    <>
                    <label className="btn">
                        📸 Upload Profile Picture
                        <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" required/>
                    </label>
                    </>

                    {userPhotoURL && <Image src={userPhotoURL} alt="Profile Picture" width={200} height={200}/>}
                </div>

                <div>
                    <p> <label htmlFor="description">Tell us more about you!</label></p>
                    <textarea id='description' placeholder='Description' required/>
                </div>
                    
                <div>
                    <p> <label htmlFor="gender">Gender</label> </p>
                    <select id="genderSelect" name="gender">
                        <option value="Man">Man</option>
                        <option value="Woman">Woman</option>
                        <option value="Other">Other</option>                        
                    </select>
                </div>

                <div>
                    <p> <label htmlFor="birthdate">Birthdate</label></p>
                    <input type="date" id="birthdate" name="birthdate" />
                </div>

                <div>
                    <p> <label htmlFor="birthplace">Birthplace</label></p>
                    <input type="text" id="birthplace" name="birthplace" placeholder="City, State, Country" />
                </div>

                <div>
                    <p> <label htmlFor="location">Location</label></p>
                    <input type="text" id="location" name="location" placeholder="Location" />
                </div>

                <div>
                    <button type='submit'>Submit</button>
                </div>
            </form>

            <div>
                <button onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>
        </>
    )
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}