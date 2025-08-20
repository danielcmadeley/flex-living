"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

interface GoogleProfileImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function GoogleProfileImage({
  src,
  alt,
  size = 32,
  className = "",
}: GoogleProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Don't render anything if no src or if there was an error
  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <User className="text-gray-400" size={size * 0.6} />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 rounded-full animate-pulse ${className}`}
          style={{ width: size, height: size }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full ${className} ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized={src.includes("googleusercontent.com")}
        priority={false}
      />
    </div>
  );
}
