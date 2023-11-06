import React, { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks';
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import { useAllUsersAndPets } from '../lib/hooks';
import Router from 'next/router';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Switch } from '@headlessui/react';

import NavBar from '../components/NavBar';
import RoundIcon from '../components/RoundIcon';
import CoverPhoto from '../components/CoverPhoto';
import PostSnippet from '../components/PostSnippet';
// import Switch from '../components/Switch';

export default function Settings() {

    const [switches, setSwitches] = useState([
        // Pet Switches
        { id: 'Pet Name', enabled: false },
        { id: 'Pet Sex', enabled: false },
        { id: 'Pet Breed', enabled: false },
        { id: 'Pet Birthday', enabled: false },
        { id: 'Pet Location', enabled: false },
        // User Switches
        { id: 'Gender', enabled: false },
        { id: 'Birthday', enabled: false },
        { id: 'Location', enabled: false },
        // Add more switches as needed
    ]);

    const toggleSwitch = (id) => {
        setSwitches(switches.map(switchItem =>
            switchItem.id === id ? { ...switchItem, enabled: !switchItem.enabled } : switchItem
        ));
    };

    const { user, username } = useUserData();
    const router = Router;

    const { allUsers, allPets } = useAllUsersAndPets();

    function handleViewProfile() {
        router.push(`/user/${username}`);
    }

    return (
        <div>
            <div id="root" className='flex h-screen'>
                <NavBar />
                <div className='h-full w-full p-4'>

                    <form
                        // onSubmit={onSubmit}
                        className="bg-snow rounded-md p-8 pb-5 w-1/2 overflow-auto h-screen">
                        <h1 className="font-bold text-3xl">Settings</h1>
                        <br></br>

                        <label htmlFor="user-visibility" className="block font-medium text-gray-700 text-xl">Security Settings</label>
                        <br></br>
                        {/* Change password */}
                        <div className="mb-4">
                            <button className="bg-black w-full mt-2 text-white text-sm p-2 rounded-md hover:opacity-80 transition-all">
                                Change Password
                            </button>
                        </div>
                        <br></br>

                        {/* User Visibility Settings*/}
                        <div className="mb-4 justify-between">
                            <label htmlFor="user-visibility" className="block font-medium text-gray-700 text-xl">User Visibility Settings</label>
                            <br></br>
                            {switches.slice(5, 8).map((switchItem) => (
                                <div key={switchItem.id} className="flex justify-between items-center mb-4">
                                    <span>{switchItem.id}</span>
                                    <Switch
                                        checked={switchItem.enabled}
                                        onChange={() => toggleSwitch(switchItem.id)}
                                        className={`${switchItem.enabled ? 'bg-green-600' : 'bg-red-600'
                                            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                    >
                                        <span className="sr-only">Enable notifications</span>
                                        <span
                                            className={`${switchItem.enabled ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                        />
                                    </Switch>
                                </div>
                            ))}
                        </div>
                        <br></br>


                        {/* Pet Visibility Settings */}
                        <div className="mb-4">
                            <label htmlFor="pet-visibility" className="block text-xl font-medium text-gray-700">Pet Visibility Settings</label>
                            <br></br>
                            {switches.slice(0, 5).map((switchItem) => (
                                <div key={switchItem.id} className="flex justify-between items-center mb-4">
                                    <span>{switchItem.id}</span>
                                    <Switch
                                        checked={switchItem.enabled}
                                        onChange={() => toggleSwitch(switchItem.id)}
                                        className={`${switchItem.enabled ? 'bg-green-600' : 'bg-red-600'
                                            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                                    >
                                        <span className="sr-only">Enable notifications</span>
                                        <span
                                            className={`${switchItem.enabled ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                        />
                                    </Switch>
                                </div>
                            ))}
                        </div>

                        {/* buttons */}
                        <br></br>
                        <div className="flex justify-end">
                            <button type='submit' className="py-2 px-4 rounded-md bg-pistachio text-white transition-all hover:scale-105 active:scale-100">
                                Save Changes
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
