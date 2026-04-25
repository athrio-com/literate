/**
 * Build-time bindings to the canonical Trope sources at
 * `registry/tropes/<id>/index.ts`.
 *
 * Per ADR-026 §4 the CLI does not dynamically import a consumer's
 * vendored `.literate/tropes/<id>/index.ts` at runtime. Trope
 * execution (`continue`, `close`) uses the bundled-from-source
 * versions imported here. This module is the single point of
 * binding so the bundler can inline the registry sources at build
 * time and the rest of the CLI stays oblivious to the registry's
 * on-disk path.
 *
 * Adding a new bundled-Trope binding means adding one re-export
 * here and one entry in the verb registry that consumes it.
 */
export {
  sessionStartStep,
  sessionStartTrope,
  SessionStartConcept,
  type SessionRef,
} from '../../../registry/tropes/session-start/index.ts'

export {
  sessionEndStep,
  sessionEndTrope,
  SessionEndConcept,
  SessionEndIncomplete,
  type SessionClosure,
} from '../../../registry/tropes/session-end/index.ts'

export {
  lfmStep,
  lfmTrope,
  LFMAuthoringConcept,
  computeLfmId,
  rewriteAnnotations,
  updateReferencesStep,
  type LFMRef,
} from '../../../registry/tropes/lfm/index.ts'

export {
  reconcileStep,
  reconcileTrope,
  ReconcileConcept,
  type ReconcileReport,
} from '../../../registry/tropes/reconcile/index.ts'

export {
  indexStep,
  indexTrope,
  IndexConcept,
  type IndexResult,
} from '../../../registry/tropes/index/index.ts'
