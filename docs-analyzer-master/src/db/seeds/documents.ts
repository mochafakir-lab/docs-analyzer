import { db } from '@/db';
import { documents } from '@/db/schema';

async function main() {
    const sampleDocuments = [
        {
            filename: '7f3a8b9c-4e2d-4a1b-9c8e-f1a2b3c4d5e6.pdf',
            originalName: 'employment_contract_2024.pdf',
            fileSize: 1245760,
            mimeType: 'application/pdf',
            filePath: '/uploads/documents/7f3a8b9c-4e2d-4a1b-9c8e-f1a2b3c4d5e6.pdf',
            status: 'processing',
            uploadDate: new Date('2024-12-15T09:30:00Z').toISOString(),
            createdAt: new Date('2024-12-15T09:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-15T09:30:00Z').toISOString(),
        },
        {
            filename: 'a9b8c7d6-e5f4-3g2h-1i0j-k9l8m7n6o5p4.pdf',
            originalName: 'nda_confidentiality_agreement.pdf',
            fileSize: 756432,
            mimeType: 'application/pdf',
            filePath: '/uploads/documents/a9b8c7d6-e5f4-3g2h-1i0j-k9l8m7n6o5p4.pdf',
            status: 'completed',
            uploadDate: new Date('2024-12-12T14:22:30Z').toISOString(),
            createdAt: new Date('2024-12-12T14:22:30Z').toISOString(),
            updatedAt: new Date('2024-12-12T15:45:12Z').toISOString(),
        },
        {
            filename: 'x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6.pdf',
            originalName: 'professional_services_agreement.pdf',
            fileSize: 1876543,
            mimeType: 'application/pdf',
            filePath: '/uploads/documents/x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6.pdf',
            status: 'completed',
            uploadDate: new Date('2024-12-08T11:15:45Z').toISOString(),
            createdAt: new Date('2024-12-08T11:15:45Z').toISOString(),
            updatedAt: new Date('2024-12-08T16:30:22Z').toISOString(),
        },
        {
            filename: 'p9q8r7s6-t5u4-v3w2-x1y0-z9a8b7c6d5e4.pdf',
            originalName: 'commercial_lease_agreement.pdf',
            fileSize: 987654,
            mimeType: 'application/pdf',
            filePath: '/uploads/documents/p9q8r7s6-t5u4-v3w2-x1y0-z9a8b7c6d5e4.pdf',
            status: 'completed',
            uploadDate: new Date('2024-12-05T16:45:18Z').toISOString(),
            createdAt: new Date('2024-12-05T16:45:18Z').toISOString(),
            updatedAt: new Date('2024-12-06T08:12:33Z').toISOString(),
        },
        {
            filename: 'm6n5o4p3-q2r1-s0t9-u8v7-w6x5y4z3a2b1.pdf',
            originalName: 'business_partnership_agreement.pdf',
            fileSize: 1534876,
            mimeType: 'application/pdf',
            filePath: '/uploads/documents/m6n5o4p3-q2r1-s0t9-u8v7-w6x5y4z3a2b1.pdf',
            status: 'completed',
            uploadDate: new Date('2024-12-02T13:28:55Z').toISOString(),
            createdAt: new Date('2024-12-02T13:28:55Z').toISOString(),
            updatedAt: new Date('2024-12-03T10:15:40Z').toISOString(),
        },
    ];

    await db.insert(documents).values(sampleDocuments);
    
    console.log('✅ Documents seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});