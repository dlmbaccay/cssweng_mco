export const basicModalStyle = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%', 
      height: '80%',
      overflow: 'auto',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#FAFAFA',
    },
};

export const confirmationModalStyle = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      // maxWidth: '1000px',
      // width: '100%',
      // maxHeight: '100vh',
      width: '500px', // Set the width to 1534px
      height: '300px  ', // Set the height to 765px
      overflow: 'auto',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#FAFAFA',
    },
}