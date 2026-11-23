# LegalLens AI – Architectural Decision Records (ADRs)
**Document Version:** 1.0.0  
**Status:** Approved with Technical Refinements  
**Architect:** Principal Software Architect & AI Research Engineer  

---

## Index of Architectural Decision Records

- [ADR-001: Modular Monorepo Architecture vs Premature Distributed Microservices](#adr-001-modular-monorepo-architecture-vs-premature-distributed-microservices)
- [ADR-002: Model Abstraction Layer & Configurable Task-Specific LLM Routing](#adr-002-model-abstraction-layer--configurable-task-specific-llm-routing)
- [ADR-003: Node.js 22/24 LTS with TypeScript for the Application Gateway](#adr-003-nodejs-2224-lts-with-typescript-for-the-application-gateway)
- [ADR-004: Decoupled Explainable AI (Structured Feature ML Model + TreeSHAP vs Generative Narrative)](#adr-004-decoupled-explainable-ai-structured-feature-ml-model--treeshap-vs-generative-narrative)
- [ADR-005: Probabilistic NLI as Supporting Verification Signal with Explicit Abstention](#adr-005-probabilistic-nli-as-supporting-verification-signal-with-explicit-abstention)
- [ADR-006: Sovereign Official Legal Data Sources vs Commercial Scraping](#adr-006-sovereign-official-legal-data-sources-vs-commercial-scraping)
- [ADR-007: Defense-in-Depth Document Ingress Security (ClamAV, Magic Bytes, Ephemeral Isolation)](#adr-007-defense-in-depth-document-ingress-security-clamav-magic-bytes-ephemeral-isolation)
- [ADR-008: Idempotent API Operations via Redis Distributed Locking](#adr-008-idempotent-api-operations-via-redis-distributed-locking)
- [ADR-009: End-to-End Tracing, Token Telemetry, and Versioned Prompts](#adr-009-end-to-end-tracing-token-telemetry-and-versioned-prompts)
- [ADR-010: Design and Creation of the Expert-Annotated `LegalLens-Risk-IN` Benchmark Dataset](#adr-010-design-and-creation-of-the-expert-annotated-legallens-risk-in-benchmark-dataset)

---

### ADR-001: Modular Monorepo Architecture vs Premature Distributed Microservices
- **Context:** Building a 6-agent system with React, Express, FastAPI, Celery, and polyglot databases risks overwhelming developer productivity if deployed immediately as 10+ distributed Kubernetes microservices.
- **Decision:** Adopt a **Modular Monorepo** (pnpm workspaces / clean project layout) with strictly isolated application boundaries (`apps/web`, `apps/api-gateway`, `apps/ai-engine`, `packages/shared-types`). Each module defines strict API contracts and typed data models. In development and initial deployment, services communicate over defined internal networks. They can be broken out into standalone containerized services seamlessly without code refactoring when scaling demands dictate.
- **Consequences:** Maximizes iteration speed, simplifies cross-boundary type sharing and local integration testing, and prevents premature network distributed-system failures.

---

### ADR-002: Model Abstraction Layer & Configurable Task-Specific LLM Routing
- **Context:** Hardcoding specific model versions creates vendor lock-in, risks API deprecation breakages, and prevents using specialized models for distinct cognitive tasks.
- **Decision:** Implement a unified `ModelProvider` abstraction layer (`BaseLLMClient`, with adapters for `GoogleGenAIClient`, `OpenAIClient`, `AnthropicClient`, and `LocalHFClient`). Model IDs are strictly injected via environment variables and configured per cognitive task:
  - `LLM_MODEL_EXTRACTION`: High-speed, high-context model (e.g., `gemini-2.5-flash` / `gemini-2.0-flash` or compatible).
  - `LLM_MODEL_RESEARCH`: Structured JSON query synthesis model.
  - `LLM_MODEL_VERIFICATION`: Adversarial evaluation model.
  - `LLM_MODEL_REASONING`: Deep multi-step reasoning model (e.g., `gemini-2.5-pro` or compatible).
- **Consequences:** Seamless fallback between providers; zero code modification when upgrading foundation models; granular cost and latency optimization per agent.

---

### ADR-003: Node.js 22/24 LTS with TypeScript for the Application Gateway
- **Context:** The Express gateway handles edge authentication, document streaming, WebSockets, rate limiting, and business validation. Node.js 20 will transition out of active LTS; modern enterprise standards demand the current or verified active LTS (Node.js 22 LTS or Node.js 24 LTS) and strict static typing.
- **Decision:** Standardize the API Gateway on **Node.js 22/24 LTS** written completely in **TypeScript 5.x** with strict type checking (`strict: true`), using Zod for runtime input validation and shared type packages synchronized with Python Pydantic models.
- **Consequences:** Long-term runtime stability, modern V8 engine performance optimizations, enhanced security patch support, and end-to-end compile-time type safety.

---

### ADR-004: Decoupled Explainable AI (Structured Feature ML Model + TreeSHAP vs Generative Narrative)
- **Context:** Applying SHAP directly to arbitrary autoregressive generative LLMs is computationally intractable (requiring thousands of LLM inference calls per token) and yields mathematically ill-defined Shapley values.
- **Decision:** Decouple qualitative legal reasoning from quantitative risk explanation:
  1. **Quantitative Risk Predictor:** A dedicated structured machine learning model (e.g., LightGBM / XGBoost) trained on engineered legal contract features (clause type, liability cap multiplier, unilateral termination flags, indemnity scope, non-compete durations, cross-jurisdiction divergence, ambiguity entropy).
  2. **Mathematically Rigorous SHAP:** Apply **TreeSHAP** to this predictive model to compute exact Shapley feature attributions with sub-second latency.
  3. **Qualitative Legal Narrative:** The LLM generates IRAC legal rationale, strictly referencing the exact evidentiary tokens and statutory sections identified.
- **Consequences:** True mathematical explainability that satisfies judicial and audit scrutiny, sub-second explanation generation, and zero LLM hallucination in quantitative feature importance weights.

---

### ADR-005: Probabilistic NLI as Supporting Verification Signal with Explicit Abstention
- **Context:** Natural Language Inference (NLI) entailment scores (e.g. $P(\text{entailment}) \ge 0.70$) cannot be treated as deterministic mathematical proof of legal truth. Legal interpretation is nuanced and contextual.
- **Decision:** 
  1. Treat NLI output strictly as a **probabilistic supporting verification signal**.
  2. Calibrate decision thresholds using isotonic regression / Platt scaling over expert-annotated legal entailment pairs.
  3. Implement an explicit **Abstention State (`ABSTAIN / INSUFFICIENT_EVIDENCE`)** when retrieved context is ambiguous, confidence is low, or statutory authorities conflict.
  4. Expand precedent status tracking to verify four distinct judicial treatments: `OVERRULED`, `REVERSED`, `DISTINGUISHED`, and `MODIFIED`.
- **Consequences:** Prevents false confidence; alerts legal counsel when automated verification is uncertain; maintains high precision over blind recall.

---

### ADR-006: Sovereign Official Legal Data Sources vs Commercial Scraping
- **Context:** Commercial legal databases (such as SCC Online, Manupatra, or AIR) are protected by copyright, database rights, and strict terms of service prohibiting automated scraping or redistribution.
- **Decision:** Legally ground all statutory and case law corpora exclusively in **sovereign, open, public domain Indian government repositories**:
  - **India Code Portal (`indiacode.nic.in`):** Authoritative repository of all Central and State Acts.
  - **The Gazette of India (`egazette.gov.in`):** Enacted statutory amendments, notifications, and rules.
  - **Supreme Court Digital Reports (`digiscr.sci.gov.in`):** Official Supreme Court Reports (SCR) with neutral citations.
  - **High Court Repositories (`judgments.ecourts.gov.in`):** Official e-Courts records.
  Commercial citations (SCC, AIR) are supported strictly as standardized text cross-reference aliases without redistributing proprietary headnotes or copyrighted editorial text.
- **Consequences:** 100% legal compliance, zero intellectual property exposure, and authoritative statutory ground truth.

---

### ADR-007: Defense-in-Depth Document Ingress Security (ClamAV, Magic Bytes, Ephemeral Isolation)
- **Context:** Adversaries can upload weaponized PDFs, macro-enabled files, decompression bombs, or malicious indirect prompt injection payloads.
- **Decision:** Implement a multi-layered ingress sanitization pipeline:
  1. **File Signature Validation:** Verify real file magic numbers using `file-type` (rejecting spoofed extensions).
  2. **Anti-Malware Scanning:** Stream files through a ClamAV anti-virus daemon before disk persistence.
  3. **Secure Ephemeral Storage:** Temp files reside in restricted POSIX/NTFS directories (`0700`) with automatic shredding/erasure.
  4. **Per-Tenant & Per-User ABAC:** Fine-grained authorization on every document resource.
  5. **Boundary Isolation:** XML containment tags (`<untrusted_document_content>`) and dual-LLM prompt scanning.
- **Consequences:** Comprehensive protection against system compromise, malware distribution, and indirect LLM hijacking.

---

### ADR-008: Idempotent API Operations via Redis Distributed Locking
- **Context:** Large legal documents take seconds or minutes to analyze. Network retries, duplicate clicks, or webhook replay attacks can spawn redundant LLM agent runs, inflating token costs and corrupting analysis states.
- **Decision:** Mandate `Idempotency-Key` headers on all state-mutating endpoints (`/api/v1/documents/upload`, `/api/v1/analysis/start`, `/api/v1/simulate/scenario`). The Express Gateway uses Redis atomic locks (`SETNX` with TTL) to reject or deduplicate concurrent in-flight requests and return cached responses for replayed requests.
- **Consequences:** Prevents duplicate token spend, eliminates race conditions in LangGraph execution, and guarantees safe network retries.

---

### ADR-009: End-to-End Tracing, Token Telemetry, and Versioned Prompts
- **Context:** Multi-agent systems with cyclical loops can become black boxes without rigorous observability, making cost control and error diagnosis difficult.
- **Decision:**
  1. **Distributed Tracing:** Integrate OpenTelemetry / Langfuse instrumentation across Express and FastAPI, tagging every agent execution with `tenant_id`, `session_id`, `agent_name`, and `correlation_id`.
  2. **Granular Cost Accounting:** Record prompt, completion, and total tokens per agent step, calculating estimated USD/INR expenditure in real time.
  3. **Versioned Prompt Registry:** Decouple prompts from application source code into versioned templates (e.g. `risk_assessment_v1.2.yaml`) with semantic version tracking.
- **Consequences:** Complete auditability of agent reasoning, clear cost attribution per tenant, and regression-free prompt evolution.

---

### ADR-010: Proposed Protocol & Experimental Design for the `LegalLens-Risk-IN` Benchmark Dataset
- **Context:** Generic legal benchmarks (CUAD, ContractNLI) focus on American/English law and do not evaluate Indian statutory compliance (e.g. Section 27 Contract Act, DPDP Act 2023, Section 74 damages doctrine).
- **Decision:** Author and design the formal specification for `LegalLens-Risk-IN`: a proposed expert-annotated benchmark dataset targeting 1,500 real-world Indian commercial contract clauses across 7 key risk categories, with a planned double-blind annotation protocol by licensed Indian Advocates. The dataset specification establishes target statutory mappings, severity guidelines, and inter-annotator agreement target metrics ($\kappa \ge 0.80$). It is treated as a proposed research protocol until full expert annotation and adjudication are completed.
- **Consequences:** Establishes a rigorous methodology and target ground-truth standard for Indian legal AI, enabling reproducible academic evaluation and empirical validation upon dataset release.
