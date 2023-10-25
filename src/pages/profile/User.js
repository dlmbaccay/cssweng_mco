import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import RoundIcon from "../../components/RoundIcon";
import CoverPhoto from "@/src/components/CoverPhoto";
import Post from "@/src/components/Post";
import EditUser from "@/src/components/edit-user";

export default function User() {
  const [isProfileEditVisible, setProfileEditVisible] = useState(false);

  const openProfileEdit = () => {
    setProfileEditVisible(true);
  };

  const closeProfileEdit = () => {
    setProfileEditVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile editing logic here
  };

  return (
    <div className="flex">
      <Navbar />

      <div className="flex-1">
        {/* circle */}
        <div className="absolute left-40 top-32 w-32 h-32 rounded-full bg-citron mb-4 z-10">
          <RoundIcon src="/images/user0-image.png" />
        </div>

        {/* Header Picture Rectangle */}
        <div className="relative left-0 top-0 w-full h-48 bg-gray-300">
          <CoverPhoto src="/images/cover0-image.png" />
        </div>

        <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border ml-36">
        <div 
                id="showcase" 
                className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                style={{ scrollSnapType: 'y mandatory' }}
            >
                <div class="flex flex-col h-fit max-h-[510px]">
                    <Post 
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <Post
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                    <Post
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                </div>
            </div>
        </div>

        {/* Left Panel */}
        <div className="absolute -ml-8 top-48 left-24 h-5/6 w-80 bg-snow p-2 border">
          <div className="absolute inset-y-0 left-0 w-16 ..."></div>

          {/* Edit button */}
          <button
            onClick={openProfileEdit}
            className="absolute top-0 right-0 mt-4 mr-4 w-16 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-raisin_black rounded-lg border-none"
          >
            Edit
          </button>

          {/* Profile Edit Pop-up */}
          {isProfileEditVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white max-w-[1534px] w-4/5 h-4/5 m-auto rounded-lg p-4 overflow-auto">
                <div className="flex justify-end mb-3">
                  <button
                    className="bg-red-500 text-white rounded-md px-4 py-2"
                    onClick={closeProfileEdit}
                  >
                    Close
                  </button>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="bg-snow rounded-md p-8 pb-5 w-full"
                >
                  <h1 className="font-bold">Edit Profile</h1>

                  {/* display name */}
                  <div className="mb-0">
                    <label
                      htmlFor="display-name"
                      className="block text-sm font-medium text-gray-700 pt-5"
                    >
                      <span>Display Name</span>
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      id="display-name"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="What would you like us to call you?"
                      maxLength="20"
                      value="Test"
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 pt-5"
                    >
                      <span>Username</span>
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      id="display-name"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="What would you like us to call you?"
                      maxLength="20"
                      value="Test"
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  {/* profile picture */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      className="mt-1 p-2 border rounded-md w-full"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a profile picture (JPG, PNG, or GIF).
                    </p>
                  </div>

                  {/* cover photo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Cover Photo
                    </label>
                    <input
                      type="file"
                      className="mt-1 p-2 border rounded-md w-full"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a covoer photo (JPG, PNG, or GIF).
                    </p>
                  </div>

                  {/* bio */}
                  <div className="mb-4">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      className="mt-1 p-2 border rounded-md w-full resize-none"
                      rows="4"
                      placeholder="Tell us about yourself..."
                      value="test"
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  {/* gender */}
                  <div className="mb-4">
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 p-2 border rounded-md w-full"
                      value="test"
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="None">Prefer Not to Say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* birthdate */}
                  <div className="mb-4">
                    <label
                      htmlFor="birthdate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Birthday
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      className="mt-1 p-2 border rounded-md w-full"
                      value="test"
                      onChange={(e) => setBirthdate(e.target.value)}
                    />
                  </div>

                  {/* location */}
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="mt-1 p-2 border rounded-md w-full"
                      placeholder="Enter your Location"
                      value="test"
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {/* buttons */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-pistachio text-white py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={closeProfileEdit}
                      className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Username */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-2xl font-bold text-raisin_black">
              petwhisperer
            </span>
          </div>

          {/* Followers and Following */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-32 text-center mt-4 flex">
            <div className="flex flex-col items-center mr-14">
              <span className="text-raisin_black text-lg font-bold">123</span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-raisin_black text-lg font-bold">69</span>
              <span className="text-gray-500 text-sm">Following</span>
            </div>
          </div>

          {/* About */}
          <div className="absolute top-48 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-lg font-bold text-raisin_black">About</span>
          </div>

          <div className="relative top-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
            <span className="text-base text-raisin_black">
              <p>
                🐾 Cat Lover Extraordinaire 🐾 Proud human to a purrfect furball
                🐱 Crazy about all things feline
              </p>
            </span>
          </div>
        </div>

        <div className="absolute mt-0 top-48 left-24 ml-72 flex flex-row mr-4 w-10/12 bg-snow">
          <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">
            Posts
          </button>
          <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">
            Pets
          </button>
          <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">
            Media
          </button>
          <button className="px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none border">
            Lost Pets
          </button>
        </div>

        {/* <div class="flex flex-col h-fit max-h-[510px]">
                    <Post
                        username='barknplay'
                        publish_date='Sept 6 at 4:30 PM'    
                        desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                            Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                            🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                        user_img_src='/images/user1-image.png'
                        post_img_src='/images/post1-image.png'
                        style={{ scrollSnapAlign: 'start' }}/>
                </div> */}
      </div>
    </div>
  );
}
