export interface DBSchema {
  reunioes: {
    key: number
    value: any
  }
  tutores: {
    key: number
    value: any
  }
  supervisores: {
    key: number
    value: any
  }
  cursistas: {
    key: number
    value: any
  }
  formadores: {
    key: number
    value: any
  }
  anotacoes: {
    key: number
    value: any
    indexes: {
      entityId: number
      entityType: string
    }
  }
  syncQueue: {
    key: number
    value: {
      id?: number
      operation: "create" | "update" | "delete"
      entity: string
      entityId: number
      data: any
      timestamp: string
      attempts: number
      lastError?: string
    }
  }
  settings: {
    key: string
    value: any
  }
}

export class IndexedDBManager {
  private dbName: string
  private version: number
  private db: IDBDatabase | null = null

  constructor(dbName = "quilombo-app-db", version = 2) {
    this.dbName = dbName
    this.version = version
  }

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("Erro ao abrir IndexedDB:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log("IndexedDB conectado com sucesso")
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = request.result
        console.log("Atualizando esquema do IndexedDB...")

        // Criar stores para entidades principais
        this.createStoreIfNotExists(db, "reunioes", { keyPath: "id" })
        this.createStoreIfNotExists(db, "tutores", { keyPath: "id" })
        this.createStoreIfNotExists(db, "supervisores", { keyPath: "id" })
        this.createStoreIfNotExists(db, "cursistas", { keyPath: "id" })
        this.createStoreIfNotExists(db, "formadores", { keyPath: "id" })

        // Store para anotações com índices
        if (!db.objectStoreNames.contains("anotacoes")) {
          const anotacoesStore = db.createObjectStore("anotacoes", { keyPath: "id" })
          anotacoesStore.createIndex("entityId", "entityId", { unique: false })
          anotacoesStore.createIndex("entityType", "entityType", { unique: false })
          anotacoesStore.createIndex("entityComposite", ["entityType", "entityId"], { unique: false })
        }

        // Store para fila de sincronização
        this.createStoreIfNotExists(db, "syncQueue", { keyPath: "id", autoIncrement: true })

        // Store para configurações
        this.createStoreIfNotExists(db, "settings", { keyPath: "key" })
      }
    })
  }

  private createStoreIfNotExists(db: IDBDatabase, storeName: string, options: IDBObjectStoreParameters) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, options)
      console.log(`Store '${storeName}' criado`)
    }
  }

  async getAll<T>(storeName: keyof DBSchema): Promise<T[]> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readonly")
      const store = transaction.objectStore(storeName as string)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async get<T>(storeName: keyof DBSchema, id: number | string): Promise<T | undefined> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readonly")
      const store = transaction.objectStore(storeName as string)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async add<T>(storeName: keyof DBSchema, data: T): Promise<any> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readwrite")
      const store = transaction.objectStore(storeName as string)
      const request = store.add(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async put<T>(storeName: keyof DBSchema, data: T): Promise<any> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readwrite")
      const store = transaction.objectStore(storeName as string)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async delete(storeName: keyof DBSchema, id: number | string): Promise<void> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readwrite")
      const store = transaction.objectStore(storeName as string)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getByIndex<T>(storeName: keyof DBSchema, indexName: string, value: any): Promise<T[]> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readonly")
      const store = transaction.objectStore(storeName as string)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clear(storeName: keyof DBSchema): Promise<void> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readwrite")
      const store = transaction.objectStore(storeName as string)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async count(storeName: keyof DBSchema): Promise<number> {
    const db = await this.connect()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName as string, "readonly")
      const store = transaction.objectStore(storeName as string)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  // Métodos específicos para sincronização
  async addToSyncQueue(
    operation: "create" | "update" | "delete",
    entity: string,
    entityId: number,
    data: any,
  ): Promise<number> {
    const queueItem = {
      operation,
      entity,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0,
    }

    return this.add("syncQueue", queueItem)
  }

  async getSyncQueue(): Promise<DBSchema["syncQueue"]["value"][]> {
    return this.getAll("syncQueue")
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    return this.delete("syncQueue", id)
  }

  async updateSyncQueueItem(id: number, updates: Partial<DBSchema["syncQueue"]["value"]>): Promise<void> {
    const item = await this.get("syncQueue", id)
    if (item) {
      const updatedItem = { ...item, ...updates }
      await this.put("syncQueue", updatedItem)
    }
  }

  // Métodos para configurações
  async getSetting(key: string): Promise<any> {
    const setting = await this.get("settings", key)
    return setting?.value
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.put("settings", { key, value })
  }

  async getAnotacoesByEntity(entityType: string, entityId: number): Promise<any[]> {
    return this.getByIndex("anotacoes", "entityComposite", [entityType, entityId])
  }
}

// Instância global
export const dbManager = new IndexedDBManager()

// Inicializar conexão
if (typeof window !== "undefined") {
  dbManager.connect().catch(console.error)
}
