import React, { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks';
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import { useAllUsersAndPets } from '../lib/hooks';
import Router from 'next/router';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Switch } from '@headlessui/react';
import Modal from 'react-modal';
import NavBar from '../components/NavBar';
import RoundIcon from '../components/RoundIcon';
import CoverPhoto from '../components/CoverPhoto';
import PostSnippet from '../components/PostSnippet';
// import Switch from '../components/Switch';

export default function Settings() {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const changePassword = () => {
          setModalIsOpen(true); // Open the modal when editing starts

    };

    const [switches, setSwitches] = useState([
        // Pet Switches
        // { id: 'Pet Name', value: 'petName', enabled: false },
        { id: 'Pet Sex', value: 'sex', enabled: false },
        { id: 'Pet Breed', value: 'breed', enabled: false },
        { id: 'Pet Birthday', value: 'birthdate', enabled: false },
        { id: 'Pet Location', value: 'birthplace', enabled: false },
        // User Switches
        { id: 'Gender', value: 'gender',enabled: false },
        { id: 'Birthday', value: 'birthdate', enabled: false },
        { id: 'Location', value: 'location',enabled: false },
        // Add more switches as needed
    ]);
    const petSwitchIDs = ['Pet Sex', 'Pet Breed', 'Pet Birthday', 'Pet Location'];
    const userSwitchIDs = ['Gender', 'Birthday', 'Location'];
    const [enabledPetSwitches, setEnabledPetSwitches] = useState([]);
    const [enabledUserSwitches, setEnabledUserSwitches] = useState([]);


    const toggleSwitch = (id, value) => {
        setSwitches(switches.map(switchItem =>
            switchItem.id === id ? { ...switchItem, enabled: !switchItem.enabled } : switchItem
        ));
        if (petSwitchIDs.includes(id)) {
            if (enabledPetSwitches.includes(value)) {
                setEnabledPetSwitches(enabledPetSwitches.filter((switchVal) => switchVal !== value));
            } else {
                setEnabledPetSwitches([...enabledPetSwitches, value]);
            }
        }
        if (userSwitchIDs.includes(id)) {
            if (enabledUserSwitches.includes(value)) {
                setEnabledUserSwitches(enabledUserSwitches.filter((switchVal) => switchVal !== value));
            } else {
                setEnabledUserSwitches([...enabledUserSwitches, value]);
            }
        }
    };

    const { user, username } = useUserData();
    const router = Router;

    function handleViewProfile() {
        router.push(`/user/${username}`);
    }

    async function hideInformation(event) {
        event.preventDefault();
    
        const updateHiddenField = async () => {
            const userRef = firestore.collection('users').doc(user.uid);
            const petsRef = firestore.collection('pets').where('petOwnerID', '==', user.uid);
    
            const batch = firestore.batch();
    
            // Update user document
            batch.update(userRef, { hidden: enabledUserSwitches });
    
            // Update pet documents
            const petQuerySnapshot = await petsRef.get();
            petQuerySnapshot.forEach((doc) => {
                batch.update(doc.ref, { hidden: enabledPetSwitches });
            });
    
            try {
                await batch.commit();
                console.log('Documents updated successfully');
            } catch (error) {
                console.error('Error updating documents:', error);
            }
        };
    
        await updateHiddenField();
    }
    
      
    return (
        <div>
            <div id="root" className='flex h-screen'>
                <NavBar />
                <div className='h-full w-full p-4'>

                    <form
                        onSubmit={hideInformation}
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
                            {switches.slice(4, 7).map((switchItem) => (
                                <div key={switchItem.id} className="flex justify-between items-center mb-4">
                                    <span>{switchItem.id}</span>
                                    <Switch
                                        checked={switchItem.enabled}
                                        onChange={() => toggleSwitch(switchItem.id, switchItem.value)}
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
                            {switches.slice(0, 4).map((switchItem) => (
                                <div key={switchItem.id} className="flex justify-between items-center mb-4">
                                    <span>{switchItem.id}</span>
                                    <Switch
                                        checked={switchItem.enabled}
                                        onChange={() => toggleSwitch(switchItem.id, switchItem.value)}
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
