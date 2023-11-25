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

      <div className='w-full overflow-scroll'>
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
              <div className='flex flex-col items-center w-full pt-8 pb-8 gap-8'>
                {reports.map((report, index) => (
                  <div key={index} className='drop-shadow-sm hover:drop-shadow-md bg-snow w-screen md:w-[650px] min-h-fit rounded-lg p-6 flex flex-col'>
                    
                    {/* reportee user meta */}
                    <div className='flex flex-row'>
                      <Image src={report.reporteeAuthorPhotoURL} alt='reportee' width={50} height={50} className='rounded-full drop-shadow-sm' />
                      
                      <div className='flex flex-col justify-center ml-2'>
                        <div className='flex flex-row gap-2 text-sm md:text-base'>
                          <h1>{report.reporteeAuthorDisplayName}</h1>
                          <div className='font-bold'>·</div>
                          <h1 className='font-bold'>@{report.reporteeAuthorUsername}</h1>
                        </div>
                        <h1 className='text-xs md:text-sm'>{formatDate(report.reportDate)}</h1>
                      </div>
                    </div>

                    <div className='text-sm md:text-base flex flex-row gap-2 items-center mt-2'>
                      <i className='fa-solid fa-flag' />
                      {report.selectedOptions.join(', ')}
                    </div>

                    <div className='mt-2 text-sm md:text-base'>
                      {report.reportBody}
                    </div>

                    {/* reported post content */}
                    <div className='mt-4 flex flex-col border border-[#d1d1d1] drop-shadow-md p-4 min-h-fit rounded-lg'>
                      <div className='flex flex-row gap-2'>
                        <Image src={report.reportedAuthorPhotoURL} alt='reportee' width={50} height={50} className='rounded-full drop-shadow-sm' />

                        <div className='flex flex-col justify-center'>
                          <div className='flex flex-row gap-2 text-sm md:text-base'>
                            <h1>{report.reportedAuthorDisplayName}</h1>
                            <div className='font-bold'>·</div>
                            <h1 className='font-bold'>@{report.reportedAuthorUsername}</h1>
                          </div>
                          <h1 className='text-xs md:text-sm'>{formatDate(report.reportedPostDate)}</h1>
                        </div>
                      </div>

                      { report.reportedPostType === 'original' &&
                        <div className='flex flex-row gap-2 mt-4 text-sm'>
                          <div className='font-bold'>Category:</div>
                          <div>{report.reportedPostCategory}</div>
                        </div>
                      }

                      { report.reportedPostPets && 
                        <div className='flex flex-row gap-2 mt-4 text-sm'>
                          <div className='font-bold'>Tagged Pets:</div>
                          <div>{report.reportedPostTaggedPets.map}</div>
                        </div>
                      }
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
