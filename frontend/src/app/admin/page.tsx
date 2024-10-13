import { ReactNode } from 'react'
import {SidebarComponent} from "@/app/admin/sidebar";

export default function Page(): ReactNode {
    return (
        <div className="flex overflow-hidden bg-main w-full h-full">
            <SidebarComponent />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full h-full">
                <main className="flex flex-col pb-8 px-8 w-full h-full"></main>
            </div>
        </div>
    )
}