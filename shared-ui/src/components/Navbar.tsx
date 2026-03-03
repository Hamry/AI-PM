import React from "react";

export function Navbar() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-4 lg:px-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 bg-primary rounded-lg text-background-dark">
          <span className="material-symbols-outlined text-2xl font-bold">
            account_tree
          </span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold tracking-tight">
          Fractalist
        </h2>
      </div>
      <nav className="hidden md:flex flex-1 justify-center gap-10">
        <a
          className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors"
          href="#"
        >
          Features
        </a>
        <a
          className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors"
          href="#"
        >
          Pricing
        </a>
        <a
          className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors"
          href="#"
        >
          About
        </a>
        <a
          className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors"
          href="#"
        >
          Blog
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
          Log In
        </button>
        <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary text-background-dark text-sm font-bold transition-all hover:opacity-90 shadow-sm shadow-primary/20">
          Get Started
        </button>
      </div>
    </header>
  );
}
