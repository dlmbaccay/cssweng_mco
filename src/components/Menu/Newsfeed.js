import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import { createPostModalStyle } from '../../lib/modalstyle';
import CreatePost from '../CreatePost';
import PostSnippet from '../PostSnippet';

import { firestore } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';

export default function Newsfeed({ props }) {
  const { 
    user, username, description, 
    email, displayName, userPhotoURL,
    showCreatePostForm, setShowCreatePostForm,
  } = props;

  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const q = query(collection(firestore, "posts"), orderBy("postDate", "desc"), limit(5));

    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            const newPosts = 
              snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(post => post.postCategory !== "Lost Pets" && post.postCategory !== "Found Pets");
            
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
  }, []);

  const fetchMorePosts = async () => {
    if (lastVisible && !loading) {
        setLoading(true);
        const nextQuery = query(collection(firestore, "posts"), orderBy("postDate", "desc"), startAfter(lastVisible), limit(5));
        const querySnapshot = await getDocs(nextQuery);
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(newLastVisible);
        const newPosts = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(post => post.postCategory !== "Lost Pets" && post.postCategory !== "Found Pets");

        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col justify-center items-center pt-8 pb-8'>
        {/* create post */}
        <div className='flex flex-row w-[800px] min-h-[100px] bg-snow drop-shadow-lg rounded-lg items-center justify-evenly'>
            {userPhotoURL && <Image src={userPhotoURL} alt={'profile picture'} width={50} height={50} className='h-[60px] w-[60px] rounded-full'/>}
            <button
                className='bg-gray h-[60px] w-[85%] text-sm rounded-xl flex pl-4 items-center hover:bg-white'
                onClick={() => setShowCreatePostForm(true)}
            >
                <input className='text-sm bg-transparent' placeholder='What`s on your mind?' disabled />
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

        <div className='w-full h-full justify-start items-center flex flex-col mt-8 mb-16 gap-8'>
          {posts.map((post, index) => (
              <div key={post.id}>
                <PostSnippet
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
              </div>
          ))}
          {loading && <div>Loading...</div>}
          {lastVisible && (
            <button
              className='mt-4 px-4 py-2 text-white bg-grass rounded-lg text-sm hover:bg-raisin_black transition-all'
              onClick={fetchMorePosts}
              disabled={loading}
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </>
  );
}
