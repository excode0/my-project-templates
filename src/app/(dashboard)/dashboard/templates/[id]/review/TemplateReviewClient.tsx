'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TemplateReviewClientProps {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    thumbnailUrl: string | null;
    demoUrl: string | null;
    status: string;
    price: number;
    downloads: number;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    ownerEmail: string;
    ownerUsername: string | null;
    instanceCount: number;
  };
  slotData: any;
}

export function TemplateReviewClient({ template, slotData }: TemplateReviewClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this template?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/approve`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve template');
      }

      alert('Template approved successfully!');
      router.push('/dashboard/templates' as any);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject template');
      }

      alert('Template rejected successfully!');
      setShowRejectModal(false);
      router.push('/dashboard/templates' as any);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !template.isFeatured }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update featured status');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-800',
      review: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const slotCount = slotData ? Object.keys(slotData).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/templates' as any)}
            className="text-sm text-orange-600 hover:text-orange-700 mb-2 flex items-center gap-1"
          >
            ← Back to Templates
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Template Review</h1>
        </div>
        <div className="flex gap-3">
          {(template.status === 'pending' || template.status === 'review') && (
            <>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Reject
              </button>
            </>
          )}
          {(template.status === 'approved' || template.status === 'published') && (
            <button
              onClick={handleToggleFeatured}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium ${
                template.isFeatured
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-slate-600 text-white hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {template.isFeatured ? 'Unfeature' : 'Feature'}
            </button>
          )}
        </div>
      </div>

      {/* Template Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thumbnail */}
          <div className="lg:col-span-1">
            {template.thumbnailUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                <span className="text-slate-400 text-sm">No thumbnail</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{template.name}</h2>
              <div className="flex items-center gap-3 mb-3">
                {getStatusBadge(template.status)}
                {template.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <p className="text-slate-600">{template.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="font-medium text-slate-900 capitalize">{template.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="font-medium text-slate-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(template.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Downloads</p>
                <p className="font-medium text-slate-900">{template.downloads}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Instances</p>
                <p className="font-medium text-slate-900">{template.instanceCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Slug</p>
                <p className="font-mono text-sm text-slate-900">{template.slug}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Editable Slots</p>
                <p className="font-medium text-slate-900">{slotCount} slots</p>
              </div>
            </div>

            {template.demoUrl && (
              <div className="pt-4 border-t border-slate-200">
                <a
                  href={template.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
                >
                  View Demo →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Template Owner</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{template.ownerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Username</p>
            <p className="font-medium text-slate-900">{template.ownerUsername || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-900">Created</p>
              <p className="text-sm text-slate-500">{formatDate(template.createdAt)}</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-900">Last Updated</p>
              <p className="text-sm text-slate-500">{formatDate(template.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Data Preview */}
      {slotData && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Slot Configuration ({slotCount} slots)
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-slate-700 whitespace-pre-wrap">
              {JSON.stringify(slotData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Template</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejecting this template. This will be sent to the contributor.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Template does not meet quality standards, missing required slots, etc."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
