/**
 * @literate/core — public surface.
 *
 * See the rewrite-stage ADRs in
 * `../../../corpus/decisions/ADR-011` through `ADR-020` for
 * rationale (ADR-019 reinstates the `@literate/*` namespace for
 * rewrite packages; ADR-020 unifies the monorepo layout so active
 * `@literate/*` packages live at repo-root `packages/*`).
 * This module re-exports every type and value a consumer needs to
 * author Steps, run them under an ExecutionLog, and dispatch via
 * Protocol.continue.
 */

// Step surface (ADR-011, ADR-012, ADR-015)
export {
  prose,
  StepError,
  StepId,
  StepKind,
  InvocationKey,
  ProseLoadError,
  type AnyStep,
  type ErrorOf,
  type InputOf,
  type OutputOf,
  type ProseRef,
  type RequirementsOf,
  type Step,
} from './step.ts'

// Execution substrate (ADR-013)
export {
  deriveInvocationKey,
  ExecutionLog,
  ExecutionRecord,
  ExecutionStatus,
  fileBackedExecutionLogLayer,
  InMemoryExecutionLogLayer,
  LogWriteError,
  makeFileBackedExecutionLog,
  makeInMemoryExecutionLog,
  persistExecutionRecords,
  rewriteExecutionLogSection,
  type ExecutionLogService,
} from './execution.ts'

// fs-backed SessionStore binding
export {
  fileSystemSessionStoreLayer,
  makeFileSystemSessionStore,
} from './session-store-fs.ts'

// Suspension (ADR-013 §4)
export {
  PendingSchema,
  ReplayDivergence,
  Suspend,
  type AIPending,
  type ExternalPending,
  type GatePending,
  type Pending,
} from './suspend.ts'

// Services (ADR-002, ADR-014)
export {
  AIInvoke,
  AIInvokeError,
  DefaultStubLayers,
  GateService,
  GateUnresolved,
  inMemorySessionStoreLayer,
  LiveProseInvokeLayer,
  makeInMemorySessionStore,
  makeProseInvoke,
  makeScriptedGateService,
  makeScriptedTerminalIO,
  makeTerminalGateService,
  ProseInput,
  ProseInvoke,
  ProseOutput,
  scriptedGateServiceLayer,
  SessionStore,
  SessionStoreError,
  StubAIInvokeLayer,
  StubGateServiceLayer,
  StubSessionStoreLayer,
  terminalGateServiceLayer,
  Timestamp,
  type AIInvokeService,
  type GateServiceImpl,
  type ProseInvokeService,
  type SessionStoreService,
  type TerminalIO,
} from './services.ts'

// Terminal (node:readline-backed TerminalIO for CLI binding)
export { makeNodeTerminalIO, type NodeTerminal } from './terminal.ts'

// Gate decisions (ADR-017)
export { GateDecisionSchema, type GateDecision } from './gate.ts'

// Combinators (ADR-012 §Combinators)
export {
  aiStep,
  effectStep,
  gateStep,
  ioStep,
  memo,
  proseStep,
  step,
  workflowStep,
  type AIStepDefinition,
  type EffectStepDefinition,
  type GateStepDefinition,
  type IoStepDefinition,
  type ProseStepDefinition,
  type StepDefinition,
  type WorkflowStepDefinition,
} from './combinators.ts'

// Protocol.continue (ADR-014)
export {
  OrphanConflict,
  Protocol,
  SessionMalformed,
  type ProtocolError,
  type ProtocolOutcome,
  type SessionRef,
} from './protocol.ts'

// Metalanguage: Concept / Trope / Variant / Modality (ADR-001, ADR-009,
// ADR-010, extended with the Step substrate from ADR-011; Modality ADT
// added by ADR-021). Variant is the FP ADT-case name for what legacy
// ADR-001 called "Subkind".
export {
  concept,
  isConcept,
  isTrope,
  isVariant,
  Modality,
  ModalitySchema,
  trope,
  variant,
  type AnyConcept,
  type AnyTrope,
  type AnyVariant,
  type Concept,
  type ConceptDefinition,
  type ConceptInstance,
  type Trope,
  type TropeDefinition,
  type Variant,
  type VariantDefinition,
} from './kinds.ts'
