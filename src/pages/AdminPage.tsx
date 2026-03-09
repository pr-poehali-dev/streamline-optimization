import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { GrainOverlay } from "@/components/grain-overlay"

const ADMIN_CLOTHES_URL = "https://functions.poehali.dev/8577a62d-80d0-46fe-8227-97d25064cc52"

interface ClothesItem {
  id: number
  name: string
  description: string
  imageUrl: string
  productUrl: string
  category: string
  isActive: boolean
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MOCK_USERS = [
  { id: "1", email: "ivan@mail.ru", name: "Иван Иванов", balance: 250, orders: 3, registered: "01.03.2026" },
  { id: "2", email: "maria@gmail.com", name: "Мария Смирнова", balance: 0, orders: 7, registered: "20.02.2026" },
  { id: "3", email: "alex@yandex.ru", name: "Алексей Петров", balance: 600, orders: 1, registered: "05.03.2026" },
]

const MOCK_ORDERS = [
  { id: "ORD-001", user: "ivan@mail.ru", style: "Деловой портрет", count: 50, status: "done", date: "06.03.2026", cost: 100 },
  { id: "ORD-002", user: "maria@gmail.com", style: "Мода", count: 100, status: "done", date: "05.03.2026", cost: 200 },
  { id: "ORD-003", user: "alex@yandex.ru", style: "Фэнтези", count: 50, status: "processing", date: "07.03.2026", cost: 100 },
]

type Tab = "dashboard" | "users" | "orders" | "fitting" | "settings"

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [apiKey, setApiKey] = useState("pk-••••••••••••••••••••••")
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [creditRate, setCreditRate] = useState("2")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [creditAmount, setCreditAmount] = useState("")

