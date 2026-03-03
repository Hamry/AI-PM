import React from "react";

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 @container">
      <div className="flex flex-col items-center gap-12 text-center lg:gap-16">
        <div className="flex flex-col gap-6 max-w-[840px]">
          <h1 className="text-slate-900 dark:text-slate-100 text-5xl font-black leading-tight tracking-[-0.04em] lg:text-7xl">
            Master the Art of <span className="text-primary">Focus</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed lg:text-xl">
            Break down complex goals into actionable steps using AI-powered task
            orchestration and decomposition. Designed for deep thinkers and high
            achievers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <label className="flex flex-1 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2">
              mail
            </span>
            <input
              className="w-full border-none bg-transparent p-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 text-base"
              placeholder="Enter your work email"
              type="email"
            />
          </label>
          <button className="bg-primary text-background-dark font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all whitespace-nowrap shadow-lg shadow-primary/20">
            Get Started for Free
          </button>
        </div>
        <div className="w-full relative mt-8">
          <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50"></div>
          <div className="relative bg-slate-200 dark:bg-slate-800 rounded-2xl p-2 shadow-2xl border border-slate-300 dark:border-slate-700">
            <img
              alt="Fractalist Dashboard"
              className="rounded-xl w-full h-auto object-cover shadow-inner aspect-[16/9]"
              data-alt="High-fidelity sage-green dashboard with task charts"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_fGqEHo34lhxwXEIElMVpYS9FF-KCQuvIsHLrCZHuqy2eozmJh34B7TGaslJWqEjmpZ4iUH4OKAfTO9nJBHlaVf5lPqcxmg8kqFc4rDPvSV9V78vnCZkU4RHPz5dkl8PILoWiO0FBkT7Yn-JWWSsoDONJSEbocRYRaSuQx8fjXwb1JXNVI0JbLQ3Db4GfBq1wkB1qUUf-qqx_euI1rwlHoJiBlHVaP-iNXGGUFHjn9vtdZFe2v6X7Pms0ZCjQgVOks-naRJyjAUUf"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
