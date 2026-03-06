import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { GrainOverlay } from "@/components/grain-overlay"

const MOCK_ORDERS = [
  { id: "1", date: "06.03.2026", style: "Деловой портрет", count: 50, status: "done", preview: null },
  { id: "2", date: "04.03.2026", style: "Мода + Арт", count: 100, status: "done", preview: null },
  { id: "3", date: "07.03.2026", style: "Фэнтези", count: 50, status: "processing", preview: null },
]

const TARIFFS = [
  { id: "start", name: "Старт", price: "299 ₽", credits: 150, popular: false },
  { id: "pro", name: "Профи", price: "999 ₽", credits: 600, popular: true },
  { id: "premium", name: "Премиум", price: "2 490 ₽", credits: 1800, popular: false },
]

export default function CabinetPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"orders" | "balance" | "settings">("orders")
  const balance = 250

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <GrainOverlay />

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0a0a0f]/80 px-6 py-4 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={16} />
          <span className="font-mono text-sm">NeuroPic</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
            <Icon name="Coins" size={14} className="text-purple-400" />
            <span className="font-mono text-sm text-purple-300">{balance} кредитов</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-sans text-3xl font-light text-white">Личный кабинет</h1>
            <p className="font-mono text-sm text-white/40">user@example.com</p>
          </div>
          <button
            onClick={() => navigate("/generate")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
          >
            <Icon name="Plus" size={16} />
            Новая фотосессия
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-xl border border-white/5 bg-white/3 p-1">
          {[
            { id: "orders", label: "Мои заказы", icon: "ImageIcon" },
            { id: "balance", label: "Баланс", icon: "Coins" },
            { id: "settings", label: "Настройки", icon: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Icon name="Image" size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-sans text-sm text-white">{order.style}</p>
                    <p className="font-mono text-xs text-white/40">{order.date} · {order.count} фото</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs ${
                    order.status === "done"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}>
                    <Icon name={order.status === "done" ? "CheckCircle" : "Clock"} size={11} />
                    {order.status === "done" ? "Готово" : "В обработке"}
                  </span>
                  {order.status === "done" && (
                    <button className="flex items-center gap-1 font-mono text-xs text-white/40 hover:text-white transition-colors">
                      <Icon name="Download" size={12} />
                      Скачать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Balance */}
        {activeTab === "balance" && (
          <div>
            <div className="mb-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-8">
              <p className="mb-2 font-mono text-sm text-white/50">Текущий баланс</p>
              <p className="font-sans text-5xl font-light text-white">{balance}</p>
              <p className="mt-1 font-mono text-sm text-purple-400">кредитов</p>
            </div>

            <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-white/40">Пополнить баланс</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {TARIFFS.map((t) => (
                <div key={t.id} className={`relative rounded-xl border p-5 transition-all hover:border-purple-500/50 cursor-pointer ${
                  t.popular ? "border-purple-500/40 bg-purple-500/10" : "border-white/8 bg-white/3"
                }`}>
                  {t.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-3 py-0.5 font-mono text-xs text-white">
                      Популярный
                    </span>
                  )}
                  <p className="mb-1 font-sans text-lg font-light text-white">{t.name}</p>
                  <p className="mb-3 font-mono text-2xl text-purple-400">{t.price}</p>
                  <p className="mb-4 font-mono text-xs text-white/50">{t.credits} кредитов</p>
                  <button className="w-full rounded-lg bg-purple-600/80 py-2 font-mono text-xs text-white hover:bg-purple-600 transition-colors">
                    Купить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {[
              { label: "Имя", value: "Иван Иванов", type: "text" },
              { label: "Email", value: "user@example.com", type: "email" },
            ].map((field) => (
              <div key={field.label} className="rounded-xl border border-white/5 bg-white/3 p-5">
                <label className="mb-2 block font-mono text-xs text-white/40">{field.label}</label>
                <input
                  type={field.type}
                  defaultValue={field.value}
                  className="w-full bg-transparent font-sans text-sm text-white focus:outline-none"
                />
              </div>
            ))}
            <button className="w-full rounded-xl bg-purple-600/80 py-3 font-sans text-sm font-medium text-white hover:bg-purple-600 transition-colors">
              Сохранить изменения
            </button>
            <button className="w-full rounded-xl border border-white/5 py-3 font-sans text-sm text-white/40 hover:text-white/60 transition-colors">
              Выйти из аккаунта
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
