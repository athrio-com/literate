import { Effect as Runtime, Layer as Wiring } from 'effect'
import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { designLogger } from './api'
import { localStore } from './store'
import { designServer } from './design'

NodeRuntime.runMain(
  Wiring.launch(
    designServer({
      port: Number(process.env.PORT ?? 5710),
      application: process.env.LOOM_APP ?? 'http://localhost:5199',
      project: process.env.LOOM_PROJECT ?? 'local',
      directory: process.cwd(),
      store: localStore(),
    }),
  ).pipe(Runtime.provide(designLogger), Runtime.provide(NodeServices.layer)),
)
