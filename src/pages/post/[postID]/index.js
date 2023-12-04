import React, { useEffect, useState } from 'react'
import { auth, firestore } from '../../../lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs } from 'firebase/firestore';

import withAuth from '../../../components/withAuth';
import { useUserData } from '../../../lib/hooks';

import Router from 'next/router';
import Modal from 'react-modal';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { arrayRemove } from 'firebase/firestore';
import Select from 'react-select';

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { postDeleteConfirmationModalStyle, editPostModalStyle, sharePostModalStyle, reactionsCountModal, viewImageModalStyle, phoneNavModalStyle } from '../../../lib/modalstyle';
import Comment from '../../../components/Post/Comment';
import Reactions from '../../../components/Post/Reactions';
import Share from '../../../components/Post/Share';

import ExpandedNavBar from '../../../components/ExpandedNavBar';
import PhoneNav from '../../../components/PhoneNav';

function Post() {

    useEffect(() => {
    if (document.getElementById('root')) {
        Modal.setAppElement('#root');
    }
    }, []);

    useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) setPageLoading(false);
        else setPageLoading(true);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    const router = Router;
    const postID = router.query.postID;
    const [ post, setPost ] = useState(null);
    const [editedPostBody, setEditedPostBody] = useState(null);
    const [editedCategory, setEditedCategory] = useState(null);
    const [editedPostTrackerLocation, setEditedPostTrackerLocation] = useState(null);
    const [ taggedPets, setTaggedPets ] = useState([]);

    useEffect(() => {
        if (postID) {

            // check if postID is within posts
            const postRef = firestore.collection('posts').doc(postID);
            postRef.get().then((doc) => {
                if (!doc.exists) {
                    toast.error('Post not found!');
                    router.push('/404');
                }
            });

            const fetchPostAndTaggedPets = async () => {
                const postRef = firestore.collection('posts').doc(postID);
                const postDoc = await postRef.get();

                if (postDoc.exists) {
                    const postData = postDoc.data();
                    setPost({ id: postDoc.id, ...postData });
                    setEditedPostBody(postData.postBody);
                    setEditedCategory({value: postData.postCategory, label: postData.postCategory});
                    setEditedPostTrackerLocation(postData.postTrackerLocation);

                    if (postData.postType === 'original') {
                        const taggedPets = await Promise.all(postData.postPets.map(async (petID) => {
                            const petRef = firestore.collection('pets').doc(petID);
                            const petDoc = await petRef.get();
                            const pet = { id: petDoc.id, ...petDoc.data() };
                            return pet;
                        }));

                        setTaggedPets(taggedPets);
                    }

                    if (postData.postType === 'repost') {
                        if (postData.repostImageUrls === undefined) {
                            return;
                        }

                        if (postData.repostImageUrls.length > 0) {
                            setRepostImage(postData.repostImageUrls[0]);
                        }
                    }
                } else {
                    console.log('No such document!');
                }
            };

            fetchPostAndTaggedPets();
        }
    }, [postID]);

    const [repostImage, setRepostImage] = useState(null);

    // Function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} at ${hours}:${minutes}`;
    };

    const { user, username, description, email, displayName, userPhotoURL, currentUserID, notifications } = useUserData();

    const [ pageLoading, setPageLoading ] = useState(true);
    const [ isSearchInputFocused, setIsSearchInputFocused ] = useState(false);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
        
    const [showDeletePostModal, setShowDeletePostModal] = useState(false);
    const [showSharePostModal, setShowSharePostModal] = useState(false);
    const [showEditPostModal, setShowEditPostModal] = useState(false);
    
    const [isFocused, setIsFocused] = useState(false);
    
    const handleSelectEditedCategory = (editedCategory) => {
      setEditedCategory(editedCategory);
    };

    const handleDeletePost = async () => {
        // Deleting comments, replies, and their reactions associated with the post
        const commentsRef = firestore.collection('posts').doc(postID).collection('comments');
        const commentsSnapshot = await commentsRef.get();
        for (const commentDoc of commentsSnapshot.docs) {
            // Deleting reactions to each reply of a comment
            const repliesRef = commentDoc.ref.collection('replies');
            const repliesSnapshot = await repliesRef.get();
            for (const replyDoc of repliesSnapshot.docs) {
                const replyReactionsSnapshot = await replyDoc.ref.collection('reactions').get();
                for (const reactionDoc of replyReactionsSnapshot.docs) {
                    await reactionDoc.ref.delete();
                }
                // Delete the reply
                await replyDoc.ref.delete();
            }

            // Deleting reactions to the comment
            const commentReactionsSnapshot = await commentDoc.ref.collection('reactions').get();
            for (const reactionDoc of commentReactionsSnapshot.docs) {
                await reactionDoc.ref.delete();
            }
            // Delete the comment itself
            await commentDoc.ref.delete();
        }

        // Delete reactions to the post
        const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
        const reactionsSnapshot = await reactionsRef.get();
        for (const reactionDoc of reactionsSnapshot.docs) {
            await reactionDoc.ref.delete();
        }

        // Delete the post from Firestore
        const postRef = firestore.collection('posts').doc(postID);
        await postRef.delete();

        if (post?.postType === 'original') {
            // Delete images associated with the post from storage
            for (const url of post?.imageUrls) {
                const imageRef = storage.refFromURL(url);
                await imageRef.delete();
            }
        }

        // Remove the post reference from the user's posts
        const userRef = firestore.collection('users').doc(post?.authorID);
        await userRef.update({
            posts: arrayRemove(postID)
        });

        toast.success('Post deleted successfully!');

        // redirect to home page
        router.push('/');
    };

    const handleEditPost = async () => {

        if (post?.postType === 'original') {
            if (!editedPostBody) {
            toast.error('Bark up some words for your post!');
            return;
            }
        }

      if (post?.postCategory === 'Lost Pets' || post?.postCategory === 'Unknown Owner' || post?.postCategory === 'Retrieved Pets') {
        if (!editedPostTrackerLocation) {
          toast.error('Please enter a tracker location!');
          return;
        }
      }

      const postRef = firestore.collection('posts').doc(postID);
      
      if (post?.postType === 'original') {
        await postRef.update({
            postBody: editedPostBody,
            postCategory: editedCategory.value,
            postTrackerLocation: editedPostTrackerLocation,
            isEdited: true
        });
      } else if (post?.postType === 'repost') {
        await postRef.update({
            postBody: editedPostBody,
            isEdited: true,
        });
      }
      

      // reload page
      window.location.reload();

      toast.success('Post edited successfully!');

      setShowEditPostModal(false);
    }

    // get likes
    const [reactions, setReactions] = useState([]);
    
    const handleReaction = async (newReaction) => {
      const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
      const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

      for (let reaction of reactionTypes) {
        const reactionRef = reactionsRef.doc(reaction);
        const reactionDoc = await reactionRef.get();

        if (reactionDoc.exists) {
          const reactionData = reactionDoc.data();
          const userIDs = reactionData.userIDs;

          if (userIDs.includes(currentUserID)) {
            if (reaction === newReaction) {
              // User has reacted with the same type again, remove user from userIDs array
              const updatedUserIDs = userIDs.filter((userID) => userID !== currentUserID);
              await reactionRef.update({ userIDs: updatedUserIDs });
              setCurrentUserReaction('');
            } else {
              // User has reacted with a different type, remove user from current userIDs array
              const updatedUserIDs = userIDs.filter((userID) => userID !== currentUserID);
              await reactionRef.update({ userIDs: updatedUserIDs });
            }
          } else if (reaction === newReaction) {
            // User has not reacted with this type, add user to userIDs array
            await reactionRef.update({ userIDs: [...userIDs, currentUserID] });
          }
        } else if (reaction === newReaction) {
          // Reaction does not exist, create reaction and add user to userIDs array
          await reactionRef.set({ userIDs: [currentUserID] });
        }
      }

        setIsOverlayVisible(false);
    }

    const [currentUserReaction, setCurrentUserReaction] = useState('');

    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
        const unsubscribe = reactionsRef.onSnapshot((snapshot) => {
            const newReactions = snapshot.docs.map((doc) => ({
                reactionType: doc.id,
                userIDs: doc.data().userIDs,
            }));
            setReactions(newReactions);

            // find out if current user has reacted to this post
            const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types
            for (let reaction of reactionTypes) {
                const reactionData = newReactions.find(r => r.reactionType === reaction);
                if (reactionData && reactionData.userIDs.includes(currentUserID)) {
                    setCurrentUserReaction(reaction);
                    break;
                }
            }
        });

        return () => {
            unsubscribe();
        }
    }, [currentUserID]);

    // get comments
    const [comments, setComments] = useState([]);
    
    // useffect to get comments, new comments
    useEffect(() => {
        const unsubscribe = firestore.collection('posts').doc(postID).collection('comments').orderBy('commentDate', 'desc').onSnapshot((snapshot) => {
            setComments(snapshot.docs.map((doc) => ({
                commentID: doc.id,
                commentBody: doc.data().commentBody,
                commentDate: doc.data().commentDate,
                authorID: doc.data().authorID,
                authorDisplayName: doc.data().authorDisplayName,
                authorUsername: doc.data().authorUsername,
                authorPhotoURL: doc.data().authorPhotoURL,
                isEdited: doc.data().isEdited,
            })));
        });

        return () => {
            unsubscribe();
        }
    }, []);

    const [commentsLength, setCommentsLength] = useState(0);

    useEffect(() => {
      const commentsRef = firestore.collection('posts').doc(postID).collection('comments');

        const unsubscribeComments = onSnapshot(commentsRef, async (snapshot) => {
          let totalComments = snapshot.size;

          for (let doc of snapshot.docs) {
              const repliesSnapshot = await getDocs(collection(doc.ref, 'replies'));
              totalComments += repliesSnapshot.size;
          }

          setCommentsLength(totalComments);
      });

        return () => {
            unsubscribeComments();
        }
    }, [postID]);

    const [commentBody, setCommentBody] = useState('');

    const handleComment = async (event) => {
        event.preventDefault();

        if(!commentBody) {
            toast.error('Comments cannot be empty!');
            return;
        }

        toast.loading('Posting comment...');

        const commentRef = firestore.collection('posts').doc(postID).collection('comments');

        await commentRef.add({
            commentBody: commentBody,
            commentDate: new Date().toISOString(),
            authorID: currentUserID,
            authorDisplayName: displayName,
            authorUsername: username,
            authorPhotoURL: userPhotoURL,
            isEdited: false,
        });

        setCommentBody('');

        toast.dismiss();
        toast.success('Comment posted successfully!');
    }

    const [showReactionsModal, setShowReactionsModal] = useState(false);

    const [viewImage, setViewImage] = useState(false);

    const [showPhoneNavModal, setShowPhoneNavModal] = useState(false);


    if (post?.postType === 'original') return (
        <div className='flex flex-row w-full h-screen overflow-hidden'>
            <div className='hidden lg:flex lg:w-[300px]'>
            {(userPhotoURL && username) && <ExpandedNavBar 
                props={{
                    userPhotoURL: userPhotoURL,
                    username: username,
                    expanded: true,
                    notifications: notifications,
                }}
            />}
            </div>

            <div className='w-fit md:flex lg:hidden hidden'>
            {(userPhotoURL && username) && <ExpandedNavBar 
                props={{
                    userPhotoURL: userPhotoURL,
                    username: username,
                    expanded: false,
                    notifications: notifications,
                }}
            />}
            </div>

            <div className='w-full bg-dark_gray flex flex-col items-center justify-start'>            
                
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
                            currentUserUsername: username,
                            currentUserPhotoURL: userPhotoURL,
                            notifications: notifications,
                        }}
                        />
                    </Modal>
                </nav>

                {/* search and logo bar */}
                <div className='w-full bg-snow drop-shadow-lg h-14 md:flex flex-row justify-between hidden'>
                    <div className='group flex flex-row w-[400px] items-center justify-center h-full ml-8 drop-shadow-sm'>
                        <i
                        className={`fa-solid fa-search w-[40px] h-8 text-sm font-bold flex justify-center items-center rounded-l-lg transition-all cursor-pointer group-hover:bg-grass group-hover:text-pale_yellow ${isSearchInputFocused ? 'bg-grass text-pale_yellow' : 'bg-dark_gray'}`}
                        // onClick={}
                        />
                        <input 
                        type='text'
                        placeholder='Search'
                        className={`w-full h-8 pl-2 pr-4 outline-none rounded-r-lg bg-dark_gray transition-all text-sm group-hover:bg-white ${isSearchInputFocused ? 'bg-white' : 'bg_dark_gray'}`}
                        onFocus={() => setIsSearchInputFocused(true)}
                        onBlur={() => setIsSearchInputFocused(false)}
                        />
                    </div>

                    <div className='flex flex-row justify-center items-center gap-2 mr-8'>
                        <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                        <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                        <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                        </div>
                    </div>
                </div>  

                <div className='h-full w-full flex flex-col items-center justify-start overflow-y-scroll'>
                    {/* post */}
                    <div className='w-full md:w-[750px] flex flex-col bg-snow rounded-lg justify-between mt-8 mb-8 pt-4 pb-2'>
                        <div className='w-full rounded-lg mt-2 pr-6 pl-6 flex flex-col'>
                            {/* Header */}
                            <div id="post-header" className='flex flex-col md:flex-row justify-between'>

                                <div className='flex flex-row justify-start items-start '>
                                    <div id="user-image">
                                    <Image width={45} height={45} src={post?.authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm aspect-square'/>
                                    </div>

                                    <div id='post-meta' className='ml-4 items-center justify-center'>
                                        <div id='user-meta' className='flex flex-row gap-2'> {/* displayName, username */}
                                        <div id='display-name' className='font-bold'><p>{post?.authorDisplayName}</p></div>
                                        <div className='font-bold'>·</div>
                                        <Link href={'/user/' + post?.authorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{post?.authorUsername}</p></Link>
                                        </div>

                                        <div id='publish-date' className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                                        <p className='text-sm'>{formatDate(post?.postDate)}</p>
                                        {post?.isEdited ? 
                                            ( 
                                            <div className='relative flex flex-row items-center gap-2'>
                                                <i className='hover-tooltip fa-solid fa-clock-rotate-left text-xs'/> 
                                                <p className='edited-post-tooltip hidden text-xs'>Edited Post</p>
                                            </div>
                                            )
                                        : null}
                                        </div>
                                    </div>
                                </div>

                                <div className='md:mt-0 mt-3 flex flex-col w-fit items-end'>
                                    {post?.postCategory !== 'Default' && (
                                    <div className='flex flex-row items-center justify-center gap-2'>
                                        <div className='w-3 h-3 rounded-full bg-grass'></div>
                                        <p className='md:text-base text-sm'>{post?.postCategory}</p>
                                    </div>
                                    )}
                                </div>

                            </div>

                            {/* Body */}
                            <div id='post-body' className='mt-2 md:mt-3 flex flex-col'>
                                <div id='post-pets' className='mr-auto mb-2'>
                                
                                {post?.postPets.length > 0 && ( // display pet name if post has tagged pets
                                    <div className='flex flex-row items-center justify-center gap-2'>
                                        {taggedPets.length === 1 && <i class="fa-solid fa-tag text-sm md:text-md"></i>}
                                        {taggedPets.length > 1 && <i class="fa-solid fa-tags text-sm md:text-md"></i>}
                                        <p className='md:text-base text-sm'>
                                        {taggedPets.map((pet, index) => (
                                            <span key={pet.id}>
                                                <Link href={`/pet/${pet.id}`} title={pet.petName} className='hover:text-grass hover:font-bold transition-all'>
                                                    {pet.petName}
                                                </Link>
                                                {index < taggedPets.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </p>
                                    </div>
                                )}
                                </div>

                                {/* { (post?.postCategory === 'Lost Pets' || post?.postCategory === 'Unknown Owner' || post?.postCategory === 'Retrieved Pets') && 
                                    <div className='flex flex-row items-center gap-2 mb-2'>
                                    <i className='fa-solid fa-location-crosshairs text-sm md:text-base '/>
                                    <p className='line-clamp-1 overflow-hidden text-sm md:text-md'>{post?.postTrackerLocation}</p>
                                    </div>
                                } */}

                                
                                { (post?.postCategory === 'Unknown Owner' || post?.postCategory === 'Retrieved Pets') && 
                                    <div className='flex flex-row items-center gap-1 mb-2'>
                                        <p className='text-sm md:text-base'>Found At:</p>
                                        <p className='line-clamp-1 overflow-hidden text-sm md:text-base'>{post?.postTrackerLocation}</p>
                                    </div>
                                }

                                { post?.postCategory === 'Lost Pets' && 
                                    <div className='flex flex-row items-center gap-1 mb-2'>
                                        <p className='text-sm md:text-base'>Last Seen:</p>
                                        <p className='line-clamp-1 overflow-hidden text-sm md:text-base'>{post?.postTrackerLocation}</p>
                                    </div>
                                }
                                
                               

                                <div id='post-text'>
                                    <p className='whitespace-pre-line'>{post?.postBody}</p>
                                </div>
                            
                                { post?.imageUrls.length >= 1 &&
                                    <div id="post-image" className='mt-4 h-[300px] w-auto flex items-center justify-center relative'>
                                        {post?.imageUrls.length > 1 && (
                                        <>
                                            <i className="fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all pl-2 md:pl-0" 
                                            onClick={() => {
                                                setCurrentImageIndex((prevIndex) => (prevIndex - 1 + post?.imageUrls.length) % post?.imageUrls.length);
                                            }}
                                            ></i>
                                            <i className="fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all pr-2 md:pr-0" 
                                            onClick={() => {
                                                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % post?.imageUrls.length);
                                            }}></i>
                                        </>
                                        )}
                                        
                                        <Image 
                                            src={post?.imageUrls[currentImageIndex]} alt="post image" 
                                            layout='fill'
                                            objectFit='contain'
                                            className='rounded-lg cursor-pointer'
                                            onClick={() => setViewImage(true)}
                                        />

                                        {viewImage && (
                                            <Modal isOpen={viewImage} onRequestClose={() => setViewImage(false)} className='flex flex-col items-center justify-center outline-none' style={viewImageModalStyle}>
                                                <div className='flex flex-col items-center justify-center w-full h-full gap-4'>                                        
                                                    <Image src={post?.imageUrls[currentImageIndex]} alt="post image"
                                                        layout='fill'
                                                        objectFit='contain'
                                                        className='rounded-lg bg-black'
                                                    />
                                                </div>
                                            </Modal>
                                        )}
                                    </div>
                                }
                            </div>

                            {/* Footer */}
                            <div id='post-footer' className='mt-4 pb-4 flex flex-row w-full justify-between relative'>
                                <div id="left" className='flex flex-row gap-4 text-sm md:text-base items-center'>

                                    <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2 w-fit h-6'>
                                        {!currentUserReaction && 
                                        <i 
                                            className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                                            onClick={() => setIsOverlayVisible(true)}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }
                                        
                                        {currentUserReaction === 'like' &&
                                        <Image
                                            src={likeReaction}
                                            alt="like reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'heart' &&
                                        <Image
                                            src={heartReaction}
                                            alt="heart reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'haha' &&
                                        <Image
                                            src={laughReaction}
                                            alt="haha reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'wow' &&
                                        <Image
                                            src={wowReaction}
                                            alt="wow reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'sad' &&
                                        <Image
                                            src={sadReaction}
                                            alt="sad reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'angry' &&
                                        <Image
                                            src={angryReaction}
                                            alt="angry reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        <p>
                                            {reactions.length === 0 && '0'}

                                            {reactions.length > 0 && reactions.reduce((total, reaction) => total + reaction.userIDs.length, 0)} 
                                        </p>

                                        {isOverlayVisible && (
                                        <div 
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                            onMouseLeave={() => setIsOverlayVisible(false)}
                                            id='overlay' 
                                            className='absolute -left-1 md:-left-2 flex flex-row gap-2 md:w-[300px] md:h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                                        >
                                            <Image 
                                            src={likeReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('like')}
                                            />
                                            <Image 
                                            src={heartReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('heart')}
                                            />
                                            <Image 
                                            src={laughReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('haha')}
                                            />
                                            <Image 
                                            src={wowReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('wow')}
                                            />
                                            <Image 
                                            src={sadReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('sad')}
                                            />
                                            <Image 
                                            src={angryReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('angry')}
                                            />
                                        </div>
                                        )}
                                    </div>
                                    
                                    <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
                                    <i className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all" 
                                        onClick={() => {
                                            document.getElementById('comment-body').focus();
                                        }}
                                        />
                                    <p>{commentsLength}</p>
                                    </div>

                                    <div id="share-control">
                                    <i 
                                        onClick={() => setShowSharePostModal(true)} 
                                        className="fa-solid fa-share-nodes hover:text-grass hover:cursor-pointer transition-all" />

                                        <Modal isOpen={showSharePostModal} onRequestClose={() => setShowSharePostModal(false)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[60%] lg:w-[30%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow"
                                            style={{
                                            overlay: {
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                zIndex: 1000,

                                            }
                                            }}>
                                            <Share 
                                                props={{
                                                    currentUserID: currentUserID,
                                                    currentUserPhotoURL: userPhotoURL,
                                                    currentUserUsername: username,
                                                    currentUserDisplayName: displayName,
                                                    postID: postID,
                                                    postBody: post?.postBody,
                                                    postCategory: post?.postCategory,
                                                    postTrackerLocation: post?.postTrackerLocation,
                                                    postPets: post?.postPets,
                                                    postDate: post?.postDate,
                                                    imageUrls: post?.imageUrls,
                                                    authorID: post?.authorID,
                                                    authorDisplayName: post?.authorDisplayName,
                                                    authorUsername: post?.authorUsername,
                                                    authorPhotoURL: post?.authorPhotoURL,
                                                    taggedPets: post?.taggedPets,
                                                    setShowSharePostModal: setShowSharePostModal,
                                                }}
                                            />
                                        </Modal>
                                    </div>
                                </div>

                                <div id="right" className='flex flex-row gap-4 text-sm md:text-base items-center'>
                                    {currentUserID !== post?.authorID && 
                                    <div id='report-control'>
                                        <i className="fa-solid fa-flag hover:text-grass hover:cursor-pointer transition-all"></i>
                                    </div>
                                    }

                                    {currentUserID === post?.authorID && (
                                    <>
                                        <div id="edit-control">
                                        <i className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                                        onClick={() => setShowEditPostModal(true)}
                                        >
                                        </i>

                                        <Modal isOpen={showEditPostModal} onRequestClose={() => setShowEditPostModal(false)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[60%] lg:w-[30%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow"
                                            style={{
                                            overlay: {
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                zIndex: 1000,

                                            }
                                            }}>
                                            <div className='flex flex-col w-full h-full'>
                                            <div className='flex flex-row justify-center items-center'>
                                                <p className='font-semibold'>Edit Post</p>
                                            </div>

                                            <div className='h-full mt-2 mb-4 w-full flex flex-col justify-start gap-4'>

                                                {
                                                (post?.postCategory === 'Lost Pets' || post?.postCategory === 'Unknown Owner') && 
                                                    <Select 
                                                    options={[
                                                        {value: 'Retrieved Pets', label: 'Retrieved Pets'},
                                                    ]}
                                                    value={editedCategory}
                                                    onChange={handleSelectEditedCategory}
                                                    placeholder='Category'
                                                    className='w-full'
                                                    />
                                                }

                                                {
                                                (post?.postCategory === 'Retrieved Pets') && 
                                                    <Select 
                                                    options={[
                                                        {value: 'Lost Pets', label: 'Lost Pets'},
                                                        {value: 'Unknown Owner', label: 'Unknown Owner'},
                                                    ]}
                                                    value={editedCategory}
                                                    onChange={handleSelectEditedCategory}
                                                    placeholder='Category'
                                                    className='w-full'
                                                    />
                                                }

                                                {
                                                (post?.postCategory !== 'Lost Pets' && post?.postCategory !== 'Unknown Owner' && post?.postCategory !== 'Retrieved Pets') && 
                                                    <Select 
                                                        options={[
                                                            {value: 'Default', label: 'Default'},
                                                            {value: 'Q&A', label: 'Q&A'},
                                                            {value: 'Tips', label: 'Tips'},
                                                            {value: 'Pet Needs', label: 'Pet Needs'},
                                                            {value: 'Milestones', label: 'Milestones'},
                                                        ]}
                                                        value={editedCategory}
                                                        onChange={handleSelectEditedCategory}
                                                        placeholder='Category'
                                                        className='w-full'
                                                    />
                                                }

                                                {
                                                (post?.postCategory === 'Lost Pets' || post?.postCategory === 'Unknown Owner') &&
                                                    <input 
                                                        id='tracker-location'
                                                        type='text'
                                                        maxLength={50}
                                                        value={editedPostTrackerLocation}
                                                        onChange={(event) => setEditedPostTrackerLocation(event.target.value)}
                                                        placeholder='Tracker Location'
                                                        className='outline-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-[38px] p-4'
                                                    />
                                                }

                                                <textarea 
                                                    id="post-body" 
                                                    value={editedPostBody}
                                                    onChange={(event) => setEditedPostBody(event.target.value)}
                                                    placeholder='What`s on your mind?' 
                                                    className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full p-4 h-full' 
                                                />
                                            </div>
                                            
                                            <div className='flex flex-row gap-2'>
                                                <button 
                                                className='px-4 py-2 font-semibold hover:bg-black hover:text-snow rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                                                onClick={() => setShowEditPostModal(false)}>
                                                    Cancel
                                                </button>

                                                <button 
                                                className='bg-black hover:bg-grass text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all' 
                                                onClick={handleEditPost}>
                                                    Save
                                                </button>
                                            </div>
                                            </div>
                                        </Modal>
                                        </div>

                                        <div id="delete-control">
                                        <i className="fa-solid fa-trash hover:text-red-600 hover:scale- hover:cursor-pointer"
                                        onClick={() => setShowDeletePostModal(true)}
                                        ></i>

                                        <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={postDeleteConfirmationModalStyle}>
                                            <div className='flex flex-col items-center justify-center h-full gap-4'>
                                            <p className='font-bold text-center'>Are you sure you want to delete this post?</p>
                                            <div className='flex flex-row gap-4'>
                                                <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={() => setShowDeletePostModal(false)}>Cancel</button>
                                                <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={handleDeletePost}>Delete</button>
                                            </div>
                                            </div>
                                        </Modal>
                                        </div>
                                    </>
                                    )}
                                </div>
                            </div>

                            {/* Reactions Button */}
                            <div className='flex flex-row text-sm justify-between'>
                                <button className='hover:underline' onClick={() => setShowReactionsModal(true)}>
                                    View Reactions
                                    
                                    
                                    <Modal isOpen={showReactionsModal} onRequestClose={() => setShowReactionsModal(false)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-[35%] lg:w-[20%] h-[32%] overflow-auto p-4 rounded-md bg-gray-100 z-50 bg-snow"
                                        style={{
                                        overlay: {
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1000,

                                        }
                                        }}>

                                        <Reactions props={{
                                            postID: postID,
                                            setShowReactionsModal: setShowReactionsModal,
                                            }} 
                                        />

                                    </Modal>
                                </button>
                            </div>

                            {/* write comment */}
                            <div id='write-comment' className='w-full mt-3 mb-3'>
                                <form 
                                    onSubmit={handleComment}
                                    className='flex flex-row items-start justify-center w-full h-full'>
                                    <div className='hidden md:flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                                        {userPhotoURL && <Image src={userPhotoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>}
                                    </div>

                                    <textarea 
                                        id="comment-body" 
                                        value={commentBody}
                                        onChange={(event) => setCommentBody(event.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        maxLength={100}
                                        onKeyDown={(event => {
                                            if (event.key === 'Enter') {
                                                handleComment(event);
                                            }
                                        })}
                                        placeholder='Write a comment...' 
                                        className={`outline-none resize-none border bg-[#f5f5f5] text-md border-[#d1d1d1] rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
                                    />

                                    <button
                                        type='submit'
                                        className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                                        <i className='fa-solid fa-paper-plane text-sm'></i>
                                    </button>
                                </form>
                            </div>  

                            {/* Comments */}
                            <div id='post-comments' className='mt-3 mb-3 flex h-full flex-col w-full justify-between relative'>
                                
                                {comments.length === 0 ? (
                                    <div className='flex text-sm'>
                                        No comments yet...
                                    </div>    
                                ) : (
                                    <div className='flex flex-col w-full h-fit gap-3 justify-start items-start'>
                                        {comments.map((comment, index) => (
                                            <div key={comment.commentID} className='w-full h-fit'>
                                                <Comment 
                                                    props = {{
                                                        currentUserID: currentUserID,
                                                        currentUserPhotoURL: userPhotoURL,
                                                        currentUserUsername: username,
                                                        currentUserDisplayName: displayName,
                                                        postID: postID,
                                                        isEdited: comment.isEdited,
                                                        commentID: comment.commentID,
                                                        commentBody: comment.commentBody,
                                                        commentDate: comment.commentDate,
                                                        authorID: comment.authorID,
                                                        authorDisplayName: comment.authorDisplayName,
                                                        authorUsername: comment.authorUsername,
                                                        authorPhotoURL: comment.authorPhotoURL,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 
                                    - comments is a subcollection under posts
                                    has commentID, commentBody, commentDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                                    - comments has a subcollection called replies
                                    replies has replyID, replyBody, replyDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                                */}

                            </div>
                        </div>
                    </div>
                </div> 
            </div>
        </div>      
    ) 
    
    if (post?.postType === 'repost') return (
        <div className='flex flex-row w-full h-screen overflow-hidden'>
            <div className='hidden lg:flex lg:w-[300px]'>
            {(userPhotoURL && username) && <ExpandedNavBar 
                props={{
                    userPhotoURL: userPhotoURL,
                    username: username,
                    expanded: true
                }}
            />}
            </div>

            <div className='w-fit md:flex lg:hidden hidden'>
            {(userPhotoURL && username) && <ExpandedNavBar 
                props={{
                    userPhotoURL: userPhotoURL,
                    username: username,
                    expanded: false
                }}
            />}
            </div>

            <div className='w-full bg-dark_gray flex flex-col items-center justify-start'>
                
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
                            currentUserUsername: username,
                            currentUserPhotoURL: userPhotoURL,
                        }}
                        />
                    </Modal>
                </nav>

                {/* search and logo bar */}
                <div className='w-full bg-snow drop-shadow-lg h-14 md:flex flex-row justify-between hidden'>
                    <div className='group flex flex-row w-[400px] items-center justify-center h-full ml-8 drop-shadow-sm'>
                        <i
                        className={`fa-solid fa-search w-[40px] h-8 text-sm font-bold flex justify-center items-center rounded-l-lg transition-all cursor-pointer group-hover:bg-grass group-hover:text-pale_yellow ${isSearchInputFocused ? 'bg-grass text-pale_yellow' : 'bg-dark_gray'}`}
                        // onClick={}
                        />
                        <input 
                        type='text'
                        placeholder='Search'
                        className={`w-full h-8 pl-2 pr-4 outline-none rounded-r-lg bg-dark_gray transition-all text-sm group-hover:bg-white ${isSearchInputFocused ? 'bg-white' : 'bg_dark_gray'}`}
                        onFocus={() => setIsSearchInputFocused(true)}
                        onBlur={() => setIsSearchInputFocused(false)}
                        />
                    </div>

                    <div className='flex flex-row justify-center items-center gap-2 mr-8'>
                        <h1 className='font-shining text-3xl text-grass'>BantayBuddy</h1>

                        <div className='bg-grass w-[40px] h-[40px] rounded-full shadow-lg'>
                        <Image src='/images/logo.png' alt='logo' width={100} height={100} className='rounded-full'/>
                        </div>
                    </div>
                </div> 

                <div className='h-full w-full flex flex-col items-center justify-start overflow-y-scroll'>
                    <div className='w-full md:w-[750px] flex flex-col bg-snow rounded-lg justify-between mt-8 mb-8 pt-4 pb-2'>
                        <div className='w-full rounded-lg mt-2 pr-6 pl-6 flex flex-col'>
                            {/* Header */}
                            <div id='post-header' className='flex'>
                                <div id='user-image' className='flex flex-row justify-start items-start'>
                                <Image 
                                    src={post?.authorPhotoURL} alt='Profile Picture' width={45} height={45}
                                    className='rounded-full drop-shadow-sm aspect-square'
                                />
                                </div>

                                <div id='post-meta' className='ml-4 items-center justify-center'>
                                    <div id='user-meta' className='flex flex-row gap-2'>
                                        <div id='display-name' className='font-bold'><p>{post?.authorDisplayName}</p></div>
                                        <div className='font-bold'>·</div>
                                        <Link href={'/user/' + post?.authorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{post?.authorUsername}</p></Link>
                                    </div>

                                    <div id='publish-date' className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                                        <p className='text-sm'>{formatDate(post?.postDate)}</p>
                                        {post?.isEdited ? 
                                        ( 
                                            <div className='relative flex flex-row items-center gap-2'>
                                            <i className='hover-tooltip fa-solid fa-clock-rotate-left text-xs'/> 
                                            <p className='edited-post-tooltip hidden text-xs'>Edited Post</p>
                                            </div>
                                        )
                                        : null}
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div id="post-body" className='mt-3 flex flex-col'>
                                <p className=''>{post?.postBody}</p>
                            </div>

                            {/* Reposted Post */}
                            <div className='mt-3 flex flex-col w-full border border-[#d1d1d1] rounded-lg p-4 drop-shadow-md'>
                                
                                <div className='flex flex-row items-center'>
                                    <Image
                                    src={post?.repostAuthorPhotoURL} alt='Profile Picture' width={45} height={45}
                                    className='rounded-full drop-shadow-sm aspect-square w-[35px] h-[35px] md:w-[45px] md:h-[45px]'
                                    />

                                    <div className='ml-4 items-center justify-center'>
                                    <div className='flex flex-row gap-2 text-sm md:text-base'> {/* displayName, username */}
                                        <div className='font-bold'><p>{post?.repostAuthorDisplayName}</p></div>
                                        <div className='font-bold'>·</div>
                                        <Link href={'/user/' + post?.repostAuthorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{post?.repostAuthorUsername}</p></Link>
                                    </div>

                                    <div className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                                        <p className='text-xs md:text-sm'>{formatDate(post?.repostDate)}</p>
                                    </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/post/${post?.repostID}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`flex flex-row mt-2 cursor-pointer ${post?.repostBody === '' ? "justify-center" : "justify-between gap-6"}`}
                                    >
                                    <div>
                                    <p className={`overflow-hidden text-sm md:text-base ${post?.repostBody === '' ? "whitespace-pre-line line-clamp-4" : "line-clamp-1"}`}>{post?.repostBody}</p>
                                    </div>

                                    <div>
                                    {repostImage !== null ? (
                                        <Image
                                        src={repostImage} alt='Repost Image' width={200} height={200}
                                        className={`rounded-md drop-shadow-sm aspect-square ${post?.repostBody === '' ? "h-[150px] w-[150px] md:h-[200px] md:w-[200px] mt-2 md:mt-0" : "h-[100px] w-[100px] md:h-[150px] md:w-[150px]"}`}
                                        />
                                    ) : null}
                                    </div>
                                </Link>
                            </div>

                            {/* Footer */}
                            <div id='post-footer' className='mt-4 pb-4 flex flex-row w-full justify-between relative'>
                                <div id="left" className='flex flex-row gap-4 text-sm md:text-base items-center'>
                                    <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2 w-fit h-6'>
                                        {!currentUserReaction && 
                                        <i 
                                            className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                                            onClick={() => setIsOverlayVisible(true)}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }
                                        
                                        {currentUserReaction === 'like' &&
                                        <Image
                                            src={likeReaction}
                                            alt="like reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'heart' &&
                                        <Image
                                            src={heartReaction}
                                            alt="heart reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'haha' &&
                                        <Image
                                            src={laughReaction}
                                            alt="haha reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'wow' &&
                                        <Image
                                            src={wowReaction}
                                            alt="wow reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'sad' &&
                                        <Image
                                            src={sadReaction}
                                            alt="sad reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        {currentUserReaction === 'angry' &&
                                        <Image
                                            src={angryReaction}
                                            alt="angry reaction"
                                            className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                        />
                                        }

                                        <p>
                                            {reactions.length === 0 && '0'}

                                            {reactions.length > 0 && reactions.reduce((total, reaction) => total + reaction.userIDs.length, 0)} 
                                        </p>

                                        {isOverlayVisible && (
                                        <div 
                                            onMouseEnter={() => setIsOverlayVisible(true)}
                                            onMouseLeave={() => setIsOverlayVisible(false)}
                                            id='overlay' 
                                            className='absolute -left-1 md:-left-2 flex flex-row gap-2 md:w-[300px] md:h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                                        >
                                            <Image 
                                            src={likeReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('like')}
                                            />
                                            <Image 
                                            src={heartReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('heart')}
                                            />
                                            <Image 
                                            src={laughReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('haha')}
                                            />
                                            <Image 
                                            src={wowReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('wow')}
                                            />
                                            <Image 
                                            src={sadReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('sad')}
                                            />
                                            <Image 
                                            src={angryReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('angry')}
                                            />
                                        </div>
                                        )}
                                    </div>
                                    
                                    <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
                                    <i className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all" 
                                        onClick={() => {
                                            document.getElementById('comment-body').focus();
                                        }}
                                        />
                                    <p>{commentsLength}</p>
                                    </div>

                                    <div>
                                    <i id="share-control"
                                        onClick={() => {
                                        const url = `https://bantaybuddy.vercel.app/post/${postID}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success('Link copied to clipboard!');
                                        }} 
                                        className="fa-solid fa-link hover:text-grass hover:cursor-pointer transition-all" />
                                    </div>
                                </div>

                                <div id="right" className='flex flex-row gap-4 text-sm md:text-base items-center'>
                                    {currentUserID !== post?.authorID && 
                                    <div id='report-control'>
                                        <i className="fa-solid fa-flag hover:text-grass hover:cursor-pointer transition-all"></i>
                                    </div>
                                    }

                                    {currentUserID === post?.authorID && (
                                    <>
                                        <div id="edit-control">
                                        <i className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                                        onClick={() => setShowEditPostModal(true)}
                                        >
                                        </i>

                                        <Modal isOpen={showEditPostModal} onRequestClose={() => setShowEditPostModal(false)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[60%] lg:w-[30%] md:h-[60%] overflow-auto p-5 rounded-md bg-gray-100 z-50 bg-snow"
                                            style={{
                                            overlay: {
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                zIndex: 1000,

                                            }
                                            }}>
                                            <div className='flex flex-col w-full h-full'>
                                            <div className='flex flex-row justify-center items-center'>
                                                <p className='font-semibold'>Edit Post</p>
                                            </div>

                                            <div className='h-full mt-2 mb-4 w-full flex flex-col justify-start gap-4'>
                                                <textarea 
                                                    id="post-body" 
                                                    value={editedPostBody}
                                                    onChange={(event) => setEditedPostBody(event.target.value)}
                                                    placeholder='What`s on your mind?' 
                                                    className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full p-4 h-full' 
                                                />
                                            </div>
                                            
                                            <div className='flex flex-row gap-2'>
                                                <button 
                                                className='px-4 py-2 font-semibold hover:bg-black hover:text-snow rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                                                onClick={() => setShowEditPostModal(false)}>
                                                    Cancel
                                                </button>

                                                <button 
                                                className='bg-black hover:bg-grass text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all' 
                                                onClick={handleEditPost}>
                                                    Save
                                                </button>
                                            </div>
                                            </div>
                                        </Modal>
                                        </div>

                                        <div id="delete-control">
                                        <i className="fa-solid fa-trash hover:text-red-600 hover:scale- hover:cursor-pointer"
                                        onClick={() => setShowDeletePostModal(true)}
                                        ></i>

                                        <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={postDeleteConfirmationModalStyle}>
                                            <div className='flex flex-col items-center justify-center h-full gap-4'>
                                            <p className='font-bold text-center'>Are you sure you want to delete this post?</p>
                                            <div className='flex flex-row gap-4'>
                                                <button className='bg-gray-400 hover:bg-black hover:text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={() => setShowDeletePostModal(false)}>Cancel</button>
                                                <button className='bg-black hover:bg-red-600 text-white font-semibold rounded-lg px-4 text-sm py-2' onClick={handleDeletePost}>Delete</button>
                                            </div>
                                            </div>
                                        </Modal>
                                        </div>
                                    </>
                                    )}
                                </div>
                            </div>

                            {/* Reactions Button */}
                            <div className='flex flex-row text-sm justify-between'>
                                <button className='hover:underline' onClick={() => setShowReactionsModal(true)}>
                                    View Reactions
                                    
                                    
                                    <Modal isOpen={showReactionsModal} onRequestClose={() => setShowReactionsModal(false)} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-[35%] lg:w-[20%] h-[32%] overflow-auto p-4 rounded-md bg-gray-100 z-50 bg-snow"
                                        style={{
                                        overlay: {
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1000,

                                        }
                                        }}>

                                        <Reactions props={{
                                            postID: postID,
                                            setShowReactionsModal: setShowReactionsModal,
                                            }} 
                                        />

                                    </Modal>
                                </button>
                            </div>

                            {/* write comment */}
                            <div id='write-comment' className='w-full mt-3 mb-3'>
                                <form 
                                    onSubmit={handleComment}
                                    className='flex flex-row items-start justify-center w-full h-full'>
                                    <div className='hidden md:flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                                        {userPhotoURL && <Image src={userPhotoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>}
                                    </div>

                                    <textarea 
                                        id="comment-body" 
                                        value={commentBody}
                                        onChange={(event) => setCommentBody(event.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        maxLength={100}
                                        onKeyDown={(event => {
                                            if (event.key === 'Enter') {
                                                handleComment(event);
                                            }
                                        })}
                                        placeholder='Write a comment...' 
                                        className={`outline-none resize-none border bg-[#fafafa] text-md border-[#d1d1d1] rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
                                    />

                                    <button
                                        type='submit'
                                        className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                                        <i className='fa-solid fa-paper-plane text-sm'></i>
                                    </button>
                                </form>
                            </div> 

                            {/* Comments */}
                            <div id='post-comments' className='mt-3 mb-4 flex h-full flex-col w-full justify-between relative'>
                                
                                {comments.length === 0 ? (
                                    <div className='flex text-sm'>
                                        No comments yet...
                                    </div>    
                                ) : (
                                    <div className='flex flex-col w-full h-fit gap-3 justify-start items-start'>
                                        {comments.map((comment, index) => (
                                            <div key={comment.commentID} className='w-full h-fit'>
                                                <Comment 
                                                    props = {{
                                                        currentUserID: currentUserID,
                                                        currentUserPhotoURL: userPhotoURL,
                                                        currentUserUsername: username,
                                                        currentUserDisplayName: displayName,
                                                        postID: postID,
                                                        isEdited: comment.isEdited,
                                                        commentID: comment.commentID,
                                                        commentBody: comment.commentBody,
                                                        commentDate: comment.commentDate,
                                                        authorID: comment.authorID,
                                                        authorDisplayName: comment.authorDisplayName,
                                                        authorUsername: comment.authorUsername,
                                                        authorPhotoURL: comment.authorPhotoURL,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 
                                    - comments is a subcollection under posts
                                    has commentID, commentBody, commentDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                                    - comments has a subcollection called replies
                                    replies has replyID, replyBody, replyDate, authorID, authorDisplayName, authorUsername, authorPhotoURL
                                */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Post);