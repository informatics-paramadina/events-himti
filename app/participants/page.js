"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParticipantsRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search || "";
      router.replace(`/dashboard/participants${search}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-semibold">
          Mengalihkan ke Kelola Peserta...
        </p>
      </div>
    </div>
  );
}