  // Fitting clothes state
  const [clothesList, setClothesList] = useState<ClothesItem[]>([])
  const [clothesLoading, setClothesLoading] = useState(false)
  const [addingClothes, setAddingClothes] = useState(false)
  const [newClothes, setNewClothes] = useState({ name: "", description: "", productUrl: "", category: "" })
  const [newClothesImage, setNewClothesImage] = useState<File | null>(null)
  const [newClothesPreview, setNewClothesPreview] = useState("")
  const [savingClothes, setSavingClothes] = useState(false)
  const clothesImageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTab === "fitting") loadClothes()
  }, [activeTab])

  const loadClothes = async () => {
    setClothesLoading(true)
    try {
      const r = await fetch(ADMIN_CLOTHES_URL)
      const d = await r.json()
      setClothesList(d.clothes || [])
    } catch { setClothesList([]) }
    finally { setClothesLoading(false) }
  }

  const handleClothesImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewClothesImage(file)
    setNewClothesPreview(URL.createObjectURL(file))
  }

  const handleAddClothes = async () => {
    if (!newClothes.name || !newClothesImage) return
    setSavingClothes(true)
    try {
      const imageBase64 = await fileToBase64(newClothesImage)
      const resp = await fetch(ADMIN_CLOTHES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClothes, imageBase64 }),
      })
      if (resp.ok) {
        setAddingClothes(false)
        setNewClothes({ name: "", description: "", productUrl: "", category: "" })
        setNewClothesImage(null)
        setNewClothesPreview("")
        loadClothes()
      }
    } catch { /* ignore */ }
    finally { setSavingClothes(false) }
  }

  const handleDeleteClothes = async (id: number) => {
    await fetch(`${ADMIN_CLOTHES_URL}?id=${id}`, { method: "DELETE" })
    loadClothes()
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <GrainOverlay />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-56 shrink-0 border-r border-white/5 bg-white/2 p-6">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <span className="font-bold text-sm text-white">N</span>
            </div>
            <span className="font-mono text-sm text-white">NeuroPic Admin</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
              { id: "users", label: "Пользователи", icon: "Users" },
              { id: "orders", label: "Заказы", icon: "ShoppingBag" },
              { id: "fitting", label: "Примерочная", icon: "Shirt" },
              { id: "settings", label: "Настройки", icon: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs transition-all ${
                  activeTab === item.id
                    ? "bg-purple-600/20 text-purple-300"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-2 font-mono text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              <Icon name="ArrowLeft" size={12} />
              На сайт
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div>
              <h1 className="mb-8 font-sans text-2xl font-light text-white">Дашборд</h1>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Пользователей", value: "3", icon: "Users", color: "purple" },
                  { label: "Заказов всего", value: "11", icon: "Image", color: "pink" },
                  { label: "Выручка", value: "12 450 ₽", icon: "TrendingUp", color: "green" },
                  { label: "В обработке", value: "1", icon: "Clock", color: "orange" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/5 bg-white/3 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-white/40">{stat.label}</span>
                      <Icon name={stat.icon} size={16} className="text-white/20" />
                    </div>
                    <p className="font-sans text-2xl font-light text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-white/30">Последние заказы</h2>
              <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">ID</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Пользователь</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Стиль</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((order) => (
                      <tr key={order.id} className="border-b border-white/3 hover:bg-white/2">
                        <td className="px-4 py-3 font-mono text-xs text-white/50">{order.id}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/70">{order.user}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/70">{order.style}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${
                            order.status === "done" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                          }`}>
                            {order.status === "done" ? "Готово" : "В обработке"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              <h1 className="mb-8 font-sans text-2xl font-light text-white">Пользователи</h1>
              <div className="space-y-3">
                {MOCK_USERS.map((user) => (
                  <div key={user.id} className="rounded-xl border border-white/5 bg-white/3 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 font-sans text-sm font-medium text-purple-400">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-sans text-sm text-white">{user.name}</p>
                          <p className="font-mono text-xs text-white/40">{user.email} · с {user.registered}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono text-sm text-purple-400">{user.balance}</p>
                          <p className="font-mono text-xs text-white/30">кредитов</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-white">{user.orders}</p>
                          <p className="font-mono text-xs text-white/30">заказов</p>
                        </div>
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-white/50 hover:border-purple-500/40 hover:text-purple-400 transition-all"
                        >
                          Управление
                        </button>
                      </div>
                    </div>

                    {selectedUser === user.id && (
                      <div className="mt-4 flex items-end gap-3 border-t border-white/5 pt-4">
                        <div className="flex-1">
                          <label className="mb-1.5 block font-mono text-xs text-white/40">Начислить/списать кредиты</label>
                          <input
                            type="number"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            placeholder="Например: 100 или -50"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none"
                          />
                        </div>
                        <button className="rounded-lg bg-purple-600/80 px-4 py-2 font-mono text-xs text-white hover:bg-purple-600 transition-colors">
                          Применить
                        </button>
                        <button className="rounded-lg border border-red-500/20 px-4 py-2 font-mono text-xs text-red-400/70 hover:border-red-500/40 hover:text-red-400 transition-colors">
                          Заблокировать
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h1 className="mb-8 font-sans text-2xl font-light text-white">Заказы</h1>
              <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">ID</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Пользователь</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Стиль</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Фото</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Дата</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-white/30">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((order) => (
                      <tr key={order.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-white/40">{order.id}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/70">{order.user}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/70">{order.style}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/50">{order.count}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/50">{order.date}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${
                            order.status === "done" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                          }`}>
                            {order.status === "done" ? "Готово" : "В обработке"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fitting clothes management */}
          {activeTab === "fitting" && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h1 className="font-sans text-2xl font-light text-white">Примерочная — каталог одежды</h1>
                <button
                  onClick={() => setAddingClothes(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600/80 px-4 py-2.5 font-mono text-xs text-white hover:bg-purple-600 transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  Добавить одежду
                </button>
              </div>

              {/* Add form */}
              {addingClothes && (
                <div className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                  <h3 className="mb-6 font-sans text-base font-light text-white">Новый товар</h3>
                  <div className="grid gap-6 sm:grid-cols-[140px_1fr]">
                    <div>
                      <div
                        onClick={() => clothesImageRef.current?.click()}
                        className="flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5 hover:border-white/40 transition-colors"
                      >
                        <input ref={clothesImageRef} type="file" accept="image/*" onChange={handleClothesImage} className="hidden" />
                        {newClothesPreview ? (
                          <img src={newClothesPreview} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Icon name="ImagePlus" size={24} className="mx-auto mb-2 text-white/20" />
                            <p className="font-mono text-xs text-white/30">Фото</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-white/40">Название *</label>
                        <input
                          type="text"
                          value={newClothes.name}
                          onChange={(e) => setNewClothes((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Например: Белая рубашка Oxford"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-white/40">Описание</label>
                        <input
                          type="text"
                          value={newClothes.description}
                          onChange={(e) => setNewClothes((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Хлопок 100%, размеры S–XL"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-white/40">Категория</label>
                        <input
                          type="text"
                          value={newClothes.category}
                          onChange={(e) => setNewClothes((p) => ({ ...p, category: e.target.value }))}
                          placeholder="Верх, Низ, Платья, Аксессуары..."
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-white/40">Ссылка на товар</label>
                        <input
                          type="url"
                          value={newClothes.productUrl}
                          onChange={(e) => setNewClothes((p) => ({ ...p, productUrl: e.target.value }))}
                          placeholder="https://shop.example.com/product/123"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleAddClothes}
                          disabled={!newClothes.name || !newClothesImage || savingClothes}
                          className={`rounded-lg px-5 py-2.5 font-mono text-xs text-white transition-colors ${
                            newClothes.name && newClothesImage && !savingClothes
                              ? "bg-purple-600 hover:bg-purple-500"
                              : "bg-white/10 cursor-not-allowed text-white/30"
                          }`}
                        >
                          {savingClothes ? (
                            <span className="flex items-center gap-2"><Icon name="Loader2" size={12} className="animate-spin" />Сохраняем...</span>
                          ) : "Сохранить"}
                        </button>
                        <button
                          onClick={() => { setAddingClothes(false); setNewClothesImage(null); setNewClothesPreview("") }}
                          className="rounded-lg border border-white/10 px-5 py-2.5 font-mono text-xs text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {clothesLoading ? (
                <div className="flex justify-center py-20">
                  <Icon name="Loader2" size={24} className="animate-spin text-purple-400" />
                </div>
              ) : clothesList.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/3 p-12 text-center">
                  <Icon name="Shirt" size={40} className="mx-auto mb-4 text-white/20" />
                  <p className="font-mono text-sm text-white/40">Каталог пуст — добавьте первый товар</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {clothesList.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/8">
                      <div className="aspect-[3/4] overflow-hidden bg-white/5">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="font-sans text-xs font-medium text-white leading-tight">{item.name}</p>
                        {item.category && <p className="mt-0.5 font-mono text-xs text-white/30">{item.category}</p>}
                        {item.productUrl && (
                          <a href={item.productUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors">
                            <Icon name="ExternalLink" size={10} />Ссылка
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteClothes(item.id)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-red-600/80 hover:text-white transition-all"
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="max-w-xl">
              <h1 className="mb-8 font-sans text-2xl font-light text-white">Настройки</h1>

              <div className="space-y-6">
                {/* API Key */}
                <div className="rounded-xl border border-white/5 bg-white/3 p-6">
                  <h3 className="mb-1 font-sans text-sm text-white">Polza.ai API ключ</h3>
                  <p className="mb-4 font-mono text-xs text-white/40">Используется для генерации изображений</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={apiKeyVisible ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white focus:border-purple-500/50 focus:outline-none"
                      />
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <Icon name={apiKeyVisible ? "EyeOff" : "Eye"} size={14} />
                      </button>
                    </div>
                    <button className="rounded-lg bg-purple-600/80 px-4 font-mono text-xs text-white hover:bg-purple-600 transition-colors">
                      Сохранить
                    </button>
                  </div>
                </div>

                {/* Credit rate */}
                <div className="rounded-xl border border-white/5 bg-white/3 p-6">
                  <h3 className="mb-1 font-sans text-sm text-white">Стоимость генерации</h3>
                  <p className="mb-4 font-mono text-xs text-white/40">Кредитов за одно изображение</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={creditRate}
                      onChange={(e) => setCreditRate(e.target.value)}
                      className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white focus:border-purple-500/50 focus:outline-none"
                    />
                    <span className="flex items-center font-mono text-xs text-white/40">кредитов / фото</span>
                  </div>
                </div>

                {/* Tariffs info */}
                <div className="rounded-xl border border-white/5 bg-white/3 p-6">
                  <h3 className="mb-1 font-sans text-sm text-white">Тарифы</h3>
                  <p className="mb-4 font-mono text-xs text-white/40">Цены и кредиты в тарифных планах</p>
                  <div className="space-y-3">
                    {[
                      { name: "Старт", price: "299 ₽", credits: "150 кредитов" },
                      { name: "Профи", price: "999 ₽", credits: "600 кредитов" },
                      { name: "Премиум", price: "2 490 ₽", credits: "1800 кредитов" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2.5">
                        <span className="font-mono text-xs text-white/60">{t.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs text-purple-400">{t.credits}</span>
                          <span className="font-mono text-xs text-white">{t.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-sans text-sm font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all">
                  Сохранить все настройки
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}