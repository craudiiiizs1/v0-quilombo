export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null
  private isInstalled = false
  private swRegistration: ServiceWorkerRegistration | null = null
  private isSecureContext = false
  private _hasServiceWorkerSupport = false

  constructor() {
    if (typeof window !== "undefined") {
      this.init()
    }
  }

  private async init() {
    // Verificar suporte básico
    this.checkSupport()

    // Verificar se estamos em um contexto seguro
    this.checkSecureContext()

    // Verificar se já está instalado
    this.checkIfInstalled()

    // Configurar eventos PWA (funciona em qualquer contexto)
    this.setupPWAEvents()

    // Registrar Service Worker APENAS em contexto seguro
    if (this.isSecureContext && this._hasServiceWorkerSupport) {
      try {
        await this.registerServiceWorker()
        console.log("PWA: Service Worker registrado com sucesso")
      } catch (error) {
        console.error("PWA: Falha ao registrar Service Worker:", error)
        // Não propagar o erro, apenas logar
      }
    } else {
      console.log("PWA: Service Worker não será registrado - contexto inseguro ou não suportado")
    }

    // Verificar atualizações apenas se SW estiver registrado
    if (this.swRegistration) {
      this.checkForUpdates()
    }
  }

  private checkSupport() {
    this._hasServiceWorkerSupport = "serviceWorker" in navigator
    console.log("PWA: Suporte a Service Worker:", this._hasServiceWorkerSupport)
  }

  private checkSecureContext() {
    // Verificar se estamos em contexto seguro
    this.isSecureContext =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local") ||
        window.location.hostname === "0.0.0.0")

    console.log("PWA: Contexto seguro:", this.isSecureContext, "- Protocol:", window.location.protocol)
  }

  private checkIfInstalled() {
    if (typeof window === "undefined") return

    // Verificar se está rodando como PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://")

    this.isInstalled = isStandalone
    console.log("PWA: Status de instalação:", this.isInstalled)
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    // Verificações de segurança ANTES de tentar registrar
    if (!this._hasServiceWorkerSupport) {
      console.log("PWA: Service Worker não suportado pelo navegador")
      return null
    }

    if (!this.isSecureContext) {
      console.warn("PWA: Service Worker requer contexto seguro (HTTPS)")
      return null
    }

    try {
      // Verificar se já existe um registration
      const existingRegistration = await navigator.serviceWorker.getRegistration("/")
      if (existingRegistration) {
        console.log("PWA: Service Worker já registrado")
        this.swRegistration = existingRegistration
        this.setupServiceWorkerEvents(existingRegistration)
        return existingRegistration
      }

      // Registrar novo Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      this.swRegistration = registration
      console.log("PWA: Service Worker registrado com sucesso:", registration.scope)

      // Configurar eventos do Service Worker
      this.setupServiceWorkerEvents(registration)

      return registration
    } catch (error) {
      console.error("PWA: Erro ao registrar Service Worker:", error)

      // Disparar evento de erro para componentes React
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pwa-sw-error", {
            detail: { error: error.message || "Erro desconhecido" },
          }),
        )
      }

      return null
    }
  }

  private setupServiceWorkerEvents(registration: ServiceWorkerRegistration) {
    // Configurar eventos do Service Worker
    registration.addEventListener("updatefound", () => {
      console.log("PWA: Nova versão do Service Worker encontrada")
      this.handleServiceWorkerUpdate(registration)
    })

    // Verificar se há um SW esperando para ser ativado
    if (registration.waiting) {
      console.log("PWA: Service Worker aguardando ativação")
      this.handleServiceWorkerUpdate(registration)
    }

    // Escutar mudanças no estado do Service Worker
    if (registration.installing) {
      this.trackServiceWorkerState(registration.installing)
    }

    if (registration.waiting) {
      this.trackServiceWorkerState(registration.waiting)
    }

    if (registration.active) {
      this.trackServiceWorkerState(registration.active)
    }
  }

  private trackServiceWorkerState(worker: ServiceWorker) {
    worker.addEventListener("statechange", () => {
      console.log("PWA: Service Worker state changed:", worker.state)

      if (worker.state === "activated") {
        console.log("PWA: Service Worker ativado")
      }
    })
  }

  private setupPWAEvents() {
    if (typeof window === "undefined") return

    // Eventos de instalação (apenas em contexto seguro)
    if (this.isSecureContext) {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
        this.installPrompt = e as PWAInstallPrompt
        console.log("PWA: Prompt de instalação capturado")

        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent("pwa-install-available"))
      })

      // Detectar quando foi instalado
      window.addEventListener("appinstalled", () => {
        this.isInstalled = true
        this.installPrompt = null
        console.log("PWA: Aplicativo instalado com sucesso")

        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent("pwa-installed"))
      })
    }

    // Detectar mudanças no status online/offline (funciona em qualquer contexto)
    window.addEventListener("online", () => {
      console.log("PWA: Conexão restaurada")
      window.dispatchEvent(new CustomEvent("pwa-online"))
      this.syncWhenOnline()
    })

    window.addEventListener("offline", () => {
      console.log("PWA: Conexão perdida")
      window.dispatchEvent(new CustomEvent("pwa-offline"))
    })

    // Detectar mudanças no display mode
    window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
      this.isInstalled = e.matches
      console.log("PWA: Display mode changed:", e.matches ? "standalone" : "browser")
    })
  }

  async promptInstall(): Promise<boolean> {
    if (!this.isSecureContext) {
      console.warn("PWA: Instalação requer contexto seguro (HTTPS)")
      return false
    }

    if (!this.installPrompt) {
      console.log("PWA: Prompt de instalação não disponível")
      return false
    }

    try {
      await this.installPrompt.prompt()
      const choiceResult = await this.installPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("PWA: Usuário aceitou a instalação")
        this.installPrompt = null
        return true
      } else {
        console.log("PWA: Usuário rejeitou a instalação")
        return false
      }
    } catch (error) {
      console.error("PWA: Erro ao mostrar prompt de instalação:", error)
      return false
    }
  }

  private handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
    const newWorker = registration.installing
    if (!newWorker) return

    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        console.log("PWA: Nova versão disponível")

        // Disparar evento de atualização disponível
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("pwa-update-available", {
              detail: { registration },
            }),
          )
        }
      }
    })
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      console.warn("PWA: Service Worker não registrado")
      return
    }

    try {
      await this.swRegistration.update()

      // Recarregar página para aplicar atualização
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: "SKIP_WAITING" })

        // Aguardar um pouco antes de recarregar
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error("PWA: Erro ao atualizar Service Worker:", error)
    }
  }

  private async checkForUpdates() {
    if (!this.swRegistration) return

    // Verificar atualizações a cada 30 minutos
    const checkInterval = setInterval(
      async () => {
        try {
          await this.swRegistration!.update()
        } catch (error) {
          console.error("PWA: Erro ao verificar atualizações:", error)
          // Se houver muitos erros, parar de verificar
          clearInterval(checkInterval)
        }
      },
      30 * 60 * 1000,
    )

    // Limpar interval quando a página for fechada
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        clearInterval(checkInterval)
      })
    }
  }

  private async syncWhenOnline() {
    if (!this.swRegistration || !navigator.onLine || !this.isSecureContext) return

    try {
      // Verificar se background sync é suportado
      if ("sync" in this.swRegistration) {
        await this.swRegistration.sync.register("sync-data")
        console.log("PWA: Sincronização em background solicitada")
      } else {
        console.log("PWA: Background sync não suportado")
      }
    } catch (error) {
      console.error("PWA: Erro ao solicitar sincronização:", error)
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("PWA: Notificações não suportadas")
      return "denied"
    }

    if (!this.isSecureContext) {
      console.warn("PWA: Notificações requerem contexto seguro (HTTPS)")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission === "denied") {
      return "denied"
    }

    try {
      const permission = await Notification.requestPermission()
      console.log("PWA: Permissão de notificação:", permission)
      return permission
    } catch (error) {
      console.error("PWA: Erro ao solicitar permissão de notificação:", error)
      return "denied"
    }
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSecureContext) {
      console.warn("PWA: Notificações requerem contexto seguro (HTTPS)")
      return
    }

    if (!this.swRegistration) {
      console.error("PWA: Service Worker não registrado")
      return
    }

    const permission = await this.requestNotificationPermission()
    if (permission !== "granted") {
      console.log("PWA: Permissão de notificação negada")
      return
    }

    const defaultOptions: NotificationOptions = {
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
      ...options,
    }

    try {
      await this.swRegistration.showNotification(title, defaultOptions)
    } catch (error) {
      console.error("PWA: Erro ao mostrar notificação:", error)
    }
  }

  // Método para verificar se PWA está funcionando corretamente
  getStatus() {
    return {
      hasServiceWorkerSupport: this._hasServiceWorkerSupport,
      isSecureContext: this.isSecureContext,
      isServiceWorkerRegistered: !!this.swRegistration,
      isInstalled: this.isInstalled,
      canInstall: this.canInstall,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    }
  }

  // Getters
  get canInstall(): boolean {
    return !!this.installPrompt && !this.isInstalled && this.isSecureContext
  }

  get isAppInstalled(): boolean {
    return this.isInstalled
  }

  get isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true
  }

  get serviceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration
  }

  get isInSecureContext(): boolean {
    return this.isSecureContext
  }

  get hasServiceWorkerSupport(): boolean {
    return this._hasServiceWorkerSupport
  }
  
  set hasServiceWorkerSupport(value: boolean) {
    this._hasServiceWorkerSupport = value
  }
}

// Instância global
export const pwaManager = new PWAManager()
