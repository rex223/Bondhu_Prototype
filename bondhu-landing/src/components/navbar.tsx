"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Team", href: "/team" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <div className="px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                        <Image
                            src="/logo.png"
                            alt="The Last Neuron Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">
                        The Last Neuron
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/60 hover:text-white"
                                    }`}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA Button */}
                <div className="hidden md:block">
                    <button className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95">
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white/80 hover:text-white"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl md:hidden flex flex-col gap-4"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`text-base font-medium ${pathname === link.href ? "text-orange-400" : "text-white/70"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold">
                        Get Started
                    </button>
                </motion.div>
            )}
        </nav>
    );
}
