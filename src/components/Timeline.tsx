"use client"

import { motion, AnimatePresence } from "framer-motion"
import { educationItems, achievementItems } from "@/lib/data"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Timeline() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <section id="education" className="py-24 sm:py-32 bg-muted/50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                {/* Education Section */}
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Education Attainment</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        My academic journey and professional milestones.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto mb-24">
                    {educationItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-8 pb-12 last:pb-0 border-l border-border"
                        >
                            <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-1">
                                <span className="text-sm font-bold text-primary">{item.year}</span>
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">{item.subtitle}</p>
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Certificates Section */}
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">My Certificates</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        Professional certifications and notable achievement milestones.
                    </p>
                </div>
                <AchievementCarousel onImageClick={setSelectedImage} />
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[110]"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            alt="Certificate Full View"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

function AchievementCarousel({ onImageClick }: { onImageClick: (img: string) => void }) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { align: "start", loop: true },
        [Autoplay({ delay: 5000, stopOnInteraction: false })]
    )

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="relative group max-w-7xl mx-auto px-4 md:px-12">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-4">
                    {achievementItems.map((item, index) => (
                        <div className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 py-4" key={index}>
                            <AchievementCard item={item} onClick={() => onImageClick(item.image)} />
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
                <span className="sr-only">Previous certificate</span>
            </Button>

            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:flex h-12 w-12 rounded-full border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-background shadow-xl"
                onClick={scrollNext}
            >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next certificate</span>
            </Button>

            {/* Mobile controls */}
            <div className="flex justify-center gap-4 mt-8 md:hidden">
                <Button variant="outline" size="icon" onClick={scrollPrev}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={scrollNext}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function AchievementCard({ item, onClick }: { item: typeof achievementItems[0], onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            onClick={onClick}
            className="group relative m-0 flex h-72 w-full max-w-[400px] rounded-xl shadow-xl ring-gray-900/5 sm:mx-auto cursor-zoom-in"
        >
            <div className="z-10 h-full w-full overflow-hidden rounded-xl border border-gray-200 opacity-80 transition duration-300 ease-in-out group-hover:opacity-100 dark:border-gray-700 dark:opacity-70">
                <img
                    src={item.image}
                    className="block h-full w-full scale-100 transform object-cover object-center opacity-100 transition duration-300 group-hover:scale-110"
                    alt={item.title}
                />
            </div>
            <div className="absolute bottom-0 z-20 m-0 pb-6 ps-6 transition duration-300 ease-in-out group-hover:-translate-y-1 group-hover:translate-x-3 group-hover:scale-110">
                <h1 className="text-2xl font-bold text-white shadow-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{item.title}</h1>
                <h1 className="text-sm font-medium text-gray-200 shadow-xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{item.subtitle}</h1>
                <p className="text-xs text-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[250px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {item.description}
                </p>
            </div>
        </motion.div>
    )
}

function TimelineSection({
    id,
    title,
    description,
    items,
    className
}: {
    id: string,
    title: string,
    description: string,
    items: typeof educationItems,
    className?: string
}) {
    return (
        <div id={id} className={`max-w-7xl mx-auto ${className || ""}`}>
            <div className="flex flex-col items-center text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">{title}</h2>
                <p className="text-muted-foreground max-w-[800px]">
                    {description}
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="relative pl-8 pb-12 last:pb-0 border-l border-border"
                    >
                        <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-1">
                            <span className="text-sm font-bold text-primary">{item.year}</span>
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">{item.subtitle}</p>
                        <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
