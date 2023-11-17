import React, { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks';
import { firestore } from '../lib/firebase'
import { getAuth, updatePassword } from "firebase/auth";
import Router from 'next/router';
import toast from 'react-hot-toast';
import { Switch } from '@headlessui/react';
import Modal from 'react-modal';
import { changePasswordStyle } from '../lib/modalstyle';
import { checkPassword } from '../lib/formats';
import withAuth from '../components/withAuth';
import ExpandedNavBar from '../components/ExpandedNavBar';

function Settings() {
    const { user, username, userPhotoURL } = useUserData();
    const router = Router;
    const [userRef, setUserRef] = useState('');
    const [petsRef, setPetsRef] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [userSwitches, setUserSwitches] = useState([
        { id: 'Gender', value: 'gender',enabled: true },
        { id: 'Birthday', value: 'birthdate', enabled: true },
        { id: 'Location', value: 'location', enabled: true },
        { id: 'Contact Number', value: 'contactNumber', enabled: true },
        { id: 'E-mail', value: 'email', enabled: true },
      ]);
    
    const [petSwitches, setPetSwitches] = useState([
    { id: 'Pet Breed', value: 'breed', enabled: true },
    { id: 'Pet Sex', value: 'sex', enabled: true },
    { id: 'Pet Birthday', value: 'birthdate', enabled: true },
    { id: 'Pet Location', value: 'birthplace', enabled: true },
    { id: 'Favorite Food', value: 'favoriteFood', enabled: true },
    { id: 'Hobby', value: 'hobbies', enabled: true },
    ]);

    useEffect(() => {
        const userDocRef = firestore.collection('users').doc(user.uid);
        const petsQueryRef = firestore.collection('pets').where('petOwnerID', '==', user.uid);
    
        userDocRef.get().then((doc) => {
          if (doc.exists) {
            setUserRef(doc.data());

            const array = doc.data().hidden === undefined ? [] : doc.data().hidden;
            const newSwitches = userSwitches.map(switchItem => {
            if (array.includes(switchItem.value)) {
                return { ...switchItem, enabled: false };
            }
            return switchItem;
            });
        
            setUserSwitches(newSwitches);

            // Add enabled switches to enabledUserSwitches
            const newDisabledUserSwitches = newSwitches.filter(switchItem => !switchItem.enabled).map(switchItem => switchItem.value);
            setDisabledUserSwitches(newDisabledUserSwitches);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
    
        petsQueryRef.get().then((querySnapshot) => {
          const pets = [];
          querySnapshot.forEach((doc) => {
            pets.push(doc.data());
          });
          setPetsRef(pets);
          const array = pets[0].hidden === undefined ? [] : pets[0].hidden;
            const newSwitches = petSwitches.map(switchItem => {
            if (array.includes(switchItem.value)) {
                return { ...switchItem, enabled: false };
            }
            return switchItem;
            });
        
            setPetSwitches(newSwitches);

            const newDisabledPetSwitches = newSwitches.filter(switchItem => !switchItem.enabled).map(switchItem => switchItem.value);
            setDisabledPetSwitches(newDisabledPetSwitches);
        }).catch((error) => {
          console.log("Error getting documents: ", error);
        });
      }, []);

    const openChangePassword = () => {
          setModalIsOpen(true); // Open the modal when editing starts
    };

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleChangePassword = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
        }

        if (!checkPassword(newPassword)) {
        setPasswordError('Check password format');
        return;
        }
        
        setPasswordError('');

        // insert change password functionality
        const auth = getAuth();
        const user = auth.currentUser;

        updatePassword(user, newPassword)
        .then(() => {
            // Password updated successfully
            // You can perform any additional actions here
            setNewPassword('');
            setConfirmPassword('');
            setModalIsOpen(false);
            toast.success("Password updated successfully!");
        })
        .catch((error) => {
            // Handle password update error
            toast.error("Try logging in again before changing.")
        });  
    };

    // useEffect(() => {
    //     const array = userRef.hidden === undefined ? '' : userRef.hidden;
    //     const newSwitches = switches.map(switchItem => {
    //       if (array.includes(switchItem.value)) {
    //         return { ...switchItem, enabled: true };
    //       }
    //       return switchItem;
    //     });
    
    //     setSwitches(newSwitches);
    //   }, []); // Dependency array. Update switches whenever this array changes.

    const petSwitchIDs = ['Pet Sex', 'Pet Breed', 'Pet Birthday', 'Pet Location', 'Favorite Food', 'Hobby'];
    const userSwitchIDs = ['Gender', 'Birthday', 'Location', 'Contact Number', 'E-mail'];
    const [disabledPetSwitches, setDisabledPetSwitches] = useState([]);
    const [disabledUserSwitches, setDisabledUserSwitches] = useState([]);

    const toggleUserSwitch = (id, value) => {
        setUserSwitches(userSwitches.map(switchItem =>
            switchItem.id === id ? { ...switchItem, enabled: !switchItem.enabled } : switchItem
        ));
        if (userSwitchIDs.includes(id)) {
            if (disabledUserSwitches.includes(value)) {
                setDisabledUserSwitches(disabledUserSwitches.filter((switchVal) => switchVal !== value));
            } else {
                setDisabledUserSwitches([...disabledUserSwitches, value]);
            }
        }
    };

    const togglePetSwitch = (id, value) => {
        setPetSwitches(petSwitches.map(switchItem =>
            switchItem.id === id ? { ...switchItem, enabled: !switchItem.enabled } : switchItem
        ));
        if (petSwitchIDs.includes(id)) {
            if (disabledPetSwitches.includes(value)) {
                setDisabledPetSwitches(disabledPetSwitches.filter((switchVal) => switchVal !== value));
            } else {
                setDisabledPetSwitches([...disabledPetSwitches, value]);
            }
        }
        console.log(disabledPetSwitches);
    };

    async function handleSubmit(event) {
        event.preventDefault();
    
        const updateHiddenField = async () => {
            const userRef = firestore.collection('users').doc(user.uid);
            const petsRef = firestore.collection('pets').where('petOwnerID', '==', user.uid);
    
            const batch = firestore.batch();
    
            // Update user document
            batch.update(userRef, { hidden: disabledUserSwitches });
    
            // Update pet documents
            const petQuerySnapshot = await petsRef.get();
            petQuerySnapshot.forEach((doc) => {
                batch.update(doc.ref, { hidden: disabledPetSwitches });
            });
    
            try {
                await batch.commit();
                console.log('Documents updated successfully');
                toast.success("Settings updated successfully!");
            } catch (error) {
                console.error('Error updating documents:', error);
            }
        };
    
        await updateHiddenField();
    }
    
    return (
        <div>
            <div id="root" className='flex flex-row h-screen paw-background'>
                {/* home navbar */}
                <div className='w-[300px]'>
                    {(userPhotoURL && username) && <ExpandedNavBar 
                            props={{
                            userPhotoURL: userPhotoURL,
                            username: username,
                            activePage: "Settings",
                            expanded: true
                        }}
                    />}
                </div>

                <div className="w-full flex justify-center items-center h-full">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-lg drop-shadow-lg p-10 w-full h-full overflow-auto flex flex-col justify-start items-center">

                        <div className='mt-2 flex flex-col justify-center items-center w-[750px] h-[150px] p-4 bg-pale_yellow rounded-lg drop-shadow-md mb-8'>
                            <label htmlFor="user-visibility" className="block font-bold text-grass font-shining text-3xl mb-4">Security</label>
                            
                            <div> {/* Change password */}
                                <button type='button' onClick={openChangePassword} className="bg-grass mt-2 mb-2 text-pale_yellow text-xs px-4 font-semibold py-2 rounded-md hover:bg-raisin_black transition-all">
                                    <i className='fa-solid fa-key mr-2'></i>
                                    Change Password
                                </button>
                                
                                {modalIsOpen && (
                                    <Modal
                                    isOpen={modalIsOpen}
                                    onRequestClose={() => setModalIsOpen(false)}
                                    style={changePasswordStyle}
                                    >
                                        <div className='w-full flex flex-col justify-between h-full'>
                                            <div>
                                                <div className='flex flex-col mb-3'>
                                                    <label className="block text-sm font-medium text-raisin_black">New Password</label>
                                                    <input 
                                                        type="password" 
                                                        value={newPassword}
                                                        minLength={8}
                                                        maxLength={16}
                                                        onChange={(e) => setNewPassword(e.target.value.trim())}
                                                        className={`w-full hover-tooltip bg-dark_gray rounded-md mt-2 pl-4 pr-4 h-10 text-sm font-semibold outline-none ${newPassword === '' ? '': !checkPassword(newPassword) ? 'border border-red-500' : 'border border-green-500'}`} placeholder='Password'/>
                                                    
                                                    <div className="mt-2 tooltip text-sm rounded transform tracking-wide">
                                                        <ul className="list-none">
                                                            <li className='text-xs text-slate-600'><span className={`bullet ${/^.{8,16}$/.test(newPassword) ? 'bg-green-500':'bg-slate-300'}`}></span>be 8-16 characters long.</li>
                                                            <li className='text-xs text-slate-600'><span className={`bullet ${/[A-Z]/.test(newPassword) ? 'bg-green-500':'bg-slate-300'}`}></span>contain at least one uppercase letter.</li>
                                                            <li className='text-xs text-slate-600'><span className={`bullet ${/[a-z]/.test(newPassword) ? 'bg-green-500':'bg-slate-300'}`}></span>contain at least one lowercase letter.</li>
                                                            <li className='text-xs text-slate-600'><span className={`bullet ${/[0-9]/.test(newPassword) ? 'bg-green-500':'bg-slate-300'}`}></span>contain at least one digit.</li>
                                                            <li className='text-xs text-slate-600'><span className={`bullet ${/\W/.test(newPassword) ? 'bg-green-500':'bg-slate-300'}`}></span>contain at least one special character.</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-raisin_black">Confirm Password</label>
                                                
                                                    <input 
                                                        type="password" 
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value.trim())}
                                                        className='bg-dark_gray rounded-md mt-2 mb-4 pl-4 pr-4 w-full h-10 text-sm font-semibold outline-none' placeholder='Confirm Password'/>
                                                </div>
                                            </div>

                                            {passwordError && <p className="text-red-500">{passwordError}</p>}

                                            <button 
                                                onClick={handleChangePassword}
                                                className="bg-grass text-pale_yellow text-sm px-4 font-semibold py-3 rounded-md hover:bg-raisin_black transition-all"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </Modal>
                                )}
                            </div>
                        </div>

                        <div className='flex flex-row justify-center items-start gap-12'>
                            <div className="justify-start items-center w-[350px] h-[350px] flex flex-col bg-pale_yellow p-8 rounded-lg shadow-lg"> {/* User Visibility */}
                                <label htmlFor="user-visibility" className="font-shining text-3xl font-bold text-grass mb-4">User Visibility</label>

                                {userSwitches.map((switchItem) => (
                                    <div key={switchItem.id} className="flex justify-between w-full items-center mb-4">
                                        <span className='text-md'>{switchItem.id}</span>
                                        <Switch
                                            checked={switchItem.enabled}
                                            onChange={() => toggleUserSwitch(switchItem.id, switchItem.value)}
                                            className={`${switchItem.enabled ? 'bg-grass' : 'bg-raisin_black'
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
        
                            <div className="justify-start items-center w-[350px] h-[350px] flex flex-col bg-pale_yellow p-8 rounded-lg drop-shadow-md"> {/* Pet Visibility */}
                                <label htmlFor="pet-visibility" className="font-shining text-3xl font-bold text-grass mb-4">Pet Visibility</label>
                                {petSwitches.map((switchItem) => (
                                    <div key={switchItem.id} className="flex justify-between w-full items-center mb-4">
                                        <span className='text-md'>{switchItem.id}</span>
                                        <Switch
                                            checked={switchItem.enabled}
                                            onChange={() => togglePetSwitch(switchItem.id, switchItem.value)}
                                            className={`${switchItem.enabled ? 'bg-grass' : 'bg-raisin_black'
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
                        </div>

                        {/* buttons */}
                        <div className="flex mt-8">
                            <button type='submit' className="py-3 px-8 rounded-md bg-grass text-pale_yellow font-shining transition-all hover:scale-105 active:scale-100 hover:bg-raisin_black text-xl">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default withAuth(Settings);