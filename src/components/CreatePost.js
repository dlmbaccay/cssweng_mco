import React, {useState} from 'react';
import Image from 'next/image'
import Select from 'react-select'
import { firestore, storage } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function CreatePost({ props }) {

    const { 
        currentUserID, pets, displayName,
        username, userPhotoURL, setShowCreatePostForm 
    } = props

    const [postBody, setPostBody] = useState('')

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

        // create reference for post
        const postRef = firestore.collection('posts').doc();
        const postID = postRef.id;

        // create reference for post images
        const imagesRef = storage.ref(`posts/${postID}`);

        // create reference for post image urls
        const imageUrlsRef = firestore.collection('posts').doc(postID).collection('imageUrls');

        // upload images to storage
        const uploadImages = images.map((image) => {
            const imageRef = imagesRef.child(image.name);
            return imageRef.put(image);
        });

        // get image urls from storage
        const imageUrls = await Promise.all(uploadImages).then((snapshots) =>
            Promise.all(snapshots.map((snapshot) => snapshot.ref.getDownloadURL()))
        );

        // add image urls to firestore
        imageUrls.forEach((imageUrl) => {
            imageUrlsRef.add({ imageUrl });
        });

        // get post category
        const postCategory = selectedCategory.value;

        // get post pets
        const postPets = selectedPets.map(pet => pet.value);

        // get post date
        const postDate = new Date().toISOString();

        // create post object
        const post = {
            id: postID,
            postBody,
            postCategory,
            postPets,
            postDate,
            imageUrls,
            authorID: currentUserID,
            authorDisplayName: displayName,
            authorUsername: username,
            authorPhotoURL: userPhotoURL,
            likes: [],
            comments: [],
        }

        // add post to firestore
        await postRef.set(post);

        // reset form
        setSelectedPets([]);
        setSelectedCategory(null);
        setImages([]);
        setPreviewImages([]);

        // close form
        setShowCreatePostForm(false);

        // show success toast
        toast.success('Post created successfully!');
    };

    return (
    <form onSubmit={handleSubmit} id='create-post' className='flex flex-col w-full h-full justify-between'>

        {/* header */}
        <div className='flex flex-row'>
            <h1 className='w-full text-center font-bold'>Create Post</h1>
            <button onClick={() => setShowCreatePostForm(false)}>
                <i className='fa-solid fa-xmark'></i>
            </button>
        </div>

        {/* category and pets selection */}
        <div className='flex flex-row justify-center items-center mt-4'>
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
        </div>  

        {/* post body */}
        <div className='h-full mt-6'>
            <textarea 
                id="post-body" 
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
                placeholder='What`s on your mind?' 
                className='outline-none resize-none border border-[#d1d1d1] rounded-md text-raisin_black w-full h-full p-4' 
            />
        </div>

        {/* media */}
        <div className="image-previews flex flex-row w-full mt-6 mb-6">
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
                hover:bg-pistachio †ransition duration-200 ease-in-out'
            >
                <p className='font-bold'>Post</p> 
            </button>
        </div>
    </form>
    )
}
