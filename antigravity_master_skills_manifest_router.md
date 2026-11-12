# Antigravity IDE — Master Skills Manifest, MCP Web Extensibility & Autonomous Router

> **AGENT SYSTEM DIRECTIVE:**
>
> You are operating inside **Google Antigravity** (`agy` CLI / Antigravity IDE). Before writing application code or scaffolding modules for the user's project, you **MUST** parse the user's project requirements against this manifest, ensure all **\[MANDATORY\]** skills and **Free MCP Servers** are installed and active, dynamically install all matching **\[CONDITIONAL\]** skills into `<workspace-root>/.agents/skills/`, provision `<workspace-root>/.agents/mcp_config.json`, build the local codebase AST graph, and execute the workflow using the prescribed skill and MCP triggers.

## 1. Autonomous Agent Execution Protocol

Whenever a new project or multi-module feature is requested, follow this exact 6-step bootstrap sequence:

1. **Requirement Decomposition:** Analyze the user's prompt and break the system down into active domains (e.g., *Marketing Landing Page, Next.js/React Dashboard, FastAPI/Node Microservices, PostgreSQL + Redis Data Layer, Hybrid RAG / Multi-Agent MCP Layer, E2E Playwright Suite, AWS Terraform/ECS/EKS Deployment*).
2. **Mandatory Baseline Check (Tier 0):** Verify that all **\[MANDATORY\]** skills in **Tier 0** are installed and initialized. Never skip Tier 0 skills—they govern codebase AST mapping, token efficiency, spec-driven planning, and security.
3. **Free MCP Web Extensibility Check (Tier 7):** Ensure `<workspace-root>/.agents/mcp_config.json` (or global `~/.gemini/config/mcp_config.json`) is configured with the free MCP servers (`context7`, `deepwiki`, `fetch`, `playwright`, `chrome-devtools`, `awslabs.aws-documentation-mcp-server`, and `awslabs.terraform-mcp-server`). Use `/mcp` in the Antigravity CLI or the IDE MCP Store to verify active connections.
4. **Dynamic Skill Selection (Tiers 1–6):** Inspect the Routing Matrix in **Section 10** and select every skill and MCP tool that matches the project's tech stack and architectural requirements.
5. **Automated Skill Installation & Audit:** Run the installation commands for any missing required skills using the `-a antigravity` flag, then run `uvx mcp-scan@latest --skills` to verify skill and MCP integrity.
6. **Graph-First, Docs-First & Spec-First Execution:**
   * Run `graphify .` and `code-review-graph build` to index the workspace.
   * Query `context7` and `deepwiki` MCP servers to pull live, version-accurate documentation before writing integration code.
   * Trigger `/brainstorming` and `/write-plan` (from `superpowers`) to lock in architecture specs before writing implementation code.
   * For UI work, run `ui-ux-pro-max` first to generate the master design system (`design-system/MASTER.md`) before writing any frontend components.

## 2. Tier 0 — Core Intelligence, Workflow & Security \[MANDATORY FOR ALL PROJECTS\]

These skills **must** be imported and active on every project regardless of tech stack. They minimize token usage, prevent hallucinated imports across modules, enforce Test-Driven Development (TDD), and secure the repository.

### 2.1 `graphify` — AST Knowledge Graph & Token Optimizer

* **Status:** `[MANDATORY]`
* **Repository:** `Graphify-Labs/graphify`
* **Use Case:** Parses code, SQL schemas, API contracts, and documentation using local `tree-sitter` AST passes into a queryable knowledge graph. Cuts agent input token usage by up to 80% on multi-module repositories.
* **When Agent Must Use It:** At project initialization, after scaffolding new modules, and before any cross-module refactoring.
* **Antigravity Setup Command:**
  ```bash
  uv tool install graphifyy && uv tool update-shell
  graphify antigravity install
  graphify .
  ```
* **Agent Trigger:** `/graphify .` or query `graphify-out/GRAPH_REPORT.md` before reading raw directories.

### 2.2 `superpowers` — Spec-Driven Engineering & Subagent TDD Loop

* **Status:** `[MANDATORY]`
* **Repository:** `obra/superpowers`
* **Use Case:** Orchestrates the entire software lifecycle through structured phases: interactive design specs (`brainstorming`), granular implementation plans (`writing-plans`), isolated parallel branches (`using-git-worktrees`), subagent execution (`subagent-driven-development`), strict TDD (`test-driven-development`), and proof-of-work checks (`verification-before-completion`).
* **When Agent Must Use It:** Before coding any new module, feature, or microservice.
* **Antigravity Setup Command:**
  ```bash
  agy plugin install https://github.com/obra/superpowers
  npx skills add obra/superpowers -a antigravity -y
  ```
