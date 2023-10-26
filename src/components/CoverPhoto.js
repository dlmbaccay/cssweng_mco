import React from 'react';
import Image from 'next/image';

export default function CoverPhoto(props) {
  const { src, alt, width, height } = props;

  return (
    <div className="relative w-full h-full">
      <div className="max-w-[1980px] max-h-[200px]  flex items-center justify-center overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={1980}
          height={222}
          objectFit='fill' 
          objectPosition="center"
          className="object-center align-middle"
        />
      </div>
    </div>
  );
}