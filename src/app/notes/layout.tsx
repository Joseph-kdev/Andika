"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function NotesLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <main>
                <div>
                    <SidebarTrigger />
                </div>
                <div>
                    {children}
                </div>
            </main>
        </div>
    )
}