* **Agent Trigger:** `/brainstorming`, `/write-plan`, `/execute-plan`

### 2.3 `code-review-graph` — Dependency Blast-Radius & Diff Analyzer

* **Status:** `[MANDATORY]`
* **Repository:** `6erskills/code-review-graph`
* **Use Case:** Exposes a local MCP server that maps cross-file call graphs and symbol dependencies so the agent only inspects files impacted by a change.
* **When Agent Must Use It:** During multi-service refactors, PR reviews, and schema updates.
* **Antigravity Setup Command:**
  ```bash
  pipx install code-review-graph
  code-review-graph install --platform antigravity
  code-review-graph build
  ```

### 2.4 `context-mode` & `caveman` — Context Window & Output Compression

* **Status:** `[MANDATORY]`
* **Repositories:** `mksglu/context-mode`, `JuliusBrussee/caveman`
* **Use Case:** `context-mode` routes noisy test/build/AWS CLI logs into a local SQLite FTS5 index so terminal dumps never pollute the context window. `caveman` strips conversational filler to save ~65% on output tokens while retaining full technical accuracy.
* **When Agent Must Use It:** Always active during long coding, test execution, and container build sessions.
* **Antigravity Setup Command:**
  ```bash
  npx skills add mksglu/context-mode -a antigravity -y
  git clone https://github.com/JuliusBrussee/caveman.git /tmp/caveman && mkdir -p ~/.gemini/config/skills && cp -r /tmp/caveman/skills/* ~/.gemini/config/skills/ && rm -rf /tmp/caveman
  ```
* **Agent Trigger:** `/caveman lite` (default during coding)

### 2.5 `security-reviewer` & `static-analysis` — Continuous SAST & Secret Guard

