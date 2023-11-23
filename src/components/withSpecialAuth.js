import React from 'react';
import 'firebase/auth';
import {auth} from '@/src/lib/firebase';
import Router from 'next/router';

const withSpecialAuth = (allowedUserIds) => (Component) => {
 class withSpecialAuth extends React.Component {
   state = { authenticated: null }

   componentDidMount() {
     auth.onAuthStateChanged(authUser => {
       if (!authUser) {
         Router.push('/Login');
       } else if (!allowedUserIds.includes(authUser.uid)) {
         // user is authenticated but not allowed
         Router.push('/Login');
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
