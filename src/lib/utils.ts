import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function scrollToSection(e: React.MouseEvent<HTMLElement>, href: string) {
    // Only intercept anchor links on the current page
    if (href.startsWith("/#") || href === "/") {
        if (window.location.pathname === "/") {
            e.preventDefault()
            const targetId = href === "/" ? "hero" : href.replace("/#", "")
            const targetElement = document.getElementById(targetId)
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" })
                // Update URL hash without abrupt jump
                window.history.pushState(null, "", href)
            } else if (href === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" })
                window.history.pushState(null, "", "/")
            }
        }
    }
}

