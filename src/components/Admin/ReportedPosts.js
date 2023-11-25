import React, { useState, useEffect } from 'react'

export default function ReportedPosts() {

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

    </div>
  )
}
