import React from 'react';
import Image from 'next/image';

export default function RoundIcon(props) {
  const { src, alt } = props;

  return (
    <div className="w-full rounded-full overflow-hidden">
      <div style={{ paddingTop: '100%' }} className="relative">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          sizes={100}
          objectFit="cover"
        />
      </div>
    </div>
  );
}
