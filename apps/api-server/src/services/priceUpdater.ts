import { db } from '../db/client.js';
import { companies, quotes } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const STALE_THRESHOLD_MS = Number(process.env.PRICE_INTERVAL_MS ?? 10000);

// Simple in-memory cache to prevent excessive updates
let lastUpdateCheck = 0;
const UPDATE_CHECK_INTERVAL = 5000; // Only check for updates every 5 seconds

/**
 * Check if prices are stale and update them if needed
 * Much better architecture than background setInterval!
 */
export async function updateStaleprices() {
  const now = Date.now();
  
  // Only check for updates every 5 seconds to reduce database load
  if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL) {
    return;
  }
  
  lastUpdateCheck = now;
  try {
    // Get all companies with their latest quotes in a single query
    const companiesWithLatestQuotes = await db
      .select({
        companyId: companies.id,
        symbol: companies.symbol,
        latestPrice: quotes.price,
        latestCreatedAt: quotes.createdAt
      })
      .from(companies)
      .leftJoin(quotes, eq(companies.id, quotes.companyId))
      .groupBy(companies.id, companies.symbol, quotes.price, quotes.createdAt)
      .orderBy(companies.symbol);

    // Group by company and find the most recent quote for each
    const latestByCompany = new Map();
    for (const row of companiesWithLatestQuotes) {
      const existing = latestByCompany.get(row.companyId);
      if (!existing || (row.latestCreatedAt && row.latestCreatedAt > existing.latestCreatedAt)) {
        latestByCompany.set(row.companyId, row);
      }
    }

    const now = new Date();
    const updatePromises = [];
    
    for (const [companyId, latest] of latestByCompany) {
      // If no quote exists or quote is stale, generate new price
      if (!latest.latestCreatedAt || now.getTime() - latest.latestCreatedAt.getTime() > STALE_THRESHOLD_MS) {
        const basePrice = Number(latest.latestPrice ?? 100);
        const delta = (Math.random() * 0.1 - 0.05) * basePrice; // ±5% random change
        const newPrice = Math.max(0.01, basePrice + delta); // Don't go below 1 cent
        
        updatePromises.push(
          db.insert(quotes).values({ 
            companyId: companyId, 
            price: newPrice.toFixed(2) 
          })
        );
      }
    }
    
    // Execute all updates in parallel
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Updated prices for ${updatePromises.length} companies`);
    }
  } catch (error) {
    console.error('Failed to update stale prices:', error);
    // Don't throw - this shouldn't break API requests
  }
}
