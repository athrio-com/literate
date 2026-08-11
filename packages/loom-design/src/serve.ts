import { Effect, Layer } from 'effect'
import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { notesServer, designLogger } from './api'

const port = Number(process.env.PORT ?? 5710)

NodeRuntime.runMain(
  Layer.launch(notesServer(port)).pipe(
    Effect.provide(designLogger),
    Effect.provide(NodeServices.layer),
  ),
)
