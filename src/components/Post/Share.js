import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { firestore, storage, firebase } from '../../lib/firebase';
import { arrayUnion } from 'firebase/firestore';

export default function Share({props}) {
    const {
        currentUserID, currentUserPhotoURL, currentUserUsername, 
        currentUserDisplayName, postID, postBody, postCategory, 
        postTrackerLocation, postPets, postDate, imageUrls, 
        authorID, authorDisplayName, authorUsername, 
        authorPhotoURL, taggedPets, setShowSharePostModal
    } = props;

    const [shareBody, setShareBody] = useState('');

    const [reposting, setReposting] = useState(false);

    const handleRepost = async (e) => {
        e.preventDefault();

        if (shareBody.trim() === '') {
            toast.error('Caption is empty!');
            return;
        }

        setReposting(true);
        toast.loading('Reposting...');

        // create reference for post
        const postRef = firestore.collection('posts').doc();
        const repostID = postRef.id;

        const repost = {
            authorID: currentUserID,
            authorDisplayName: currentUserDisplayName,
            authorUsername: currentUserUsername,
            authorPhotoURL: currentUserPhotoURL,
             
            id: repostID,
            postDate: new Date().toISOString(),
            postType: 'repost',
            postBody: shareBody,
            isEdited: false,

            repostID: postID,
            repostBody: postBody,
            repostCategory: postCategory,
            repostPets: postPets,
            repostDate: postDate,
            repostImageUrls: imageUrls,
            repostAuthorID: authorID,
            repostAuthorDisplayName: authorDisplayName,
            repostAuthorUsername: authorUsername,
            repostAuthorPhotoURL: authorPhotoURL,

            comments: [],
            reactions:[],
        }

        // add repost to firestore
        await postRef.set(repost);

        // add repost to user's reposts
        const userRef = firestore.collection('users').doc(currentUserID);
        await userRef.update({
            posts: arrayUnion(repostID)
        });

        toast.dismiss();
        toast.success('Repost successful!');
        e.stopPropagation();
        setReposting(false);
        setShowSharePostModal(false);
    }

    return (
        <div className='flex flex-col w-full h-full justify-between'>
            <div className='flex flex-row w-full justify-between items-center'>
                <p className='font-bold text-center w-full pl-2'>Share {authorUsername}`s Post</p>
                <i className='fa-solid fa-circle-xmark hover:text-xanthous cursor-pointer' onClick={() => setShowSharePostModal(false)}/>
            </div>

            <div className='w-full h-full mt-5 mb-2'>
                <textarea 
                    id="share-body"
                    name="share-body"
                    value={shareBody}
                    maxLength={400}
                    onChange={(e) => setShareBody(e.target.value)}
                    placeholder='Caption to quote post...'
                    className='outline-none resize-none w-full border border-[#d1d1d1] rounded-lg p-2 h-full'
                />
            </div>

            <div className='flex flex-row w-full items-center mt-3 mb-2 text-lg gap-4'>
                <button 
                    className={`bg-black text-[#FAFAFA] flex flex-row gap-2 w-full items-center h-10 justify-center font-shining rounded-md transition-all ${(reposting || shareBody === '')? 'cursor-not-allowed opacity-60' : 'hover:bg-grass hover:text-pale_yellow'}`}
                    onClick={(e) => handleRepost(e)}
                >
                    <i className='fa-solid fa-retweet'/>
                    <p>Repost</p>
                </button>

                <button 
                    className='bg-black text-[#FAFAFA] flex flex-row gap-2 min-w-[40px] items-center justify-center font-shining rounded-md h-10  hover:bg-grass hover:text-pale_yellow transition-all'
                    onClick={() => {
                        const url = `https://bantaybuddy.vercel.app/post/${postID}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Link copied to clipboard!');
                    }}
                >
                    <i className='fa-solid fa-link'/>
                </button>
            </div>
        </div>
    )
}
