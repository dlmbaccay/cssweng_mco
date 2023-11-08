import React, { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks';
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import { useAllUsersAndPets } from '../lib/hooks';
import Router from 'next/router';
import PostSnippet from '../components/PostSnippet';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import Link from 'next/link';
import withAuth from '../components/withAuth';
import Loader from '../components/Loader';

// import { FaQuestion, FaEnvelope } from 'react-icons';
// import { BsBookmarkFill } from 'react-icons';
// import { LiaShoppingCartSolid } from 'react-icons';
// import { IoMdSearch } from 'react-icons';
// import { IconContext } from "react-icons";

function Home() {


  const { user, username } = useUserData();
  const router = Router;

  const { allUsers, allPets } = useAllUsersAndPets();

  const [ pageLoading, setPageLoading ] = useState(true);

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          // User is signed in.
          setPageLoading(false);
        } else {
          // No user is signed in.
          setPageLoading(true);
        }
      });
  
  // Cleanup subscription on unmount
      return () => unsubscribe();
  }, []);


  function handleViewProfile() {
    router.push(`/user/${username}`);
  }

  if (!pageLoading) {
    return (
      // <div>
      //   <div className='flex h-screen'>
      //     <NavBar />

      //     <div className='h-full w-full p-4'>
      //       {/* Current User Info */}
      //       <div className='bg-snow w-80 rounded-lg p-4'>
      //         <h1 className='text-xl font-bold mb-2'>Welcome, {user?.displayName}!</h1>
      //         <h1 className='text-sm'>Display Name: {user?.displayName}</h1>
      //         <h1 className='text-sm'>Username: {username}</h1>
      //         <h1 className='text-sm'>Email: {user?.email}</h1>
      //         <button onClick={handleViewProfile} className='bg-black w-full mt-2 text-white text-sm p-2 rounded-md hover:opacity-80 transition-all'>
      //           View Profile
      //         </button>
      //       </div>

      //       {/* all users by their usernames */}
      //       <div className='bg-snow w-80 rounded-lg p-4 mt-4'>
      //         <h1 className='text-xl font-bold mb-2'>All Users</h1>
      //         <div className='flex flex-col'>
      //           {allUsers && allUsers.map((user) => (
      //             <Link href={`/user/${user.username}`} key={user.username}>
      //               <p className='text-sm hover:underline'>{user.username}</p>
      //             </Link>
      //           ))}
      //         </div>
      //       </div>

      //       {/* all pets by their owners */}
      //       <div className='bg-snow w-80 rounded-lg p-4 mt-4'>
      //         <h1 className='text-xl font-bold mb-2'>All Pets</h1>
      //         <div className='flex flex-col'>
      //           {allPets && allPets.map((pet) => (
      //             <Link href={`/pet/${pet.id}`} key={pet.petName}>
      //               <p className='text-sm hover:underline'>{pet.petName}</p>
      //             </Link>
      //           ))}
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      <div className = 'bg-gray flex flex-row min-h-screen h-screen w-full'>
            {/* NavBar */}
            <div className='min-h-screen sticky'>
                <NavBar/>
            </div>
            
            <div className='min-h-screen w-full flex flex-col items-center'>
                {/* Top Rectangle */}
                <div className="sticky flex flex-row items-center justify-between w-full h-20 pl-5  bg-snow drop-shadow-xl">
                        {/* Search Bar */}
                        <div className="mr-10 w-80 h-10 bg-dark_gray rounded-[30px] flex flex-row items-center ">
                            <div className="items-center justify-left flex flex-row ml-4">
                                {/* <IconContext.Provider value={{ color: "#898989", size: "20"}}>
                                    <IoMdSearch />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </div>
                            <input type="text" className="bg-transparent w-full h-full pl-2 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Search"/>
                        </div>
                        <div className='flex flex-row mr-3'>
                        {/* App Name */}
                        <span className=" mr-4 pl-10 top-3 font-semibold focus:outline-none text-[30px]">App Name</span>
                        {/* Icon */}
                        <div className="w-12 h-12 bg-dark_gray rounded-[30px]"></div>
                        </div>
                </div>
                <div className='flex flex-col justify-center items-center overflow-y-scroll scrollbar-hide overflow-hidden'>
                    <div className='bg-snow w-full max-w-5xl h-60 mr-40 ml-40 mt-20 justify-between flex flex-col drop-shadow-xl rounded-[30px]'>
                        <div className='flex flex-row'>
                            {/* Profile Picture */}
                            <div className="ml-10 mt-8 w-[145px] h-[115px] bg-dark_gray rounded-full"></div>
                            {/* Write Post */}
                            <a href={'/homepage/WritePost'}>
                            <div className=" w-full ml-10 h-[120px] max-w-1xl mt-8 mb-8 mr-[40px] bg-dark_gray rounded-[30px]"> 
                                <input type="text" className="bg-transparent w-full h-full pl-10 text-raisin_black text-xl font-semibold focus:outline-none" placeholder="Write a post..."/>
                            </div>
                            </a>
                        </div>
                        <div className='flex flex-row justify-between mb-3 ml-4 mr-10 border-t-2 border-dark_gray items-center'>
                            {/* Buttons */}
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Media</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Tag</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black border-r-2 border-dark_gray">Check-In</span>
                            <span className="pl-10 top-3 pr-20 font-regular focus:outline-none text-[23px] text-raisin_black">Post</span>
                        </div>
                    </div>
                    {/* Posts */}
                    <div 
                        id="showcase" 
                        className="flex justify-center w-full max-w-[859px] rounded-[20px] m-8"
                    >
                        <div class="flex flex-col h-fit max-h-[510px]">
                            <PostSnippet
                                username='barknplay'
                                displayName='Barker'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                                style={{ scrollSnapAlign: 'start' }}
                            />
                            <PostSnippet
                                username='barknplay'
                                displayName='Barker'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                                style={{ scrollSnapAlign: 'start' }}
                            />
                            <PostSnippet
                                username='barknplay'
                                displayName='Barker'
                                publish_date='Sept 6 at 4:30 PM'    
                                desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                    Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                    🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                                user_img_src='/images/user1-image.png'
                                post_img_src='/images/post1-image.png'
                                style={{ scrollSnapAlign: 'start' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Navbar */}
            <div className="sticky flex flex-col h-screen min-h-screen items-left justify-left w-90 pr-10 bg-snow drop-shadow-xl">
                <span className="pl-10 mt-10 pr-20 font-bold focus:outline-none text-[35px] text-mustard">Menu</span>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        {/* green circle */}
                        <div className="w-12 h-12 bg-grass rounded-full ">
                            <div className='pt-[11px] pl-[11px]'>
                                {/* <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <FaQuestion />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-question"></i>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Lost Pets</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[11px] pl-[11px]'>
                                {/* <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <FaQuestion />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-question"></i>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Found Pets</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-9 mt-3 pl-1'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                        <div className='pt-[11px] pl-[11px]'>
                                {/* <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <FaEnvelope />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-3 font-regular focus:outline-none text-[20px] text-grass">Messages</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[11px] pl-[11px]'>
                                {/* <IconContext.Provider value={{ color: "#F5F0F0", size: "25"}}>
                                    <BsBookmarkFill />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-bookmark"></i>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Saved Posts</span>
                </div>
                <div className="flex flex-row">
                    <div className='ml-10 mt-3'>
                        <div className="w-12 h-12 bg-grass rounded-full">
                            <div className='pt-[8px] pl-[6px]'>
                                {/* <IconContext.Provider value={{ color: "#F5F0F0", size: "35"}}>
                                    <LiaShoppingCartSolid />
                                </IconContext.Provider> */}
                                <i class="fa-solid fa-cart-shopping"></i>
                            </div>
                        </div>
                    </div>
                    <span className="mt-5 pl-2 font-regular focus:outline-none text-[20px] text-grass">Shops</span>
                </div>
                <div className="border-b-2 border-dark_gray mt-10 ml-10"></div>
                <span className="pl-10 mt-10 pr-20 font-bold focus:outline-none text-[35px] text-mustard ">Events</span>
            </div>
        </div>
    )
  } else {
    return null;
  }
}

export default withAuth(Home);