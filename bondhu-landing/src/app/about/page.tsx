"use client";
import React, { useState, useEffect } from "react";
import { Heart, Shield, Brain, Users, Sparkles, Target, Moon, Sun, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const values = [
    {
      icon: Heart,
      title: "Empathy First",
      desc: "Every response Bondhu generates begins with understanding — not assumption. We design AI that listens deeply before speaking.",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Privacy by Design",
      desc: "Your emotions, reflections, and chats stay yours. We prioritize security, data protection, and transparency in everything we build.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Brain,
      title: "Continuous Learning",
      desc: "Bondhu grows with you — improving its understanding through ethical AI and user feedback, not invasive data collection.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Users,
      title: "Accessibility for All",
      desc: "Mental health tools shouldn't be a luxury. We aim to make Bondhu accessible to anyone, regardless of background or ability.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Sparkles,
      title: "Human-Centered Innovation",
      desc: "Technology is only as good as its impact on people. We craft experiences that feel warm, intuitive, and emotionally intelligent.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Honest Impact",
      desc: "We measure success not by engagement, but by emotional well-being — the peace and self-awareness our users gain.",
      color: "from-indigo-500 to-violet-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 transition-colors duration-500">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 dark:bg-background/95 backdrop-blur-xl border-b border-border z-50 shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group cursor-pointer">
                <Image 
                  src="/Light mode logo.svg" 
                  alt="Bondhu" 
                  width={56}
                  height={56}
                  className="h-14 w-auto object-contain dark:hidden"
                />
                <Image 
                  src="/Dark mode Logo.svg" 
                  alt="Bondhu" 
                  width={56}
                  height={56}
                  className="h-14 w-auto object-contain hidden dark:block"
                />
              </Link>
            </div>  

            <div className="flex items-center space-x-2">
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold"
                >
                  About
                </Link>
                <Link
                  href="/team"
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                >
                  Team
                </Link>
              </nav>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pb-2 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/team"
                className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Team
              </Link>
            </nav>
          )}
        </div>
      </header>

      <div className="h-16"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Animated Background Orbs - optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse will-change-transform" style={{ animationDuration: '4s' }} />
          <div className="absolute w-96 h-96 bg-secondary/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse will-change-transform" style={{ animationDelay: '1s', animationDuration: '5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4 backdrop-blur-sm border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Your AI Companion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="text-foreground">About </span>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Bondhu
              </span>
            </h1>

            <p className="text-xl md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
              A human-first AI companion designed to support emotional well-being and mental clarity. 
              We combine <span className="font-semibold text-primary">empathy</span>, 
              <span className="font-semibold text-primary"> science</span>, and 
              <span className="font-semibold text-primary"> technology</span> to make 
              mental health support more accessible, private, and personal.
            </p>
          </div>
        </div>

        <style jsx>{`
          /* Reduce motion for accessibility */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* GPU acceleration hints */
          .group:hover {
            will-change: transform;
          }
        `}</style>
      </section>

      {/* Vision & Mission Section */}
      <section className="relative overflow-hidden bg-secondary/20 min-h-[600px]">

        {/* Content Layer */}
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative p-10 bg-card/90 rounded-3xl border border-border shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-md">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent mb-4">
                  Our Vision
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To make emotional well-being as natural and effortless as breathing. 
                  Bondhu envisions a world where technology amplifies empathy — where 
                  AI doesn't replace connection, but helps people find it again within 
                  themselves and others.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative p-10 bg-card/90 rounded-3xl border border-border shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-md">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Heart className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent mb-4">
                  Our Mission
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To empower individuals through mindful AI interactions that listen, 
                  learn, and respond with care. Our mission is to democratize mental 
                  health tools — so anyone, anywhere, can find emotional clarity and 
                  companionship without stigma or judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative bg-gradient-to-br from-background via-secondary/10 to-background py-16 md:py-24 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The Philosophy Behind Bondhu
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/80 mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p className="bg-card/60 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg">
              Mental health tools today are often either too clinical or too superficial. 
              Bondhu bridges that gap — designed to understand real human emotions, context, 
              and behavior patterns. It learns from your interactions to respond in ways that 
              feel personal, comforting, and genuine.
            </p>
            <p className="bg-card/60 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg">
              The name <span className="font-bold text-primary">Bondhu</span> means 
              <span className="font-semibold italic"> friend</span> — because that's what we aim to be. 
              Not a therapist, not a chatbot — but a thoughtful digital companion that listens 
              without judgment and gently helps you grow.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative bg-secondary/20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/80 mx-auto rounded-full"></div>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-card rounded-2xl border border-border p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-xl font-bold mb-3 bg-gradient-to-br ${value.color} bg-clip-text text-transparent`}>
                    {value.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 text-center">
          <p className="text-xl md:text-xl font-light text-foreground leading-relaxed">
            Bondhu.tech isn't just building an app — it's shaping a{" "}
            <span className="font-bold text-primary">movement</span> where emotional well-being meets 
            meaningful technology.
          </p>
          <p className="mt-6 text-l md:text-l text-muted-foreground font-light">
            Because everyone deserves a friend who listens — even in silence.
          </p>
        </div>
      </section>
    </div>
  );
}