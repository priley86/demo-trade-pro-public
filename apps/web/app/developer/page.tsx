import { auth0 } from '@/lib/auth0';
import DeveloperClient from './developer-client';

export default async function DeveloperPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Workshop Developer Tools
                    </h1>
                    <p className="text-lg text-gray-600">
                        Create Auth0 OIDC clients for workshop participants
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-blue-900 mb-3">
                        🔧 Workshop OIDC Setup Generator
                    </h2>
                    <p className="text-blue-800 mb-4">
                        This tool creates Auth0 client applications in the source tenant and generates
                        Terraform configuration for workshop participants to set up OIDC connections.
                    </p>
                    <div className="text-sm text-blue-700">
                        <p><strong>What this generates:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Regular web application in the DemoTradePro source tenant</li>
                            <li>Callback URL configured for participant's destination tenant</li>
                            <li>Terraform <code className="bg-white px-1 rounded text-xs">.tfvars</code> configuration file</li>
                            <li>Ready-to-use Infrastructure as Code setup</li>
                        </ul>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-700">
                        🎡 <strong>New Approach:</strong> Instead of manual CLI commands, participants get a complete
                        Terraform configuration that they can apply with a single script: <code>./add-oidc-connection.sh</code>
                    </div>
                </div>

                <DeveloperClient />

                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        📋 Participant Workflow (Infrastructure as Code)
                    </h3>
                    <div className="text-sm text-gray-700 space-y-3">
                        <p>The new streamlined workflow for workshop participants:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-4">
                            <li><strong>Generate configuration:</strong> Use the tool above to get their Terraform config</li>
                            <li><strong>Add to project:</strong> Copy the <code className="bg-white px-1 rounded text-xs">terraform.tfvars</code> content to their agent project</li>
                            <li><strong>Apply infrastructure:</strong> Run <code className="bg-white px-1 rounded text-xs">./add-oidc-connection.sh</code> in their <code className="bg-white px-1 rounded text-xs">auth0-agent</code> directory</li>
                            <li><strong>Test connection:</strong> Login to their agent application with OIDC</li>
                        </ol>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-yellow-800 text-xs">
                                📚 <strong>Educational Value:</strong> Participants learn proper Infrastructure as Code patterns
                                while setting up secure Auth0 federation with Token Vault.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
