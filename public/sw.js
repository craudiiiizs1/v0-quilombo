const CACHE_NAME = "quilombo-app-v1.0.1"
const STATIC_CACHE = "quilombo-static-v1"
const DYNAMIC_CACHE = "quilombo-dynamic-v1"
const API_CACHE = "quilombo-api-v1"

// Recursos para cache inicial
const STATIC_ASSETS = ["/", "/manifest.json", "/offline.html", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// URLs da API que devem ser cacheadas
const API_URLS = [
  "/api/municipios",
  "/api/reunioes",
  "/api/tutores",
  "/api/supervisores",
  "/api/cursistas",
  "/api/formadores",
]

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando versão", CACHE_NAME)

  event.waitUntil(
    Promise.all([
      // Cache recursos estáticos
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Service Worker: Cacheando recursos estáticos")
          return cache.addAll(STATIC_ASSETS).catch((error) => {
            console.error("Service Worker: Erro ao cachear recursos estáticos:", error)
            // Não falhar a instalação por causa de recursos que não existem
            return Promise.resolve()
          })
        }),
      // Força a ativação imediata
      self.skipWaiting(),
    ]),
  )
})

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Ativando versão", CACHE_NAME)

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== CACHE_NAME
              ) {
                console.log("Service Worker: Removendo cache antigo:", cacheName)
                return caches.delete(cacheName)
              }
            }),
          )
        }),
      // Assumir controle de todas as páginas
      self.clients.claim(),
    ]),
  )
})

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith("http")) {
    return
  }

  // Ignorar requisições para outros domínios (exceto APIs conhecidas)
  if (url.origin !== self.location.origin && !isKnownAPI(url)) {
    return
  }

  // Estratégia para diferentes tipos de recursos
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request))
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE))
  }
})

// Sincronização em background
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Evento de sincronização:", event.tag)

  if (event.tag === "sync-data") {
    event.waitUntil(syncPendingData())
  }
})

// Notificações push
self.addEventListener("push", (event) => {
  console.log("Service Worker: Notificação push recebida")

  const options = {
    body: event.data ? event.data.text() : "Nova atualização disponível",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Abrir App",
        icon: "/icons/icon-96x96.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/icons/icon-96x96.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Quilombo Admin", options))
})

// Clique em notificação
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Clique em notificação")

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus()
          }
        }
        // Senão, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  }
})

// Mensagens do cliente
self.addEventListener("message", (event) => {
  console.log("Service Worker: Mensagem recebida:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Estratégias de cache

// Cache First - para recursos estáticos
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    // Só cachear se a resposta for válida
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("Cache First falhou:", error)

    // Tentar cache como fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    return new Response("Recurso não disponível offline", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Network First - para dados da API
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Só cachear respostas válidas
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("Network First: Tentando cache para:", request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Retornar dados offline padrão se disponível
    return getOfflineData(request)
  }
}

// Stale While Revalidate - para recursos dinâmicos
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

// Estratégia para navegação
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Tentar página principal em cache
    const cachedResponse = await caches.match("/")
    if (cachedResponse) {
      return cachedResponse
    }

    // Página offline como último recurso
    const offlinePage = await caches.match("/offline.html")
    if (offlinePage) {
      return offlinePage
    }

    return new Response("Página não disponível offline", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Funções auxiliares
function isStaticAsset(request) {
  return (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.url.includes("/icons/") ||
    request.url.includes("/manifest.json") ||
    request.url.includes("/_next/static/")
  )
}

function isAPIRequest(request) {
  return (
    request.url.includes("/api/") ||
    request.url.includes("supabase.co") ||
    API_URLS.some((url) => request.url.includes(url))
  )
}

function isNavigationRequest(request) {
  return request.mode === "navigate"
}

function isKnownAPI(url) {
  return (
    url.hostname.includes("supabase.co") || url.hostname.includes("vercel.app") || url.hostname.includes("localhost")
  )
}

async function getOfflineData(request) {
  // Retornar dados padrão para diferentes endpoints
  const url = new URL(request.url)

  if (url.pathname.includes("municipios")) {
    return new Response(JSON.stringify([{ id: 1, nome: "Dados Offline", estado: "BA" }]), {
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify([]), {
    headers: { "Content-Type": "application/json" },
  })
}

async function syncPendingData() {
  console.log("Service Worker: Sincronizando dados pendentes...")

  try {
    // Simular sincronização
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Service Worker: Sincronização concluída")
  } catch (error) {
    console.error("Service Worker: Erro na sincronização:", error)
    throw error
  }
}
