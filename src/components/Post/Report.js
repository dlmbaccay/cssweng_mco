import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { firestore, storage, firebase } from '../../lib/firebase';
import { arrayUnion } from 'firebase/firestore';

export default function Report({props}) {
    const {
        currentUserID, currentUserPhotoURL, currentUserUsername, 
        currentUserDisplayName, postID, postBody, postCategory, 
        postTrackerLocation, postPets, postDate, imageUrls, 
        authorID, authorDisplayName, authorUsername, 
        authorPhotoURL, taggedPets, setShowReportPostModal
    } = props;

    // const [shareBody, setShareBody] = useState('');

    const [reporting, setReporting] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [othersInput, setOthersInput] = useState('');

    const handleCheckboxChange = (option) => {
        if (selectedOptions.includes(option)) {
          setSelectedOptions(selectedOptions.filter((item) => item !== option));
        } else {
          setSelectedOptions([...selectedOptions, option]);
        }
      };

    const handleReport = async (e) => {
        e.preventDefault();

        setReporting(true);
        // toast.loading('Reporting...');

    //     // create reference for post
    //     const postRef = firestore.collection('posts').doc();
    //     const repostID = postRef.id;

       

        

        const report = {
            authorID: currentUserID,
            authorDisplayName: currentUserDisplayName,
            authorUsername: currentUserUsername,
    //         authorPhotoURL: currentUserPhotoURL,
             
    //         id: repostID,
    //         postDate: new Date().toISOString(),
    //         postType: 'repost',
    //         postBody: shareBody,
    //         isEdited: false,

    //         repostID: postID,
    //         repostBody: postBody,
    //         repostCategory: postCategory,
    //         repostPets: postPets,
    //         repostDate: postDate,
    //         repostImageUrls: imageUrls,
    //         repostAuthorID: authorID,
    //         repostAuthorDisplayName: authorDisplayName,
            reportAuthorUsername: authorUsername,
            reportAuthorPhotoURL: authorPhotoURL,

    //         comments: [],
    //         reactions:[],
        }

    //     // add repost to firestore
    //     await postRef.set(repost);

    //     // add repost to user's reposts
    //     const userRef = firestore.collection('users').doc(currentUserID);
    //     await userRef.update({
    //         posts: arrayUnion(repostID)
    //     });

        toast.dismiss();
        toast.success('Report button clicked!');
        e.stopPropagation();
        // setReposting(false);
        setShowReportPostModal(false);
    }

    const optionsGroup1 = ['Nudity', 'Harassment', 'Violence', 'Self-Injury'];
    const optionsGroup2 = ['False Information', 'Spam', 'Hate Speech', 'Others'];


    return (
        <div className='flex flex-col w-full h-full justify-between'>
            <div className='flex flex-row w-full justify-between items-center'>
                <p className='font-bold text-center w-full pl-2'>Report {authorUsername}&apos;s Post</p>
                <i className='fa-solid fa-circle-xmark hover:text-xanthous cursor-pointer' onClick={() => setShowReportPostModal(false)}/>
            </div>

            

            <div className='flex flex-col mt-5 w-full'>
                <div className='flex flex-row gap-2 w-full'>
                
                <div className='flex flex-col gap-2 w-1/2'>
                    {optionsGroup1.map((option) => (
                        <div key={option} className='flex items-center'>
                        <input
                            type='checkbox'
                            id={`checkbox-${option}`}
                            name={`checkbox-${option}`}
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                            className='hidden'
                        />
                        {/* <label htmlFor={`checkbox-${option}`}>{option}</label> */}
                        <label
                            htmlFor={`checkbox-${option}`}
                            className={`w-full cursor-pointer flex items-center p-1 pl-2 border rounded ${selectedOptions.includes(option) ? 'bg-grass text-white' : 'border-gray-300'}`}
                            >
                            {option}
                        </label>
                        {option === 'Others' && selectedOptions.includes('Others') && (
                            <input
                            type='text'
                            value={othersInput}
                            onChange={(e) => setOthersInput(e.target.value)}
                            placeholder='Please specify'
                            className='ml-2 border border-[#d1d1d1] rounded p-1'
                            required
                            />
                        )}
                        </div>
                    ))}
                </div>

                <div className='flex flex-col gap-2 w-1/2'>
                    {optionsGroup2.map((option) => (
                        <div key={option} className='flex items-center'>
                        <input
                            type='checkbox'
                            id={`checkbox-${option}`}
                            name={`checkbox-${option}`}
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                            className='hidden'
                        />
                        {/* <label htmlFor={`checkbox-${option}`}>{option}</label> */}
                        <label
                            htmlFor={`checkbox-${option}`}
                            className={`w-full cursor-pointer flex items-center p-1 pl-2 border rounded ${selectedOptions.includes(option) ? 'bg-grass text-white' : 'border-gray-300'}`}
                            >
                            {option}
                        </label>
                        {option === 'Others' && selectedOptions.includes('Others') && (
                            <input
                            type='text'
                            value={othersInput}
                            onChange={(e) => setOthersInput(e.target.value)}
                            placeholder='Please specify'
                            className='ml-2 border border-[#d1d1d1] rounded p-1 w-32'
                            required
                            />
                        )}
                        </div>
                    ))}
                </div>

                
            </div>

            </div>
                <div className='w-full h-full mt-5 mb-2'>
                <textarea 
                    id="report-body"
                    name="report-body"
                    // value={shareBody}
                    maxLength={400}
                    // onChange={(e) => setShareBody(e.target.value)}
                    placeholder='Say something about your report...'
                    className='outline-none resize-none w-full border border-[#d1d1d1] rounded-lg p-2 h-full'
                />
            </div>

            <div className='flex flex-row w-full items-center mt-3 mb-2 text-lg gap-4'>
                <button 
                    className={` flex flex-row gap-2 w-20 items-center h-10 justify-center font-shining rounded-md hover:bg-red-400 ml-auto hover:text-snow transition-all }`}
                    onClick={(e) => handleReport(e)}
                >
                    <p>Cancel</p>
                </button>

                <button 
                    className={`bg-pistachio text-[#FAFAFA] flex flex-row gap-2 w-20 items-center h-10 justify-center font-shining rounded-md hover:bg-grass hover:text-pale_yellow transition-all }`}
                    onClick={(e) => handleReport(e)}
                >
                    <p>Submit</p>
                </button>

            </div>
        </div>
    )
}
