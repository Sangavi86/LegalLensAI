import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documentListQuerySchema, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from '../schema';

describe('Document Validation Schemas', () => {
  it('should validate allowed extensions and MIME types', () => {
    assert.ok(ALLOWED_EXTENSIONS.includes('pdf'));
    assert.ok(ALLOWED_EXTENSIONS.includes('docx'));
    assert.ok(ALLOWED_EXTENSIONS.includes('txt'));
    assert.ok(ALLOWED_MIME_TYPES.includes('application/pdf'));
  });

  it('should parse valid document query parameters', () => {
    const query = {
      page: '2',
      limit: '20',
      search: 'contract',
      status: 'READY',
      sort: 'createdAt_desc',
    };

    const result = documentListQuerySchema.safeParse(query);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 20);
      assert.equal(result.data.search, 'contract');
      assert.equal(result.data.status, 'READY');
    }
  });

  it('should supply default values for missing query parameters', () => {
    const result = documentListQuerySchema.safeParse({});
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 10);
      assert.equal(result.data.sort, 'createdAt_desc');
    }
  });
});
