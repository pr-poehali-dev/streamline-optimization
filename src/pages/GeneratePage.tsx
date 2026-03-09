import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { GrainOverlay } from "@/components/grain-overlay"

const GENERATE_URL = "https://functions.poehali.dev/a2fa73fb-9ce7-4ded-93ca-b1a03a6c66e8"

const STYLES = [
  { id: "business", label: "Деловой портрет", icon: "Briefcase" },
  { id: "fashion", label: "Мода", icon: "Sparkles" },
  { id: "fantasy", label: "Фэнтези", icon: "Wand2" },
  { id: "travel", label: "Путешествия", icon: "Globe" },
  { id: "art", label: "Арт-портрет", icon: "Palette" },
  { id: "sport", label: "Спорт", icon: "Zap" },
  { id: "wedding", label: "Свадебный", icon: "Heart" },
  { id: "nature", label: "Природа", icon: "Leaf" },
  { id: "custom", label: "Свой стиль", icon: "PenLine" },
]

const BACKGROUNDS = ["Офис", "Студия", "Город", "Природа", "Абстракция", "Космос"]
const MOODS = ["Серьёзный", "Улыбающийся", "Задумчивый", "Энергичный"]
const COUNTS = [1, 5, 20, 50]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>("")
  const [customStyle, setCustomStyle] = useState<string>("")
  const [selectedBg, setSelectedBg] = useState<string>("Студия")
  const [selectedMood, setSelectedMood] = useState<string>("Серьёзный")
  const [photoCount, setPhotoCount] = useState<number>(5)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ orderId: number; status: string } | null>(null)
  const [error, setError] = useState<string>("")

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 20))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 20))
  }

  const removeFile = (i: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const canGenerate =
    uploadedFiles.length >= 1 &&
    (selectedStyle !== "" && selectedStyle !== "custom" || customStyle.trim().length > 3)

  const handleGenerate = async () => {
    if (!canGenerate) return
    setIsLoading(true)
    setError("")
    try {
      const photos = await Promise.all(uploadedFiles.map(fileToBase64))
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": "user-demo" },
        body: JSON.stringify({
          style: selectedStyle !== "custom" ? selectedStyle : "",
          customStyle: selectedStyle === "custom" ? customStyle : "",
          background: selectedBg,
          mood: selectedMood,
          photoCount,
          photos,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Ошибка генерации")
      setResult({ orderId: data.orderId, status: data.status })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так")
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] text-white">
        <GrainOverlay />
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
            <Icon name="CheckCircle" size={32} className="text-purple-400" />
          </div>
          <h2 className="mb-2 font-sans text-2xl font-light">Заказ принят!</h2>
          <p className="mb-1 font-mono text-sm text-white/50">Заказ #{result.orderId}</p>
          <p className="mb-8 font-mono text-xs text-white/30">
            Генерация займёт 5–15 минут. Результат появится в личном кабинете.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/cabinet")}
              className="rounded-xl bg-purple-600 px-6 py-3 font-sans text-sm text-white hover:bg-purple-500 transition-colors"
            >
              В личный кабинет
            </button>
            <button
              onClick={() => { setResult(null); setUploadedFiles([]) }}
              className="rounded-xl border border-white/10 px-6 py-3 font-sans text-sm text-white/60 hover:border-white/20 hover:text-white transition-colors"
            >
              Новый заказ
            </button>
          </div>
        </div>
      </div>
    )
  }

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
            <span className="font-mono text-sm text-purple-300">250 кредитов</span>
          </div>
          <button onClick={() => navigate("/cabinet")} className="text-white/60 hover:text-white transition-colors">
            <Icon name="User" size={20} />
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <h1 className="mb-2 font-sans text-4xl font-light tracking-tight text-white md:text-5xl">
            Нейрофотосессия
          </h1>
          <p className="font-mono text-sm text-white/50">Загрузите фото, выберите стиль и получите результат</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* Upload — от 1 фото */}
            <div>
              <label className="mb-4 block font-mono text-xs uppercase tracking-widest text-white/40">
                01 / Ваши фото (от 1 штуки)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => uploadedFiles.length === 0 && fileInputRef.current?.click()}
                className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                  isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/3 hover:border-white/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {uploadedFiles.length === 0 ? (
                  <div className="text-center">
                    <Icon name="Upload" size={32} className="mx-auto mb-3 text-white/20" />
                    <p className="text-sm text-white/50">Перетащите фото или кликните для выбора</p>
                    <p className="mt-1 font-mono text-xs text-white/30">Минимум 1 фото · JPG, PNG, WEBP</p>
                  </div>
                ) : (
                  <div className="flex w-full flex-wrap gap-2 p-4">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg bg-white/10">
                        <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black"
                        >
                          <Icon name="X" size={10} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-white/20 text-white/30 hover:border-white/40 transition-colors"
                    >
                      <Icon name="Plus" size={20} />
                    </button>
                  </div>
                )}
              </div>
              {uploadedFiles.length > 0 && (
                <p className="mt-2 font-mono text-xs text-white/40">
                  {uploadedFiles.length} / 20 фото · {uploadedFiles.length >= 5 ? "Чем больше фото, тем лучше результат" : "Рекомендуем 5+ для лучшего качества"}
                </p>
              )}
            </div>

            {/* Styles */}
            <div>
              <label className="mb-4 block font-mono text-xs uppercase tracking-widest text-white/40">
                02 / Стиль фотосессии
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      selectedStyle === style.id
                        ? "border-purple-500 bg-purple-500/15 text-white"
                        : "border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    <Icon name={style.icon} size={20} />
                    <span className="text-center text-xs leading-tight">{style.label}</span>
                  </button>
                ))}
              </div>

              {selectedStyle === "custom" && (
                <div className="mt-4">
                  <textarea
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="Опишите желаемый стиль... например: «портрет в стиле 90-х, джинсовая куртка, яркие цвета, плёночная фотография»"
                    rows={3}
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-500/5 px-4 py-3 font-mono text-sm text-white placeholder:text-white/25 focus:border-purple-500/60 focus:outline-none resize-none transition-colors"
                  />
                  <p className="mt-1 font-mono text-xs text-white/30">{customStyle.length} символов · минимум 4</p>
                </div>
              )}
            </div>

            {/* Background */}
            <div>
              <label className="mb-4 block font-mono text-xs uppercase tracking-widest text-white/40">
                03 / Фон
              </label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedBg(bg)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-xs transition-all ${
                      selectedBg === bg
                        ? "border-pink-500 bg-pink-500/15 text-pink-300"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="mb-4 block font-mono text-xs uppercase tracking-widest text-white/40">
                04 / Настроение
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-xs transition-all ${
                      selectedMood === mood
                        ? "border-pink-500 bg-pink-500/15 text-pink-300"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-2xl border border-white/8 bg-white/3 p-6">
              <h3 className="mb-6 font-sans text-lg font-light text-white">Ваш заказ</h3>

              <div className="mb-6">
                <label className="mb-3 block font-mono text-xs text-white/40">Количество фото</label>
                <div className="grid grid-cols-4 gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPhotoCount(c)}
                      className={`rounded-lg border py-2 font-mono text-sm transition-all ${
                        photoCount === c
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-white/10 text-white/50 hover:border-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 space-y-3 border-t border-white/5 pt-6">
                <div className="flex justify-between font-mono text-xs text-white/50">
                  <span>Стиль</span>
                  <span>{selectedStyle === "custom" ? "Свой вариант" : selectedStyle || "—"}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-white/50">
                  <span>Фото загружено</span>
                  <span>{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-white/50">
                  <span>Фон</span>
                  <span>{selectedBg}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-white/50">
                  <span>Настроение</span>
                  <span>{selectedMood}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 font-mono text-sm">
                  <span className="text-white/70">Итого</span>
                  <span className="text-purple-400">{photoCount} фото</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                disabled={!canGenerate || isLoading}
                onClick={handleGenerate}
                className={`w-full rounded-xl py-3.5 font-sans text-sm font-medium transition-all ${
                  canGenerate && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Отправляем...
                  </span>
                ) : canGenerate ? "Создать фотосессию" : "Загрузите фото и выберите стиль"}
              </button>

              <p className="mt-4 text-center font-mono text-xs text-white/30">
                Стоимость: {photoCount * 2} кредитов
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
