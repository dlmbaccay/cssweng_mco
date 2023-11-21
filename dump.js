<div className='w-full h-full flex flex-col'>
    <div
        className='w-full h-full rounded-lg mt-2 pr-6 pl-6 flex flex-col overflow-y-auto'>

        {/* Header */}
        <div id="post-header" className='flex flex-row justify-between'>

            <div className='flex flex-row justify-start items-start '>
                <div id="user-image">
                <Image width={45} height={45} src={post.authorPhotoURL} alt="user image" className='rounded-full drop-shadow-sm aspect-square'/>
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
                        <i className="fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" 
                        onClick={() => {
                            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
                        }}
                        ></i>
                        <i className="fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-grass active:scale-110 transition-all" 
                        onClick={() => {
                            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
                        }}></i>
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
                    {currentUserReaction === '' && 
                    <i 
                        className={`fa-solid fa-heart hover:text-grass hover:cursor-pointer transition-all ${isOverlayVisible? "text-grass" : ""}`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)}
                    />
                    }
                    
                    {currentUserReaction === 'like' &&
                    <Image
                        src={likeReaction}
                        alt="like reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }

                    {currentUserReaction === 'heart' &&
                    <Image
                        src={heartReaction}
                        alt="heart reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }

                    {currentUserReaction === 'haha' &&
                    <Image
                        src={laughReaction}
                        alt="haha reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }

                    {currentUserReaction === 'wow' &&
                    <Image
                        src={wowReaction}
                        alt="wow reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }

                    {currentUserReaction === 'sad' &&
                    <Image
                        src={sadReaction}
                        alt="sad reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }

                    {currentUserReaction === 'angry' &&
                    <Image
                        src={angryReaction}
                        alt="angry reaction"
                        className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                        onMouseEnter={() => setIsOverlayVisible(true)}
                        onMouseLeave={() => setIsOverlayVisible(false)} 
                    />
                    }
                <p>{reactionsLength}</p>

                {isOverlayVisible && (
                    <div 
                    onMouseEnter={() => setIsOverlayVisible(true)}
                    onMouseLeave={() => setIsOverlayVisible(false)}
                    id='overlay' 
                    className='absolute bottom-2 -left-2 flex flex-row gap-2 w-[300px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
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

                    <Modal isOpen={showSharePostModal} onRequestClose={() => setShowSharePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={sharePostModalStyle}>
                        <Share 
                            props={{
                                currentUserID: currentUserID,
                                postID: postID,
                                postBody: postBody,
                                postCategory: postCategory,
                                postTrackerLocation: postTrackerLocation,
                                postPets: postPets,
                                postDate: postDate,
                                imageUrls: imageUrls,
                                authorID: authorID,
                                authorDisplayName: authorDisplayName,
                                authorUsername: authorUsername,
                                authorPhotoURL: authorPhotoURL,
                                taggedPets: taggedPets,
                                setShowSharePostModal: setShowSharePostModal,
                            }}
                        />
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

        {/* Reactions */}
        <div className='w-fit text-sm mt-3 hover:underline cursor-pointer' onClick={() => setShowReactionsModal(true)}>
            View Reactions...

            <Modal isOpen={showReactionsModal} onRequestClose={() => setShowReactionsModal(false)} className='flex flex-col items-center justify-center outline-none' style={reactionsCountModal}>

                <Reactions props={{
                    postID: postID,
                    setShowReactionsModal: setShowReactionsModal,
                    }} 
                />

            </Modal>
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
                className={`outline-none resize-none border bg-[#f5f5f5] text-md border-[#d1d1d1] rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
            />

            <button
                type='submit'
                className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-dark_gray items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                <i className='fa-solid fa-paper-plane text-sm'></i>
            </button>
        </form>
    </div>  
</div>