import React, { useState } from 'react';
import Image from 'next/image';
import { FALLBACK_IMG } from '@/data/meta';

export default function SafeImage({ src, alt, fallbackSrc = FALLBACK_IMG, className, ...props }) {
  const [imgSrc, setImgSrc] = useState(src?.startsWith('/') ? fallbackSrc : (src || fallbackSrc));
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      src={error ? fallbackSrc : imgSrc}
      alt={alt || "Event Image"}
      className={`${className} ${error ? "object-contain p-4" : "object-cover"}`}
      onError={() => {
        if (!error) {
          setError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
