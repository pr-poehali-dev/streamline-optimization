import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { GrainOverlay } from "@/components/grain-overlay"

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

type Tab = "dashboard" | "users" | "orders" | "settings"

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [apiKey, setApiKey] = useState("pk-••••••••••••••••••••••")
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [creditRate, setCreditRate] = useState("2")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [creditAmount, setCreditAmount] = useState("")

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
