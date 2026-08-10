import { Effect, Layer } from 'effect'
import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { notesServer, devtoolsLogger } from './api'
import { localStore } from './store'

const port = Number(process.env.PORT ?? 5710)

NodeRuntime.runMain(
  Layer.launch(notesServer(port, localStore())).pipe(
    Effect.provide(devtoolsLogger),
    Effect.provide(NodeServices.layer),
  ),
)