* **Status:** `[MANDATORY]`
* **Repositories:** `jeffallan/claude-skills`, `trailofbits/skills`
* **Use Case:** Runs automated static analysis (Semgrep, CodeQL, Bandit), secret detection (Gitleaks), dependency CVE auditing (Trivy), and OWASP Top 10 / LLM Top 10 security checks.
* **When Agent Must Use It:** Before finalizing any API endpoint, auth flow, AI prompt pipeline, or Terraform manifest.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills --skill security-reviewer -a antigravity -y
  npx skills add trailofbits/skills --skill static-analysis -a antigravity -y
  ```

### 2.6 `systematic-debugging` — Root-Cause Diagnostic Engine

* **Status:** `[MANDATORY]`
* **Repository:** `obra/superpowers` (bundled skill)
* **Use Case:** Prohibits "guess-and-check" code edits. Enforces a 4-step loop: (1) Reproduce consistently, (2) Isolate & trace data flow across module boundaries, (3) Formulate a single falsifiable hypothesis, (4) Write a failing regression test before applying the fix.
* **When Agent Must Use It:** Immediately whenever any build, unit test, Playwright test, or container health check fails.

## 3. Tier 1 — Frontend, UI/UX Systems & Conversion Landing Pages \[CONDITIONAL: UI/WEB\]

> **Selection Rule:** Import all skills in this tier whenever the project includes a web frontend, SaaS dashboard, customer portal, or marketing landing page.

### 3.1 `ui-ux-pro-max` — Master Design System & Token Generator

* **Status:** `[MANDATORY FOR ALL FRONTEND MODULES]`
* **Repository:** `nextlevelbuilder/ui-ux-pro-max-skill`
* **Use Case:** Runs a local BM25 search engine over 79 UI aesthetics, 192 curated industry color palettes, 74 typography pairings, and UX anti-pattern rules. Outputs `design-system/MASTER.md` with CSS variables, spacing scales, and component specs.
* **Antigravity Setup Command:**
  ```bash
  npm install -g ui-ux-pro-max-cli
  uipro init --ai antigravity
  ```
* **Agent Directive:** Always run `python3 .shared/ui-ux-pro-max/scripts/search.py "<product-domain>" --design-system -p "<ProjectName>"` before writing any React/Next.js/Vue code.

### 3.2 `landing-page-design` & `figma-designer` — High-Conversion Marketing UI

* **Status:** `[CONDITIONAL: Landing Page / Public Marketing Site]`
* **Repository:** `elayadesign/ai-design-skills`
* **Use Case:** Designs high-converting hero sections, value-proposition grids, interactive product showcases, social proof blocks, pricing tiers, motion choreography, and Figma-ready component hierarchies.
* **Antigravity Setup Command:**
  ```bash
  npx skills add elayadesign/ai-design-skills \
    --skill landing-page-design \
    --skill figma-designer \
    -a antigravity -y
  ```

### 3.3 `frontend-design` — Bespoke Aesthetic & Motion Execution

* **Status:** `[CONDITIONAL: Custom Web UI / Interactive Apps]`
* **Repository:** `anthropics/skills`
* **Use Case:** Eliminates generic AI template layouts ("AI slop") by locking in bold typographic hierarchy, intentional color contrast, micro-interactions, and responsive grid choreography.
* **Antigravity Setup Command:**
  ```bash
  npx skills add anthropics/skills --skill frontend-design -a antigravity -y
  ```

### 3.4 `react-best-practices`, `composition-patterns` & `web-design-guidelines`

* **Status:** `[CONDITIONAL: React / Next.js / TypeScript Frontend]`
* **Repository:** `vercel-labs/agent-skills`
* **Use Case:** Enforces 57+ React 19 / Next.js App Router performance rules (Server Components vs. Client Components, streaming Suspense boundaries, bundle splitting, zero waterfall fetches), compound component architecture, and 100+ WCAG accessibility / Core Web Vitals checks.
* **Antigravity Setup Command:**
  ```bash
  npx skills add vercel-labs/agent-skills \
    --skill react-best-practices \
    --skill web-design-guidelines \
    --skill vercel-optimize \
    -a antigravity -y
  ```

### 3.5 Bonus Efficiency Skill: `seo-and-web-vitals` (Technical SEO & Metadata)

* **Status:** `[CONDITIONAL: Public-Facing Web App / SaaS]`
* **Use Case:** Automatically scaffolds dynamic `sitemap.xml`, `robots.txt`, OpenGraph/Twitter social cards, JSON-LD structured schema markup, and LCP/CLS/INP optimization rules.

## 4. Tier 2 — Backend Architecture, Microservices & Polyglot APIs \[CONDITIONAL: BACKEND\]

> **Selection Rule:** Import these skills whenever the project requires backend APIs, distributed services, authentication, billing, or real-time communication.

### 4.1 `microservices-architect` & `architecture-designer`

* **Status:** `[MANDATORY FOR MULTI-MODULE BACKENDS]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Defines clean bounded contexts, Domain-Driven Design (DDD) module boundaries, Architecture Decision Records (ADRs), inter-service communication (REST, gRPC, async event buses), Saga orchestration, and transactional outbox patterns.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill microservices-architect \
    --skill architecture-designer \
    -a antigravity -y
  ```

### 4.2 `fastapi-expert` & `modern-python`

* **Status:** `[CONDITIONAL: Python Backend / AI Service Layer]`
* **Repositories:** `jeffallan/claude-skills`, `trailofbits/skills`
* **Use Case:** Builds high-throughput async FastAPI services using Pydantic v2 strict validation, dependency injection, lifespan context managers, background task workers, and modern Python tooling (`uv`, `ruff`, `ty`, `pytest-asyncio`).
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills --skill fastapi-expert -a antigravity -y
  npx skills add trailofbits/skills --skill modern-python -a antigravity -y
  ```

### 4.3 `typescript-pro` & `golang-pro` (Polyglot High-Concurrency Services)

* **Status:** `[CONDITIONAL: Node.js / Bun / NestJS / Go Services]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Enforces strict type-level programming, zero-cost abstractions, structured concurrency, and clean hexagonal architecture for Node/TypeScript or Go microservices.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill typescript-pro \
    --skill golang-pro \
    -a antigravity -y
  ```

### 4.4 `api-designer` & `websocket-engineer`

* **Status:** `[MANDATORY FOR ALL API & REAL-TIME MODULES]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Standardizes OpenAPI 3.1 contract-first design, RFC 9457 Problem Details error payloads, cursor pagination, idempotency keys, rate limiting, and scalable WebSocket / Server-Sent Events (SSE) streaming (essential for real-time AI token streaming).
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill api-designer \
    --skill websocket-engineer \
    -a antigravity -y
  ```

### 4.5 Bonus Efficiency Skills: Auth, RBAC & SaaS Billing Patterns

* **Status:** `[CONDITIONAL: Multi-Tenant SaaS / Monetized App]`
* **Use Case:**
  * **Authentication & Multi-Tenancy:** Enforces OAuth2/OIDC, PKCE, short-lived JWTs + rotating HttpOnly refresh tokens, Role-Based Access Control (RBAC), and organization-level tenant isolation.
  * **Stripe & Webhook Idempotency:** Implements signature-verified webhook handlers, idempotent state transitions, metered AI usage billing, and subscription entitlement guards.

## 5. Tier 3 — Database Engineering, Caching & Vector Storage \[CONDITIONAL: DATA LAYER\]

