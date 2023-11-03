import React, { useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import { auth } from '../lib/firebase';
import { checkPassword } from '../lib/formats';
import toast from 'react-hot-toast';

// Assuming you have already initialized Firebase and authenticated the user

// Function to change the user's password
function changePassword(newPassword, currentPassword) {
    const user = auth.currentUser;
  
    // Prompt the user to re-authenticate before changing the password
    if (user) {
        // Prompt the user to re-authenticate before changing the password
        const credentials = firebase.auth.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
    
        user.reauthenticateWithCredential(credentials)
          .then(() => {
            // User has been successfully re-authenticated
            // Now update the password
            user.updatePassword(newPassword)
              .then(() => {
                // Password has been successfully updated
                toast.success('Password updated successfully');
              })
              .catch((error) => {
                // An error occurred while updating the password
                console.error('Error updating password:', error);
              });
          })
          .catch((error) => {
            // An error occurred while re-authenticating the user
            console.error('Error re-authenticating user:', error);
          });
      } else {
        console.error('User is not signed in');
      }
    }
  
  
  

function settings() {
    
    // Example usage
    const [ currentPassword, setCurrentPassword ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    
    return (
        <div>
            <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value.trim())}
                className={`hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-[90%] h-12 text-lg font-semibold outline-none ${currentPassword === '' ? '' : !checkPassword(currentPassword) ? 'border border-red-500' : 'border border-green-500'}`} 
                placeholder='Current Password'
            />
            
            <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value.trim())}
                className={`hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-[90%] h-12 text-lg font-semibold outline-none ${newPassword === '' ? '' : !checkPassword(newPassword) ? 'border border-red-500' : 'border border-green-500'}`} 
                placeholder='New Password'
            />
            
            <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                className={`hover-tooltip bg-light_yellow rounded-xl mt-3 p-4 w-[90%] h-12 text-lg font-semibold outline-none ${confirmPassword === '' ? '' : !checkPassword(confirmPassword) || confirmPassword !== newPassword ? 'border border-red-500' : 'border border-green-500'}`} 
                placeholder='Confirm Password'
            />
            
            <button 
                onClick={() => changePassword(newPassword, currentPassword)}
                disabled={!checkPassword(newPassword) || confirmPassword !== newPassword}
                className="bg-blue-500 text-white py-2 px-4 rounded-md ml-5 transition duration-300 ease-in-out transform hover:scale-105 active:scale-100"
            >
                Change Password
            </button>
        </div>
    )
}

export default settings