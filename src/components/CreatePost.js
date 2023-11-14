import React, {useState} from 'react';
import Image from 'next/image'
import Select from 'react-select'
import { firestore, storage, firebase } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function CreatePost({ props }) {

    const { 
        currentUserID, pets, displayName,
        username, userPhotoURL, setShowCreatePostForm 
    } = props

    const [selectedPets, setSelectedPets] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const handleSelectPets = (selectedPets) => {
        setSelectedPets(selectedPets)
    }

    const handleSelectCategory = (selectedCategory) => {
        setSelectedCategory(selectedCategory)
    }

    const handleImageUpload = (event) => {
        const newImages = [...images];
        const newPreviewImages = [...previewImages];

        for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        const imageUrl = URL.createObjectURL(file);

        if (images.length < 4) {
            newImages.push(file);
            newPreviewImages.push(imageUrl);
        }
        }

        setImages(newImages);
        setPreviewImages(newPreviewImages);
    };

    const isUploadDisabled = images.length >= 4;

    const handleDeleteImage = (index) => {
        const newImages = [...images];
        const newPreviewImages = [...previewImages];

        newImages.splice(index, 1);
        newPreviewImages.splice(index, 1);

        setImages(newImages);
        setPreviewImages(newPreviewImages);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        toast.success('Posted');
    };

    return (
    <form id='create-post' className='flex flex-col w-full h-full justify-between'>

        {/* header */}
        <div className='flex flex-row'>
            <h1 className='w-full text-center'>Create Post</h1>
            <button onClick={() => setShowCreatePostForm(false)}>
                <i className='fa-solid fa-xmark'></i>
            </button>
        </div>

        {/* category and pets selection */}
        <div className='flex flex-row justify-center items-center'>
            <div>
                <Image src={userPhotoURL} alt={username} width={70} height={70} className='rounded-full'/>
            </div>

            <div className='ml-4 flex flex-col w-full'>
                <div className='w-full'>
                    {displayName} · @{username}
                </div>

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
                        className='w-[150px]'
                    />

                    <Select 
                        options={pets.map(pet => ({value: pet.id, label: pet.petName}))}
                        value={selectedPets}
                        onChange={handleSelectPets}
                        isMulti
                        placeholder='Pet(s)'
                        className='min-w-[150px] max-w-fit'
                    />
                </div>
            </div>
        </div>  

        {/* post body */}
        <div className=''>
            <textarea 
                id="post-body" 
                placeholder='What`s on your mind?' 
                className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-[200px] p-2 max-h-fit' 
            />
        </div>

        {/* media */}
        <div className="image-previews flex flex-row w-full mb-1">
            <div>
                <label htmlFor="post-images" className={`h-[100px] w-[100px] flex justify-center items-center bg-gray ${isUploadDisabled ? 'opacity-50 cursor-default' : 'hover:text-grass cursor-pointer '}`}>
                    <i className="fa-regular fa-image text-3xl"></i>
                </label>

                <input
                    id="post-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploadDisabled}
                    className="hidden"
                />
            </div>
            
            <div className='flex flex-row gap-4 w-full ml-4'>
                {previewImages.map((imageUrl, index) => (
                    <div key={index} className="preview-image-container">
                        <button
                            type='button'
                            onClick={() => handleDeleteImage(index)}
                            className="delete-image-button"
                        >
                            <i className='fa-solid fa-xmark' />
                        </button>
                        <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            width={100}
                            height={100}
                            className="preview-image"
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* post button */}
        <div className='flex justify-center items-center w-full'>
            <button 
                type='submit'
                className='flex items-center justify-center bg-xanthous text-snow w-full h-[39px] rounded-[10px]
                hover:bg-pistachio †ransition duration-200 ease-in-out
                '
                onClick={handleSubmit}
            >
                <p className='font-bold text-lg'>Post</p> 
            </button>
        </div>
    </form>
    )
}
