import React, { useState, useEffect } from 'react'
import {firestore} from '@/src/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, startAfter, getDocs, where } from 'firebase/firestore';
import Image from 'next/image'

export default function ReportedPosts() {

  const [reports, setReports] = useState([])
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
    // const q = query(collection(firestore, 'reports'), orderBy('reportDate', 'desc'), limit(10))
    const q = firestore.collection('reports').orderBy('reportDate', 'desc').limit(10)

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports = []
      querySnapshot.forEach((doc) => {
        reports.push(doc.data())
      })
      setReports(reports)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className='w-full'>

      <div className='flex flex-row h-14 pl-6 pr-6 bg-snow items-center justify-between'>
        <h1 className='font-shining text-grass text-3xl'>Reported Posts</h1>
        
        {/* drop down for filter */}
        {/* via Reported Post Time */}
        {/* via Reason for Reporting */}
        {/* via Times Reported */}
        <select 
          className='w-[200px] h-10 bg-snow border-2 border-grass rounded-md text-grass font-shining text-xl pl-2 pr-2'
          name="reportFilter" id="reportFilter">
          <option value="filter" disabled selected>Filter</option>
          <option value="time">Reported Post Time</option>
          <option value="reason">Reason for Reporting</option>
          <option value="times">Times Reported</option>
        </select>
      </div>

      <div className='w-full overflow-scroll h-screen pb-8'>
        {loading ? 
          <div className='w-full h-full flex items-center justify-center'>
            <h1 className='font-shining text-2xl'>Loading...</h1>
          </div>
        :
          <div className='w-full'>
            {reports.length === 0 ?
              <div className='w-full h-full flex items-center justify-center'>
                <h1 className='font-shining text-2xl'>No reported posts</h1>
              </div>
            :
              <div className='flex flex-col items-center w-full pt-8 pb-8 gap-8 '>
                {reports.map((report, index) => (
                  <div key={index} className='drop-shadow-sm hover:drop-shadow-md bg-snow w-screen md:w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
                    
                    <div className='border-b pb-2'>
                      <h1 className='font-bold text-sm italic'>@{report.reporteeAuthorUsername} on {formatDate(report.reportDate)} reported:</h1>
                    </div>

                    <div className='flex flex-row items-center justify-between'>
                      {/* reported user meta */}
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

                    {/* {report.reportedPostType === 'repost' && (
                      // TODO: add reposted post report functionality before styling this
                      <div>
                      </div>  
                    )} */}

                    <div className='w-full border-t border-b pt-4 pb-4 flex flex-row items-center justify-between pr-6 pl-6'>
                      <div className='flex flex-row items-center gap-2'>
                        <i className='fa-solid fa-bars' />
                        <h1 className='font-semibold text-sm '>See report details...</h1>
                      </div>

                      <i className='fa-solid fa-chevron-left text-sm' />


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