> **Selection Rule:** Import these skills whenever the project persists relational data, vector embeddings, high-throughput event streams, or distributed caches.

### 5.1 `postgres-pro` & `database-optimizer`

* **Status:** `[MANDATORY FOR SQL / POSTGRESQL PROJECTS]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Designs normalized + JSONB hybrid schemas, composite/partial/GIN indexes, `pgvector` HNSW indexing, Row-Level Security (RLS) for multi-tenant isolation, `EXPLAIN (ANALYZE, BUFFERS)` query tuning, PgBouncer connection pooling, and zero-downtime Alembic/Prisma/Drizzle migrations.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill postgres-pro \
    --skill database-optimizer \
    -a antigravity -y
  ```

### 5.2 Bonus Efficiency Skill: Distributed Redis Caching & Async Queues

* **Status:** `[CONDITIONAL: High-Scale APIs / Background AI Jobs]`
* **Use Case:** Configures Redis cache-aside/write-through patterns, semantic LLM response caching, distributed locks (Redlock), sliding-window rate limiters, and Celery / BullMQ / Temporal durable task queues with dead-letter handling.

## 6. Tier 4 — AI Agents, Hybrid RAG, MCP & LLM Engineering \[CONDITIONAL: AI / ML\]

> **Selection Rule:** Import these skills whenever the project incorporates LLMs, autonomous agents, RAG pipelines, tool calling, or custom fine-tuned models.

### 6.1 `rag-architect` — Production Hybrid & Graph RAG

* **Status:** `[MANDATORY FOR KNOWLEDGE / SEARCH / CHAT-WITH-DATA MODULES]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Implements structure-aware document chunking, hybrid retrieval (BM25 lexical + dense vector embeddings via Reciprocal Rank Fusion), cross-encoder reranking, metadata filtering, citation grounding, and query decomposition.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills --skill rag-architect -a antigravity -y
  ```

### 6.2 `mcp-builder` & `mcp-developer` — Model Context Protocol Servers

* **Status:** `[MANDATORY FOR TOOL-USING AI AGENTS]`
* **Repositories:** `anthropics/skills`, `jeffallan/claude-skills`
* **Use Case:** Designs and builds standardized, schema-validated MCP servers and resources in Python (FastMCP) or TypeScript so AI agents can safely query databases, trigger internal microservices, and interact with third-party APIs.
* **Antigravity Setup Command:**
  ```bash
  npx skills add anthropics/skills --skill mcp-builder -a antigravity -y
  npx skills add jeffallan/claude-skills --skill mcp-developer -a antigravity -y
  ```

### 6.3 `prompt-engineer` — Structured Outputs, Guardrails & Prompt Caching

* **Status:** `[MANDATORY FOR ALL LLM INTEGRATIONS]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Crafts deterministic system prompts, JSON Schema / Pydantic structured output enforcement, prompt-injection input/output guardrails, prefix caching for latency/cost reduction, and multi-model fallback routing.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills --skill prompt-engineer -a antigravity -y
  ```

### 6.4 `fine-tuning-expert` & `ml-pipeline`

* **Status:** `[CONDITIONAL: Custom Model Training / MLOps]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Builds end-to-end synthetic dataset distillation, LoRA/QLoRA fine-tuning pipelines, DPO alignment, vLLM / TGI quantized model serving, and MLflow experiment tracking.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill fine-tuning-expert \
    --skill ml-pipeline \
    -a antigravity -y
  ```

### 6.5 Bonus Efficiency Skill: Automated LLM & RAG Evaluation (`llm-eval-gate`)

* **Status:** `[MANDATORY FOR PRODUCTION AI FEATURES]`
* **Use Case:** Integrates automated evaluation datasets (RAGAS / DeepEval / Promptfoo) into CI to score **Faithfulness, Answer Relevance, Context Precision, Hallucination Rate, and Token Latency** before any prompt or retrieval change is merged.

## 7. Tier 5 — End-to-End Testing, Load Benchmarking & Resilience \[MANDATORY FOR QA\]

> **Selection Rule:** A project is never considered complete until unit, integration, contract, and real-browser E2E tests pass.

### 7.1 `webapp-testing` — Real-Browser Playwright E2E Verification

* **Status:** `[MANDATORY FOR ALL FULL-STACK / FRONTEND PROJECTS]`
* **Repository:** `anthropics/skills`
* **Use Case:** Boots local/staging application servers and drives headless Chromium via Playwright to test complete user journeys (signup, auth, AI chat streaming, dashboard mutations), inspect DOM state, capture screenshots, and fail on zero-tolerance browser console/network errors.
* **Antigravity Setup Command:**
  ```bash
  npx skills add anthropics/skills --skill webapp-testing -a antigravity -y
  ```

