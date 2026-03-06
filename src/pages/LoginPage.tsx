import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GrainOverlay } from "@/components/grain-overlay"
import Icon from "@/components/ui/icon"

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/generate")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <GrainOverlay />

      <div className="w-full max-w-sm px-6">
        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          <span className="font-mono text-xs">NeuroPic</span>
        </button>

        <div className="mb-8">
          <h1 className="mb-1 font-sans text-3xl font-light text-white">
            {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
          </h1>
          <p className="font-mono text-xs text-white/40">
            {mode === "login" ? "Войдите в свой аккаунт" : "Начните создавать нейрофотосессии"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1.5 block font-mono text-xs text-white/40">Имя</label>
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none transition-colors"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/40">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/40">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-sans text-sm font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
          >
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-xs text-white/30">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>

        <p className="mt-4 text-center font-mono text-xs text-white/20">
          Для входа в админ-панель:{" "}
          <button onClick={() => navigate("/admin")} className="text-white/30 hover:text-white/50 transition-colors">
            /admin
          </button>
        </p>
      </div>
    </div>
  )
}
