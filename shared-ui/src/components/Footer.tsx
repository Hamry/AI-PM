import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 lg:px-20 text-center flex flex-col items-center gap-8">
      <div className="flex items-center gap-3 grayscale opacity-70">
        <div className="flex items-center justify-center size-8 bg-slate-300 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200">
          <span className="material-symbols-outlined text-xl">
            account_tree
          </span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
          Fractalist
        </h2>
      </div>
      <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm"
          href="#"
        >
          Privacy Policy
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm"
          href="#"
        >
          Terms of Service
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm"
          href="#"
        >
          Contact Us
        </a>
        <a
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm"
          href="#"
        >
          Security
        </a>
      </nav>
      <div className="flex gap-6">
        <a
          className="text-slate-400 hover:text-primary transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">brand_family</span>
        </a>
        <a
          className="text-slate-400 hover:text-primary transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">hub</span>
        </a>
        <a
          className="text-slate-400 hover:text-primary transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">terminal</span>
        </a>
      </div>
      <p className="text-slate-400 text-sm">
        © 2024 Fractalist AI. All rights reserved.
      </p>
    </footer>
  );
}