### 7.2 `chaos-engineer` — Fault Injection & Resilience Testing

* **Status:** `[CONDITIONAL: High-Availability Microservices / Production AWS]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Validates system behavior under LLM API timeouts, Redis/RDS connection pool exhaustion, third-party rate limits, and container restarts by enforcing circuit breakers, exponential backoff with jitter, and graceful degradation.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills --skill chaos-engineer -a antigravity -y
  ```

### 7.3 Bonus Efficiency Skill: `k6-load-testing` (Scalability & Concurrency Verification)

* **Status:** `[CONDITIONAL: High-Traffic APIs / Scalable AWS Deployments]`
* **Use Case:** Generates automated `k6` or `Locust` load testing scripts to benchmark $p_{95}$ and $p_{99}$ latencies, verify database connection pool limits, and validate AWS auto-scaling triggers under simulated spike traffic.

## 8. Tier 6 — AWS Cloud Architecture, IaC, CI/CD & Observability \[MANDATORY FOR AWS DEPLOYMENT\]

> **Selection Rule:** Import all skills in this tier whenever the project targets deployment on AWS (ECS Fargate, EKS, Lambda, RDS, S3, CloudFront, Bedrock, ElastiCache).

### 8.1 `cloud-architect` & `terraform-engineer` — Modular AWS Infrastructure-as-Code

* **Status:** `[MANDATORY FOR AWS DEPLOYMENT]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Designs AWS Well-Architected multi-AZ topologies and authors modular Terraform / OpenTofu configurations:
  * **Networking:** VPC, public/private/isolated subnets, NAT Gateways / VPC Endpoints.
  * **Compute:** ECS Fargate clusters or EKS with Karpenter autoscaling, ALB with WAF & TLS termination.
  * **Data & AI:** RDS PostgreSQL (Multi-AZ + RDS Proxy), ElastiCache Serverless Redis, S3 + CloudFront CDN, AWS Bedrock / Secrets Manager.
  * **Security:** Least-privilege IAM roles, OIDC workload identity (zero static AWS keys).
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill cloud-architect \
    --skill terraform-engineer \
    -a antigravity -y
  ```

### 8.2 `devops-engineer` & `kubernetes-specialist` — Containers, CI/CD & GitOps

* **Status:** `[MANDATORY FOR CONTAINERIZED DEPLOYMENT]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:**
  * Writes multi-stage, non-root, distroless/slim `Dockerfile`s and local `docker-compose.yml` parity environments.
  * Builds GitHub Actions CI/CD pipelines with AST security gates, automated test matrices, ECR image vulnerability scanning, and blue-green / canary deployments via ECS or ArgoCD/Helm on EKS.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill devops-engineer \
    --skill kubernetes-specialist \
    -a antigravity -y
  ```

### 8.3 `monitoring-expert` & `sre-engineer` — OpenTelemetry, Prometheus & Runbooks

* **Status:** `[MANDATORY FOR PRODUCTION READINESS]`
* **Repository:** `jeffallan/claude-skills`
* **Use Case:** Instruments frontend, backend APIs, and LLM agent calls with OpenTelemetry distributed tracing, structured JSON logging (with correlation IDs), Prometheus/Grafana dashboards, AWS CloudWatch SLO burn-rate alerts, health/readiness probes, and automated rollback runbooks.
* **Antigravity Setup Command:**
  ```bash
  npx skills add jeffallan/claude-skills \
    --skill monitoring-expert \
    --skill sre-engineer \
    -a antigravity -y
  ```

### 8.4 Bonus Efficiency Skill: `aws-finops-cost-guard` (Cloud & Token Cost Optimization)

* **Status:** `[MANDATORY FOR AWS + AI PROJECTS]`
* **Use Case:** Optimizes infrastructure and AI unit economics by selecting AWS Graviton (ARM64) instances, configuring Spot capacity for stateless workers, setting S3 Intelligent-Tiering lifecycle rules, enforcing AWS Budgets alerts, and implementing per-tenant LLM token rate/cost quotas.

## 9. Tier 7 — Free MCP Servers & Live Web Extensibility Suite \[ZERO-COST / NO PAID KEYS REQUIRED\]

Google Antigravity natively supports local `stdio` and remote Streamable HTTP MCP servers via `<workspace-root>/.agents/mcp_config.json` (project-level) and `~/.gemini/config/mcp_config.json` (global), manageable interactively with `/mcp`. Connecting these free MCP servers gives the Antigravity agent live web browsing, real-time framework documentation, open-source repo intelligence, live Chrome debugging, and official AWS/Terraform verification at zero cost.

