import React, { useState, useEffect } from 'react'
import { firestore } from '../lib/firebase'
import Image from 'next/image'

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

export default function Reactions({props}) {

    const { postID, setShowReactionsModal } = props

    const [likeCount, setLikeCount] = useState(0)
    const [heartCount, setHeartCount] = useState(0)
    const [hahaCount, setHahaCount] = useState(0)
    const [wowCount, setWowCount] = useState(0)
    const [sadCount, setSadCount] = useState(0)
    const [angryCount, setAngryCount] = useState(0)

    // get the number of reactions for each type by counting the number of userIDs in each type
    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('reactions');

        const unsubscribe = reactionsRef.onSnapshot((snapshot) => {
            const reactionCounts = {
                like: 0,
                heart: 0,
                haha: 0,
                wow: 0,
                sad: 0,
                angry: 0,
            };

            snapshot.docs.forEach((doc) => {
                const reactionData = doc.data();
                if (reactionCounts.hasOwnProperty(doc.id)) {
                    reactionCounts[doc.id] = reactionData.userIDs.length;
                }
            });

            setLikeCount(reactionCounts.like);
            setHeartCount(reactionCounts.heart);
            setHahaCount(reactionCounts.haha);
            setWowCount(reactionCounts.wow);
            setSadCount(reactionCounts.sad);
            setAngryCount(reactionCounts.angry);
        });

        return () => {
            unsubscribe();
        };
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
                <div className='flex flex-row items-center gap-2'>
                    <Image src={likeReaction} alt='like reaction' width={25} height={25} 
                    />
                    <p className='font-bold'>{likeCount}</p>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <Image src={heartReaction} alt='heart reaction' width={25} height={25} />
                    <p className='font-bold'>{heartCount}</p>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <Image src={laughReaction} alt='laugh reaction' width={25} height={25} />
                    <p className='font-bold'>{hahaCount}</p>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <Image src={wowReaction} alt='wow reaction' width={25} height={25}/>
                    <p className='font-bold'>{wowCount}</p>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <Image src={sadReaction} alt='sad reaction' width={25} height={25} />
                    <p className='font-bold'>{sadCount}</p>
                </div>
                <div className='flex flex-row items-center gap-2'>
                    <Image src={angryReaction} alt='angry reaction' width={25} height={25} />
                    <p className='font-bold'>{angryCount}</p>
                </div>
            </div>

        </div>
    )
}
