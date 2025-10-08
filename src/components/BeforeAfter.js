"use client";

import { useState } from "react";
import Image from "next/image";

export default function BeforeAfter({ before, after, altBefore, altAfter }) {
  const [v, setV] = useState(50);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-200">
      <Image
        src={after}
        alt={altAfter}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${v}%` }}
      >
        <Image
          src={before}
          alt={altBefore}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(parseInt(e.target.value))}
        className="absolute bottom-4 left-1/2 w-1/2 -translate-x-1/2"
        aria-label="Before and after slider"
      />
    </div>
  );
}
