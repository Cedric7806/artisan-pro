import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
};

export function PageHeader({ title, description, actionHref, actionLabel, actionIcon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-base text-slate-600">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link className="btn-primary shrink-0" href={actionHref}>
          {Icon ? <Icon aria-hidden="true" size={20} /> : null}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
