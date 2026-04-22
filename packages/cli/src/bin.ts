#!/usr/bin/env bun
/**
 * @adr ADR-004
 *
 * CLI entry point. Runs the @effect/cli command tree under BunContext.
 */

import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect } from 'effect'
import { run } from './main.ts'

run(process.argv).pipe(
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
)
