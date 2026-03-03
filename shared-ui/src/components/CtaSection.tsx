import React from "react";

export function CtaSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      <div className="bg-background-dark dark:bg-slate-900 rounded-[2rem] p-12 lg:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32"></div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <h2 className="text-white text-4xl lg:text-5xl font-black max-w-2xl leading-tight">
            Ready to transform your workflow?
          </h2>
          <p className="text-slate-400 text-lg lg:text-xl max-w-xl">
            Join 50,000+ professionals who have regained control of their daily
            focus with Fractalist.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button className="bg-primary text-background-dark px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20">
              Get Started for Free
            </button>
            <button className="bg-slate-800 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">play_circle</span>{" "}
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
