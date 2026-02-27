"use client"
import Link from 'next/link';
import { useState } from 'react';
import { 
    HomeIcon, 
    CalendarIcon, 
    UsersIcon, 
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon 
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/events', label: 'Events', icon: CalendarIcon },
        { href: '/participants', label: 'Participants', icon: UsersIcon },
        { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    ];

    return (
        <nav className="bg-white border-b-4 border-primary sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg border-2 border-primary-dark flex items-center justify-center">
                                <span className="text-white font-black text-xl">EH</span>
                            </div>
                            <span className="font-black text-xl text-primary-dark">
                                Events <span className="text-primary">HIMTI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center px-4 py-2 text-sm font-bold text-primary-dark hover:bg-primary-light hover:bg-opacity-20 rounded-lg transition"
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-primary-dark hover:bg-primary-light hover:bg-opacity-20 transition"
                        >
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden border-t-2 border-primary">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center px-3 py-2 text-base font-bold text-primary-dark hover:bg-primary-light hover:bg-opacity-20 rounded-lg transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
