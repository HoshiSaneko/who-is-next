import React from 'react';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { SITE_CONFIG } from '../configs/site.config';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-4 py-2.5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold text-slate-800">{SITE_CONFIG.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-slate-400">
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-slate-950"
          >
            <FiGithub className="h-3 w-3" aria-hidden="true" />
            GitHub
          </a>
          <span>{SITE_CONFIG.icpRecord}</span>
          <span>Crafted with React 19</span>
          <span className="inline-flex items-center gap-1.5">
            © {currentYear} Saneko
            <FiExternalLink className="h-3 w-3 text-slate-300" aria-hidden="true" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
