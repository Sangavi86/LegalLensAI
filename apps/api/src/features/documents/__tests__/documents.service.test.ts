import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../service';

describe('DocumentService Utility Methods', () => {
  it('should compute SHA-256 file hash correctly', () => {
    const buffer = Buffer.from('JurisMind AI Legal Intelligence Test Document', 'utf-8');
    const hash = DocumentService.computeFileHash(buffer);
    assert.ok(hash);
    assert.equal(hash.length, 64); // SHA-256 hex string length
  });

  it('should sanitize filename removing directory traversal characters', () => {
    const unsafeFilename = '../../../etc/passwd_contract.pdf';
    const sanitized = DocumentService.sanitizeFilename(unsafeFilename);
    assert.equal(sanitized, 'passwd_contract.pdf');
    assert.ok(!sanitized.includes('..'));
    assert.ok(!sanitized.includes('/'));
  });

  it('should preserve legitimate filenames', () => {
    const validFilename = 'Employment_Agreement_2026.docx';
    const sanitized = DocumentService.sanitizeFilename(validFilename);
    assert.equal(sanitized, 'Employment_Agreement_2026.docx');
  });
});
