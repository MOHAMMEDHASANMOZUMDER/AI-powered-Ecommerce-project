"use client";

import Link from "next/link";

export default function About() {
  const coreValues = [
    {
      title: "Absolute Speed",
      desc: "Instant loading times and milliseconds routing responses ensure an engaging, bounce-free storefront experience.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Cognitive AI",
      desc: "Replacing traditional search lists with Google Gemini semantic models to interpret real customer thoughts and requests.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m15.364 6.364l-.707-.707M6.364 6.364l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Safe Persistence",
      desc: "Robust order checkouts saved securely inside Mongoose schemas, maintaining a reliable record of client purchases.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Premium Aesthetics",
      desc: "Ultra-modern layouts featuring glassmorphism elements, custom dark modes, and soft micro-animations to wow users.",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const techStack = [
    {
      name: "Next.js 16 (App Router)",
      role: "Application Framework & Core Routing",
      desc: "Powers server-side rendering (SSR), optimized bundle structures, dynamic API endpoints, and clean client-side hydration for highly interactive interfaces.",
      iconPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      glowColor: "group-hover:shadow-indigo-500/10 dark:group-hover:shadow-indigo-500/5 border-indigo-500/30",
      accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500/20",
    },
    {
      name: "MongoDB Atlas",
      role: "Elastic Cloud Database",
      desc: "Houses our flexible data models. Interfaced via Mongoose schema models to guarantee robust, lightning-fast queries across our catalog storage collections.",
      iconPath: "M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4",
      glowColor: "group-hover:shadow-emerald-500/10 dark:group-hover:shadow-emerald-500/5 border-emerald-500/30",
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/20",
    },
    {
      name: "Google Gemini 1.5 Flash",
      role: "Cognitive Search Brain",
      desc: "Applies Large Language Model intelligence to decode raw natural language search inputs. Converts vague user intent into highly optimized query keywords.",
      iconPath: "M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m15.364 6.364l-.707-.707M6.364 6.364l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
      glowColor: "group-hover:shadow-violet-500/10 dark:group-hover:shadow-violet-500/5 border-violet-500/30",
      accent: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-500/20",
    },
  ];

  const team = [
    {
      name: "Sarah Jenkins",
      role: "Co-Founder & CEO",
      bio: "Fascinated by semantic user interfaces. Former product designer and leader with over a decade of e-commerce experience.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Kabir Ahmed",
      role: "CTO & Database Architect",
      bio: "Specializes in clustered architectures and indexed schemas. Scaling MongoDB data channels to sub-millisecond ranges.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Elena Rostova",
      role: "Lead AI Research Engineer",
      bio: "Bridges the gap between machine intelligence and transactional databases. Optimizing cognitive search models using Gemini APIs.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  return (
    <div className="flex-1 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Splendid Hero Banner Section */}
      <section className="relative overflow-hidden py-20 border-b border-zinc-200 dark:border-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 dark:from-indigo-950/20 via-white dark:via-zinc-950 to-zinc-50 dark:to-zinc-950">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Block: Narrative */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/20 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Next-Gen E-Commerce
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
                Our Journey to <br />
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Intelligent Shopping
                </span>
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
                NexusStore was founded with a singular, disruptive vision: shopping should be conversational and immediate. Traditional keyword matches fail customers daily, forcing them to guess product titles. 
                <br /><br />
                We built a bridge directly connecting cognitive artificial intelligence with relational MongoDB schemas. The result is a high-fidelity catalog that immediately decodes semantic queries, coupled with a checkout system optimized for secure settlements.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all duration-200"
                >
                  Explore Catalog
                </Link>
                <Link
                  href="/checkout"
                  className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 font-semibold text-xs rounded-xl active:scale-95 transition-all duration-200"
                >
                  Secured Checkout
                </Link>
              </div>
            </div>

            {/* Right Block: Showcase Image from Unsplash */}
            <div className="lg:col-span-6 relative h-[380px] w-full rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl group">
              <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay z-10 pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=compress&cs=tinysrgb&w=800"
                alt="Elite product design studio teamwork session"
                className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col gap-24">
        
        {/* Core Values Section */}
        <div className="flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Our Core Values</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              Every feature, component, and schema we engineer rests upon these fundamental pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val) => (
              <div
                key={val.title}
                className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none shadow-sm"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border mb-5 ${val.color}`}>
                  {val.icon}
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">{val.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Showcase Grid */}
        <div className="flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Built on the Best</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              Our technology ecosystem integrates bleeding-edge engineering layers to deliver absolute speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className={`group relative bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tech.glowColor}`}
              >
                <div className="absolute inset-x-0 -top-px h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />

                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border mb-6 ${tech.accent}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tech.iconPath} />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {tech.name}
                </h3>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1 mb-4">
                  {tech.role}
                </span>

                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meet the Visionaries section */}
        <div className="flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Meet the Visionaries</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              Our exceptional founding team unites leading experts in user experience, systems scaling, and AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="group flex flex-col bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden p-5 transition-all duration-300 hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1"
              >
                {/* Visual Avatar from Unsplash */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 mb-5 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                  />
                </div>
                
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {member.name}
                </h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1 mb-3">
                  {member.role}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Metrics Showcase Banner */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                Intelligent Search, <br />No Keywords Required.
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed text-xs sm:text-sm font-medium">
                Traditional storefront search engines fail when users type expressions. If a customer searches for *"a device to blend fruits and create smoothies"*, keyword matchers return zero results. 
                <br /><br />
                NexusStore routes this intent directly through a sanitized **Gemini API model request**. It extracts the root concept—**"Blender"**—and retrieves Mongoose database schemas in milliseconds, producing the perfect product cards.
              </p>
            </div>

            {/* Metrics Dashboard mock */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "AI Translation Latency", val: "~150ms", detail: "Optimized model routes" },
                { label: "Database Core Response", val: "< 5ms", detail: "Indexed MongoDB structures" },
                { label: "Hydration Success Rate", val: "100%", detail: "No client layout flashes" },
                { label: "Customer Wow Factor", val: "Maximum", detail: "Fully responsive layouts" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex flex-col shadow-inner dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                    {metric.val}
                  </span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 mt-2">
                    {metric.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
                    {metric.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-10 transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">
            &copy; {new Date().getFullYear()} NexusStore Inc. All rights reserved.
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Go to Catalog</Link>
            <Link href="/checkout" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Go to Checkout</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
