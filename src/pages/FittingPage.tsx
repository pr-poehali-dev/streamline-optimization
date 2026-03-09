import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { GrainOverlay } from "@/components/grain-overlay"

const FITTING_URL = "https://functions.poehali.dev/2186d92f-d0f8-465a-a983-94add1dbfb82"

interface ClothesItem {
  id: number
  name: string
  description: string
  imageUrl: string
  productUrl: string
  category: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function FittingPage() {
  const navigate = useNavigate()
  const userPhotoRef = useRef<HTMLInputElement>(null)
  const customClothesRef = useRef<HTMLInputElement>(null)

  const [clothes, setClothes] = useState<ClothesItem[]>([])
  const [loadingClothes, setLoadingClothes] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("Все")

  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null)
  const [userPhotoPreview, setUserPhotoPreview] = useState<string>("")
  const [selectedClothesId, setSelectedClothesId] = useState<number | null>(null)
  const [customClothesFile, setCustomClothesFile] = useState<File | null>(null)
  const [customClothesPreview, setCustomClothesPreview] = useState<string>("")

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ fittingId: number; status: string } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(FITTING_URL)
      .then((r) => r.json())
      .then((d) => setClothes(d.clothes || []))
      .catch(() => setClothes([]))
      .finally(() => setLoadingClothes(false))
  }, [])

  const categories = ["Все", ...Array.from(new Set(clothes.map((c) => c.category).filter(Boolean)))]

  const filteredClothes =
    selectedCategory === "Все" ? clothes : clothes.filter((c) => c.category === selectedCategory)

  const handleUserPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUserPhotoFile(file)
    setUserPhotoPreview(URL.createObjectURL(file))
  }

  const handleCustomClothes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomClothesFile(file)
    setCustomClothesPreview(URL.createObjectURL(file))
    setSelectedClothesId(null)
  }

  const handleSelectClothes = (id: number) => {
    setSelectedClothesId(id === selectedClothesId ? null : id)
    setCustomClothesFile(null)
    setCustomClothesPreview("")
  }

  const canTryOn = !!userPhotoFile && (selectedClothesId !== null || !!customClothesFile)

  const handleTryOn = async () => {
    if (!canTryOn || !userPhotoFile) return
    setIsLoading(true)
    setError("")
    try {
      const userPhotoB64 = await fileToBase64(userPhotoFile)
      const body: Record<string, unknown> = { userPhoto: userPhotoB64 }
      if (selectedClothesId !== null) {
        body.clothesId = selectedClothesId
      } else if (customClothesFile) {
        body.customClothesPhoto = await fileToBase64(customClothesFile)
      }

      const resp = await fetch(FITTING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": "user-demo" },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Ошибка")
      setResult({ fittingId: data.fittingId, status: data.status })
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
        <div className="max-w-md text-center px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
            <Icon name="Shirt" size={32} className="text-purple-400" />
          </div>
          <h2 className="mb-2 font-sans text-2xl font-light">Примерка в обработке!</h2>
          <p className="mb-1 font-mono text-sm text-white/50">Заявка #{result.fittingId}</p>
          <p className="mb-8 font-mono text-xs text-white/30">
            ИИ примеряет на вас одежду. Результат будет готов через 1–3 минуты.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/cabinet")}
              className="rounded-xl bg-purple-600 px-6 py-3 font-sans text-sm text-white hover:bg-purple-500 transition-colors"
            >
              В личный кабинет
            </button>
            <button
              onClick={() => { setResult(null); setUserPhotoFile(null); setUserPhotoPreview(""); setSelectedClothesId(null) }}
              className="rounded-xl border border-white/10 px-6 py-3 font-sans text-sm text-white/60 hover:border-white/20 hover:text-white transition-colors"
            >
              Ещё примерка
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h1 className="mb-2 font-sans text-4xl font-light tracking-tight text-white md:text-5xl">
            Примерочная
          </h1>
          <p className="font-mono text-sm text-white/50">Загрузите своё фото и примерьте одежду с помощью ИИ</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left — clothes catalogue */}
          <div>
            {/* Category filter */}
            {categories.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-xs transition-all ${
                      selectedCategory === cat
                        ? "border-purple-500 bg-purple-500/15 text-purple-300"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {loadingClothes ? (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader2" size={24} className="animate-spin text-purple-400" />
              </div>
            ) : filteredClothes.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/3 p-12 text-center">
                <Icon name="Shirt" size={40} className="mx-auto mb-4 text-white/20" />
                <p className="font-mono text-sm text-white/40">Каталог одежды пока пуст</p>
                <p className="mt-1 font-mono text-xs text-white/20">Администратор скоро добавит варианты</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {filteredClothes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectClothes(item.id)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                      selectedClothesId === item.id
                        ? "border-purple-500 shadow-lg shadow-purple-500/20"
                        : "border-white/8 hover:border-white/20"
                    }`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {selectedClothesId === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600/30">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                            <Icon name="Check" size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-left">
                      <p className="font-sans text-xs font-medium text-white leading-tight">{item.name}</p>
                      {item.description && (
                        <p className="mt-0.5 font-mono text-xs text-white/40 line-clamp-1">{item.description}</p>
                      )}
                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 flex items-center gap-1 font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Icon name="ExternalLink" size={10} />
                          Купить
                        </a>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom clothes upload */}
            <div className="mt-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/30">— или загрузите своё фото одежды —</p>
              <div
                onClick={() => customClothesRef.current?.click()}
                className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/3 p-4 hover:border-white/20 transition-colors"
              >
                <input ref={customClothesRef} type="file" accept="image/*" onChange={handleCustomClothes} className="hidden" />
                {customClothesPreview ? (
                  <>
                    <img src={customClothesPreview} alt="" className="h-16 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-mono text-sm text-white">{customClothesFile?.name}</p>
                      <p className="font-mono text-xs text-purple-400">Выбрана для примерки</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCustomClothesFile(null); setCustomClothesPreview("") }}
                      className="ml-auto text-white/30 hover:text-white/70 transition-colors"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                      <Icon name="ImagePlus" size={20} className="text-white/30" />
                    </div>
                    <p className="font-mono text-sm text-white/40">Загрузить фото одежды</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right — user photo + try on */}
          <div>
            <div className="sticky top-24 space-y-5">
              {/* User photo */}
              <div
                onClick={() => userPhotoRef.current?.click()}
                className="cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/3 transition-all hover:border-white/20"
              >
                <input ref={userPhotoRef} type="file" accept="image/*" onChange={handleUserPhoto} className="hidden" />
                {userPhotoPreview ? (
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={userPhotoPreview} alt="Ваше фото" className="w-full object-cover max-h-80" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); userPhotoRef.current?.click() }}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                      >
                        <Icon name="RefreshCw" size={12} />
                        Сменить фото
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                      <Icon name="User" size={28} className="text-white/30" />
                    </div>
                    <p className="font-sans text-sm text-white/60">Загрузите своё фото</p>
                    <p className="mt-1 font-mono text-xs text-white/30">Полный рост или портрет</p>
                  </div>
                )}
              </div>

              {/* Selected clothes preview */}
              {(selectedClothesId !== null || customClothesPreview) && (
                <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
                  {selectedClothesId !== null ? (
                    <>
                      <img
                        src={clothes.find((c) => c.id === selectedClothesId)?.imageUrl}
                        alt=""
                        className="h-12 w-9 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-white truncate">
                          {clothes.find((c) => c.id === selectedClothesId)?.name}
                        </p>
                        <p className="font-mono text-xs text-purple-400">Выбрана из каталога</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={customClothesPreview} alt="" className="h-12 w-9 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-white truncate">{customClothesFile?.name}</p>
                        <p className="font-mono text-xs text-purple-400">Ваша одежда</p>
                      </div>
                    </>
                  )}
                  <Icon name="Shirt" size={16} className="text-purple-400 shrink-0" />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                disabled={!canTryOn || isLoading}
                onClick={handleTryOn}
                className={`w-full rounded-xl py-4 font-sans text-sm font-medium transition-all ${
                  canTryOn && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Обрабатываем...
                  </span>
                ) : !userPhotoFile ? "Сначала загрузите своё фото" : !canTryOn ? "Выберите одежду для примерки" : "Примерить!"}
              </button>

              <p className="text-center font-mono text-xs text-white/30">Стоимость: 5 кредитов</p>

              {/* Instruction */}
              <div className="rounded-xl border border-white/5 bg-white/3 p-4 space-y-2.5">
                <p className="font-mono text-xs uppercase tracking-widest text-white/30">Как это работает</p>
                {[
                  ["1", "Загрузите своё фото (лучше полный рост)"],
                  ["2", "Выберите одежду из каталога или загрузите своё фото"],
                  ["3", "Нажмите «Примерить» — ИИ оденет вас"],
                ].map(([n, text]) => (
                  <div key={n} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-mono text-xs text-purple-400">
                      {n}
                    </span>
                    <p className="font-mono text-xs text-white/50">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
