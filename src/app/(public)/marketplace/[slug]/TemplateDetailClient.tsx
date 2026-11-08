'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { formatPrice } from '@/components/public/TemplateCard';

interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  previewImage: string | null;
  description: string | null;
  isFeatured: boolean;
  demoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  contributorId: string;
  contributorUsername: string | null;
  contributorEmail: string;
  purchaseCount: number;
  avgRating: number | null;
  reviewCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  username: string | null;
  email: string;
}

interface RelatedTemplate {
  id: string;
  name: string;
  slug: string;
  price: number;
  previewImage: string | null;
  purchaseCount: number;
}

interface TemplateDetailClientProps {
  template: Template;
  reviews: Review[];
  relatedTemplates: RelatedTemplate[];
}

function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating)
              ? 'h-3.5 w-3.5 fill-orange-500 text-orange-600'
              : 'h-3.5 w-3.5 text-slate-200'
          }
        />
      ))}
    </span>
  );
}

const included = [
  'Lifetime access',
  'Full customization',
  'Free updates',
  'Custom domain support',
];

export function TemplateDetailClient({
  template,
  reviews,
  relatedTemplates,
}: TemplateDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/marketplace/${template.slug}`);
      return;
    }

    setLoading(true);
    try {
      const checkRes = await fetch(`/api/purchases/check?templateId=${template.id}`);
      const checkData = await checkRes.json();
      const check = checkData?.data;

      if (check?.purchased) {
        const instanceId = check.purchase?.instance?.id;
        alert(
          instanceId
            ? 'You already own this template! Opening your editor...'
            : 'You already own this template! Opening your dashboard...'
        );
        router.push(instanceId ? `/editor/${instanceId}` : '/dashboard');
        return;
      }

      if (template.price === 0) {
        const res = await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: template.id,
            paymentMethod: 'free',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Purchase failed');
        }

        const instanceId = data.data?.instanceId || data.data?.instance?.id;
        alert('Template activated! Your template is ready to customize.');
        if (instanceId) {
          router.push(`/editor/${instanceId}`);
        } else {
          router.push('/dashboard');
        }
        return;
      }

      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Mock/dev payments are provisioned immediately by the server.
      if (data.data?.mock || data.data?.instanceId) {
        const instanceId = data.data?.instanceId;
        alert('Payment successful! Your template is ready to customize.');
        if (instanceId) {
          router.push(`/editor/${instanceId}`);
        } else {
          router.push('/dashboard');
        }
        return;
      }

      const script = document.createElement('script');
      script.src =
        process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
        'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-ignore - Midtrans Snap global
        window.snap.pay(data.data.token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            router.push(
              `/payment/callback?order_id=${data.data.orderId}&transaction_status=settlement` as any
            );
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            router.push(
              `/payment/callback?order_id=${data.data.orderId}&transaction_status=pending` as any
            );
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            alert('Payment failed. Please try again.');
            setLoading(false);
          },
          onClose: () => {
            console.log('Payment popup closed');
            setLoading(false);
          },
        });
      };

      script.onerror = () => {
        alert('Failed to load payment system. Please try again.');
        setLoading(false);
      };
    } catch (error: any) {
      alert(error.message || 'An error occurred during purchase');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const contributor = template.contributorUsername || template.contributorEmail;

  return (
    <div className="korex-section py-12">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Main */}
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {template.category}
              </span>
              {template.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="korex-h1 mt-4">{template.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-orange-600" />
                {template.purchaseCount} purchases
              </span>
              {template.avgRating && (
                <span className="inline-flex items-center gap-2">
                  <Stars rating={template.avgRating} />
                  <span className="font-semibold text-slate-900">
                    {template.avgRating.toFixed(1)}
                  </span>
                  <span>({template.reviewCount} reviews)</span>
                </span>
              )}
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {template.previewImage ? (
              <Image
                src={template.previewImage}
                alt={template.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Sparkles className="h-14 w-14 text-orange-300" />
              </div>
            )}
          </div>

          <div className="korex-card p-6 sm:p-8">
            <h2 className="korex-h3">About this template</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {template.description || 'No description available.'}
            </p>
          </div>

          {/* Live Preview Button */}
          <Link
            href={`/demo/${template.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-6 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <ExternalLink className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-slate-900">View Live Preview</div>
                <div className="text-sm text-slate-600">
                  Try the template before you buy
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-orange-600 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>

          {template.demoUrl && (
            <a
              href={template.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-5 transition-colors hover:bg-orange-50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                  <ExternalLink className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">View live demo</div>
                  <div className="text-xs text-slate-600">
                    Explore the template before you buy
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-orange-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}

          {reviews.length > 0 && (
            <div className="korex-card p-6 sm:p-8">
              <h2 className="korex-h3">Customer reviews ({reviews.length})</h2>
              <div className="mt-6 space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-slate-200 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-semibold text-white">
                          {(review.username || review.email)[0]?.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {review.username || 'Anonymous'}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Stars rating={review.rating} />
                            <span className="text-xs text-slate-600">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Purchase card */}
        <div>
          <div className="korex-card sticky top-28 p-6 sm:p-8">
            <div className="text-sm text-slate-600">One-time purchase</div>
            <div className="mt-2 font-display text-4xl font-semibold text-gradient-fire">
              {formatPrice(template.price)}
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={loading}
              className="korex-btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Purchase now
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>

            {!session?.user && (
              <p className="mt-3 text-center text-xs text-slate-600">
                You&apos;ll be asked to sign in before purchase
              </p>
            )}

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-orange-600" />
                  {item}
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-orange-600" />
                Secure checkout
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="text-xs uppercase tracking-wide text-slate-600">
                Created by
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-semibold text-white">
                  {contributor[0]?.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-900">{contributor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedTemplates.length > 0 && (
        <div className="mt-20">
          <h2 className="korex-h2">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTemplates.map((related) => (
              <Link
                key={related.id}
                href={`/marketplace/${related.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="relative aspect-video w-full bg-gradient-to-br from-orange-50 to-white">
                  {related.previewImage ? (
                    <Image
                      src={related.previewImage}
                      alt={related.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Sparkles className="h-10 w-10 text-orange-300" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900 group-hover:text-orange-600">
                      {related.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {related.purchaseCount} purchases
                    </p>
                  </div>
                  <span className="font-display text-sm font-semibold text-gradient-fire">
                    {formatPrice(related.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
