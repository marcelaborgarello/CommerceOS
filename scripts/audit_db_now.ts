
import prisma from '../src/lib/db';

async function main() {
    console.log('🔍 FULL DATABASE AUDIT 🔍');

    // 1. Orgs
    const orgs = await prisma.organization.findMany();
    console.log(`🏢 Organizations: ${orgs.length}`);
    orgs.forEach(o => console.log(`   - ${o.id} (${o.name})`));

    // 2. Sessions
    const sessions = await prisma.cashSession.findMany();
    console.log(`📦 Cash Sessions: ${sessions.length}`);
    sessions.forEach(s => console.log(`   - ${s.id} | Date: ${s.date} | Status: ${s.status}`));

    // 3. Sales
    const sales = await prisma.sale.findMany({ include: { items: true } });
    console.log(`💰 Sales: ${sales.length}`);
    if (sales.length === 0) console.log('   ⚠️ NO SALES FOUND');
    sales.forEach(s => {
        console.log(`   - ID: ${s.id}`);
        console.log(`     Type: ${s.type} | Num: ${s.pointOfSale}-${s.number}`);
        console.log(`     Status: ${s.status} | Amount: ${s.amount}`);
        console.log(`     Items: ${s.items.length}`);
        console.log(`     Org: ${s.organizationId} | Session: ${s.cashSessionId}`);
        console.log('---');
    });

    // 4. Sequences
    const seqs = await prisma.documentSequence.findMany();
    console.log(`🔢 Sequences: ${seqs.length}`);
    seqs.forEach(s => console.log(`   - ${s.type} (POS ${s.pointOfSale}): Current ${s.currentNumber}`));

}

main()
    .catch(e => console.error(e));
