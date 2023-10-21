import { useEffect, useState } from 'react';
import { firestore } from '@/src/lib/firebase';
import { useRouter } from 'next/router';

export default function PetProfile() {
  const router = useRouter();
  const { userId, petId } = router.query;
  const [pet, setPet] = useState(null);
  
  useEffect(() => {
    let unsubscribe;

    if (petId && userId) {
      const petRef = firestore.collection('users').doc(userId).collection('pets').doc(petId);
      unsubscribe = petRef.onSnapshot((doc) => {
        if (doc.exists) {
          setPet({
            id: doc.id,
            ...doc.data()
          });
        } else {
          setPet(null);
        }
      });
    } else {
      setPet(null);
    }

    return unsubscribe;
  }, [petId, userId]);

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Pet Profile Page</h1>

      <p>Pet Name: {pet.name}</p>
      <p>Favorite Human: {pet.favehooman}</p>
    </div>
  );
}
