import { getSettings } from "@/actions/settings"
import ProfileTransition from "./ProfileTransition"
import AboutContent from "./AboutContent"

export async function About() {
    const settings = await getSettings()

    return (
        <section id="about" className="py-24 sm:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center max-w-4xl mx-auto">
                    <AboutContent
                        initial={{ opacity: 0, x: -50 }}
                        delay={0}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted max-w-sm mx-auto w-full"
                    >
                        <ProfileTransition
                            image1="/profile.png"
                            image2="/profile-hover.png"
                            width={600}
                            height={600}
                        />
                    </AboutContent>

                    <AboutContent
                        initial={{ opacity: 0, x: 50 }}
                        delay={0.2}
                        className="flex flex-col gap-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About Me</h2>
                        <p className="text-muted-foreground text-lg">
                            {settings.about_me_1}
                        </p>
                        <p className="text-muted-foreground text-lg">
                            {settings.about_me_2}
                        </p>
                    </AboutContent>
                </div>
            </div>
        </section>
    )
}
