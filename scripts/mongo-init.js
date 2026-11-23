// MongoDB initialization script for local development
db = db.getSiblingDB('jurismind_dev');

db.createCollection('users');
db.createCollection('documents');
db.createCollection('document_chunks');
db.createCollection('analyses');
db.createCollection('analysis_clauses');
db.createCollection('comparisons');
db.createCollection('conversations');
db.createCollection('messages');
db.createCollection('clause_library');

print('JurisMind Dev DB initialized successfully.');
