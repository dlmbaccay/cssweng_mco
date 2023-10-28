export default function AddPet() {
    return(
        <div className="bg-gradient-to-tl from-jasmine via-citron to-[#7DD184] min-h-screen justify-center items-center flex flex-col space-y-10 p-80
        lg:flex-row lg:space-x-20 lg:py-10
        md:space-x-14 md:py-10
        sm:space-x-10 sm:py-10">

                <div className="bg-white max-w-[1534px] w-4/5 h-4/5 m-auto rounded-lg p-4 overflow-auto">
                    <form
                    
                    className="bg-snow rounded-md p-8 pb-5 w-full"
                    >
                    <h1 className="font-bold">Add a New Pet</h1>

                    {/* Display current profile icon */}
                    <img src="/images/user0-image.png" alt="Current Profile Icon" className="mx-auto w-32 h-32 rounded-full bg-citron mb-4" />

                    {/* Button to upload new profile icon */}
                    <input
                    type="file"
                    onChange={(e) => setProfileIcon(URL.createObjectURL(e.target.files[0]))}
                    accept="image/*"
                    />

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
                        placeholder="Give your pet a unique name!"
                        maxLength="20"
                        value=""
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        />
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
                        placeholder="Tell us about your pet..."
                        value=""
                        onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    {/* sex */}
                    <div className="mb-4">
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

                    {/* place of birth */}
                    <div className="mb-4">
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
                        onChange={(e) => setPob(e.target.value)}
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
                        value=""
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
                        
                        className="bg-red-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
                        >
                        Cancel
                        </button>
                    </div>
                    </form>
                </div>
                </div>
            
        
    )
}

