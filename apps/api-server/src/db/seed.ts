import { db } from './client.js';
import { companies, quotes } from './schema.js';

const initialCompanies = [
  { symbol: 'WAYNE', name: 'Wayne Enterprises' },
  { symbol: 'STARK', name: 'Stark Industries' },
  { symbol: 'LEX', name: 'LexCorp' },
  { symbol: 'OSC', name: 'Oscorp' }
];

async function main() {
  try {
    console.log('Seeding database...');
    
    for (const c of initialCompanies) {
      const existing = await db.query.companies.findFirst({ 
        where: (row, { eq }) => eq(row.symbol, c.symbol) 
      });
      
      if (!existing) {
        const [company] = await db.insert(companies).values(c).returning();
        await db.insert(quotes).values({ companyId: company.id, price: '100.00' });
        console.log(`Added company: ${c.symbol}`);
      } else {
        console.log(`Company ${c.symbol} already exists`);
      }
    }
    
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
