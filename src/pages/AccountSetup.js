import { auth, storage, STATE_CHANGED, firestore } from '../lib/firebase';
import { UserContext } from '../lib/context';
import Image from 'next/image';
import Router from 'next/router';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';
import UserProfileUploader from '../components/UserProfileUploader';

export default function AccountSetup() {

    const { user, username } = useContext(UserContext)

    // const displayName = '', description = '', profilePictureURL = '';
    const [usernameFormValue, setUsernameFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = Router;

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState(null);


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
        // Get the file
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        // Makes reference to the storage bucket location
        const ref = storage.ref(`profilePictures/${user.uid}/${Date.now()}.${extension}`);
        setUploading(true);

        // TODO: fix error where profilePictures/undefined is being created in storage

        // Starts the upload
        const task = ref.put(file);

        // Listen to updates to upload task
        task.on(STATE_CHANGED, (snapshot) => {
        const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0); // pct is percentage of upload completed
        setProgress(pct);

        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        task
            .then((d) => ref.getDownloadURL())
            .then((url) => {
            setDownloadURL(url);
            setUploading(false);

            // Update user's Firestore document with profile picture URL
            const userRef = firestore.doc(`users/${user.uid}`);
            userRef.update({ photoURL: url });
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
            photoURL: downloadURL,
            displayName: document.querySelector("#display-name").value,
            description: document.querySelector("#description").value,
        })
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();

        toast.success(user.uid + " is now registered!")

        // push to Profile
        router.push(`/${usernameFormValue}`);
    };

    return (
        <>

            Hello Mofo!

            Welcome to Account Setup!

            <form onSubmit={onSubmit}>
                <div>
                {/* username */}
                    <p> <label htmlFor="username"> Be creative! </label> </p>
                    <input id="username" placeholder="Select Username" value={usernameFormValue} onChange={onChange} />
                    <UsernameMessage username={usernameFormValue} isValid={isValid} loading={loading} />
                </div>

                <div>
                    <p> <label htmlFor="display-name">What would you like us to call you?</label></p>
                    <input type="text" id='display-name' placeholder='Select Display Name' maxLength="20"  />
                </div>

                {/* <UserProfileUploader /> */}

                <div>
                    <Loader show={uploading} />
                    {uploading && <h3>{progress}%</h3>}

                    {!uploading && (
                        <>
                        <label className="btn">
                            📸 Upload Profile Picture
                            <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                        </label>
                        </>
                    )}

                    {downloadURL && <img src={downloadURL} alt="Profile Picture" />}
                </div>

                <div>
                    <p> <label htmlFor="description">Tell us more about you!</label></p>
                    <textarea id='description' placeholder='Description'/>
                </div>

                <div>
                    <button type='submit'>Submit</button>
                </div>
            </form>
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