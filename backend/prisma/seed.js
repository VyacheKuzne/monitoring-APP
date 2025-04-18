"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.company.createMany({
        data: [
            { name: 'ООО "Лес"' },
            { name: 'АО "Бабуины"' },
            { name: 'ИП "Балабол"' },
            { name: 'АО "Арбидол"' },
            { name: 'ИП "Казахстан"' },
        ],
    });
    await prisma.server.createMany({
        data: [
            {
                parentCompany: 1,
                ipAddress: '192.168.3.124',
                hostname: 'forest.com',
                location: 'Bangladesh',
                os: 'Microsoft Linux',
            },
        ],
    });
    console.log('✅ Seed data inserted successfully');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map