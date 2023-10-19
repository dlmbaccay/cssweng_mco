import { useState } from 'react';
import { auth, storage, STATE_CHANGED, firestore } from '../lib/firebase';
import Loader from './Loader';

// Uploads profile picture to Firebase Storage and updates user's Firestore document
export default function UserPictureUploader({ userId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

  // Creates a Firebase Upload Task
  const uploadFile = async (e) => {
    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];

    // Makes reference to the storage bucket location
    const ref = storage.ref(`profilePictures/${userId}/${Date.now()}.${extension}`);
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
          const userRef = firestore.doc(`users/${userId}`);
          userRef.update({ profilePictureURL: url });
        });
    });
  };

  return (
    <div className="box">
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
  );
}