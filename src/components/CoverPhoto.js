import React from 'react';
import Image from 'next/image';

export default function CoverPhoto(props) {
  const { src, alt } = props;

  return (
    <div className="relative w-full h-full">
      <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      </div>
    </div>
  );
}