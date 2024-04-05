'use client'
import { sidebarLinks } from '@/constants'
import React from 'react'
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Sidebar = () => {
    const pathname = usePathname();
    return (
        <section className="sticky left-0 top-0 flex h-screen w-fit flex-col
        justify-between bg-gradient-to-t from-color3 to-color4 p-6 pt-28 
        text-white max-sm:hidden lg:w-[264px] rounded">
            <div className='flex flex-1 flex-col'>
                <Image
                    src="/clubsys-logo-white.png"
                    width={150}
                    height={150}
                    alt="Clubsys Logo"
                    className='mb-10 ml-7'
                />
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.route || 
                    (link.route !== '/' && pathname?.startsWith(`${link.route}/`)); 

                    return (
                        <Link
                            href={link.route}
                            key={link.label}
                            className={cn('flex gap-4 items-center p-4 rounded-lg justify-start', {
                                'border border-white': isActive,
                            })}
                        >
                            <ListItemIcon>
                                <link.IconComponent style={{ color: 'white' }} />
                            </ListItemIcon>
                            <ListItemText primary={link.label} className='text-white' />
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

export default Sidebar