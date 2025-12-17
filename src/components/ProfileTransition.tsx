"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import gsap from "gsap"

// --- Shaders ---
// Based on the CodePen Slide effect (Cubic Bezier transition)
const vertexShader = `
uniform float uTime;
uniform float uDuration;

attribute float aDelay;
attribute float aDuration;
attribute vec3 aControl0;
attribute vec3 aControl1;
attribute vec3 aStartPosition;
attribute vec3 aEndPosition;

varying vec2 vUv;
varying float vProgress;

vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    float oneMinusT = 1.0 - t;
    return oneMinusT * oneMinusT * oneMinusT * p0 +
           3.0 * oneMinusT * oneMinusT * t * p1 +
           3.0 * oneMinusT * t * t * p2 +
           t * t * t * p3;
}

float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
    vUv = uv;

    float tDelay = aDelay;
    float tDuration = aDuration;
    float tTime = clamp(uTime - tDelay, 0.0, tDuration);
    float tProgress = tTime / tDuration;
    
    tProgress = easeInOutCubic(tProgress);
    vProgress = tProgress;

    vec3 transformed = cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uOpacity;

varying vec2 vUv;
varying float vProgress;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    if (color.a < 0.1) discard;
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
}
`

interface ProfileTransitionProps {
    image1: string
    image2: string
    width?: number
    height?: number
}

