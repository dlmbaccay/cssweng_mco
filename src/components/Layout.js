import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className='min-h-screen'>
            {/* hi comment out ko muna 'to kasi big white space pa lang siya rn HSHDGH
            
            <div className="flex">
                <Navbar />
            </div> */}
            <main>
                {children}
            </main>
        </div>
    )
};

export default Layout;
