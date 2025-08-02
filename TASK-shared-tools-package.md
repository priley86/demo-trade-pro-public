# TASK: Create Shared Tools Package for MCP and AI SDK v5

**Objective:** Design and implement a shared tools package at `packages/tools` that provides a unified interface for tool definitions compatible with both Model Context Protocol (MCP) servers and Vercel AI SDK v5 agents.

## 📚 Must Reference Documentation

**Primary References (Study These First):**
- **[Model Context Protocol SDK](https://modelcontextprotocol.io/sdk/server)** - Server implementation patterns
- **[Zod Schema Validation](https://zod.dev/)** - Type-safe schema definitions
- **[Vercel AI SDK v5](https://sdk.vercel.ai/)** - Tool definitions and integration

**Secondary References:**
- [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema) - Converting Zod to JSON Schema for MCP
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Advanced types and module design

---

## 🏗️ Package Architecture

### **Core Design Principle**
> **Single Source of Truth:** One Zod schema definition → Two different implementations (AI SDK native vs MCP JSON Schema)

### **Required Directory Structure**
```
packages/tools/
├── package.json                 # Dependencies: zod, zod-to-json-schema
├── tsconfig.json               # TypeScript config
├── src/
│   ├── index.ts                # Main exports
│   ├── schemas/                # Zod tool schemas
│   │   ├── portfolio.ts        # Portfolio management tools
│   │   ├── stocks.ts           # Stock data tools  
│   │   ├── orders.ts           # Trading order tools
│   │   └── index.ts            # Schema exports
│   ├── types/                  # Shared TypeScript types
│   │   ├── api.ts              # DemoTradePro API types
│   │   └── tools.ts            # Tool interface types
│   ├── adapters/               # Framework-specific adapters
│   │   ├── ai-sdk.ts           # AI SDK v5 tool factory
│   │   ├── mcp.ts              # MCP tool factory
│   │   └── index.ts            # Adapter exports  
│   └── utils/
│       ├── api-client.ts       # Shared API utilities
│       └── validation.ts       # Common validation helpers
```

---

## 🔧 Implementation Requirements

### **1. Zod Schema Design**
Each tool must have a Zod schema that includes:
- Parameter validation with proper types
- Rich descriptions for AI understanding
- Type inference for TypeScript
- JSON Schema compatibility via zod-to-json-schema

**Example Schema Pattern:**
```typescript
// packages/tools/src/schemas/portfolio.ts
import { z } from 'zod'

export const GetPortfolioSchema = z.object({
  userId: z.string().describe('User ID to fetch portfolio for'),
  includeHistory: z.boolean().optional().describe('Include historical performance data')
})

export type GetPortfolioParams = z.infer<typeof GetPortfolioSchema>
```

### **2. AI SDK v5 Adapter**
Convert Zod schemas to AI SDK tool format:
```typescript
// packages/tools/src/adapters/ai-sdk.ts
import { tool } from 'ai'
import type { ZodSchema } from 'zod'

export function createAISDKTool<T extends ZodSchema>(
  name: string,
  schema: T, 
  execute: (params: z.infer<T>) => Promise<any>
) {
  return tool({
    description: `${name} tool for DemoTradePro`,
    parameters: schema,
    execute
  })
}
```

### **3. MCP Adapter** 
Convert Zod schemas to MCP tool format:
```typescript
// packages/tools/src/adapters/mcp.ts
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { ZodSchema } from 'zod'

export function createMCPTool<T extends ZodSchema>(
  name: string,
  description: string,
  schema: T,
  handler: (params: z.infer<T>) => Promise<any>
) {
  return {
    name,
    description,
    inputSchema: zodToJsonSchema(schema),
    handler
  }
}
```

### **4. Required DemoTradePro Tools**
Implement these specific tools with proper schemas:

**Portfolio Tools:**
- **`getPortfolio`** - Fetch user portfolio holdings
- **`getPortfolioHistory`** - Get historical performance data

**Stock Tools:**
- **`getStockPrice`** - Get current stock price by symbol  
- **`getStockInfo`** - Get detailed stock information
- **`searchStocks`** - Search stocks by name/symbol

**Order Tools:**
- **`getOrderHistory`** - Fetch user's trading history
- **`getOrderStatus`** - Check specific order status
- **`createOrder`** - Place new trading order (write operation)
- **`cancelOrder`** - Cancel existing order

Each tool should have:
- Proper Zod schema with validation
- TypeScript types
- Both AI SDK and MCP adapters
- JSDoc documentation

---

## 🚀 Package Configuration

### **package.json Structure**
```json
{
  "name": "@workspace/tools",
  "version": "1.0.0", 
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./schemas": "./dist/schemas/index.js",
    "./adapters": "./dist/adapters/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.25.0",
    "zod-to-json-schema": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🎯 DemoTradePro API Integration

### **API Base URL**
Tools should connect to: `http://localhost:3001/api`

### **Required Endpoints Integration**
- `GET /portfolio` - Portfolio data
- `GET /stocks` - Stock listings  
- `GET /stocks/:symbol` - Stock details
- `GET /orders` - Order history
- `POST /orders` - Create order
- `DELETE /orders/:id` - Cancel order

### **Error Handling**
All tools must handle:
- Network errors
- API authentication errors
- Invalid parameters
- Rate limiting

---

## ✅ Success Criteria

**The package is complete when:**

1. **Schema Reusability** - Same Zod schema works in both AI SDK and MCP contexts
2. **Type Safety** - Full TypeScript support with proper inference
3. **Easy Integration** - Simple imports in both `apps/agent` and `apps/mcp-server`
4. **Documentation** - JSDoc comments on all exported functions
5. **Validation** - Runtime validation works consistently across frameworks
6. **Build System** - TypeScript compilation to dist/ folder works
7. **Exports** - All required tools exported from main index

**Test Integration Examples:**

**AI SDK Agent Usage:**
```typescript
// apps/agent/app/api/chat/route.ts
import { createPortfolioTool } from '@workspace/tools/adapters/ai-sdk'

const portfolioTool = createPortfolioTool(async (params) => {
  // Implementation
})
```

**MCP Server Usage:**
```typescript
// apps/mcp-server/src/server.ts  
import { createPortfolioMCPTool } from '@workspace/tools/adapters/mcp'

const portfolioMCPTool = createPortfolioMCPTool('getPortfolio', async (params) => {
  // Implementation  
})
```

---

## 🎯 Workshop Integration Context

This shared package demonstrates:
- **Architecture best practices** - Shared contracts between systems
- **Security patterns** - Same schema, different auth implementations  
- **DRY principles** - Write once, use everywhere
- **Type safety** - Compile-time guarantees across frameworks
- **Enterprise patterns** - Tool sharing in production environments

The package showcases enterprise-grade tool sharing while maintaining focus on security patterns for the workshop's pedagogical goals.

---

## 🚨 Important Notes

1. **Monorepo Setup** - This package must work within the existing PNPM workspace
2. **No Authentication** - Tools should not handle auth directly (that's for the consuming apps)
3. **Error Consistency** - All tools should have consistent error handling patterns
4. **Documentation** - Each tool needs clear JSDoc with examples
5. **Testing** - Consider adding unit tests for critical functions

**Priority:** HIGH - This package blocks both MCP server and advanced agent development.
