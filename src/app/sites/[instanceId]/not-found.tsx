export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-white px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-orange-200 bg-orange-50 font-display text-2xl font-semibold text-orange-600 shadow-sm">
          404
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-slate-900">
          Site Not Found
        </h1>
        <p className="mt-3 text-slate-600">
          The site you're looking for doesn't exist or has been removed.
        </p>
        <a href="/" className="korex-btn-primary mt-6">
          Go to Homepage
        </a>
      </div>
    </div>
  )
}
