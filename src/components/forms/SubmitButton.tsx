"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full sm:w-auto" type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" size={20} /> : null}
      {pending ? "Enregistrement..." : label}
    </button>
  );
}
