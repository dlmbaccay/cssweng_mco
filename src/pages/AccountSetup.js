export default function AccountSetup() {
    return(
        <div className="bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center flex flex-col space-y-10 p-80
        lg:flex-row lg:space-x-20 lg:py-10
        md:space-x-14 md:py-10
        sm:space-x-10 sm:py-10">
            <div className="bg-snow rounded-md p-8 pb-5 w-full">
                <h1 className="font-bold">Welcome to Account Setup!</h1>

                {/* username */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 pt-5">
                        <span>Username</span>
                        <span className="text-red-500"> *</span>
                    </label>
                    <input type="text" className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your username" required />
                </div>

                {/* display name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 pt-5">
                        <span>Display Name</span>
                        <span className="text-red-500"> *</span>
                    </label>
                    <input type="text" className="mt-1 p-2 border rounded-md w-full" placeholder="What would you like us to call you?" required/>
                </div>

                {/* profile picture */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <input type="file" className="mt-1 p-2 border rounded-md w-full" accept="image/*" />
                    <p className="text-sm text-gray-500 mt-1">Upload a profile picture (JPG, PNG, or GIF).</p>
                </div>

                {/* bio */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea className="mt-1 p-2 border rounded-md w-full" rows="4" placeholder="Tell us about yourself..."></textarea>
                </div>

                {/* gender */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select className="mt-1 p-2 border rounded-md w-full">
                        <option value="none">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* birthday */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Birthday</label>
                    <input type="date" className="mt-1 p-2 border rounded-md w-full" />
                </div>

                {/* location */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" className="mt-1 p-2 border rounded-md w-full" placeholder="Enter your location" />
                </div>

                {/* buttons */}
                <div className="flex justify-end">
                    <button className="bg-pistachio text-white py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 active:scale-100">
                    Submit
                    </button>

                    <button className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100">
                        Sign Out
                    </button>
                </div>
                
            </div>
            
        </div>
    )
}

/* username
- avaiolabjkawe
- name
profile pic
bio
gender
birthdate
location
submit
sign out
 */