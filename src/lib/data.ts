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
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
    },
    {
        title: "AI Content Generator",
        description: "SaaS application that uses OpenAI API to generate marketing copy and social media posts.",
        tags: ["React", "Node.js", "OpenAI", "Stripe"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/307008/pexels-photo-307008.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
    },
    {
        title: "Task Management App",
        description: "Collaborative task manager with real-time updates using WebSockets.",
        tags: ["Vue.js", "Firebase", "Pinia"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
        title: "Finance Tracker",
        description: "Personal finance tracking app with data visualization and budget planning features.",
        tags: ["Next.js", "Drizzle", "Chart.js"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
        title: "Health & Fitness App",
        description: "Mobile-first web app for tracking workouts and diet plans with social features.",
        tags: ["React", "PWA", "Supabase"],
        links: { demo: "#", github: "#" },
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1260&q=80"
    },
    {
        title: "Real Estate Platform",
        description: "Property listing platform with map integration and virtual tour capabilities.",
        tags: ["Next.js", "Mapbox", "Prisma"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
        title: "Learning Management",
        description: "Online course platform for creators to host and sell their educational content.",
        tags: ["React", "Express", "MongoDB"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
        title: "Social Media Dashboard",
        description: "Analytics tool aggregating metrics from various social platforms into one view.",
        tags: ["Vue", "D3.js", "AWS"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260"
    },
    {
        title: "Travel Companion",
        description: "Trip planning application with itinerary generation and local recommendations.",
        tags: ["React Native", "Expo", "GraphQL"],
        links: { demo: "#", github: "#" },
        image: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1260"
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

export const educationItems = [
    {
        year: "2024",
        title: "Bachelor of Science in Computer Science",
        subtitle: "University of Technology",
        description: "Graduated with honors. Specialized in Software Engineering and Artificial Intelligence."
    },
    {
        year: "2023",
        title: "Full Stack Development Bootcamp",
        subtitle: "Tech Academy",
        description: "Intensive 12-week program focused on modern web technologies including React, Node.js, and cloud architecture."
    }
];

export const achievementItems = [
    {
        year: "2024",
        title: "Top Contributor",
        subtitle: "Open Source Community",
        description: "Recognized for significant contributions to core web development libraries and mentoring new developers.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
    },
    {
        year: "2023",
        title: "Certified Solutions Architect",
        subtitle: "Amazon Web Services",
        description: "Professional certification demonstrating expertise in designing distributed systems on AWS.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    },
    {
        year: "2022",
        title: "Best Innovation Award",
        subtitle: "Regional Hackathon 2022",
        description: "Won first prize for developing an accessible educational platform using AI for personalized learning.",
        image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=3149&q=80"
    },
    {
        year: "2021",
        title: "Outstanding Research Paper",
        subtitle: "International CS Conference",
        description: "Published a highly cited paper on the applications of NLP in early disease detection.",
        image: "https://images.unsplash.com/photo-1454165833767-1316b34460d9?auto=format&fit=crop&w=800&q=80"
    },
    {
        year: "2020",
        title: "Dean's List",
        subtitle: "University Academic Excellence",
        description: "Maintained a consistent 4.0 GPA across all computer science subjects for three consecutive years.",
        image: "https://images.unsplash.com/photo-1523050335392-93851179ae2c?auto=format&fit=crop&w=800&q=80"
    },
    {
        year: "2019",
        title: "National Coding Challenge Winner",
        subtitle: "Code Masters 2019",
        description: "Ranked 1st among 5,000+ participants in a high-stakes competitive programming event.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
    }
];
