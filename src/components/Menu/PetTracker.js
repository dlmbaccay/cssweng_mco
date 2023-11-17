import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import { createPostModalStyle } from '../../lib/modalstyle';
import CreatePost from '../CreatePost';
import PostSnippet from '../PostSnippet';

import { firestore } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';

export default function PetTracker({ props }) {
  const { 
    user, username, description, 
    email, displayName, userPhotoURL,
    showCreatePostForm, setShowCreatePostForm,
  } = props;
  
  const [activeContainer, setActiveContainer] = useState('Lost Pets');

  // States for Lost Pets
  const [lostPets, setLostPets] = useState([]);
  const [lastVisibleLost, setLastVisibleLost] = useState(null);
  const [loadingLost, setLoadingLost] = useState(false);

  // States for Found Pets
  const [foundPets, setFoundPets] = useState([]);
  const [lastVisibleFound, setLastVisibleFound] = useState(null);
  const [loadingFound, setLoadingFound] = useState(false);

  // Initial fetch for Lost Pets
  useEffect(() => {
    setLoadingLost(true);

    const q = query(
      collection(firestore, "posts"), 
      where("postCategory", "==", "Lost Pets"),
      orderBy("postDate", "desc"), limit(3)
    );

    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLastVisibleLost(snapshot.docs[snapshot.docs.length - 1]);
            setLostPets(newPosts);
            setLoadingLost(false);
        },
        (error) => {
            console.error("Error fetching lost pets posts:", error);
            setLoadingLost(false);
        }
    );

    return () => unsubscribe();
  }, []);

  // Initial fetch for Found Pets
  useEffect(() => {
    setLoadingFound(true);

    const q = query(
      collection(firestore, "posts"), 
      where("postCategory", "==", "Found Pets"),
      orderBy("postDate", "desc"), 
      limit(3)
    );

    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLastVisibleFound(snapshot.docs[snapshot.docs.length - 1]);
            setFoundPets(newPosts);
            setLoadingFound(false);
        },
        (error) => {
            console.error("Error fetching found pets posts:", error);
            setLoadingFound(false);
        }
    );

    return () => unsubscribe();
  }, []);

  // Fetch more Lost Pets
  const fetchMoreLostPets = async () => {
    if (lastVisibleLost && !loadingLost) {
        setLoadingLost(true);
        const nextQuery = query(
          collection(firestore, "posts"), 
          where("postCategory", "==", "Lost Pets"),
          orderBy("postDate", "desc"), 
          startAfter(lastVisibleLost), 
          limit(3)
        );
        const querySnapshot = await getDocs(nextQuery);
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleLost(newLastVisible);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setLostPets(prevPosts => [...prevPosts, ...newPosts]);
        setLoadingLost(false);
    }
  };

  // Fetch more Found Pets
  const fetchMoreFoundPets = async () => {
    if (lastVisibleFound && !loadingFound) {
        setLoadingFound(true);
        const nextQuery = query(
          collection(firestore, "posts"), 
          where("postCategory", "==", "Found Pets"),
          orderBy("postDate", "desc"), 
          startAfter(lastVisibleFound), 
          limit(3)
        );
        const querySnapshot = await getDocs(nextQuery);
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleFound(newLastVisible);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(post => post.postCategory === "Found Pets");

        setFoundPets(prevPosts => [...prevPosts, ...newPosts]);
        setLoadingFound(false);
    }
  };

  return (
    <>
      <div className='flex flex-col justify-center items-center pt-8 pb-8'>

        {/* create post */}
        <div className='flex flex-row w-[800px] min-h-[100px] bg-snow drop-shadow-lg rounded-3xl items-center justify-evenly'>
            {userPhotoURL && <Image src={userPhotoURL} alt={'profile picture'} width={50} height={50} className='h-[60px] w-[60px] rounded-full drop-shadow-lg'/>}
            <button
                className='bg-dark_gray h-[60px] w-[85%] text-sm rounded-2xl flex pl-4 items-center hover:bg-gray drop-shadow-sm'
                onClick={() => setShowCreatePostForm(true)}
            >
                What`s on your mind, {displayName}?
            </button>

            {/* create post modal */}
            <Modal
                isOpen={showCreatePostForm}
                onRequestClose={() => setShowCreatePostForm(false)}
                style={createPostModalStyle}
            >
                <CreatePost 
                  props={{
                      currentUserID: user.uid,
                      displayName: displayName,
                      username: username,
                      userPhotoURL: userPhotoURL,
                      setShowCreatePostForm: setShowCreatePostForm,
                  }}
                />
            </Modal>
        </div>

        <div className='w-[800px] rounded-lg drop-shadow-lg bg-snow h-12 mt-8 mb-8 flex flex-row justify-center items-center'>
          
          <button
            onClick={() => setActiveContainer('Lost Pets')}
            className={`transition-all w-1/2 h-full rounded-l-lg text-raisin_black font-bold font-shining text-2xl hover:text-snow hover:bg-grass ${activeContainer === 'Lost Pets' ? 'text-snow bg-grass' : ''}`}
          >
            Lost Pets
          </button>

          <button
            onClick={() => setActiveContainer('Found Pets')}
            className={`transition-all w-1/2 h-full rounded-r-lg text-raisin_black font-bold font-shining text-2xl hover:text-snow hover:bg-grass ${activeContainer === 'Found Pets' ? 'text-snow bg-grass' : ''}`}
          >
            Found Pets
          </button>
        </div>

        <div className='w-full h-full justify-start items-center flex flex-col mb-16 gap-8'>
          
          {activeContainer === 'Lost Pets' && (
            <div className='w-full flex flex-col justify-start gap-8 items-center'>
              {lostPets.map((post, index) => (
                <PostSnippet key={post.id}
                  props={{
                    currentUserID: user.uid,
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
              ))}
              {loadingLost && <div>Loading...</div>}
              {lastVisibleLost && (
                <button 
                  onClick={fetchMoreLostPets} 
                  disabled={loadingLost} 
                  className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                    Load More
                </button>
        
              )}
            </div>
          )}

          {activeContainer === 'Found Pets' && (
            <div className='w-full flex flex-col justify-start gap-8 items-center'>
              {foundPets.map((post, index) => (
                <PostSnippet key={post.id}
                  props={{
                    currentUserID: user.uid,
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
              ))}
              {loadingFound && <div>Loading...</div>}
              {lastVisibleFound && (
                <button 
                  onClick={fetchMoreFoundPets} 
                  disabled={loadingLost} 
                  className='px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'>
                    Load More
                  </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
