import React, { useState, useEffect } from 'react'
import { firestore } from '../lib/firebase'
import Image from 'next/image'

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/laugh.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

export default function Reactions({props}) {

    const { postID, setShowReactionsModal } = props

    const [activeContainer, setActiveContainer] = useState('')

    const [likeCount, setLikeCount] = useState(0)
    const [heartCount, setHeartCount] = useState(0)
    const [hahaCount, setHahaCount] = useState(0)
    const [wowCount, setWowCount] = useState(0)
    const [sadCount, setSadCount] = useState(0)
    const [angryCount, setAngryCount] = useState(0)

    // get the number of reactions for each type by counting the number of userIDs in each type
    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');
        const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Your actual reaction types

        const unsubscribes = reactionTypes.map((reaction) => {
            const reactionRef = reactionsRef.doc(reaction);

            return reactionRef.onSnapshot((snapshot) => {
                const reactionData = snapshot.data();

                if (reactionData) {
                    const userIDsCount = reactionData.userIDs.length;

                    switch (reaction) {
                        case 'like':
                            setLikeCount(userIDsCount);
                            break;
                        case 'heart':
                            setHeartCount(userIDsCount);
                            break;
                        case 'haha':
                            setHahaCount(userIDsCount);
                            break;
                        case 'wow':
                            setWowCount(userIDsCount);
                            break;
                        case 'sad':
                            setSadCount(userIDsCount);
                            break;
                        case 'angry':
                            setAngryCount(userIDsCount);
                            break;
                        default:
                            break;
                    }
                }
            });
        });

        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, []);

    return (
        <div className='w-full h-full flex flex-col'>
            
            <div className='w-full h-fit flex flex-row items-center justify-between'>
                <p className='w-full text-center pl-4 font-bold'>Post Reactions</p>
                <i className='fa-solid fa-circle-xmark cursor-pointer hover:text-xanthous' onClick={(e) => {
                    e.stopPropagation();
                    setShowReactionsModal(false)
                }}/>
            </div>

            <div className='mt-2 flex flex-col h-fit gap-2'>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={likeReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{likeCount}</p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={heartReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{heartCount}</p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={laughReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{hahaCount}</p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={wowReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{wowCount}</p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={sadReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{sadCount}</p>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Image src={angryReaction} alt='like reaction' width={30} height={30} />
                    <p className='text-sm font-bold'>{angryCount}</p>
                </div>
            </div>

        </div>
    )
}
