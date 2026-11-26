'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import HeartbeatLoader from '../../lab/components/report/HeartbeatLoader';

// Halaman uji sementara untuk tampilan menunggu.
export default function Preview() {
  const [show, setShow] = useState(false);
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <main className="min-h-dvh bg-background px-4 py-10 md:p-12">
      <button id="show-loader" type="button" onClick={() => setShow(true)}>show</button>
      <div className="mx-auto max-w-5xl">
        {show && <HeartbeatLoader eyebrow="Ranolazine" title="Simulating the heart cell" detail="The simulator is running each dose." />}
      </div>
    </main>
  );
}
 