import React, {useState} from 'react'
import Modal from 'react-modal';
import withSpecialAuth from '@/src/components/withSpecialAuth'
import { auth } from '@/src/lib/firebase'
import toast from 'react-hot-toast'
import Image from 'next/image'
import AdminNavbar from '@/src/components/AdminNavbar'
import { phoneNavModalStyle } from '@/src/lib/modalstyle'
import AdminPhoneNav from '@/src/components/AdminPhoneNav';
import ReportedPosts from '@/src/components/Admin/ReportedPosts';
import FoundationApps from '@/src/components/Admin/FoundationApps';
import AdminSettings from '@/src/components/Admin/AdminSettings';

function Admin() {

  const [activeContainer, setActiveContainer] = useState('Reported Posts')
  const [showPhoneNavModal, setShowPhoneNavModal] = useState(false)

  return (
    <div className='flex flex-row w-full h-screen overflow-hidden bg-dark_gray'>
        <div className='hidden lg:flex lg:w-[300px]'>
          <AdminNavbar 
              props={{
                expanded: true,
                activeContainer: activeContainer,
                setActiveContainer: setActiveContainer
              }}
          />
        </div>

        <div className='w-fit md:flex lg:hidden hidden'>
          <AdminNavbar 
              props={{
                expanded: false,
                activeContainer: activeContainer,
                setActiveContainer: setActiveContainer
              }}
          />
        </div>

        <div className='w-full'>
          <nav className='w-screen h-14 bg-snow flex justify-between items-center md:hidden drop-shadow-sm'>
              <div className='h-full w-fit flex flex-row items-center gap-1'>
                <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full'/>
                <h1 className='font-shining text-4xl text-grass'>Admin</h1>
              </div>
              
              <button onClick={() => setShowPhoneNavModal(true)}>
                <i className='fa-solid fa-bars text-xl w-[56px] h-[56px] flex items-center justify-center'/>
              </button>

              <Modal 
                  isOpen={showPhoneNavModal}
                  onRequestClose={() => setShowPhoneNavModal(false)}
                  style={phoneNavModalStyle}
              >
                <AdminPhoneNav
                  props={{
                    setShowPhoneNavModal: setShowPhoneNavModal,
                    activeContainer: activeContainer,
                    setActiveContainer: setActiveContainer
                  }}
                />
              </Modal>
          </nav>
          
          { activeContainer === 'Reported Posts' && <ReportedPosts /> }
          { activeContainer === 'Foundation Applications' && <FoundationApps /> }
          { activeContainer === 'Settings' && <AdminSettings /> }
        </div>
    </div>
  )
}

export default withSpecialAuth('luTr6y0B1TUOkimRQlfiCO9xQqo1')(Admin)