### 9.1 `context7` (`@upstash/context7-mcp`) — Live Version-Specific Library Docs

* **Status:** `[MANDATORY FOR ALL CODING]`
* **Cost:** 100% Free (runs via `npx -y @upstash/context7-mcp@latest` or remote `https://mcp.context7.com/mcp`)
* **Use Case:** Eliminates hallucinated or deprecated APIs by pulling live, version-specific documentation and code examples (Next.js, React 19, FastAPI, LangGraph, Tailwind v4, AWS SDKs, Prisma, etc.) directly into the agent's context via `resolve-library-id` and `query-docs`.
* **When Agent Must Use It:** Before writing code against any external SDK, framework, or library.

### 9.2 `deepwiki` (`https://mcp.deepwiki.com/mcp`) — Zero-Auth Open-Source GitHub Repo Intelligence

* **Status:** `[MANDATORY FOR OPEN-SOURCE INTEGRATIONS]`
* **Cost:** 100% Free, Remote Streamable HTTP, Zero Auth Required
* **Use Case:** Connects to Devin's public DeepWiki index (`read_wiki_structure`, `read_wiki_contents`, `ask_question`) so the Antigravity agent can instantly understand the internal architecture and implementation patterns of any public GitHub repository without cloning it locally.
* **When Agent Must Use It:** Whenever integrating complex open-source libraries, LangGraph/MCP templates, or unfamiliar GitHub repositories.

### 9.3 `playwright` (`@playwright/mcp`) — Autonomous Accessibility-Tree Web Browser

* **Status:** `[MANDATORY FOR WEB EXTENSIBILITY & E2E QA]`
* **Cost:** 100% Free & Local (`npx -y @playwright/mcp@latest`)
* **Use Case:** Official Microsoft Playwright MCP server that interacts with live web pages using fast, token-efficient **accessibility tree snapshots** rather than heavy vision screenshots. Enables the agent to browse external URLs, test live forms, verify OAuth logins, scrape dynamic JS pages, and self-verify the running frontend app.
* **When Agent Must Use It:** When scraping dynamic web data, testing UI flows interactively, or verifying rendered pages.

### 9.4 `chrome-devtools` (`chrome-devtools-mcp`) — Live Browser Inspector & Lighthouse Auditor

* **Status:** `[MANDATORY FOR FRONTEND DEBUGGING & WEB VITALS]`
* **Cost:** 100% Free & Local (`npx -y chrome-devtools-mcp@latest`)
* **Use Case:** Official Google Chrome DevTools MCP server that lets the Antigravity agent attach to a live Chrome instance, inspect failed API network requests (`get_network_requests`), analyze console stack traces, diagnose CSS layout shifts at mobile/desktop viewports, inspect memory heap snapshots, and run **automated Lighthouse audits** for Performance, Accessibility, and SEO.
* **When Agent Must Use It:** During frontend debugging, API CORS/network troubleshooting, and pre-release Lighthouse audits.

### 9.5 `fetch` (`mcp-server-fetch`) — Lightweight HTML-to-Markdown Web Reader

* **Status:** `[MANDATORY FOR STATIC WEB READING]`
* **Cost:** 100% Free & Local (`uvx mcp-server-fetch`)
* **Use Case:** Official Model Context Protocol reference server that fetches any public webpage, API spec, changelog, or `robots.txt` and converts noisy HTML into clean, chunked Markdown (`start_index`, `max_length`) with minimal token overhead.
* **When Agent Must Use It:** Whenever reading static documentation pages, blog posts, or JSON/Markdown endpoints from a URL.

### 9.6 `awslabs.aws-documentation-mcp-server` & `awslabs.terraform-mcp-server` — Official AWS & IaC Verification

* **Status:** `[MANDATORY FOR AWS DEPLOYMENT]`
* **Cost:** 100% Free & Open-Source (`uvx awslabs.aws-documentation-mcp-server@latest` and `uvx awslabs.terraform-mcp-server@latest`)
* **Use Case:**
  * **AWS Documentation MCP:** Searches official AWS service docs, API references, and architectural guides in real time.
  * **AWS Terraform MCP:** Provides AWS Well-Architected Terraform/AWSCC resource schemas, pre-built AWS-IA GenAI modules (Bedrock, SageMaker, OpenSearch Serverless), and integrated **Checkov** security compliance scanning (`RunCheckovScan`).
* **When Agent Must Use It:** Before authoring or validating any AWS architecture, IAM policy, or Terraform module.

### 9.7 `shadcn` (`npx shadcn@latest mcp`) & `sequential-thinking` — UI Registry & Deep Reasoning

