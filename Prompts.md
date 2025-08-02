# DemoTradePro AI Agent Workshop

**45-minute hands-on workshop building secure AI agents with authentication**

## 🎯 Workshop Flow (Source of Truth)

| Step | Time | Focus | Status |
|------|------|-------|---------|
| **Setup** | 8 min | Bootstrap Auth0, start template agent | ✅ Docs complete |
| **Add Public Tools** | 12 min | Stock price fetching (getStockPrice, searchStocks, getStockInfo) | ✅ Docs complete |
| **Add Authentication** | 10 min | Auth0 user identity + server-side protection | ✅ Docs complete |
| **Add Authorized Tools** | 15 min | Portfolio & order tools with delegated tokens | ✅ Docs complete |

## 🏗️ Architecture

**Apps (all documented):**
- `apps/web` - DemoTradePro platform (Next.js, :3000)
- `apps/api-server` - Protected APIs (Hono, :3001)
- `apps/agent` - **Template agent** with AI SDK v5 (:3003)
- `apps/mcp-server` - Tool sharing (Hono, :3004)
- `apps/docs` - Workshop docs (Next.js, :3002)

**Security Stack:**
- **Auth0 Token Vault** (native OBO, not custom service)
- **Agent tenant** from auth0.com/ai (auto-enables Token Vault)
- **Model Context Protocol** for secure tool sharing
- **5-minute scoped tokens** (not root keys)



## 📚 All Documentation Complete

**Inline copy-paste approach with enhanced docs:**
- ✅ `setup/page.mdx` - Bootstrap Auth0, start all services
- ✅ `add-tools/page.mdx` - Public stock tools (clean tools config approach)
- ✅ `add-auth/page.mdx` - Auth0 authentication (middleware + server-side protection)
- ✅ `add-authenticated-tools/page.mdx` - Portfolio & order tools (delegated tokens)
- ✅ **Copy-paste buttons** on all code blocks
- ✅ **Mermaid diagrams** for architecture flows

## 🎨 Key Decisions

**Architecture Patterns:**
- ✅ **Clean tools configuration** - Centralized `tools.ts` file approach
- ✅ **Server-side auth** - `withPageAuthRequired` + API route protection
- ✅ **Defense in depth** - Middleware + page + API authentication
- ✅ **Shared tools package** - `@workspace/agent-utils` for DRY principles
- ✅ **Progressive complexity** - Public tools → Auth → Authenticated tools

**Security Patterns:**
- ❌ M2M root keys → ✅ Delegated access tokens
- ❌ Client-side auth → ✅ Server-side session validation
- ❌ Direct API calls → ✅ Centralized API client with auth
- ❌ Long-lived tokens → ✅ 5-minute scoped

**Teaching Flow:**
- Start with working foundation (template agent)
- Show dangerous patterns (live demo only)
- Implement enterprise solutions (Token Vault, MCP)
- "Other AIs can use your secure MCP server!" 🤯

## 🚀 Implementation Status

**Ready:**
- All workshop documentation with copy-paste snippets
- Template agent concept designed
- Security architecture finalized

**Next:**
- Create git checkpoint branches
- End-to-end testing
- Live demo script for root keys

---

*Perfect pedagogical flow: Foundation → Security → Scale*
