"use client"

import React from "react"
import { cn } from "@/lib/utils"
// import styles from "./bubble.module.css" // We will implement styles directly with Tailwind

interface BubbleTextProps {
    text: string;
    className?: string;
}

const BubbleText = ({ text, className }: BubbleTextProps) => {
    return (
        <h2 className={cn("text-center font-thin", className)}>
            {text.split("").map((child, idx) => (
                <span
                    className="hoverText inline-block cursor-default hover:text-primary transition-colors duration-300"
                    key={idx}
                >
                    {child === " " ? "\u00A0" : child}
                </span>
            ))}
        </h2 >
    );
};

export default BubbleText;
