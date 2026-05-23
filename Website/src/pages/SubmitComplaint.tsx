import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { getApiErrorMessage } from '@/api/client'
import { createComplaint } from '@/api/complaints'

const SEVERITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'] as const

const ROAD_TYPE_OPTIONS = [
  { value: 'NH', label: 'NH - National Highway' },
  { value: 'SH', label: 'SH - State Highway' },
  { value: 'MDR', label: 'MDR - Major District Road' },
  { value: 'Village Road', label: 'Village Road' },
] as const

export default function SubmitComplaint() {
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('')
  const [roadType, setRoadType] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [createdComplaintId, setCreatedComplaintId] = useState<number | null>(null)

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file)
    setPhotoPreview('')

    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setCreatedComplaintId(null)

    const parsedLatitude = Number(latitude)
    const parsedLongitude = Number(longitude)

    if (!description.trim()) {
      setErrorMessage('Please enter a complaint description.')
      return
    }

    if (!severity) {
      setErrorMessage('Please choose a severity level.')
      return
    }

    if (!roadType) {
      setErrorMessage('Please choose a road type.')
      return
    }

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      setErrorMessage('Please enter valid latitude and longitude values.')
      return
    }

    if (!photoFile) {
      setErrorMessage('Please upload a photo for the complaint.')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('description', description.trim())
      formData.append('severity', severity)
      formData.append('roadType', roadType)
      formData.append('location', `POINT(${parsedLongitude} ${parsedLatitude})`)
      formData.append('latitude', String(parsedLatitude))
      formData.append('longitude', String(parsedLongitude))
      formData.append('image', photoFile)

      const created = await createComplaint(formData)
      setCreatedComplaintId(created.id)
      setSuccessMessage(`Complaint #${created.id} created successfully.`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to submit complaint.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Complaint"
        subtitle="Create a new road complaint with location, severity, and photo evidence."
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-700 to-brand-600 p-5 text-white">
            <p className="text-sm font-medium text-brand-100">Complaint intake</p>
            <h3 className="mt-1 text-xl font-semibold">Record the issue with real coordinates and evidence</h3>
            <p className="mt-2 max-w-2xl text-sm text-brand-100/90">
              Capture the report details once, then submit them directly to the backend with the
              photo attachment and geolocation.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {successMessage}
                {createdComplaintId && (
                  <div className="mt-3">
                    <Link
                      to={`/complaints/${createdComplaintId}`}
                      className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
                    >
                      View Complaint
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="Describe the complaint in detail"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Severity</span>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                >
                  <option value="" disabled>
                    Select severity
                  </option>
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Road Type</span>
                <select
                  value={roadType}
                  onChange={(event) => setRoadType(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                >
                  <option value="" disabled>
                    Select road type
                  </option>
                  {ROAD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Photo Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
                  required
                />
              </label>
            </div>

            {photoPreview && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img src={photoPreview} alt="Complaint preview" className="max-h-80 w-full object-contain" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
              </button>
              <p className="text-sm text-slate-500">All fields are sent directly to the API with the uploaded image.</p>
            </div>
          </form>
        </section>

        <aside className="space-y-4 rounded-3xl border border-brand-100 bg-brand-50 p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Guidance</p>
            <h3 className="mt-2 text-xl font-semibold text-brand-900">What to include</h3>
          </div>

          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              Provide a clear description of the damage or issue.
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              Use an exact latitude and longitude so the complaint can be pinned on the map.
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              Upload a recent photo for faster triage and better backend AI analysis.
            </div>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            The complaint is created via <span className="font-medium text-slate-900">POST /api/complaints</span> with the form fields and image attachment.
          </div>
        </aside>
      </div>
    </div>
  )
}