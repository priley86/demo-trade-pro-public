import { db } from '../db/client.js';
import { companies, quotes } from '../db/schema.js';

const interval = Number(process.env.PRICE_INTERVAL_MS ?? 10000);

export function startPriceGenerator() {
  setInterval(async () => {
    const now = new Date();
    const allCompanies = await db.select().from(companies);

    for (const company of allCompanies) {
      const latest = await db.query.quotes.findFirst({
        where: (row, { eq }) => eq(row.companyId, company.id),
        orderBy: (row, { desc }) => [desc(row.createdAt)]
      });

      if (!latest || now.getTime() - latest.createdAt.getTime() > interval) {
        const delta = (Math.random() * 0.1 - 0.05) * Number(latest?.price ?? 100);
        const newPrice = Number(latest?.price ?? 100) + delta;
        await db.insert(quotes).values({ companyId: company.id, price: newPrice.toFixed(2) });
      }
    }
  }, interval);
}
