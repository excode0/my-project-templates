'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react'

interface DomainSettingsProps {
  instanceId: string
  currentDomain?: string
  subdomain?: string
  domainSuffix?: string
  onDomainVerified?: (domain: string) => void
}

interface DomainData {
  id?: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verificationToken?: string
  txtRecord?: {
    name: string
    value: string
  }
  errors?: string[]
  verifiedAt?: Date
}

export function DomainSettings({
  instanceId,
  currentDomain,
  subdomain,
  domainSuffix = 'korex.site',
  onDomainVerified,
}: DomainSettingsProps) {
  const subdomainHost = subdomain ? `${subdomain}.${domainSuffix}` : undefined
  const [domain, setDomain] = useState(currentDomain || '')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [domainData, setDomainData] = useState<DomainData | null>(null)
  const [error, setError] = useState('')

  const handleVerifyDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId,
          domain: domain.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to verify domain')
        return
      }

      if (result.success) {
        setDomainData(result.data)
        
        if (result.data.status === 'verified') {
          onDomainVerified?.(result.data.domain)
        }
      } else {
        setError(result.message || 'Domain verification failed')
        setDomainData(result.data || null)
      }
    } catch (err) {
      console.error('Domain verification error:', err)
      setError('An error occurred while verifying the domain')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!domainData?.id) return

    setChecking(true)
    setError('')

    try {
      const response = await fetch(`/api/domains/${domainData.id}/status`)
      const result = await response.json()

      if (result.success) {
        setDomainData(result.data)
        
        if (result.data.status === 'verified') {
          onDomainVerified?.(result.data.domain)
        }
      } else {
        setError(result.error || 'Failed to check status')
      }
    } catch (err) {
      console.error('Status check error:', err)
      setError('An error occurred while checking status')
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Current Access URLs */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Current URLs</Label>
        <div className="space-y-2 rounded-lg border p-4">
          {subdomainHost && (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Subdomain</p>
                <p className="font-mono text-sm">{subdomainHost}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://${subdomainHost}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {currentDomain && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Custom Domain</p>
                <p className="font-mono text-sm">{currentDomain}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://${currentDomain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {!subdomain && !currentDomain && (
            <p className="text-sm text-muted-foreground">
              No domains configured yet
            </p>
          )}
        </div>
      </div>

      {/* Add Custom Domain */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="domain">Add Custom Domain</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Connect your own domain (e.g., mysite.com or www.mysite.com)
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            id="domain"
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading}
          />
          <Button
            onClick={handleVerifyDomain}
            disabled={loading || !domain.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Verification Instructions */}
      {domainData && domainData.status === 'pending' && domainData.txtRecord && (
        <div className="space-y-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-yellow-100 p-1">
              <Loader2 className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900">
                Verification Pending
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Add the following TXT record to your domain&apos;s DNS settings:
              </p>
            </div>
          </div>

          <div className="space-y-3 ml-7">
            <div className="rounded bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Record Type
                  </Label>
                  <p className="font-mono text-sm">TXT</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Name/Host
                  </Label>
                  <p className="font-mono text-sm break-all">
                    {domainData.txtRecord.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(domainData.txtRecord!.name)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Value
                  </Label>
                  <p className="font-mono text-xs break-all">
                    {domainData.txtRecord.value}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(domainData.txtRecord!.value)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-yellow-700 space-y-1">
              <p className="font-medium">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Log in to your domain registrar (GoDaddy, Namecheap, etc.)</li>
                <li>Go to DNS settings or DNS management</li>
                <li>Add a new TXT record with the name and value above</li>
                <li>Wait 5-10 minutes for DNS propagation</li>
                <li>Click &quot;Check Verification&quot; below</li>
              </ol>
            </div>

            {domainData.errors && domainData.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside text-xs">
                    {domainData.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleCheckStatus}
              disabled={checking}
              variant="outline"
              className="w-full"
            >
              {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Verification
            </Button>
          </div>
        </div>
      )}

      {/* Verification Success */}
      {domainData && domainData.status === 'verified' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Domain verified successfully!</strong>
            <br />
            Your site is now accessible at{' '}
            <a
              href={`https://${domainData.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {domainData.domain}
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
