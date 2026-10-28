"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Returns a debounced version of the input value that only updates after the specified delay.
 * Useful for debouncing search input queries, filter queries, or expensive computations.
 *
 * @param value The value to debounce (e.g. search query or text input)
 * @param delay Milliseconds to delay updating the value (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Returns a memoized callback that delays invoking callback until after delay milliseconds have elapsed
 * since the last time the debounced function was invoked.
 *
 * @param callback The function to debounce
 * @param delay Milliseconds to delay execution (default: 300ms)
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            timerRef.current = setTimeout(() => {
                callbackRef.current(...args)
            }, delay)
        },
        [delay]
    )
}
