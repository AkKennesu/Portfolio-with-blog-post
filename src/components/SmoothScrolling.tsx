"use client"

import { ReactLenis } from "lenis/react"
import { usePathname } from "next/navigation"

export function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    if (pathname?.startsWith("/admin")) {
        return <>{children}</>
    }

    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        }}>
            {children}
        </ReactLenis>
    )
}
