import React from 'react'
import RoundIcon from './RoundIcon'

export default function CreatePost( props ) {

  const { userID, pets, userPhotoURL, username } = props

  return (
    <div id='create-post' className='mt-10 shadow-sm bg-snow rounded-3xl flex flex-col'>
        
        <div className='flex flex-row w-full h-full items-center'>

            <div className='h-[50px] w-[50px] flex items-center'>
                <RoundIcon src={userPhotoURL} alt={username + " profile picture"} />
            </div>
            
        </div>
    </div>
  )
}
