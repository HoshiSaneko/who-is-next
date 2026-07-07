import React from 'react';
import { IconType } from 'react-icons';

type Tone = 'blue' | 'teal' | 'amber' | 'rose' | 'slate';

const toneClass: Record<Tone, string> = {
  blue: 'text-sky-700 bg-sky-50 border-sky-100',
  teal: 'text-teal-700 bg-teal-50 border-teal-100',
  amber: 'text-amber-700 bg-amber-50 border-amber-100',
  rose: 'text-rose-700 bg-rose-50 border-rose-100',
  slate: 'text-slate-700 bg-slate-50 border-slate-200',
};

export const PageShell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <section className={`mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pb-8 pt-24 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </section>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-3xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const DataPanel: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, children, className = '' }) => (
  <section className={`overflow-hidden rounded-[8px] border border-slate-200 bg-white ${className}`}>
    {(title || description || actions) && (
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <h2 className="text-base font-semibold text-slate-950">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  helper?: string;
  icon?: IconType;
  tone?: Tone;
}> = ({ label, value, helper, icon: Icon, tone = 'blue' }) => (
  <div className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{value}</div>
      </div>
      {Icon && (
        <div className={`rounded-[12px] border p-2.5 ${toneClass[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </div>
    {helper && <p className="mt-3 text-xs leading-5 text-slate-500">{helper}</p>}
  </div>
);

export const StatBadge: React.FC<{ children: React.ReactNode; tone?: Tone; className?: string }> = ({
  children,
  tone = 'slate',
  className = '',
}) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass[tone]} ${className}`}>
    {children}
  </span>
);

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconType; label: string }> = ({
  icon: Icon,
  label,
  className = '',
  ...props
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${className}`}
    {...props}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const SegmentedControl = <T extends string | number>({
  items,
  value,
  onChange,
  getLabel = String,
  className = '',
}: {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
  className?: string;
}) => (
  <div className={`flex max-w-full gap-1 overflow-x-auto rounded-[8px] border border-slate-200 bg-white p-1 no-scrollbar ${className}`}>
    {items.map((item) => {
      const active = item === value;
      return (
        <button
          key={String(item)}
          type="button"
          onClick={() => onChange(item)}
          className={`shrink-0 cursor-pointer rounded-[6px] px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
            active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
          }`}
        >
          {getLabel(item)}
        </button>
      );
    })}
  </div>
);

export const MediaCard: React.FC<{
  title: string;
  image?: string;
  meta?: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
}> = ({ title, image, meta, href, children }) => {
  const content = (
    <article className="group h-full overflow-hidden rounded-[8px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
      {image && (
        <div className="aspect-video overflow-hidden bg-slate-100 p-2">
          <div className="h-full w-full overflow-hidden rounded-[6px]">
            <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          </div>
        </div>
      )}
      <div className="flex h-full flex-col gap-3 p-4">
        {meta && <div className="text-xs font-medium text-slate-500">{meta}</div>}
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-slate-950">{title}</h3>
        {children}
      </div>
    </article>
  );

  if (!href) return content;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">
      {content}
    </a>
  );
};

export const EmptyState: React.FC<{ title: string; description?: string; icon?: IconType }> = ({ title, description, icon: Icon }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-center">
    {Icon && <Icon className="mb-3 h-7 w-7 text-slate-400" aria-hidden="true" />}
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>}
  </div>
);

