import React from "react";

export function FeaturesSection() {
  return (
    <section className="bg-white dark:bg-slate-950/50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-4 mb-16 max-w-[720px]">
          <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight lg:text-4xl">
            Engineered for Deep Work
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Fractalist helps you navigate complexity with intuitive AI tools
            designed for modern productivity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="size-14 flex items-center justify-center bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-background-dark transition-colors">
              <span className="material-symbols-outlined text-3xl">
                psychology
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">
                AI Orchestration
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically decompose large projects into manageable sub-tasks
                using our proprietary neural engine.
              </p>
            </div>
          </div>
          {/* Feature 2 */}
          <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="size-14 flex items-center justify-center bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-background-dark transition-colors">
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">
                Deep Focus Timer
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay in the flow with integrated Pomodoro techniques and
                real-time focus quality tracking.
              </p>
            </div>
          </div>
          {/* Feature 3 */}
          <div className="group flex flex-col gap-6 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="size-14 flex items-center justify-center bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-background-dark transition-colors">
              <span className="material-symbols-outlined text-3xl">
                keyboard
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">
                Natural Language Entry
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Turn abstract thoughts into concrete tasks instantly with
                powerful AI-driven natural language processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
