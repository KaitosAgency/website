"use client"

import { ToastProvider, useToast } from "./toast"
import { useEffect } from "react"

function ToastListener() {
  const { addToast } = useToast()

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail
      addToast(message, type, duration)
    }

    window.addEventListener("toast" as any, handleToast as EventListener)
    return () => {
      window.removeEventListener("toast" as any, handleToast as EventListener)
    }
  }, [addToast])

  return null
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  return (
    <ToastProvider>
      <ToastListener />
      {children}
    </ToastProvider>
  )
}

