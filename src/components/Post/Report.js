import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { firestore, storage, firebase } from '../../lib/firebase';
import { arrayUnion } from 'firebase/firestore';

export default function Report({props}) {
    const {
        currentUserID, currentUserPhotoURL, currentUserUsername, 
        currentUserDisplayName, setShowReportPostModal, 
        authorID, authorDisplayName, authorUsername, authorPhotoURL, 
        
        // for original posts
        postID, postBody, postCategory, postType,
        postTrackerLocation, postPets, postDate, imageUrls, taggedPets,
        
        // (additional) for repost posts
        repostAuthorDisplayName, repostAuthorID, repostAuthorPhotoURL, repostAuthorUsername,
        repostBody, repostCategory, repostDate, repostID, repostImageUrls, repostPets
    } = props;

    // const [shareBody, setShareBody] = useState('');

    const [reporting, setReporting] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [othersInput, setOthersInput] = useState('');
    const [reportBody, setReportBody] = useState('');

    const handleCheckboxChange = (option) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter((item) => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const handleReport = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // if reportBody and selectedOptions are empty, return
        if (reportBody.trim() === '' && selectedOptions.length === 0) {
            toast.error('Please select a reason for reporting.');
            return;
        } else if (reportBody.trim() === '') {
            toast.error('Please specify your reason for reporting.');
            return;
        } else if (selectedOptions.length === 0) {
            toast.error('Please select a reason for reporting.');
            return;
        }

        setReporting(true);
        toast.loading('Reporting...');

        let finalSelectedOptions = [...selectedOptions];

        // If 'Others' is selected, replace 'Others' with the value from othersInput in the array
        if (finalSelectedOptions.includes('Others')) {
            finalSelectedOptions = finalSelectedOptions.filter(option => option !== 'Others');
            if (othersInput.trim() !== '') {
                finalSelectedOptions.push(othersInput.trim());
            }
        }
        // Increment timesReported field in post
        const postRef = firestore.collection('posts').doc(postID);
        const postDoc = await postRef.get();
        const post = postDoc.data();
        const timesReported = post.timesReported + 1;
        await postRef.update({ timesReported });

        // Add report to reports collection
        const reportsRef = firestore.collection('reports');
        const reportID = reportsRef.doc().id;
        const reportRef = reportsRef.doc(reportID);

        if (postType === 'original') {
            await reportRef.set({
                reporteeAuthorID: currentUserID,
                reporteeAuthorDisplayName: currentUserDisplayName,
                reporteeAuthorUsername: currentUserUsername,
                reporteeAuthorPhotoURL: currentUserPhotoURL,

                reportedAuthorID: authorID,
                reportedAuthorDisplayName: authorDisplayName,
                reportedAuthorUsername: authorUsername,
                reportedAuthorPhotoURL: authorPhotoURL,
                reportedPostType: postType,
                reportedPostBody: postBody,
                reportedPostCategory: postCategory,
                reportedPostTrackerLocation: postTrackerLocation,
                reportedPostPets: postPets,
                reportedPostDate: postDate,
                reportedPostImageUrls: imageUrls,
                reportedPostID: postID,
                reportedPostTaggedPets: taggedPets,

                reportID,
                reportStatus: 'unchecked',
                reportDate: new Date().toISOString(),
                reportBody: reportBody.trim(),
                selectedOptions: finalSelectedOptions,
            });
        } else if (postType === 'repost') {
            await reportRef.set({
                reporteeAuthorID: currentUserID,
                reporteeAuthorDisplayName: currentUserDisplayName,
                reporteeAuthorUsername: currentUserUsername,
                reporteeAuthorPhotoURL: currentUserPhotoURL,

                reportedOriginalPostID: repostID,
                reportedOriginalPostBody: repostBody,
                reportedOriginalPostCategory: repostCategory,
                reportedOriginalPostPets: repostPets,
                reportedOriginalPostDate: repostDate,
                reportedOriginalPostImageUrls: repostImageUrls,
                reportedOriginalAuthorID: repostAuthorID,
                reportedOriginalAuthorDisplayName: repostAuthorDisplayName,
                reportedOriginalAuthorUsername: repostAuthorUsername,
                reportedOriginalAuthorPhotoURL: repostAuthorPhotoURL,


                reportedRepostBody: postBody,
                reportedRepostID: postID,
                reportedRepostDate: postDate,
                reportedPostType : postType,

                reportedAuthorID: authorID,
                reportedAuthorDisplayName: authorDisplayName,
                reportedAuthorUsername: authorUsername,
                reportedAuthorPhotoURL: authorPhotoURL,
                
                reportID,
                reportStatus: 'unchecked',
                reportDate: new Date().toISOString(),
                reportBody: reportBody.trim(),
                selectedOptions: finalSelectedOptions,
            });
        }
        toast.dismiss();
        toast.success('Successfully reported!');
        setReporting(false);
        setShowReportPostModal(false);
    }

    const optionsGroup1 = ['Nudity', 'Harassment', 'Violence', 'Self-Injury'];
    const optionsGroup2 = ['False Information', 'Spam', 'Hate Speech', 'Others'];

    return (
        <div className='flex flex-col w-full h-full justify-between'>
            <div className='flex flex-row w-full justify-between items-center'>
                <p className='font-bold text-center w-full pl-2'>Report {authorUsername}&apos;s Post</p>
                <i className='fa-solid fa-circle-xmark hover:text-xanthous cursor-pointer' onClick={(e) => {
                    e.stopPropagation();
                    setShowReportPostModal(false);
                }}/>
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
                                    className={`w-full cursor-pointer flex items-center p-1 pl-2 h-10 border rounded ${selectedOptions.includes(option) ? 'bg-grass text-white' : 'border-gray-300'}`}
                                    >
                                    {option}
                                </label>
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
                                    className={`w-full cursor-pointer flex items-center p-1 pl-2 h-10 border rounded ${selectedOptions.includes(option) ? 'bg-grass text-white' : 'border-gray-300'}`}
                                    >
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedOptions.includes('Others') &&
                    <div className='flex flex-row gap-2 w-full mt-2'>
                        <input 
                            type='text'
                            id='others-input'
                            name='others-input'
                            value={othersInput}
                            maxLength={25}
                            onChange={(e) => setOthersInput(e.target.value)}
                            placeholder='Specify your reason...'
                            className='outline-none resize-none w-full border border-[#d1d1d1] rounded-lg p-2 h-full'
                        />
                    </div>
                }
            </div>
            
            <div className='w-full h-full mt-4 mb-2'>
                <textarea 
                    id="report-body"
                    name="report-body"
                    value={reportBody}
                    onChange={(e) => setReportBody(e.target.value)}
                    maxLength={500}
                    placeholder='Say something about your report...'
                    className='outline-none resize-none w-full border border-[#d1d1d1] rounded-lg p-2 h-full'
                />
            </div>

            <div className='flex flex-row w-full items-center mt-3 mb-2 text-lg gap-4'>
                <button 
                    className={` flex flex-row gap-2 w-20 items-center h-10 justify-center font-shining rounded-md hover:bg-red-600 ml-auto hover:text-snow transition-all }`}
                    onClick={(e) => {
                        // clear all states
                        setSelectedOptions([]);
                        setOthersInput('');
                        setReportBody('');
                        e.stopPropagation();
                        setShowReportPostModal(false);
                    }}
                >
                    <p>Cancel</p>
                </button>

                <button 
                    className={`bg-black text-[#FAFAFA] flex flex-row gap-2 w-20 items-center h-10 justify-center font-shining rounded-md hover:bg-grass hover:text-pale_yellow transition-all }`}
                    onClick={(e) => handleReport(e)}
                >
                    <p>Submit</p>
                </button>

            </div>
        </div>
    )
}
