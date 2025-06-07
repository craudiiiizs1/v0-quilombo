"use client"

import { useState, useEffect } from "react"
import { pwaManager } from "@/lib/pwa-manager"

export interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  isInstalling: boolean
  isUpdating: boolean
  isSecureContext: boolean
  hasServiceWorkerSupport: boolean
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: true,
    isUpdateAvailable: false,
    isInstalling: false,
    isUpdating: false,
    isSecureContext: false,
    hasServiceWorkerSupport: false,
  })

  useEffect(() => {
    // Estado inicial
    setState((prev) => ({
      ...prev,
      isInstalled: pwaManager.isAppInstalled,
      canInstall: pwaManager.canInstall,
      isOnline: pwaManager.isOnline,
      isSecureContext: pwaManager.isInSecureContext,
      hasServiceWorkerSupport: pwaManager.hasServiceWorkerSupport,
    }))

    // Event listeners
    const handleInstallAvailable = () => {
      setState((prev) => ({ ...prev, canInstall: true }))
    }

    const handleInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        isInstalling: false,
      }))
    }

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
    }

    const handleUpdateAvailable = () => {
      setState((prev) => ({ ...prev, isUpdateAvailable: true }))
    }

    const handleSWError = () => {
      // Service Worker error - pode afetar funcionalidades
      console.warn("Service Worker error detected")
    }

    // Adicionar listeners
    window.addEventListener("pwa-install-available", handleInstallAvailable)
    window.addEventListener("pwa-installed", handleInstalled)
    window.addEventListener("pwa-online", handleOnline)
    window.addEventListener("pwa-offline", handleOffline)
    window.addEventListener("pwa-update-available", handleUpdateAvailable)
    window.addEventListener("pwa-sw-error", handleSWError)

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallAvailable)
      window.removeEventListener("pwa-installed", handleInstalled)
      window.removeEventListener("pwa-online", handleOnline)
      window.removeEventListener("pwa-offline", handleOffline)
      window.removeEventListener("pwa-update-available", handleUpdateAvailable)
      window.removeEventListener("pwa-sw-error", handleSWError)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    if (!pwaManager.isInSecureContext) {
      console.warn("PWA installation requires secure context (HTTPS)")
      return false
    }

    setState((prev) => ({ ...prev, isInstalling: true }))

    try {
      const success = await pwaManager.promptInstall()
      return success
    } finally {
      setState((prev) => ({ ...prev, isInstalling: false }))
    }
  }

  const update = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isUpdating: true }))

    try {
      await pwaManager.updateServiceWorker()
      setState((prev) => ({ ...prev, isUpdateAvailable: false }))
    } finally {
      setState((prev) => ({ ...prev, isUpdating: false }))
    }
  }

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    return pwaManager.requestNotificationPermission()
  }

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    return pwaManager.showNotification(title, options)
  }

  return {
    ...state,
    install,
    update,
    requestNotificationPermission,
    showNotification,
  }
}
