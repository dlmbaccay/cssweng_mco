import React, { useState, useEffect } from 'react'
import { firestore } from '@/src/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where, runTransaction, transaction, increment, FieldValue } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import Image from 'next/image'
import { updateDoc, doc } from 'firebase/firestore';

export default function ReportedPosts() {

  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    // get first 10 reported posts
    setLoading(true)
    const q = firestore.collection('reports').orderBy('reportDate', 'desc')

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports = []
      querySnapshot.forEach((doc) => {
        reports.push(doc.data())
      })
      setReports(reports)
      setFilteredReports(reports)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const reasons = ['Nudity', 'Harassment', 'Violence', 'Self-Injury', 'False Information', 'Spam', 'Hate Speech', 'Others'];

  useEffect(() => {
    // filter reports based on filterValue
    if (filterValue === 'time') {
      const sortedReports = [...reports].sort((a, b) => {
        // Convert the date strings into Date objects
        const dateA = new Date(a.reportDate);
        const dateB = new Date(b.reportDate);
       
        // Subtract the dates to get a value for sorting
        return dateB - dateA;
      });
      setFilteredReports(sortedReports)
    } else {
      if (filterValue === 'Others') {
        // Filter reports wherein the selectedOptions array contains a value that does not exist in reasons array
        const sortedReports = reports.filter((report) => report.selectedOptions.some(option => !reasons.includes(option)))
        setFilteredReports(sortedReports)
      } else {
        // Filter reports wherein the selectedOptions array contains the filterValue
        const sortedReports = reports.filter((report) => report.selectedOptions.includes(filterValue))
        setFilteredReports(sortedReports)
      }
    }
    // } else if (filterValue === 'times') {
    //   setFilteredReports(sortedReports)
    // }
  }, [filterValue])



  const [openReportIndex, setOpenReportIndex] = useState(null);

  const handleAccept = async (report) => {
    // delete post from posts collection
    // delete post from user's posts collection
    // delete report from reports collection
    // update user's report count 

    const postRef = firestore.collection('posts').doc(report.reportedPostID)
    const reportRef = firestore.collection('reports').doc(report.reportID)
    const userRef = firestore.collection('users').doc(report.reportedAuthorID)

    try {
      await runTransaction(firestore, async (transaction) => {
        // Get user snapshot first
        const userSnapshot = await transaction.get(userRef);
        const userPosts = userSnapshot.data().posts || [];

        transaction.delete(postRef)

        // Delete post from user's posts collection
        const updatedPosts = userPosts.filter((postId) => postId !== report.reportedPostID);
        transaction.update(userRef, { posts: updatedPosts });

        transaction.delete(reportRef) 
        transaction.update(userRef, {
          // increment reportCount by 1
          reportCount: increment(1)
        })
      })
      toast.success('Report accepted');
    } catch (error) {
      toast.error('Transaction failed: ', error.message);
      console.log(error.message)
    }
  }

  const handleReject = async (report) => {
    // update report status to rejected

    const reportRef = firestore.collection('reports').doc(report.reportID)
    try {
      // await updateDoc(reportRef, {
      //   reportStatus: 'rejected'
      // });
      await runTransaction(firestore, async (transaction) => {
        transaction.delete(reportRef) 
      })
      toast.success('Report rejected');
    } catch (error) {
      toast.error('Transaction failed: ', error.message);
    }
  }

  return (
    <div className='w-full'>

      <div className='flex flex-row h-14 pl-6 pr-6 bg-snow items-center justify-between'>
        <h1 className='font-shining text-grass text-3xl'>View Reported Posts</h1>
        
        {/* drop down for filter */}
        {/* via Reported Post Time */}
        {/* via Reason for Reporting */}
        {/* via Times Reported */}
        <select 
          className='w-[200px] h-10 bg-snow border-2 border-grass rounded-md text-grass font-shining text-xl pl-2 pr-2'
          name="reportFilter" id="reportFilter" onChange={(e) => setFilterValue(e.target.value)}>
          <option value="filter" disabled selected>Filter</option>
          <option value="time" className='cursor-pointer'>Reported Post Time</option>
          <option value="reason" disabled>Reason for Reporting</option>
          {reasons.map((reason, index) => (
            <option key={index} value={reason} className='cursor-pointer'> → {reason}</option>
          ))}
          {/* <option value="times" className='cursor-pointer' >Times Reported</option> */}
        </select>
      </div>

      <div className='w-full overflow-scroll h-screen pb-8'>
        {loading ? 
          <div className='w-full h-full flex items-center justify-center'>
            <h1 className='font-shining text-2xl'>Loading...</h1>
          </div>
        :
          <div className='w-full'>
            {filteredReports.length === 0 ?
              <div className='w-full h-full flex items-center justify-center'>
                <h1 className='font-shining text-2xl pt-8'>No reported posts</h1>
              </div>
            :
              <div className='flex flex-col items-center w-full pt-8 pb-8 gap-8 '>
                {filteredReports.map((report, index) => (
                  <div key={index} className='drop-shadow-sm hover:drop-shadow-md bg-snow w-screen md:w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
                    
                    <div className='border-b pb-2 flex flex-row items-center justify-between'>
                      <h1 className='font-bold text-sm italic'>@{report.reporteeAuthorUsername} on {formatDate(report.reportDate)} reported:</h1>
                      <h1 className={`font-bold text-sm italic uppercase ${report.reportStatus === 'accepted' ? 'text-grass' : report.reportStatus === 'rejected' ? 'text-red-500' : ''}`}>
                        {report.reportStatus}
                      </h1>
                    </div>

                    <div className='flex flex-row items-center justify-between'>
                      
                      {report.reportedPostType === 'original' &&
                        <div className='flex flex-row items-center mt-4'>
                          <Image src={report.reportedAuthorPhotoURL} alt='' width={50} height={50} className='rounded-full' />
                          <div className= 'ml-2 flex flex-col justify-start'>
                            <div className='flex flex-row gap-1 justify-start items-center'>
                              <h1>{report.reportedAuthorDisplayName}</h1>
                              <p className='font-bold'>·</p>
                              <h1 className='font-bold'>@{report.reportedAuthorUsername}</h1>
                            </div>
                            <div className='text-sm '>
                              {formatDate(report.reportedPostDate)}
                            </div>
                          </div>
                        </div>
                      }

                      { report.reportedPostType === 'original' && 
                        <div className='flex flex-col w-fit items-end mt-3 md:mt-0 text-sm md:text-base'>
                          {report.reportedPostCategory !== 'Default' && (
                            <div className='flex flex-row items-center justify-center gap-2'>
                              <div className='w-3 h-3 rounded-full bg-grass'></div>
                              <p>{report.reportedPostCategory}</p>
                            </div>
                          )}
                        </div>
                      }

                      { report.reportedPostType === 'repost' &&
                        <div className='flex flex-row items-center mt-4'>
                          <Image src={report.reportedAuthorPhotoURL} alt='' width={50} height={50} className='rounded-full' />
                          <div className= 'ml-2 flex flex-col justify-start'>
                            <div className='flex flex-row gap-1 justify-start items-center'>
                              <h1>{report.reportedAuthorDisplayName}</h1>
                              <p className='font-bold'>·</p>
                              <h1 className='font-bold'>@{report.reportedAuthorUsername}</h1>
                            </div>
                            <div className='text-sm '>
                              {formatDate(report.reportedRepostDate)}
                            </div>
                          </div>
                        </div>
                      }
                    </div>

                    {report.reportedPostType === 'original' && (
                      <div className='flex flex-col'>
                        {
                          report.reportedPostTaggedPets.length > 0 && 
                          <div className='mt-4 flex flex-row gap-1 items-center text-xs md:text-sm'>
                            <h1 className='font-bold'>Tagged Pets:</h1>
                            <div className='flex flex-row items-center justify-start gap-2'>
                              <h1>
                                {report.reportedPostTaggedPets.map(pet => pet.petName).join(', ')}
                              </h1>
                            </div>
                          </div>
                        }

                        {
                          report.reportedPostCategory === 'Lost Pets' && 
                          <div className='mt-2 flex flex-row gap-1 text-xs md:text-sm'>
                            <h1 className='font-bold'>Last Seen:</h1>
                            <p>{report.reportedPostTrackerLocation}</p>
                          </div>
                        }

                        {
                          (report.reportedPostCategory === 'Unknown Owner' || report.reportedPostCategory === 'Retrieved Pets')  && 
                          <div className='mt-2 flex flex-row gap-1 text-xs md:text-sm'>
                            <h1 className='font-bold'>Found At:</h1>
                            <p>{report.reportedPostTrackerLocation}</p>
                          </div>
                        }

                        {
                          report.reportedPostBody !== '' && 
                          <div className='mt-4'>
                            <p className='whitespace-pre-line'>{report.reportedPostBody}</p>
                          </div>
                        }

                        {
                          report.reportedPostImageUrls.length > 0 && 
                          // only show first image
                          <div className='w-full flex items-center justify-center'> 
                            <Image src={report.reportedPostImageUrls[0]} alt='' width={200} height={200} className='rounded-lg mt-4' />
                          </div>
                        }

                      </div>
                    )}

                    {report.reportedPostType === 'repost' && (
                      <div className='flex flex-col'>
                        
                        <div className='mt-4 whitespace-pre-line'>
                          {report.reportedRepostBody}
                        </div>

                        <div className='mt-4 flex flex-col border border-[#d1d1d1] drop-shadow-md rounded-lg p-4'>
                          <div className='flex flex-row'>
                            <Image src={report.reportedOriginalAuthorPhotoURL} alt='' width={50} height={50} className='rounded-full' />
                            <div className= 'ml-2 flex flex-col justify-start'>
                              <div className='flex flex-row gap-1 justify-start items-center'>
                                <h1>{report.reportedOriginalAuthorDisplayName}</h1>
                                <p className='font-bold'>·</p>
                                <h1 className='font-bold'>@{report.reportedOriginalAuthorUsername}</h1>
                              </div>
                              <div className='text-sm '>
                                {formatDate(report.reportedOriginalPostDate)}
                              </div>
                            </div>
                          </div>

                          {report.reportedOriginalPostBody !== '' &&
                            <p className='mt-2 whitespace-pre-line'>{report.reportedOriginalPostBody}</p>
                          }

                          {(report.reportedOriginalPostImageUrls && report.reportedOriginalPostImageUrls.length > 0) &&
                            // only show first image
                            <div className='w-full flex items-center justify-center'> 
                              <Image src={report.reportedOriginalPostImageUrls} alt='' width={200} height={200} className='rounded-lg mt-4' />
                            </div>
                          }
                        </div>  
                        
                      </div>  
                    )}

                    <div 
                      className='mt-4 w-full border-t border-b pt-4 pb-4 flex flex-row items-center justify-between pr-6 pl-6 hover:text-grass cursor-pointer'
                      onClick={() => setOpenReportIndex(openReportIndex === index ? null : index)}
                    >
                      <div className='flex flex-row items-center gap-2'>
                        <i className='fa-solid fa-bars' />
                        <h1 className='font-semibold text-sm '>See report details...</h1>
                      </div>

                      <i className={`fa-solid fa-chevron-${openReportIndex === index ? 'down' : 'left'} text-sm transition-all`} />
                    </div>

                    {openReportIndex === index && (
                      <div className='flex flex-col'>

                        <div>
                          {report.selectedOptions.length > 0 && (
                            <div className='mt-4 flex flex-row gap-1 items-center text-xs md:text-sm'>
                              <h1 className='font-bold'>Reason:</h1>
                              <div className='flex flex-row items-center justify-start gap-2'>
                                <h1>
                                  {report.selectedOptions.map(option => option).join(', ')}
                                </h1>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className='mt-1 gap-1 flex flex-col text-xs md:text-sm'>
                          <p className='font-bold'>Explanation:</p>
                          <p className='whitespace-pre-line'>{report.reportBody}</p>
                        </div>
                      </div>
                    )}

                    <div className='flex flex-row items-center justify-center w-full gap-6 mt-4'>
                      <button className='text-snow font-semibold bg-grass bg-opacity-60 hover:bg-opacity-100 w-16 h-8 rounded-md text-sm' onClick={() => handleAccept(report)}>Accept</button>
                      <button className='text-snow font-semibold bg-red-400 hover:bg-red-600 w-16 h-8 rounded-md text-sm' onClick={() => handleReject(report)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        }
      </div>

    </div>
  )
}
