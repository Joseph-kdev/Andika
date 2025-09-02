"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export default function NotesLayout({
    children
}: {
    children: React.ReactNode
}) {
     const { state: sidebarState } = useSidebar();
    return (
        <div>
            <main>
                <div className={`${sidebarState === 'expanded' ? 'mx-1' : 'mx-2'}`}>
                    <SidebarTrigger />
                </div>
                <div>
                    {children}
                </div>
            </main>
        </div>
    )
}