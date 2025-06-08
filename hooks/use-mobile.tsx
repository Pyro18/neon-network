/**
 * Hook per rilevamento dispositivi mobile
 * 
 * Funzionalità:
 * - Rileva se il dispositivo è mobile basandosi su breakpoint
 * - Listener per cambi di dimensione finestra
 * - Gestione stato durante idratazione SSR
 * - Utilizzato per layout responsive e funzionalità mobile-specific
 * - Breakpoint configurabile (default: 768px)
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook che determina se il dispositivo corrente è mobile
 * @returns boolean - true se la larghezza della finestra è sotto il breakpoint mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
