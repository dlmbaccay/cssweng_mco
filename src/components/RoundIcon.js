import React from 'react';
import Image from 'next/image';

export default function RoundIcon(props) {
  const { src, alt, width, height } = props;

  return (
    <div className='w-full'>
      <div className="max-w-[300px] max-h-[300px] object-center overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="object-center rounded-full align-middle"
        />
      </div>
    </div>
  );
}