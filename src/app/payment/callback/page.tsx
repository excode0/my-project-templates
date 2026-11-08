'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type PaymentStatus = 'loading' | 'success' | 'pending' | 'failed'

interface PaymentDetails {
  status: string
  purchase: {
    id: string
    status: string
    totalPrice: number
    purchasedAt: string
  }
  template: {
    id: string
    name: string
    slug: string
  }
  instance: {
    id: string
    subdomain: string
    customDomain: string | null
    status: string
  } | null
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [details, setDetails] = useState<PaymentDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    const transactionStatus = searchParams.get('transaction_status')

    if (!orderId) {
      setStatus('failed')
      setError('Missing order information.')
      return
    }

    if (transactionStatus === 'pending') {
      setStatus('pending')
      return
    }

    if (
      transactionStatus &&
      !['settlement', 'capture'].includes(transactionStatus)
    ) {
      setStatus('failed')
      return
    }

    let cancelled = false

    const verify = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.error || 'Failed to verify payment')
        }

        if (cancelled) return

        const data = json.data as PaymentDetails
        setDetails(data)

        if (data.status === 'completed') {
          setStatus('success')
        } else if (data.status === 'pending') {
          setStatus('pending')
        } else {
          setStatus('failed')
        }
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Failed to verify payment'
        )
        setStatus('failed')
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  const continueToEditor = () => {
    if (details?.instance?.id) {
      router.push(`/editor/${details.instance.id}` as any)
    } else {
      router.push('/dashboard' as any)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30 px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
          <p className="text-sm text-slate-600">
            Verifying your payment...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
        {status === 'success' && (
          <>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
              ✓
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              Payment Successful
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your template is ready. Start customizing it right away.
            </p>

            {details && (
              <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Template</span>
                  <span className="font-medium text-slate-900">
                    {details.template?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(details.purchase?.totalPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Order</span>
                  <span className="truncate font-mono text-xs text-slate-900">
                    {details.purchase?.id}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={continueToEditor}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-fire-500 via-fire-600 to-flame-end px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              Start Customizing
            </button>
            <Link
              href="/dashboard/purchases"
              className="mt-4 inline-block text-sm text-slate-600 hover:text-orange-600"
            >
              View purchase history
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-3xl text-amber-600">
              ⏳
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              Payment Pending
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your payment is being processed. We will activate your template as
              soon as it is confirmed.
            </p>
            <Link
              href="/dashboard/purchases"
              className="mt-6 inline-block w-full rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl text-red-600">
              ✕
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              Payment Failed
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {error ||
                'We could not confirm your payment. Please try again or choose another payment method.'}
            </p>
            <Link
              href="/marketplace"
              className="mt-6 inline-block w-full rounded-xl bg-gradient-to-r from-fire-500 via-fire-600 to-flame-end px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm text-slate-600 hover:text-orange-600"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  )
}
