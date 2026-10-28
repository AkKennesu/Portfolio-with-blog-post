"use client"

import { useEffect, useRef, memo } from "react"
import { usePathname } from "next/navigation"
import * as THREE from "three"

// Helper to reliably parse any CSS color format (hex, rgb, hsl, oklch) into a THREE.Color
function getResolvedColor(cssVar: string, fallback: string = "#3b82f6"): THREE.Color {
    try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
        if (!raw) return new THREE.Color(fallback)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.fillStyle = raw
            return new THREE.Color(ctx.fillStyle)
        }
        return new THREE.Color(raw)
    } catch {
        return new THREE.Color(fallback)
    }
}

// Procedurally create a soft luminous star sprite texture
function createStarTexture(): THREE.Texture {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext("2d")!

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
    gradient.addColorStop(0.18, "rgba(255, 255, 255, 0.9)")
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.25)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export const SpotlightBackground = memo(function SpotlightBackground() {
    const pathname = usePathname()
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (pathname?.startsWith("/admin")) return
        const container = containerRef.current
        if (!container) return

        let animationFrameId: number
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        )
        camera.position.z = 400

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        container.appendChild(renderer.domElement)

        // Texture
        const starTexture = createStarTexture()

        // Color setup
        const primaryColor = getResolvedColor("--primary", "#3b82f6")
        const coreColor = new THREE.Color("#ffffff")
        const deepSpaceColor = new THREE.Color("#60a5fa")

        // Main celestial rotating universe group
        const galaxyGroup = new THREE.Group()
        // Tilt the galactic disk slightly for cinematic 3D perspective
        galaxyGroup.rotation.x = 0.55
        galaxyGroup.rotation.z = -0.25
        scene.add(galaxyGroup)

        // 2. Spiral Galaxy Particles
        const GALAXY_COUNT = 3200
        const GALAXY_ARMS = 3
        const GALAXY_RADIUS = 500
        const GALAXY_SPIN = 0.85

        const galaxyGeometry = new THREE.BufferGeometry()
        const galaxyPositions = new Float32Array(GALAXY_COUNT * 3)
        const galaxyColors = new Float32Array(GALAXY_COUNT * 3)
        const galaxySizes = new Float32Array(GALAXY_COUNT)

        for (let i = 0; i < GALAXY_COUNT; i++) {
            const i3 = i * 3
            // Non-linear radius distribution (denser core)
            const r = Math.pow(Math.random(), 2.2) * GALAXY_RADIUS
            const armIndex = i % GALAXY_ARMS
            const armAngle = (armIndex * 2 * Math.PI) / GALAXY_ARMS
            const spinAngle = r * (GALAXY_SPIN / GALAXY_RADIUS) * Math.PI * 2

            // Natural 3D cloud dispersion
            const randomSpread = Math.pow(Math.random(), 3) * (GALAXY_RADIUS * 0.15)
            const randomX = (Math.random() - 0.5) * randomSpread * (r / GALAXY_RADIUS + 0.3)
            const randomY = (Math.random() - 0.5) * (randomSpread * 0.45) * (1 - r / GALAXY_RADIUS + 0.2)
            const randomZ = (Math.random() - 0.5) * randomSpread * (r / GALAXY_RADIUS + 0.3)

            const totalAngle = armAngle + spinAngle
            galaxyPositions[i3] = Math.cos(totalAngle) * r + randomX
            galaxyPositions[i3 + 1] = randomY
            galaxyPositions[i3 + 2] = Math.sin(totalAngle) * r + randomZ

            // Color gradient from core to arm tips
            const mixRatio = Math.min(r / GALAXY_RADIUS, 1)
            const vertexColor = coreColor.clone().lerp(primaryColor, mixRatio * 0.75).lerp(deepSpaceColor, mixRatio * 0.25)

            galaxyColors[i3] = vertexColor.r
            galaxyColors[i3 + 1] = vertexColor.g
            galaxyColors[i3 + 2] = vertexColor.b

            // Size: core stars are slightly larger; outer dust is delicate
            galaxySizes[i] = (Math.random() * 3.5 + 1.2) * (1 - mixRatio * 0.35)
        }

        galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(galaxyPositions, 3))
        galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(galaxyColors, 3))

        const galaxyMaterial = new THREE.PointsMaterial({
            size: 3.5,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            map: starTexture,
            transparent: true,
            opacity: 0.75,
        })

        const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial)
        galaxyGroup.add(galaxyPoints)

        // 3. Constellation Layer (Foreground major stars + connective links)
        const CONSTELLATION_COUNT = 65
        const CONSTELLATION_SPREAD = 520
        const constellationPositions: THREE.Vector3[] = []
        const constellationGeometry = new THREE.BufferGeometry()
        const constellationPosArray = new Float32Array(CONSTELLATION_COUNT * 3)

        for (let i = 0; i < CONSTELLATION_COUNT; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * CONSTELLATION_SPREAD * 1.8,
                (Math.random() - 0.5) * CONSTELLATION_SPREAD * 1.2,
                (Math.random() - 0.5) * 120
            )
            constellationPositions.push(pos)
            constellationPosArray[i * 3] = pos.x
            constellationPosArray[i * 3 + 1] = pos.y
            constellationPosArray[i * 3 + 2] = pos.z
        }

        constellationGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(constellationPosArray, 3)
        )

        const constellationMaterial = new THREE.PointsMaterial({
            size: 6.5,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: primaryColor,
            map: starTexture,
            transparent: true,
            opacity: 0.85,
        })

        const constellationPoints = new THREE.Points(constellationGeometry, constellationMaterial)
        galaxyGroup.add(constellationPoints)

        // Precompute constellation connective lines between neighboring stars
        const maxLinkDist = 130
        const linePositions: number[] = []

        for (let i = 0; i < CONSTELLATION_COUNT; i++) {
            for (let j = i + 1; j < CONSTELLATION_COUNT; j++) {
                const dist = constellationPositions[i].distanceTo(constellationPositions[j])
                if (dist < maxLinkDist && Math.random() > 0.35) {
                    linePositions.push(
                        constellationPositions[i].x,
                        constellationPositions[i].y,
                        constellationPositions[i].z,
                        constellationPositions[j].x,
                        constellationPositions[j].y,
                        constellationPositions[j].z
                    )
                }
            }
        }

        const linesGeometry = new THREE.BufferGeometry()
        linesGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(linePositions, 3)
        )

        const linesMaterial = new THREE.LineBasicMaterial({
            color: primaryColor,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })

        const constellationLines = new THREE.LineSegments(linesGeometry, linesMaterial)
        galaxyGroup.add(constellationLines)

        // 4. Subtle Meteor / Shooting Star Simulation
        const meteorGeo = new THREE.BufferGeometry()
        const meteorPos = new Float32Array([0, 0, 0, -25, -20, 0])
        meteorGeo.setAttribute("position", new THREE.BufferAttribute(meteorPos, 3))
        const meteorMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
        })
        const meteor = new THREE.Line(meteorGeo, meteorMat)
        scene.add(meteor)

        let meteorActive = false
        let meteorProgress = 0
        const meteorStart = new THREE.Vector3()
        const meteorVelocity = new THREE.Vector3()

        const triggerMeteor = () => {
            if (meteorActive) return
            meteorActive = true
            meteorProgress = 0
            meteorStart.set(
                (Math.random() - 0.5) * 600,
                Math.random() * 200 + 150,
                Math.random() * 100 - 50
            )
            meteorVelocity.set(
                -(Math.random() * 8 + 12),
                -(Math.random() * 6 + 10),
                0
            )
        }

        // Trigger meteor occasionally
        const meteorInterval = setInterval(() => {
            if (Math.random() > 0.4) triggerMeteor()
        }, 8000)

        // 5. Interactive Motion & State Tracking
        // Normalized coordinates [-1, 1]
        let targetNormX = 0
        let targetNormY = 0
        let currentNormX = 0
        let currentNormY = 0

        // Scroll state
        let targetScrollRotation = 0
        let currentScrollRotation = 0

        const handleMouseMove = (e: MouseEvent) => {
            targetNormX = (e.clientX / window.innerWidth) * 2 - 1
            targetNormY = -(e.clientY / window.innerHeight) * 2 + 1
        }

        const handleScroll = () => {
            const scrollY = window.scrollY
            // Full 360 degree slow graceful rotation across the full page height
            targetScrollRotation = scrollY * 0.0016
        }

        window.addEventListener("mousemove", handleMouseMove, { passive: true })
        window.addEventListener("scroll", handleScroll, { passive: true })

        // Initial scroll calculation
        handleScroll()

        const handleResize = () => {
            const w = window.innerWidth
            const h = window.innerHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        }
        window.addEventListener("resize", handleResize, { passive: true })

        // 6. Theme Observer to refresh brand color dynamically
        const themeObserver = new MutationObserver(() => {
            const updatedPrimary = getResolvedColor("--primary", "#3b82f6")
            constellationMaterial.color.copy(updatedPrimary)
            linesMaterial.color.copy(updatedPrimary)
        })
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"],
        })

        // 7. Render Loop
        const baseTiltX = 0.55
        const baseTiltZ = -0.25
        let baseSpin = 0

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)

            // Smooth interpolation for mouse axis
            currentNormX += (targetNormX - currentNormX) * 0.05
            currentNormY += (targetNormY - currentNormY) * 0.05

            // Smooth interpolation for scroll rotation
            currentScrollRotation += (targetScrollRotation - currentScrollRotation) * 0.06

            if (!prefersReducedMotion) {
                // Gentle infinite cosmic drift
                baseSpin += 0.0007

                // Combine base rotation + scroll rotation on Y
                galaxyGroup.rotation.y = baseSpin + currentScrollRotation

                // Follow mouse axis: tilt X and Z dynamically with pitch and yaw
                const mousePitch = -currentNormY * 0.35
                const mouseRoll = currentNormX * 0.35

                galaxyGroup.rotation.x = baseTiltX + mousePitch
                galaxyGroup.rotation.z = baseTiltZ + mouseRoll

                // Camera subtle parallax tracking
                camera.position.x += (currentNormX * 35 - camera.position.x) * 0.04
                camera.position.y += (currentNormY * 25 - camera.position.y) * 0.04
                camera.lookAt(0, 0, 0)

                // Hover interaction: boost constellation line glow based on mouse activity
                const mouseActivity = Math.abs(currentNormX) + Math.abs(currentNormY)
                linesMaterial.opacity = 0.12 + Math.min(mouseActivity * 0.15, 0.25)
            }

            // Meteor animation
            if (meteorActive) {
                meteorProgress += 0.035
                meteor.position.copy(meteorStart).addScaledVector(meteorVelocity, meteorProgress * 30)
                meteorMat.opacity = Math.sin(meteorProgress * Math.PI) * 0.8
                if (meteorProgress >= 1) {
                    meteorActive = false
                    meteorMat.opacity = 0
                }
            }

            renderer.render(scene, camera)
        }

        animate()

        // Tab visibility management to save GPU
        const handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId)
            } else {
                animationFrameId = requestAnimationFrame(animate)
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId)
            clearInterval(meteorInterval)
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", handleResize)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            themeObserver.disconnect()

            renderer.dispose()
            starTexture.dispose()
            galaxyGeometry.dispose()
            galaxyMaterial.dispose()
            constellationGeometry.dispose()
            constellationMaterial.dispose()
            linesGeometry.dispose()
            linesMaterial.dispose()
            meteorGeo.dispose()
            meteorMat.dispose()

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement)
            }
        }
    }, [pathname])

    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-background pointer-events-none select-none"
        />
    )
})
