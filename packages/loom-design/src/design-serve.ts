import { Effect as Runtime, Layer as Wiring, Option } from 'effect'
import { NodeRuntime, NodeServices } from '@effect/platform-node'
import { designLogger } from './api'
import { localStore } from './store'
import { addressOf, designServer } from './design'

const written = Option.fromNullishOr(process.argv[2]).pipe(
  Option.orElse(() => Option.fromNullishOr(process.env.LOOM_APP)),
  Option.getOrElse(() => '5199'),
)

NodeRuntime.runMain(
  Wiring.launch(
    designServer({
      port: Number(process.env.PORT ?? 5710),
      application: addressOf(written),
      project: process.env.LOOM_PROJECT ?? 'local',
      store: localStore(),
    }),
  ).pipe(Runtime.provide(designLogger), Runtime.provide(NodeServices.layer)),
)
