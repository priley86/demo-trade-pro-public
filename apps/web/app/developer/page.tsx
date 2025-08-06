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

                <DeveloperClient />
            </div>
        </div>
    );
}
