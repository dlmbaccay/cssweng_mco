import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Modal from 'react-modal';
import { firestore, storage, firebase } from '../lib/firebase';
import { arrayRemove } from 'firebase/firestore';
import Select from 'react-select'
import toast from 'react-hot-toast';


import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'
import { confirmationModalStyle, editPostModalStyle, sharePostModalStyle } from '../lib/modalstyle';

export default function PostSnippet({ props }) {

    useEffect(() => {
      if (document.getElementById('root')) {
        Modal.setAppElement('#root');
      }
    }, []);

    const {
        currentUserID, postID, postBody, 
        postCategory, postTrackerLocation,
        postPets, postDate, imageUrls,
        authorID, authorDisplayName, authorUsername,
        authorPhotoURL, likes, comments,
        isEdited
    } = props 

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [taggedPets, setTaggedPets] = useState([]);

    const [editedCategory, setEditedCategory] = useState({ value: postCategory, label: postCategory });

    const [editedPostTrackerLocation, setEditedPostTrackerLocation] = useState(postTrackerLocation);

    const handleSelectEditedCategory = (editedCategory) => {
      setEditedCategory(editedCategory);
    };

    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    };

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

    // get pets' names, if any
    const getTaggedPets = async () => {
      const taggedPets = await Promise.all(postPets.map(async (petID) => {
        const petRef = firestore.collection('pets').doc(petID);
        const petDoc = await petRef.get();
        const pet = petDoc.data();
        return pet;
      }));

      setTaggedPets(taggedPets);
    };

    useEffect(() => {
      if (currentUserID != '123') {
        getTaggedPets();
      }
    }, []);

    const [showDeletePostModal, setShowDeletePostModal] = useState(false);

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

    const [showSharePostModal, setShowSharePostModal] = useState(false);
    const [showEditPostModal, setShowEditPostModal] = useState(false);
    const [editedPostBody, setEditedPostBody] = useState(postBody);

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

    return (
      currentUserID === '123'? ( // if not logged in
        <div className='shadow-sm hover:shadow-lg bg-snow w-[700px] h-[500px] rounded-3xl p-6 flex flex-col'>
          {/* Header */}
            <div id="post-header" className='flex flex-row'>

              <div className='flex flex-row'>
                {/* User Image */}
                <div id="user-image">
                  <Image width={50} height={50} src={authorPhotoURL} alt="user image" className='rounded-full shadow-md'/>
                </div>

                <div id='post-meta' className='ml-4 h-full items-center justify-center'>
                    <div id='user-meta' className='flex flex-row gap-2 '>
                      {/* Display Name */}
                      <div id='display-name' className='font-bold'>
                        <p>{authorDisplayName}</p>
                      </div>

                      <div className='font-bold'>
                        ·
                      </div>

                      {/* Username */}
                      <Link href={'/user/' + authorUsername} id='display-name' className='hover:text-grass hover:font-semibold transition-all'>
                        <p>@{authorUsername}</p>
                      </Link>
                    </div>
      
                    {/* Publish Date */}
                    <div id='publish-date'>
                      <p>{postDate}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div id='post-body' className='mt-4 flex flex-col'>
              <div id='post-text'>
                <p className='whitespace-pre-line line-clamp-1 overflow-hidden'>{postBody}</p>
              </div>
              
              {/* Image Carousel */}
              <div id="post-image" className='mt-4 h-[310px] w-auto flex items-center justify-center relative'>
                {imageUrls.length > 1 && (
                  <>
                    <i className="fa-solid fa-chevron-left absolute left-0 cursor-pointer z-10" onClick={prevImage}></i>
                    <i className="fa-solid fa-chevron-right absolute right-0 cursor-pointer z-10" onClick={nextImage}></i>
                  </>
                )}
                <Image src={imageUrls[currentImageIndex]} alt="post image" 
                  layout='fill'
                  objectFit='contain'
                  className='rounded-lg'
                  />
              </div>
            </div>

            {/* Footer */}
            <div id='post-footer' className='mt-4 flex flex-row w-full justify-between relative'>
              
              <div id="left" className='flex flex-row gap-4'>
                <div id='post-reaction-control' className='flex flex-row justify-center items-center gap-2'>
                  <i className="fa-solid fa-heart hover:text-grass hover:scale- hover:cursor-pointer" 
                  ></i>
                  <p>0</p>
                </div>
                
                <div id="comment-control" className='flex flex-row justify-center items-center gap-2'>
                  <i className="fa-solid fa-comment hover:text-grass hover:scale- hover:cursor-pointer"></i>
                  <p>0</p>
                </div>

                <div id="share-control">
                  <i className="fa-solid fa-share-nodes hover:text-grass hover:scale- hover:cursor-pointer"></i>
                </div>
              </div>

              <div id="right" className='flex flex-row gap-4'>
                <div id='bookmark-control'>
                  <i className="fa-solid fa-bookmark hover:text-grass hover:scale- hover:cursor-pointer"></i>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='drop-shadow-sm hover:drop-shadow-md bg-snow w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
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
  
                  <div id='publish-date'> {/* YYYY-MM-DD at HH-MM */}
                    <p className='text-sm'>{formatDate(postDate)}</p>
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
              {/* display their names */}
              {postPets.length > 0 && (
                <div className='flex flex-row items-center justify-center gap-2'>
                  {taggedPets.length === 1 && <i class="fa-solid fa-tag text-md"></i>}
                  {taggedPets.length > 1 && <i class="fa-solid fa-tags text-md"></i>}
                  <p className='line-clamp-1 overflow-hidden text-md'>{taggedPets.map(pet => pet.petName).join(', ')}</p>
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
              <p className='whitespace-pre-line line-clamp-4 overflow-hidden'>{postBody}</p>
            </div>
            
            { imageUrls.length >= 1 &&
              <div id="post-image" className='mt-4 h-[300px] w-auto flex items-center justify-center relative'>
                {imageUrls.length > 1 && (
                  <>
                    <i className="fa-solid fa-chevron-left absolute left-0 cursor-pointer z-10" onClick={prevImage}></i>
                    <i className="fa-solid fa-chevron-right absolute right-0 cursor-pointer z-10" onClick={nextImage}></i>
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
          <div id='post-footer' className='mt-3 flex flex-row w-full justify-between relative'>
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
                <i className="fa-solid fa-comment hover:text-grass hover:cursor-pointer transition-all"></i>
                <p>0</p>
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
              
              <p className='italic text-sm font-semibold'>{isEdited ? "edited" : ""}</p>

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

                    <Modal isOpen={showDeletePostModal} onRequestClose={() => setShowDeletePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={confirmationModalStyle}>
                      <div className='flex flex-col items-center justify-center gap-4'>
                        <p className='font-bold text-base'>Are you sure you want to delete this post?</p>
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
        </div>
      )
    )
}