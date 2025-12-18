"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { projects } from "@/lib/data"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"

export function Projects() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true })

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <section id="projects" className="py-24 sm:py-32 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Featured Projects</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        A selection of projects that showcase my improved skills and passion for building.
                    </p>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 md:px-12">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex touch-pan-y -ml-4">
                            {projects.map((project, index) => (
                                <div className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 py-4" key={index}>
                                    <ProjectCard project={project} index={index} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:flex h-12 w-12 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-background shadow-xl"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Previous project</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:flex h-12 w-12 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-background shadow-xl"
                        onClick={scrollNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                        <span className="sr-only">Next project</span>
                    </Button>
                </div>

                {/* Mobile controls specifically positioned below if needed, or kept hidden/swipeable */}
                <div className="flex justify-center gap-4 mt-8 md:hidden">
                    <Button variant="outline" size="icon" onClick={scrollPrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={scrollNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

            </div>
        </section>
    )
}

function ProjectCard({ project, index }: { project: typeof projects[0], index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="card w-full h-full"
        >
            <div className="card__info-hover">
                <div className="card__clock-info">
                    <svg className="card__clock" viewBox="0 0 24 24">
                        <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" />
                    </svg>
                    <span className="card__time">View Project</span>
                </div>
            </div>
            <div className="card__img" style={{ backgroundImage: `url(${project.image})`, visibility: 'visible' }}></div>
            <Link href={project.links.demo} className="card_link">
                <div className="card__img--hover" style={{ backgroundImage: `url(${project.image})` }}></div>
            </Link>
            <div className="card__info">
                <span className="card__category">{project.tags[0]}</span>
                <h3 className="card__title">{project.title}</h3>
                <span className="card__by">
                    Built with <a href={project.links.github} className="card__author" title="author">{project.tags.slice(1, 3).join(", ")}</a>
                </span>
                <div className="mt-5 flex items-center justify-end gap-5">
                    <Link href={project.links.demo} className="card__author text-sm underline underline-offset-4 uppercase tracking-wider hover:brightness-125 hover:text-white transition-colors">
                        Demo
                    </Link>
                    <Link href={project.links.github} className="card__author text-sm underline underline-offset-4 uppercase tracking-wider hover:brightness-125 hover:text-white transition-colors">
                        Source Code
                    </Link>
                </div>
            </div>
        </motion.article>
    )
}
