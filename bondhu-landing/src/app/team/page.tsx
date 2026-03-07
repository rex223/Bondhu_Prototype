"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/navbar";

// --- Data ---

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  socials: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

const mentor: TeamMember = {
  name: "Saikat Bandopadhyay",
  role: "Mentor & Advisor",
  image: "/team/Saikat_sir.jpeg",
  bio: "Guiding the team with wisdom and experience ensuring that Bondhu AI remains thoughtful, ethical and impactful.",
  socials: {
    linkedin: "https://www.linkedin.com/in/saikatbandopadhyay91/",
  },
};

const teamMembers: TeamMember[] = [
  {
    name: "Md Haaris Hussain",
    role: "Full Stack Developer",
    image: "/team/Haaris.png",
    bio: "Building end-to-end solutions with passion and precision.",
    socials: {
      linkedin: "https://www.linkedin.com/in/md-haaris-hussain-a69742253/",
      github: "https://github.com/mdhaarishussain",
    },
  },
  {
    name: "Raquib",
    role: "AI Engineer",
    image: "/team/Raquib.jpeg",
    bio: "Crafting intelligent systems that understand and empathize.",
    socials: {
      linkedin: "https://www.linkedin.com/in/raquib223/",
      github: "https://github.com/rex223",
    },
  },
  {
    name: "Shaikh Ahmad",
    role: "Backend Developer",
    image: "/team/Shaikh.png",
    bio: "Architecting robust infrastructure for seamless experiences.",
    socials: {
      linkedin: "https://www.linkedin.com/in/shaikhahmad0968/",
      github: "https://github.com/shaikhahmad0968",
    },
  },
  {
    name: "Md Adinul Arfin",
    role: "Frontend Developer",
    image: "/team/Adinul.jpeg",
    bio: "Creating beautiful, intuitive interfaces that users love.",
    socials: {
      linkedin: "https://www.linkedin.com/in/md-adinul-arfin-ba15b3208/",
    },
  },
  {
    name: "Nawal Fida Laskar",
    role: "UI/UX Designer",
    image: "/team/Nawal.png",
    bio: "Designing experiences that blend aesthetics with empathy.",
    socials: {
      linkedin: "https://www.linkedin.com/in/nawal-fida-laskar-48b6a52bb/",
    },
  },
];

// --- Components ---

const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
  <Link
    href={href}
    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all hover:scale-110"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon size={18} />
  </Link>
);

export default function TeamPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-orange-500/30">
      <Navbar />

      {/* Liquid Glass Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-orange-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-amber-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-red-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="mb-32 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            Building the future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">
              empathy.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            We are a team of dreamers, engineers, and designers from NSEC, united by a single mission: to make AI more human.
          </motion.p>
        </section>

        {/* Mentor Section - Compact */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm p-1 max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-[300px_1fr] gap-6 items-center">
              <div className="relative h-[320px] w-full overflow-hidden rounded-2xl">
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wider uppercase">
                  Mentor & Advisor
                </div>
                <h2 className="text-3xl font-bold mb-2">{mentor.name}</h2>
                <p className="text-lg text-white/50 mb-4">{mentor.role}</p>
                <p className="text-base text-white/80 leading-relaxed mb-6">
                  "{mentor.bio}"
                </p>
                <div className="flex gap-4">
                  {mentor.socials.linkedin && <SocialLink href={mentor.socials.linkedin} icon={Linkedin} />}
                  {mentor.socials.email && <SocialLink href={`mailto:${mentor.socials.email}`} icon={Mail} />}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Team Grid */}
        <section>
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-bold">Core Team</h2>
            <div className="h-px flex-1 bg-white/10 ml-8 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[400px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="absolute inset-0">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-orange-400 text-sm font-medium mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {member.role}
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 translate-y-4 group-hover:translate-y-0">
                    {member.bio}
                  </p>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
                    {member.socials.github && <SocialLink href={member.socials.github} icon={Github} />}
                    {member.socials.linkedin && <SocialLink href={member.socials.linkedin} icon={Linkedin} />}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Join Us Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: teamMembers.length * 0.1 }}
              className="group relative h-[400px] rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white/5 to-white/0 hover:border-orange-500/50 transition-colors"
            >
              <div className="mb-6 p-4 rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform duration-500">
                <ArrowUpRight size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Join the Mission</h3>
              <p className="text-white/60 mb-8">
                We are always looking for brilliant minds to join our collective.
              </p>
              <button className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-orange-400 hover:text-white transition-colors">
                View Open Roles
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}