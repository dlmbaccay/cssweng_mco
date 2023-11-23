import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import Router from 'next/router';

const withSpecialAuth = (allowedUserIds) => (Component) => {
 class withSpecialAuth extends React.Component {
   state = { authenticated: null }

   componentDidMount() {
     firebase.auth().onAuthStateChanged(authUser => {
       if (!authUser) {
         Router.push('/login');
       } else if (!allowedUserIds.includes(authUser.uid)) {
         // user is authenticated but not allowed
         Router.push('/unauthorized');
       } else {
         // user is authenticated and allowed
         this.setState({ authenticated: true });
       }
     });
   }

   render() {
     if (!this.state.authenticated) {
       return 'Loading...';
     }
     return (
       <Component { ...this.props } />
     );
   }
 }

 return withSpecialAuth;
}

export default withSpecialAuth;
