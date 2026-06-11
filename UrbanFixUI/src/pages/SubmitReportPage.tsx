import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Crosshair,
  FileImage,
  LogIn,
  MapPin,
  Search,
  UploadCloud,
} from 'lucide-react'
import { searchLocations } from '../api/geocodingApi'
import { createReport } from '../api/reportsApi'
import { LocationPickerMap } from '../components/LocationPickerMap'
import { formatFileSize } from '../lib/format'
import type { LocationSearchResult } from '../types/location'

type Coordinates = {
  latitude: number
  longitude: number
}

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export function SubmitReportPage() {
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<LocationSearchResult[]>(
    [],
  )
  const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [addressSearchTouched, setAddressSearchTouched] = useState(false)
  const [activeAddressIndex, setActiveAddressIndex] = useState(0)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const addressSearchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const trimmedQuery = addressQuery.trim()

    if (trimmedQuery.length < 3 || !isSearchingAddress) {
      return
    }

    const timeout = window.setTimeout(() => {
      void searchLocations(trimmedQuery).then((results) => {
        setAddressResults(results)
        setActiveAddressIndex(0)
        setAddressSearchTouched(true)
        setIsSearchingAddress(false)
      })
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [addressQuery, isSearchingAddress])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        addressSearchRef.current &&
        !addressSearchRef.current.contains(event.target as Node)
      ) {
        setIsAddressMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const filePreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl)
      }
    }
  }, [filePreviewUrl])

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit =
    isEmailValid && description.trim().length >= 10 && file && coordinates
  const showEmailError = email.length > 0 && !isEmailValid
  const showDescriptionError =
    description.length > 0 && description.trim().length < 10

  const updateAddressQuery = (value: string) => {
    setAddressQuery(value)
    setAddressSearchTouched(false)
    setActiveAddressIndex(0)

    if (value.trim().length >= 3) {
      setIsAddressMenuOpen(true)
      setIsSearchingAddress(true)
      return
    }

    setIsAddressMenuOpen(false)
    setIsSearchingAddress(false)
    setAddressResults([])
  }

  const selectAddress = (address: LocationSearchResult) => {
    if (address.source === 'error') {
      return
    }
    setCoordinates({
      latitude: address.latitude,
      longitude: address.longitude,
    })
    setAddressQuery(address.label)
    setAddressResults([])
    setIsAddressMenuOpen(false)
    setAddressSearchTouched(false)
    setIsSearchingAddress(false)
    setActiveAddressIndex(0)
  }

  const handleAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isAddressMenuOpen) {
      return
    }

    if (event.key === 'Escape') {
      setIsAddressMenuOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveAddressIndex((index) =>
        Math.min(index + 1, Math.max(addressResults.length - 1, 0)),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveAddressIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === 'Enter' && addressResults[activeAddressIndex]) {
      event.preventDefault()
      selectAddress(addressResults[activeAddressIndex])
    }
  }

  const selectFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!allowedImageTypes.has(selectedFile.type)) {
      setFile(null)
      setError('Wybierz plik JPG, PNG, GIF albo WEBP.')
      return
    }

    setError(null)
    setFile(selectedFile)
  }

  const submit = async () => {
    if (!canSubmit || !file || !coordinates) {
      setError('Uzupełnij e-mail, opis, zdjęcie i lokalizację na mapie.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createReport({
        email,
        description,
        file,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      })
      setSubmittedId(result.reportId)
    } catch {
      setError('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError('Twoja przeglądarka nie udostępnia geolokalizacji.')
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setAddressQuery('')
        setError(null)
        setIsLocating(false)
      },
      (positionError) => {
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setError(null)
        } else if (positionError.code === positionError.TIMEOUT) {
          setError('Nie udało się ustalić lokalizacji na czas.')
        } else {
          setError(
            'Nie udało się pobrać lokalizacji. Wybierz punkt na mapie.',
          )
        }

        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-emerald-700">UrbanFix</p>
            <h1 className="text-2xl font-semibold">
              Zgłoś usterkę w swojej okolicy
            </h1>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            to="/admin/login"
          >
            <LogIn size={16} />
            Panel admina
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1" ref={addressSearchRef}>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  aria-activedescendant={
                    addressResults[activeAddressIndex]
                      ? `address-option-${addressResults[activeAddressIndex].id}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  aria-controls="address-results"
                  aria-expanded={isAddressMenuOpen}
                  className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => updateAddressQuery(event.target.value)}
                  onFocus={() => {
                    if (addressQuery.trim().length >= 3) {
                      setIsAddressMenuOpen(true)
                    }
                  }}
                  onKeyDown={handleAddressKeyDown}
                  placeholder="Wyszukaj adres we Wrocławiu"
                  role="combobox"
                  value={addressQuery}
                />
                {isAddressMenuOpen && addressQuery.trim().length >= 3 && (
                  <div
                    className="absolute z-[1200] mt-2 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
                    id="address-results"
                    role="listbox"
                  >
                    {isSearchingAddress && (
                      <div className="px-3 py-2 text-sm text-slate-500">
                        Szukam adresu...
                      </div>
                    )}
                    {!isSearchingAddress &&
                      addressSearchTouched &&
                      addressResults.length === 0 && (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          Brak wyników. Kliknij punkt na mapie.
                        </div>
                      )}
                    {addressResults.map((address, index) => (
                      <button
                        aria-selected={index === activeAddressIndex}
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          address.source === 'error'
                            ? 'text-red-600 cursor-default'
                            : `hover:bg-slate-50 ${
                                index === activeAddressIndex ? 'bg-emerald-50' : ''
                              }`
                        }`}
                        id={`address-option-${address.id}`}
                        key={address.id}
                        onClick={() => selectAddress(address)}
                        onMouseEnter={() => {
                          if (address.source !== 'error') {
                            setActiveAddressIndex(index)
                          }
                        }}
                        role="option"
                        type="button"
                      >
                        <span className="block">{address.label}</span>
                        {address.source === 'mock' && (
                          <span className="text-xs text-slate-500">
                            wynik offline
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                disabled={isLocating}
                onClick={locateMe}
                type="button"
              >
                <Crosshair size={17} />
                {isLocating ? 'Lokalizuję...' : 'Zlokalizuj mnie'}
              </button>
            </div>
          </div>
          <div className="h-[320px] sm:h-[420px] lg:h-[calc(100vh-250px)] lg:min-h-[460px]">
            <LocationPickerMap
              onSelect={(coords) => {
                setCoordinates(coords)
                setAddressQuery('')
              }}
              selected={coordinates}
            />
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {submittedId ? (
            <div className="flex h-full flex-col justify-center text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
              <h2 className="mt-4 text-xl font-semibold">
                Zgłoszenie wysłane
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Numer referencyjny:
              </p>
              <p className="mt-2 break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm">
                {submittedId}
              </p>
              <Link
                className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                to={`/status?reportId=${submittedId}`}
              >
                Śledź status zgłoszenia
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Dane zgłoszenia</h2>
                <p className="mt-1 text-sm text-slate-500">
                  E-mail służy tylko do powiadomień o statusie naprawy.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Adres e-mail</span>
                <input
                  className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jan@example.com"
                  type="email"
                  value={email}
                />
                {showEmailError && (
                  <p className="mt-1 text-xs text-red-600">
                    Podaj poprawny adres e-mail.
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium">Opis usterki</span>
                <textarea
                  className="mt-1 min-h-32 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Opisz, co się stało i co widać na miejscu."
                  value={description}
                />
                {showDescriptionError && (
                  <p className="mt-1 text-xs text-red-600">
                    Opis powinien mieć co najmniej 10 znaków.
                  </p>
                )}
              </label>

              <div>
                <span className="text-sm font-medium">Zdjęcie</span>
                <button
                  className="mt-1 flex min-h-36 w-full flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:bg-slate-100"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    selectFile(event.dataTransfer.files[0] ?? null)
                  }}
                  type="button"
                >
                  {filePreviewUrl ? (
                    <img
                      alt=""
                      className="h-40 w-full rounded object-cover"
                      src={filePreviewUrl}
                    />
                  ) : (
                    <>
                      <UploadCloud className="text-slate-500" size={30} />
                      <span className="mt-2 text-sm font-medium">
                        Przeciągnij zdjęcie lub wybierz plik
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG lub zdjęcie z telefonu
                      </span>
                    </>
                  )}
                </button>
                <input
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    selectFile(event.target.files?.[0] ?? null)
                  }
                  ref={fileInputRef}
                  type="file"
                />
              </div>

              {coordinates && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <MapPin size={16} />
                  {coordinates.latitude.toFixed(5)},{' '}
                  {coordinates.longitude.toFixed(5)}
                </div>
              )}

              {file && (
                <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <FileImage size={16} />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="text-slate-400">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              )}

              {!coordinates && (
                <p className="text-xs text-slate-500">
                  Wybierz lokalizację kliknięciem na mapie, wyszukiwarką lub
                  geolokalizacją.
                </p>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                className="h-12 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSubmitting}
                onClick={submit}
                type="button"
              >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
              </button>

              <Link
                className="block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
                to="/status"
              >
                Masz już zgłoszenie? Śledź jego status tutaj
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
