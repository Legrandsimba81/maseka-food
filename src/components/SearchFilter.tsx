"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchFilter({ placeholder, basePath }: { placeholder: string; basePath: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      router.push(`${basePath}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, router, basePath]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field max-w-md"
      />
    </div>
  );
}