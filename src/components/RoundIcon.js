import React from 'react';
import Image from 'next/image';

export default function RoundIcon(props) {
  const { src, alt, width, height } = props;

  return (
    <div className="relative w-full h-full">
      <div className="max-w-[500px] max-h-[500px] object-center overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="object-center"
        />
      </div>
    </div>
  );
}