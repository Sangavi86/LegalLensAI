import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from './app.js';

test('GET /api/v1/health returns 200 with service health info', async () => {
  const app = createApp();
  const response = await request(app).get('/api/v1/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'healthy');
  assert.equal(response.body.service, 'api-gateway');
  assert.equal(typeof response.body.uptime, 'number');
  assert.equal(typeof response.body.timestamp, 'string');
});

test('GET /api/v1/non-existent returns 404 RFC 7807 problem details', async () => {
  const app = createApp();
  const response = await request(app).get('/api/v1/non-existent');

  assert.equal(response.status, 404);
  assert.equal(response.body.code, 'ENDPOINT_NOT_FOUND');
  assert.equal(response.body.status, 404);
});
