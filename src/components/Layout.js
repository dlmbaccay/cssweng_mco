import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className='min-h-screen'>
            <main>
                {children}
            </main>
        </div>
    )
};

export default Layout;
