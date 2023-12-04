import React from 'react'
import Image from 'next/image';



export default function Notifications({notifications}) {
    const notificationsList = notifications === undefined ? [] : notifications ;
    notificationsList.sort((a, b) => {
        // Convert the date strings into Date objects
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
       
        // Subtract the dates to get a value for sorting
        return dateB - dateA;
    });
       
    // console.log(notificationsList);

    const formatNotifDate = (notifdate) => {
        const date = new Date(notifdate);
        const now = new Date();
        const diff = now - date;
        const secs = Math.floor(diff / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        if (secs < 60) {
            return 'Just now';
        } else if (mins < 60) {
            return `${mins === 1 ? '1 minute' : `${mins} minutes`} ago`;
        } else if (hours < 24) {
            return `${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
        } else if (days < 7) {
            return `${days === 1 ? '1 day' : `${days} days`} ago`;
        } else if (weeks < 4) {
            return `${weeks === 1 ? '1 week' : `${weeks} weeks`} ago`;
        }
    }

    return (
        <div className="flex flex-col relative z-10 w-full bg-snow drop-shadow-xl rounded-xl pl-2 pr-2 h-full ">
        <div className="flex flex-row items-center text-left justify-between pl-2 pr-3">
            <div className="text-2xl font-bold mt-5 text-mustard inline lg:text-md">Notifications</div>
            <i className="fa-solid fa-chevron-down text-citron text-2xl "></i>
        </div>
        <hr className="border-1 border-dark_gray my-5 w-full h-1" />

            <div className="flex flex-col overflow-y-auto">
                <div className="flex flex-col gap-4 justify-start items-left">
                    {notificationsList.map((notification, index) => (
                      <div key={index} className="flex items-center p-3 hover:bg-gray leading-3">
                          <Image src={notification.userPhotoURL} width={100} height={100} alt="user-image" className="w-12 h-12 mr-4 rounded-full" />
                          <div>
                              <div style={{ wordWrap: 'break-word' }} className=''>
                                 <span className="text-sm font-bold">{notification.username}</span> 
                                 <span className="text-sm"> {notification.action}</span>
                              </div>
                              <p className='mt-1 text-xs text-raisin'>{formatNotifDate(notification.date)}</p>
                          </div>
                      </div>
                    ))}
                </div>
            </div>
        </div>
    )
}