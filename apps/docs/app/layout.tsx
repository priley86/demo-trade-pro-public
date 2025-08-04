import './globals.css'

export const metadata = {
  title: 'Stock Agent Workshop',
  description: 'AI Agents that Interact with the World Around Them',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <nav className="w-64 bg-gray-50 border-r border-gray-200 p-6">
            <h1 className="text-lg font-bold mb-6">Auth0 AI Workshop</h1>
            <ul className="space-y-2">
              <li><a href="/" className="block py-2 px-3 rounded hover:bg-gray-100">Welcome</a></li>
              <li><a href="/setup" className="block py-2 px-3 rounded hover:bg-gray-100">1. Local Setup</a></li>
              <li><a href="/add-tools" className="block py-2 px-3 rounded hover:bg-gray-100">2. Add Public Tools</a></li>
              <li><a href="/add-auth" className="block py-2 px-3 rounded hover:bg-gray-100">3. Add Authentication</a></li>
              <li><a href="/add-authenticated-tools" className="block py-2 px-3 rounded hover:bg-gray-100">4. Add Portfolio Tools</a></li>
              {/* 
                For our workshop in berkeley disable the mcp-server part for now
              
                <li><a href="/token-vault" className="block py-2 px-3 rounded hover:bg-gray-100 text-orange-700">🔒 Token Vault Deep-Dive</a></li>
                <li><a href="/mcp" className="block py-2 px-3 rounded hover:bg-gray-100 text-blue-700">⚡ MCP Integration</a></li> 
                
              */}
            </ul>
          </nav>
          
          {/* Main content */}
          <main className="flex-1 p-8 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
