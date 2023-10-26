import React, { useEffect, useState } from 'react';
import { firestore, storage} from '@/src/lib/firebase';
import { useRouter } from 'next/router';
import { useUserData, getUserIDfromUsername } from '@/src/lib/hooks'; // Import the useUser hook
import { formatDateWithWords } from '../lib/formats';
import Image from 'next/image';
import Modal from 'react-modal'; // Import the Modal component  
import toast from 'react-hot-toast'
import { basicModalStyle } from '../lib/modalstyle';
import NavBar from '@/src/components/NavBar';
import Post from "@/src/components/Post";

Modal.setAppElement('#root'); // Set the root element for accessibility

export default function PetProfile() {
    const router = useRouter();
    const { profileUsername, petId } = router.query;
    const profileUserID = getUserIDfromUsername(profileUsername);
    const [pet, setPet] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false); // State for controlling the modal
    const [petName, setPetName] = useState(null);
    const [about, setAbout] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [following, setFollowing] = useState(null);
    const [sex, setSex] = useState(null);
    const [breed, setBreed] = useState(null);
    const [birthdate, setBirthdate] = useState(null);
    const [birthplace, setBirthplace] = useState(null);
    const [petPhotoURL, setPetPhotoURL] = useState(null);
    const currentUser = useUserData(); // Get the logged-in user
    const currentUserID = getUserIDfromUsername(currentUser.username);

    useEffect(() => {
        let unsubscribe;

        if (petId && profileUserID) {
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);
        unsubscribe = petRef.onSnapshot((doc) => {
            if (doc.exists) {
              setPet({
                  id: doc.id,
                  ...doc.data()
              });
              setPetName(doc.data().petname);
              setAbout(doc.data().about);
              setFollowers(doc.data().followers);
              setFollowing(doc.data().following);
              setSex(doc.data().sex);
              setBreed(doc.data().breed);

              setBirthdate(doc.data().birthdate);
              setBirthplace(doc.data().birthplace);
            } else {
              setPet(null);
            }
        });
        } else {
          setPet(null);
        }

        return unsubscribe;
    }, [petId, profileUserID]);
    
    const openEdit = () => {
        if (currentUser && currentUserID === profileUserID) { // Check if the logged-in user is the owner of the pet
          setModalIsOpen(true); // Open the modal when editing starts
        }
    };

    const closeEdit = () => {
      if (currentUser && currentUserID === profileUserID) { // Check if the logged-in user is the owner of the pet
        setModalIsOpen(false); // Open the modal when editing starts
      }
  };

    const handleSave = async (e) => {
      e.preventDefault();
        const petRef = firestore.collection('users').doc(profileUserID).collection('pets').doc(petId);
        const batch = firestore.batch();
      
        try {
          const updateData = {
            petname: petName,
            about: about,
            photoURL: petPhotoURL ? await uploadPhotoAndGetURL() : pet.photoURL
          };
      
          batch.update(petRef, updateData);
      
          await batch.commit();
          setModalIsOpen(false);
          toast.success('Pet profile updated successfully!');
        } catch (error) {
          console.error('Error saving pet:', error);
        }
      };
      
      const uploadPhotoAndGetURL = async () => {
        const storageRef = storage.ref(`petProfilePictures/${petId}/profilePic`);
        await storageRef.put(petPhotoURL);
        return await storageRef.getDownloadURL();
      };
  
    const handleFollow = () => {
        const isFollowing = pet.followers && pet.followers.includes(currentUserID);
      
        const updatedFollowers = isFollowing
          ? pet.followers.filter(id => id !== currentUserID) // Remove currentUserID if already following
          : [...pet.followers, currentUserID]; // Add currentUserID if not already following
      
        firestore.collection('users').doc(profileUserID).collection('pets').doc(petId).update({
          followers: updatedFollowers
        })
        .then(() => {
          setPet(prevPet => ({
            ...prevPet,
            followers: updatedFollowers
          }));
          toast.success('Followed successfully!');
        })
        .catch(error => {
          console.error('Error updating followers:', error);
        });
      };

    // tab functionality
    const [activeTab, setActiveTab] = useState('Posts');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    if (!pet) {
        return <div>Loading...</div>;
    }

    return (
      <div className = "flex">
      <NavBar />

      <div className="flex-1 p-8">
          {/* circle */}
          <div className="absolute left-40 top-32 w-32 h-32 rounded-full bg-citron mb-4 z-10">
          {pet.photoURL && <img src={pet.photoURL} alt='pet profile picture' className="absolute w-32 h-32 rounded-full bg-citron mb-4 z-10"/> }
          </div>

          {/* Header Picture Rectangle */}
          <div className="absolute left-16 top-0 w-full h-48 bg-gray-300 mb-8 ml-0"></div>

          {/* Left Panel */}
          <div class="absolute -ml-8 top-48 h-screen w-80 bg-snow p-2 border border-neutral-300">
              <div class="absolute inset-y-0 left-0 w-16 ..."></div>

              {currentUser && currentUserID === profileUserID ? ( // Edit pet profile button
                <button 
                  onClick={openEdit}
                  className="absolute top-0 right-0 mt-4 mr-4 w-16 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-snow font-bold rounded-lg border-none"
                >Edit</button>
              ):(null)}

              {currentUser && currentUserID !== profileUserID ? (
              // Follow button
              <button 
                  onClick={handleFollow}
                  className="absolute top-0 right-0 mt-4 mr-4 w-20 h-8 flex-shrink-0 bg-citron hover:bg-xanthous text-snow font-bold rounded-lg border-none"
              >{pet.followers && pet.followers.includes(currentUserID) ? 'Following' : 'Follow'}</button>
              ) : null}

              {/* Profile Edit Pop-up */}
              {modalIsOpen && (
                <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                style={basicModalStyle}
                >
                  {/* <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> */}
                  <div>
                      <form
                      onSubmit={handleSave}
                      className="bg-snow rounded-md p-8 pb-5 w-full"
                      >
                      <h1 className="font-bold">Edit Profile</h1>

                      {/* display name */}
                      {/* <div className="mb-0">
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
                          placeholder="What would you like us to call your pet?"
                          maxLength="20"
                          value=""
                          onChange={(e) => setPetName(e.target.value)}
                          required
                          />
                      </div> */}

                      {/* Username */}
                      <div className="mb-4">
                          <label
                          htmlFor="username"
                          className="block text-sm font-medium text-gray-700 pt-5"
                          >
                          <span>Pet Name</span>
                          </label>
                          <input
                          type="text"
                          id="display-name"
                          className="mt-1 p-2 border rounded-md w-full"
                          placeholder={pet.petname}
                          maxLength="20"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          />
                      </div>

                      {/* profile picture */}
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                          Change Profile Picture
                          </label>
                          <div id="img-preview">
                            {pet.photoURL && <Image src={pet.photoURL} alt='pet profile picture' height={200} width={200} className='cursor-pointer hover:opacity-50'/> }
                          </div>
                          
                          <input
                          type="file"
                          className="mt-1 p-2 border rounded-md w-full"
                          accept="image/*"
                          onChange={e => setPetPhotoURL(e.target.files[0])}
                          />
                          
                          <p className="text-sm text-gray-500 mt-1">
                          Upload a profile picture (JPG, PNG, or GIF).
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
                          placeholder={pet.about}
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          />
                      </div>

                      {/* sex */}
                      {/* <div className="mb-4">
                          <label
                          htmlFor="sex"
                          className="block text-sm font-medium text-gray-700"
                          >
                          Sex
                          </label>
                          <select
                          id="sex"
                          name="sex"
                          className="mt-1 p-2 border rounded-md w-full"
                          value="test"
                          onChange={(e) => setSex(e.target.value)}
                          >
                          <option value="None">Prefer Not to Say</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          </select>
                      </div> */}

                      {/* birthdate */}
                      {/* <div className="mb-4">
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
                      </div> */}

                      {/* place of birth */}
                      {/* <div className="mb-4">
                          <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700"
                          >
                          Place of Birth
                          </label>
                          <input
                          type="text"
                          id="pob"
                          name="pob"
                          className="mt-1 p-2 border rounded-md w-full"
                          placeholder="Enter your pet's Place of Birth"
                          value=""
                          onChange={(e) => setBirthplace(e.target.value)}
                          />
                      </div> */}

                      {/* location */}
                      {/* <div className="mb-4">
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
                          value=""
                          onChange={(e) => setLocation(e.target.value)}
                          />
                      </div> */}

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
                          onClick={closeEdit}
                          className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                          >
                          Cancel
                          </button>
                      </div>
                      </form>
                  </div>
                  {/* </div> */}

                </Modal>
              )}
              
              {/* Username */} 
              <div class="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                  <span class="text-2xl font-bold text-raisin_black">{pet.petname}</span>
              </div>
          
              {/* Followers and Following */}
              <div className="relative left-64 transform -translate-x-1/2 top-32 text-center mt-4 ml-3 flex">
                  <div className="flex flex-col items-center">
                      <span className="text-raisin_black text-lg font-bold"> {pet.followers ? pet.followers.length : 0}</span>
                      <span className="text-gray-500 text-sm">Followers</span>
                  </div>
                  {/* <div className="flex flex-col items-center">
                      <span className="text-raisin_black text-lg font-bold">69</span>
                      <span className="text-gray-500 text-sm">Following</span>
                  </div> */}
              </div>

              {/* About */}
              <div class="relative top-48 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                  <span class="text-lg font-bold text-raisin_black">About</span>
                  <span class="text-base text-raisin_black max-h-5">
                      <p class="mt-5">
                        {pet.about}
                      </p>
                  </span>
              </div>

              {/* <div class="relative top-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-0 bg-red-300">
                  <span class="text-base text-raisin_black max-h-5">
                      <p>
                          🐾 Woof Woof Woof ! 🐾 
                          Woof Woof Woof ! Woof Woof Woof !
                          
                      </p>
                  </span>
              </div> */}
          </div>

          {/* Posts */}
          {activeTab === 'Posts' && (
          <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border border-neutral-300 ml-36">
          <div 
                  id="showcase" 
                  className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                  style={{ scrollSnapType: 'y mandatory' }}
              >
                  <div class="flex flex-col h-fit max-h-[510px]">
                      <Post 
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                      <Post
                          username='petwhisperer'
                          publish_date='Sept 6 at 4:30 PM'    
                          desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                              Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                              🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                          user_img_src='/images/user0-image.png'
                          post_img_src='/images/post1-image.png'
                          style={{ scrollSnapAlign: 'start' }}/>
                  </div>
              </div>
          </div>
          )}

          {/* Milestones */}
          {activeTab === 'Milestones' && (
              <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border border-neutral-300 ml-36">
              <div 
                      id="showcase" 
                      className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                      style={{ scrollSnapType: 'y mandatory' }}
                  >
                      <div class="flex flex-col h-fit max-h-[510px]">
                          <Post 
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                          <Post
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                          <Post
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                      </div>
                  </div>
              </div>
          )}

          {/* Media */}
          {activeTab === 'Media' && (
          <div className="absolute top-64 left-64 h-800 w-859 p-2 ml-36">
              <div className="grid grid-cols-7 gap-2">
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              <div className="w-36 h-36 rounded-xl bg-pale_yellow"></div>
              </div>
          </div>
          )}

          {/* Tagged Posts */}
          {activeTab === 'Tagged Posts' && (
              <div className="absolute top-64 left-96 h-800 w-859 bg-snow p-2 border border-neutral-300 ml-36">
              <div 
                      id="showcase" 
                      className="flex scrollbar-hide justify-center w-full max-w-[859px]  overflow-y-scroll rounded-[20px]"
                      style={{ scrollSnapType: 'y mandatory' }}
                  >
                      <div class="flex flex-col h-fit max-h-[510px]">
                          <Post 
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                          <Post
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                          <Post
                              username='petwhisperer'
                              publish_date='Sept 6 at 4:30 PM'    
                              desc='Chaos and cuddles with this dynamic quartet! 🐾🐾🐾🐾 
                                  Our two pups and two kitties bring a whole lot of joy and a touch of mayhem to our everyday life. 
                                  🐶🐱🐶🐱 They may be different species, but they share a bond thats truly heartwarming.'
                              user_img_src='/images/user0-image.png'
                              post_img_src='/images/post1-image.png'
                              style={{ scrollSnapAlign: 'start' }}/>
                      </div>
                  </div>
              </div>
          )}

          <div className="absolute mt-0 top-48 left-24 ml-72 flex flex-row mr-4 w-10/12 bg-snow divide-x divide-neutral-300">
              <button 
                  className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                              activeTab === 'Posts' ? 'bg-citron text-white' : ''
                          }`}
                  onClick={() => handleTabClick('Posts')}>
                  Posts
              </button>
              <button 
                  className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                              activeTab === 'Milestones' ? 'bg-citron text-white' : ''
                          }`}
                  onClick={() => handleTabClick('Milestones')}>
                  Milestones
              </button>
              <button 
                  className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                              activeTab === 'Media' ? 'bg-citron text-white' : ''
                          }`}
                  onClick={() => handleTabClick('Media')}>
                  Media
              </button>
              <button 
                  className={`px-14 py-2 text-raisin_black hover:bg-citron hover:text-white focus:outline-none ${
                              activeTab === 'Tagged Posts' ? 'bg-citron text-white' : ''
                          }`}
                  onClick={() => handleTabClick('Tagged Posts')}>
                  Tagged Posts
              </button>
          </div>

      </div>

  </div>
    );
}
