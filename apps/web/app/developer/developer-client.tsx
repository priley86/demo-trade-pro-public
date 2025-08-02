'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

interface WorkshopClient {
  client_id: string;
  client_secret: string;
  tenant_domain: string;
  callback_url: string;
  name: string;
  tfvars_content: string;
}

export default function DeveloperClient() {
  const [tenantDomain, setTenantDomain] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WorkshopClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/developer/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantDomain,
          participantName: participantName || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      if (data.success) {
        setResult(data.data);
        // Clear form after success
        setTenantDomain('');
        setParticipantName('');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Workshop Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="tenantDomain" className="block text-sm font-medium text-gray-700 mb-2">
                Participant's Auth0 Tenant Domain *
              </label>
              <input
                type="text"
                id="tenantDomain"
                value={tenantDomain}
                onChange={(e) => setTenantDomain(e.target.value)}
                placeholder="participant-name.us.auth0.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: alice-workshop.us.auth0.com
              </p>
            </div>

            <div>
              <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-2">
                Participant Name (Optional)
              </label>
              <input
                type="text"
                id="participantName"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Alice Johnson"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for client naming - makes it easier to identify in Auth0 dashboard
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !tenantDomain}
              className="w-full"
            >
              {isLoading ? 'Creating Client...' : 'Create Workshop Client'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <span>✅</span>
              <span>Workshop Client Created Successfully!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <div className="bg-white p-3 rounded border">
                  <Badge variant="outline">{result.name}</Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Domain</label>
                <div className="bg-white p-3 rounded border flex items-center justify-between">
                  <code className="text-sm">{result.tenant_domain}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.tenant_domain)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
                <div className="bg-white p-3 rounded border flex items-center justify-between">
                  <code className="text-sm">{result.callback_url}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.callback_url)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <div className="bg-white p-3 rounded border flex items-center justify-between">
                  <code className="text-sm font-mono break-all">{result.client_id}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.client_id)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <div className="bg-white p-3 rounded border flex items-center justify-between">
                  <code className="text-sm font-mono break-all">{result.client_secret}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.client_secret)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Terraform Configuration */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Terraform Configuration</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.tfvars_content)}
                >
                  Copy All
                </Button>
              </div>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto font-mono whitespace-pre-wrap">
                {result.tfvars_content}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-900 mb-2">🚀 Next Steps for Participant</h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>
                  <strong>Copy the Terraform configuration</strong> above to their 
                  <code className="bg-white px-1 rounded text-xs ml-1">auth0-agent/terraform/terraform.tfvars</code> file
                </li>
                <li>
                  <strong>Run the setup script:</strong>
                  <code className="bg-white px-2 py-1 rounded text-xs ml-2 block mt-1">cd auth0-agent && ./add-oidc-connection.sh</code>
                </li>
                <li>
                  <strong>Test the OIDC connection</strong> by logging into their agent application
                </li>
              </ol>
              <div className="mt-3 p-3 bg-blue-100 rounded text-xs text-blue-700">
                💡 <strong>Infrastructure as Code:</strong> The OIDC connection will be managed through Terraform, 
                making it easy to destroy and recreate as needed during the workshop.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
