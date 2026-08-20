"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/backend/actions/auth";

export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-foreground hover:text-primary"
      >
        {name}
        <span aria-hidden className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-md border border-border bg-white py-1 shadow-lg">
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-foreground hover:bg-background-alt"
          >
            Meu perfil
          </Link>
          <Link
            href="/reservas"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-foreground hover:bg-background-alt"
          >
            Minhas reservas
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm text-foreground-muted hover:bg-background-alt hover:text-primary"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