export default function ProfileTransition({ image1, image2, width = 600, height = 600 }: ProfileTransitionProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [debugMsg, setDebugMsg] = useState<string>("Initializing...")

    useEffect(() => {
        if (!containerRef.current) return

        let frameId: number
        let renderer: THREE.WebGLRenderer

        try {
            // Setup
            const scene = new THREE.Scene()

            const camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 5000)
            const fov = 80;
            const dist = height / (2 * Math.tan((fov * Math.PI) / 360))
            camera.position.z = dist

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.domElement.style.width = '100%'
            renderer.domElement.style.height = '100%'
            containerRef.current.appendChild(renderer.domElement)

            // Textures
            const textureLoader = new THREE.TextureLoader()
            const tex1 = textureLoader.load(image1)
            const tex2 = textureLoader.load(image2)
            tex1.magFilter = THREE.LinearFilter
            tex2.magFilter = THREE.LinearFilter

            // Geometry Generation
            const SEGMENTS_X = 60
            const SEGMENTS_Y = 60

            const createSlideGeometry = (isEntry: boolean) => {
                const geometry = new THREE.PlaneGeometry(width, height, SEGMENTS_X, SEGMENTS_Y)
                const bufferGeometry = geometry.toNonIndexed()

                const count = bufferGeometry.attributes.position.count

                const aDelay = new Float32Array(count)
                const aDuration = new Float32Array(count)
                const aControl0 = new Float32Array(count * 3)
                const aControl1 = new Float32Array(count * 3)
                const aStartPosition = new Float32Array(count * 3)
                const aEndPosition = new Float32Array(count * 3)

                const positions = bufferGeometry.attributes.position.array as Float32Array

                const minDuration = 0.8
                const maxDuration = 1.2
                const maxDelayX = 0.9
                const maxDelayY = 0.125
                const stretch = 0.11

                for (let i = 0; i < count; i += 3) {
                    const c = new THREE.Vector3()
                    for (let j = 0; j < 3; j++) {
                        c.x += positions[(i + j) * 3]
                        c.y += positions[(i + j) * 3 + 1]
                        c.z += positions[(i + j) * 3 + 2]
                    }
                    c.divideScalar(3)

                    const xNorm = (c.x + width / 2) / width

                    let delayX, delayY
                    if (isEntry) {
                        delayX = (1.0 - xNorm) * maxDelayX
                    } else {
                        delayX = xNorm * maxDelayX
                    }
                    const yCenterNorm = (c.y / (height / 2))
                    delayY = (1.0 - Math.abs(yCenterNorm)) * maxDelayY

                    const duration = THREE.MathUtils.randFloat(minDuration, maxDuration)
                    const delay = delayX + delayY + Math.random() * stretch * duration

                    for (let j = 0; j < 3; j++) {
                        const idx = i + j
                        const px = positions[idx * 3]
                        const py = positions[idx * 3 + 1]
                        const pz = positions[idx * 3 + 2]

                        aDelay[idx] = delay
                        aDuration[idx] = duration

                        const pVertex = new THREE.Vector3(px, py, pz)
                        const pOffset = pVertex.clone()

                        if (isEntry) {
                            pOffset.sub(new THREE.Vector3(0, height, 0))
                        } else {
                            pOffset.add(new THREE.Vector3(0, height, 0))
                        }

                        if (isEntry) {
                            aStartPosition[idx * 3] = pOffset.x; aStartPosition[idx * 3 + 1] = pOffset.y; aStartPosition[idx * 3 + 2] = pOffset.z
                            aEndPosition[idx * 3] = pVertex.x; aEndPosition[idx * 3 + 1] = pVertex.y; aEndPosition[idx * 3 + 2] = pVertex.z
                        } else {
                            aStartPosition[idx * 3] = pVertex.x; aStartPosition[idx * 3 + 1] = pVertex.y; aStartPosition[idx * 3 + 2] = pVertex.z
                            aEndPosition[idx * 3] = pOffset.x; aEndPosition[idx * 3 + 1] = pOffset.y; aEndPosition[idx * 3 + 2] = pOffset.z
                        }

                        const c0 = c.clone()
                        const c1 = c.clone()
                        if (isEntry) {
                            c0.sub(new THREE.Vector3(0, height, 0))
                        } else {
                            c0.add(new THREE.Vector3(0, height, 0))
                        }

                        aControl0[idx * 3] = c0.x; aControl0[idx * 3 + 1] = c0.y; aControl0[idx * 3 + 2] = c0.z
                        aControl1[idx * 3] = c1.x; aControl1[idx * 3 + 1] = c1.y; aControl1[idx * 3 + 2] = c1.z
                    }
                }

                bufferGeometry.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1))
                bufferGeometry.setAttribute('aDuration', new THREE.BufferAttribute(aDuration, 1))
                bufferGeometry.setAttribute('aControl0', new THREE.BufferAttribute(aControl0, 3))
                bufferGeometry.setAttribute('aControl1', new THREE.BufferAttribute(aControl1, 3))
                bufferGeometry.setAttribute('aStartPosition', new THREE.BufferAttribute(aStartPosition, 3))
                bufferGeometry.setAttribute('aEndPosition', new THREE.BufferAttribute(aEndPosition, 3))

                return bufferGeometry
            }

            const geo1 = createSlideGeometry(false) // OUT
            const geo2 = createSlideGeometry(true) // IN

            const mat1 = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: tex1 },
                    uOpacity: { value: 1.0 }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide
            })

            const mat2 = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: tex2 },
                    uOpacity: { value: 1.0 }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.DoubleSide
            })

            const mesh1 = new THREE.Mesh(geo1, mat1)
            const mesh2 = new THREE.Mesh(geo2, mat2)

            scene.add(mesh1)
            scene.add(mesh2)

            // GSAP
            const timelineData = {
                tl: gsap.timeline({
                    paused: true,
                    repeat: -1,
                    yoyo: true,
                    repeatDelay: 10
                }),
            }

            const totalDuration = 1.2 + 0.9 + 0.125 + 0.11

            timelineData.tl.to(mat1.uniforms.uTime, {
                value: totalDuration,
                duration: 2.0,
                ease: "power2.inOut"
            }, 0)
                .to(mat2.uniforms.uTime, {
                    value: totalDuration,
                    duration: 2.0,
                    ease: "power2.inOut"
                }, 0)

            // Interaction: Start loop on first hover
            const el = containerRef.current
            const onEnter = () => {
                if (timelineData.tl.paused()) {
                    timelineData.tl.play()
                }
            }

            el.addEventListener('mouseenter', onEnter)
            // No mouseleave listener -> Loop continues

            setDebugMsg("Slide Effect Ready (Auto-Loop)")

            const animate = () => {
                frameId = requestAnimationFrame(animate)
                renderer.render(scene, camera)
            }
            animate()

            return () => {
                cancelAnimationFrame(frameId)
                el.removeEventListener('mouseenter', onEnter)
                renderer.dispose()
                geo1.dispose()
                geo2.dispose()
                mat1.dispose()
                mat2.dispose()
                if (containerRef.current) containerRef.current.innerHTML = ''
            }

        } catch (e) {
            console.error(e)
            setDebugMsg("Error: " + String(e))
        }

    }, [image1, image2, width, height])

    return (
        <div ref={containerRef} className="w-full h-full cursor-pointer relative" />
    )
}
