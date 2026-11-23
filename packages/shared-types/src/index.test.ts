import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DocumentMetadataSchema,
  ContractClauseSchema,
  RiskFindingSchema,
  HealthCheckResponseSchema,
  StatutoryReferenceSchema,
} from './index.js';

test('HealthCheckResponseSchema validates healthy response', () => {
  const payload = {
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    uptime: 42.5,
    timestamp: new Date().toISOString(),
    environment: 'development',
  };
  const result = HealthCheckResponseSchema.safeParse(payload);
  assert.equal(result.success, true);
});

test('DocumentMetadataSchema validates valid contract metadata', () => {
  const doc = {
    documentId: 'doc_123',
    tenantId: 'tenant_abc',
    uploaderUserId: 'user_456',
    title: 'Master Services Agreement 2026',
    originalFilename: 'msa_2026.pdf',
    declaredMimeType: 'application/pdf',
    detectedMagicMime: 'application/pdf',
    fileSizeBytes: 102450,
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    storageUri: 's3://vault/tenant_abc/msa_2026.pdf',
    documentType: 'CONTRACT_MSA',
    jurisdiction: 'IN',
    malwareScan: { status: 'CLEAN', engine: 'ClamAV' },
    ocrStatus: 'COMPLETED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = DocumentMetadataSchema.safeParse(doc);
  assert.equal(result.success, true);
});

test('StatutoryReferenceSchema rejects invalid official source URL', () => {
  const ref = {
    statuteCode: 'IN_CONTRACT_1872',
    actTitle: 'The Indian Contract Act, 1872',
    sectionNumber: '27',
    exactTextExcerpt: 'Agreement in restraint of trade void',
    officialSourceUrl: 'not-a-valid-url',
  };
  const result = StatutoryReferenceSchema.safeParse(ref);
  assert.equal(result.success, false);
});