* **Status:** `[CONDITIONAL: React UI / Complex System Design]`
* **Cost:** 100% Free & Local
* **Use Case:**
  * **`shadcn` MCP:** Allows the agent to search, inspect, and install accessible UI components directly from the shadcn/ui registry into the project.
  * **`sequential-thinking` MCP (`@modelcontextprotocol/server-sequential-thinking`):** Provides structured, multi-branch reflective reasoning steps for complex distributed system design and multi-agent orchestration.

### 9.8 Ready-to-Use Antigravity MCP Configuration (`<workspace-root>/.agents/mcp_config.json`)

The agent (or user) must ensure the following configuration exists in `<workspace-root>/.agents/mcp_config.json` (or globally in `~/.gemini/config/mcp_config.json`):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--headless"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--headless"]
    },
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "aws-terraform": {
      "command": "uvx",
      "args": ["awslabs.terraform-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

## 10. Autonomous Skill & MCP Routing Matrix (For the Antigravity Agent)

When reading the user's project prompt, evaluate the following conditions and automatically import and execute both the mapped **Skills** and **Free MCP Servers**:

| Project Requirement Detected in User Prompt | Classification | Skills the Agent MUST Import & Trigger | Free MCP Servers to Invoke |
| :--- | :--- | :--- | :--- |
| **Any Project / Multi-Module Repo** | **MANDATORY** | `graphify`, `superpowers`, `code-review-graph`, `context-mode`, `caveman`, `security-reviewer`, `static-analysis`, `systematic-debugging` | `context7`, `deepwiki`, `fetch`, `sequential-thinking` |
| **Marketing Page / Waitlist / SaaS Home** | Conditional | `ui-ux-pro-max`, `landing-page-design`, `figma-designer`, `frontend-design` | `chrome-devtools` (Lighthouse SEO/Perf), `playwright` |
| **Web App / Dashboard (React / Next.js)** | Conditional | `ui-ux-pro-max`, `frontend-design`, `react-best-practices`, `web-design-guidelines`, `vercel-optimize` | `context7`, `chrome-devtools`, `playwright`, `shadcn` |
| **Multi-Service / Modular Backend** | Conditional | `microservices-architect`, `architecture-designer`, `api-designer` | `sequential-thinking`, `context7`, `deepwiki` |
| **Python / FastAPI / Async AI Backend** | Conditional | `fastapi-expert`, `modern-python`, `api-designer`, `websocket-engineer` | `context7`, `deepwiki`, `fetch` |
| **Node.js / TypeScript / Go Backend** | Conditional | `typescript-pro` (or `golang-pro`), `api-designer`, `websocket-engineer` | `context7`, `deepwiki` |
| **PostgreSQL / Vector DB / High-Scale Data** | Conditional | `postgres-pro`, `database-optimizer` | `context7` |
| **RAG / Chat with Docs / Knowledge Search** | Conditional | `rag-architect`, `prompt-engineer`, `postgres-pro` (pgvector) | `fetch`, `playwright`, `context7`, `deepwiki` |
| **Autonomous AI Agents / Tool Calling** | Conditional | `mcp-builder`, `mcp-developer`, `prompt-engineer` | `context7`, `deepwiki`, `fetch` |
| **Model Fine-Tuning / Custom ML Pipelines** | Conditional | `fine-tuning-expert`, `ml-pipeline` | `context7`, `deepwiki` |
| **End-to-End QA & Fault Resilience** | **MANDATORY** | `webapp-testing` (Playwright), `test-driven-development`, `chaos-engineer` | `playwright`, `chrome-devtools` |
| **AWS Cloud Deployment (ECS/EKS/RDS/IaC)** | **MANDATORY** | `cloud-architect`, `terraform-engineer`, `devops-engineer`, `kubernetes-specialist`, `monitoring-expert`, `sre-engineer` | `aws-docs`, `aws-terraform` (with Checkov scan) |

## 11. One-Shot Antigravity Bootstrap Script (Skills + Free MCP Config)

If this is a fresh full-stack + AI + AWS workspace, the agent (or developer) can execute this single bootstrap script to provision all mandatory skills **and** generate the `.agents/mcp_config.json` file in Google Antigravity at once:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== [1/9] Installing Mandatory Core AST Graph & Workflow Plugins ==="
uv tool install graphifyy && uv tool update-shell
graphify antigravity install

pipx install code-review-graph
code-review-graph install --platform antigravity

agy plugin install https://github.com/obra/superpowers || true
npx skills add obra/superpowers -a antigravity -y
npx skills add mksglu/context-mode -a antigravity -y

if [ ! -d "$HOME/.gemini/config/skills/caveman" ]; then
  git clone https://github.com/JuliusBrussee/caveman.git /tmp/caveman
  mkdir -p ~/.gemini/config/skills
  cp -r /tmp/caveman/skills/* ~/.gemini/config/skills/
  rm -rf /tmp/caveman
fi

echo "=== [2/9] Installing UI/UX Pro Max, Landing Page & React Design Skills ==="
npm install -g ui-ux-pro-max-cli
uipro init --ai antigravity

npx skills add elayadesign/ai-design-skills \
  --skill landing-page-design \
  --skill figma-designer \
  -a antigravity -y

npx skills add anthropics/skills --skill frontend-design -a antigravity -y
npx skills add vercel-labs/agent-skills \
  --skill react-best-practices \
  --skill web-design-guidelines \
  --skill vercel-optimize \
  -a antigravity -y

echo "=== [3/9] Installing Backend, Microservices, API & Database Skills ==="
npx skills add jeffallan/claude-skills \
  --skill microservices-architect \
  --skill architecture-designer \
  --skill fastapi-expert \
  --skill typescript-pro \
  --skill api-designer \
  --skill websocket-engineer \
  --skill postgres-pro \
  --skill database-optimizer \
  -a antigravity -y

npx skills add trailofbits/skills --skill modern-python -a antigravity -y

echo "=== [4/9] Installing AI Agents, Hybrid RAG, MCP & ML Pipeline Skills ==="
npx skills add anthropics/skills --skill mcp-builder -a antigravity -y
npx skills add jeffallan/claude-skills \
  --skill rag-architect \
  --skill prompt-engineer \
  --skill mcp-developer \
  --skill fine-tuning-expert \
  --skill ml-pipeline \
  -a antigravity -y

echo "=== [5/9] Installing Playwright E2E Testing, Security & Chaos Skills ==="
npx skills add anthropics/skills --skill webapp-testing -a antigravity -y
npx skills add trailofbits/skills --skill static-analysis -a antigravity -y
npx skills add jeffallan/claude-skills \
  --skill security-reviewer \
  --skill chaos-engineer \
  -a antigravity -y

echo "=== [6/9] Installing AWS Cloud, Terraform IaC, K8s & SRE Observability Skills ==="
npx skills add jeffallan/claude-skills \
  --skill cloud-architect \
  --skill terraform-engineer \
  --skill devops-engineer \
  --skill kubernetes-specialist \
  --skill monitoring-expert \
  --skill sre-engineer \
  -a antigravity -y

echo "=== [7/9] Provisioning Free Web Extensibility MCP Servers (.agents/mcp_config.json) ==="
mkdir -p .agents
cat << 'EOF' > .agents/mcp_config.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--headless"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--headless"]
    },
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "aws-terraform": {
      "command": "uvx",
      "args": ["awslabs.terraform-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
EOF

echo "=== [8/9] Auditing Installed Skills & MCP Servers for Security ==="
uvx mcp-scan@latest --skills || true

echo "=== [9/9] Building Initial Codebase AST Knowledge Graphs ==="
graphify .
code-review-graph build

echo "✅ Antigravity Full-Stack + AI + AWS Skill & Free MCP Suite Ready!"
```

## 12. Definition of Done (Mandatory Agent Checklist Before Completion)

Before declaring any module or project complete, the Antigravity agent **MUST** verify every item below:

* \[ \] **AST Graph Updated:** `graphify .` and `code-review-graph build` reflect all newly created files and schemas.
* \[ \] **Live Docs & Repo Context Verified:** All external SDKs and APIs were verified against `context7` or `deepwiki` MCP servers (zero deprecated or hallucinated methods).
* \[ \] **Design System Enforced:** All UI components strictly consume tokens from `design-system/MASTER.md` generated by `ui-ux-pro-max`.
* \[ \] **Type & Lint Clean:** Zero errors from `ruff` / `ty` (Python) and `tsc --noEmit` / `eslint` (TypeScript).
* \[ \] **Automated Tests & DevTools Audit Green:** Unit, integration, real-browser Playwright E2E tests (`webapp-testing` / `playwright` MCP), and `chrome-devtools` MCP console/network/Lighthouse checks pass with zero errors.
* \[ \] **Security Gate Passed:** `security-reviewer`, `static-analysis`, and `aws-terraform` Checkov scans confirm zero hardcoded secrets, SQLi/XSS vectors, or unauthenticated endpoints.
* \[ \] **AWS Deployment Validated:** `terraform validate`, multi-stage `Dockerfile` builds, health check endpoints (`/healthz`, `/readyz`), and OpenTelemetry instrumentation are verified.