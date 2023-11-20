import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore, storage, firebase } from '../lib/firebase';
import { arrayRemove } from 'firebase/firestore';
import Select from 'react-select'
import Router from 'next/router';
import toast from 'react-hot-toast';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { postDeleteConfirmationModalStyle, editPostModalStyle, sharePostModalStyle } from '../lib/modalstyle';
import Comment from './Comment';

export default function PostExpanded({ props }) {

    useEffect(() => {
      if (document.getElementById('root')) {
        Modal.setAppElement('#root');
      }
    }, []);

    // if postAction is comment, direct cursor to comment box
    useEffect(() => {
        if (postAction === 'comment') {
            document.getElementById('comment-body').focus();
        }
    }, []);

    const {
        currentUserID, postID, postBody, 
        postCategory, postTrackerLocation,
        postPets, postDate, imageUrls,
        authorID, authorDisplayName, authorUsername, 
        authorPhotoURL, formatDate,
        isEdited, taggedPets, 
        setShowPostExpanded, postAction
    } = props 

    // get currentUser data
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (currentUserID) {
            firestore.collection('users').doc(currentUserID).get()
            .then((doc) => {
                setCurrentUser(doc.data());
            })
        }
    }, []);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
        
    const [showDeletePostModal, setShowDeletePostModal] = useState(postAction === 'delete');
    const [showSharePostModal, setShowSharePostModal] = useState(postAction === 'share');
    const [showEditPostModal, setShowEditPostModal] = useState(postAction === 'edit');

    const [editedPostBody, setEditedPostBody] = useState(postBody);
    const [editedCategory, setEditedCategory] = useState({ value: postCategory, label: postCategory });
    const [editedPostTrackerLocation, setEditedPostTrackerLocation] = useState(postTrackerLocation);

    const [isFocused, setIsFocused] = useState(false);

    const handleSelectEditedCategory = (editedCategory) => {
      setEditedCategory(editedCategory);
    };

    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

    const handleDeletePost = async () => {
      
      // recap: every path created
      // posts/postID (firestore)
      // users/userID/posts/postID (firestore)
      // posts/postID/imageURL (storage)
      
      // deleting post from firestore
      const postRef = firestore.collection('posts').doc(postID);
      await postRef.delete();

      // delete image urls from storage
      imageUrls.forEach(async (url) => {
        const imageRef = storage.refFromURL(url);
        await imageRef.delete();
      });
  
      // delete postID from user posts
      const userRef = firestore.collection('users').doc(authorID);
      await userRef.update({
        posts: arrayRemove(postID)
      });

      // reload page
      // window.location.reload();

      toast.success('Post deleted successfully!');
    }

    const handleEditPost = async () => {

      if (!editedPostBody) {
        toast.error('Bark up some words for your post!');
        return;
      }

      if (postCategory === 'Lost Pets' || postCategory === 'Unknown Owner' || postCategory === 'Retrieved Pets') {
        if (!editedPostTrackerLocation) {
          toast.error('Please enter a tracker location!');
          return;
        }
      }

      const postRef = firestore.collection('posts').doc(postID);
      await postRef.update({
        postBody: editedPostBody,
        postCategory: editedCategory.value,
        postTrackerLocation: editedPostTrackerLocation,
        isEdited: true
      });

      // reload page
      // window.location.reload();

      toast.success('Post edited successfully!');

      setShowEditPostModal(false);
    }

    // get likes
    const [reactions, setReactions] = useState([]);
    // TODO: reactions functionality

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


    const [commentBody, setCommentBody] = useState('');
    // TODO: edit comment functionality

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
            authorDisplayName: currentUser.displayName,
            authorUsername: currentUser.username,
            authorPhotoURL: currentUser.photoURL,
            isEdited: false,
        });

        setCommentBody('');

        toast.dismiss();
        toast.success('Comment posted successfully!');
    }

    return (
        <div className='w-full h-full flex flex-col'>
            {/* expanded controls */}
            <div className='w-full h-10 pt-4 rounded-t-lg flex flex-row justify-between items-center pr-4 pl-4'>
                <h1 className='w-full text-center font-bold'>
                    {authorDisplayName}&apos;s Post
                </h1>

                <i  
                    onClick={() => setShowPostExpanded(false)}
                    className='fa-solid fa-circle-xmark font-bold hover:text-xanthous cursor-pointer'
                 />
            </div>
        
            {/* expanded post */}
            <div
                className='w-full h-full rounded-lg mt-2 pr-6 pl-6 flex flex-col overflow-y-auto'>

                {/* Header */}
                <div id="post-header" className='flex flex-row justify-between'>

                    <div className='flex flex-row justify-start items-start '>
                        <div id="user-image">
                        <Image width={45} height={45} src={authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm'/>
                        </div>

                        <div id='post-meta' className='ml-4 items-center justify-center'>
                            <div id='user-meta' className='flex flex-row gap-2'> {/* displayName, username */}
                            <div id='display-name' className='font-bold'><p>{authorDisplayName}</p></div>
                            <div className='font-bold'>·</div>
                            <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-bold transition-all'><p>@{authorUsername}</p></Link>
                            </div>

                            <div id='publish-date' className='flex flex-row gap-2 items-center'> {/* YYYY-MM-DD at HH-MM */}
                            <p className='text-sm'>{formatDate(postDate)}</p>
                            {isEdited ? 
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

                    <div className='flex flex-col w-fit items-end'>
                        {postCategory !== 'Default' && (
                        <div className='flex flex-row items-center justify-center gap-2'>
                            <div className='w-3 h-3 rounded-full bg-grass'></div>
                            <p>{postCategory}</p>
                        </div>
                        )}
                    </div>

                </div>

                {/* Body */}
                <div id='post-body' className='mt-3 flex flex-col'>
                    <div id='post-pets' className='mr-auto mb-2'>
                    
                    {postPets.length > 0 && ( // display pet name if post has tagged pets
                        <div className='flex flex-row items-center justify-center gap-2'>
                            {taggedPets.length === 1 && <i class="fa-solid fa-tag text-md"></i>}
                            {taggedPets.length > 1 && <i class="fa-solid fa-tags text-md"></i>}
                            <p className='text-md'>
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

                    { (postCategory === 'Lost Pets' || postCategory === 'Unknown Owner' || postCategory === 'Retrieved Pets') && 
                        <div className='flex flex-row items-center gap-2 mb-2'>
                        <i className='fa-solid fa-location-crosshairs'/>
                        <p className='line-clamp-1 overflow-hidden text-md'>{postTrackerLocation}</p>
                        </div>
                    }

                    <div id='post-text'>
                        <p className='whitespace-pre-line'>{postBody}</p>
                    </div>
                
                    { imageUrls.length >= 1 &&
                        <div id="post-image" className='mt-4 h-[300px] w-auto flex items-center justify-center relative'>
                            {imageUrls.length > 1 && (
                                <>
                                <i className="fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" onClick={prevImage}></i>
                                <i className="fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" onClick={nextImage}></i>
                                </>
                            )}
                            
                            <Image src={imageUrls[currentImageIndex]} alt="post image" 
                                layout='fill'
                                objectFit='contain'
                                className='rounded-lg'
                            />
                        </div>
                    }
                </div>

                {/* Footer */}
                <div id='post-footer' className='mt-4 pb-4 flex flex-row w-full justify-between relative border-b border-dark_gray'>
                    <div id="left" className='flex flex-row gap-4'>
                    <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
                    <i 
                        className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)}
                    />
                    <p>0</p>

                    {isOverlayVisible && (
                        <div 
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)}
                        id='overlay' 
                        className='absolute bottom-4 -left-2 flex flex-row gap-2 w-[300px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                        >
                        <Image src={likeReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        <Image src={heartReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        <Image src={laughReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        <Image src={wowReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        <Image src={sadReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        <Image src={angryReaction} alt="like reaction" className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'/>
                        </div>
                    )}
                    </div>
                    
                    <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
                    <i className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all" 
                        onClick={() => {
                            document.getElementById('comment-body').focus();
                        }}
                        />
                    <p>{comments.length}</p>
                    </div>

                    <div id="share-control">
                    <i 
                        onClick={() => setShowSharePostModal(true)} 
                        className="fa-solid fa-share-nodes hover:text-grass hover:cursor-pointer transition-all" />

                        <Modal isOpen={showSharePostModal} onRequestClose={() => setShowSharePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={sharePostModalStyle}>
                            <div className='flex flex-col w-full h-full'>
                                <div className='flex flex-row justify-center items-center'>
                                    <p className='font-semibold'>Share Post</p>
                                </div>

                                <div className='h-full mt-2 mb-3'>
                                    <textarea 
                                        id="post-body" 
                                        value={editedPostBody}
                                        onChange={(event) => setEditedPostBody(event.target.value)}
                                        placeholder='Say something about this...' 
                                        className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-full p-4' 
                                    />
                                </div>
                                
                                <div className='flex flex-row gap-2 mb-4'>
                                    <button 
                                    className='px-4 py-2 bg-black text-white font-semibold hover:bg-red-600 rounded-lg text-sm cursor-pointer w-1/2 transition-all'
                                    onClick={() => setShowSharePostModal(false)}>
                                        Cancel
                                    </button>

                                    <button 
                                    className='bg-xanthous hover:bg-pistachio text-white font-semibold rounded-md px-4 text-sm py-2 w-1/2 transition-all'>
                                        Share now
                                    </button>
                                </div>
                                <hr className=''></hr>
                                <div className='mt-2'>
                                    Share to
                                    <div className='flex justify-between mt-2'>
                                    <div className='relative w-14 h-14 bg-pistachio rounded-full hover:bg-grass'>
                                        <i className='absolute inset-0 flex items-center justify-center text-white text-2xl fas fa-link hover:scale-110 cursor-pointer'></i>
                                    </div>
                                    <div className='relative w-14 h-14 bg-pistachio rounded-full hover:bg-grass'>
                                        <i className='absolute inset-0 flex items-center justify-center text-white text-2xl fas fa-brands fa-facebook hover:scale-110 cursor-pointer'></i>
                                    </div>
                                    <div className='relative w-14 h-14 bg-pistachio rounded-full hover:bg-grass'>
                                        <i className='absolute inset-0 flex items-center justify-center text-white text-2xl fas fa-brands fa-x-twitter hover:scale-110 cursor-pointer'></i>
                                    </div>
                                    <div className='relative w-14 h-14 bg-pistachio rounded-full hover:bg-grass'>
                                        <i className='absolute inset-0 flex items-center justify-center text-white text-2xl fas fa-ellipsis hover:scale-110 cursor-pointer'></i>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>

                <div id="right" className='flex flex-row gap-4 items-center'>
                    {currentUserID !== authorID && 
                    <div id='report-control'>
                        <i className="fa-solid fa-flag hover:text-grass hover:cursor-pointer transition-all"></i>
                    </div>
                    }

                    {currentUserID === authorID && (
                    <>
                        <div id="edit-control">
                        <i className="fa-solid fa-pencil hover:text-grass hover:scale- hover:cursor-pointer"
                        onClick={() => setShowEditPostModal(true)}
                        >
                        </i>

                        <Modal isOpen={showEditPostModal} onRequestClose={() => setShowEditPostModal(false)} className='flex flex-col items-center justify-center outline-none' style={editPostModalStyle}>
                            <div className='flex flex-col w-full h-full'>
                            <div className='flex flex-row justify-center items-center'>
                                <p className='font-semibold'>Edit Post</p>
                            </div>

                            <div className='h-full mt-2 mb-4 w-full flex flex-col justify-start gap-4'>

                                {
                                (postCategory === 'Lost Pets' || postCategory === 'Unknown Owner') && 
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
                                (postCategory === 'Retrieved Pets') && 
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
                                (postCategory !== 'Lost Pets' && postCategory !== 'Unknown Owner' && postCategory !== 'Retrieved Pets') && 
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
                                (postCategory === 'Lost Pets' || postCategory === 'Unknown Owner') &&
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

                {/* Comments */}
                <div id='post-comments' className='mt-4 flex h-full flex-col w-full justify-between relative'>
                    
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
                                            currentUserPhotoURL: currentUser.photoURL,
                                            currentUserUsername: currentUser.username,
                                            currentUserDisplayName: currentUser.displayName,
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

            {/* write comment */}
            <div id='write-comment' className='mt-3 pb-3 pl-6 pr-6'>
                <form 
                    onSubmit={handleComment}
                    className='flex flex-row items-start justify-center h-full'>
                    <div className='flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                        {currentUser && <Image src={currentUser.photoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>}
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
                        className={`outline-none resize-none border border-[#d1d1d1] rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
                    />

                    <button
                        type='submit'
                        className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                        <i className='fa-solid fa-paper-plane text-sm'></i>
                    </button>
                </form>
            </div>  
        </div>
      
    )
}