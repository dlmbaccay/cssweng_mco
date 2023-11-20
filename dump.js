{/* SHARE */}
<div id="share-control">
    <i className="fa-solid fa-share-nodes hover:text-grass hover:scale- hover:cursor-pointer"
    onClick={() => setShowSharePostModal(true)}
    >
    </i>

    <Modal isOpen={showSharePostModal} onRequestClose={() => setShowSharePostModal(false)} className='flex flex-col items-center justify-center outline-none' style={sharePostModalStyle}>
        <div className='flex flex-col w-full h-full'>
        <div className='flex flex-row justify-center items-center'>
            <p className='font-semibold'>Share Post</p>
        </div>

        {/* category and pets selection */}
        {/* <div className='flex flex-row justify-center items-center mt-4'>
            <div className='w-full flex flex-row gap-4'>
                <Select
                    options={[
                        {value: 'Default', label: 'Default'},
                        {value: 'Q&A', label: 'Q&A'},
                        {value: 'Tips', label: 'Tips'},
                        {value: 'Pet Needs', label: 'Pet Needs'},
                        {value: 'Lost Pets', label: 'Lost Pets'},
                        {value: 'Found Pets', label: 'Found Pets'},
                        {value: 'Milestones', label: 'Milestones'},
                    ]}
                    value={selectedCategory}
                    defaultValue={{value: 'Default', label: 'Default'}}
                    onChange={handleSelectCategory}
                    placeholder='Category'
                    className='w-1/3'
                />

                <Select 
                    options={pets.map(pet => ({value: pet.id, label: pet.petName}))}
                    value={selectedPets}
                    onChange={handleSelectPets}
                    isMulti
                    placeholder='Pet(s)'
                    className='w-2/3'
                />
            </div>
        </div>   */}

        <div className='h-full mt-2 mb-3'>
            <textarea 
                id="post-body" 
                value={newPostBody}
                onChange={(event) => setNewPostBody(event.target.value)}
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