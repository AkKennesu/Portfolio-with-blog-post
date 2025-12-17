import { Home, User, Code, Folder, GraduationCap, BookOpen, Mail } from "lucide-react";

export const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/#about", icon: User },
    { name: "Skills", href: "/#skills", icon: Code },
    { name: "Projects", href: "/#projects", icon: Folder },
    { name: "Education", href: "/#education", icon: GraduationCap },
    { name: "Blog", href: "/#blog", icon: BookOpen },
    { name: "Contact", href: "/#contact", icon: Mail },
];

export const projects = [
    {
        title: "E-Commerce Dashboard",
        description: "A comprehensive dashboard for managing products, orders, and analytics. Built with Next.js and Tremor.",
        tags: ["Next.js", "TypeScript", "Tailwind", "Postgres"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "AI Content Generator",
        description: "SaaS application that uses OpenAI API to generate marketing copy and social media posts.",
        tags: ["React", "Node.js", "OpenAI", "Stripe"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Task Management App",
        description: "Collaborative task manager with real-time updates using WebSockets.",
        tags: ["Vue.js", "Firebase", "Pinia"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Finance Tracker",
        description: "Personal finance tracking app with data visualization and budget planning features.",
        tags: ["Next.js", "Drizzle", "Chart.js"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Health & Fitness App",
        description: "Mobile-first web app for tracking workouts and diet plans with social features.",
        tags: ["React", "PWA", "Supabase"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Real Estate Platform",
        description: "Property listing platform with map integration and virtual tour capabilities.",
        tags: ["Next.js", "Mapbox", "Prisma"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Learning Management",
        description: "Online course platform for creators to host and sell their educational content.",
        tags: ["React", "Express", "MongoDB"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Social Media Dashboard",
        description: "Analytics tool aggregating metrics from various social platforms into one view.",
        tags: ["Vue", "D3.js", "AWS"],
        links: { demo: "#", github: "#" }
    },
    {
        title: "Travel Companion",
        description: "Trip planning application with itinerary generation and local recommendations.",
        tags: ["React Native", "Expo", "GraphQL"],
        links: { demo: "#", github: "#" }
    }
];

export const blogPosts = [
    {
        title: "The Future of Web Development: What to Expect in 2024",
        excerpt: "Exploring the rise of AI-driven coding, server components, and the next generation of frontend frameworks.",
        date: "Dec 15, 2023",
        readTime: "5 min read",
        slug: "future-web-dev-2024",
        category: "Tech Trends"
    },
    {
        title: "Mastering TypeScript: Advanced Patterns for Scalable Apps",
        excerpt: "Deep dive into generics, utility types, and how to build type-safe applications that scale with your team.",
        date: "Nov 28, 2023",
        readTime: "8 min read",
        slug: "mastering-typescript",
        category: "Development"
    },
    {
        title: "Optimizing React Performance: A Practical Guide",
        excerpt: "Practical tips and techniques to reduce re-renders, improve load times, and deliver a buttery smooth UX.",
        date: "Nov 10, 2023",
        readTime: "6 min read",
        slug: "react-performance",
        category: "Performance"
    }
];
