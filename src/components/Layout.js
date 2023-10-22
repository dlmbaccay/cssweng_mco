import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className='min-h-screen'>
            <div className="flex">
                <Navbar />
            </div>
            <main>
                {children}
            </main>
        </div>
    )
};

export default Layout;
