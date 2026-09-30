/** Xiaomi MiMo V2.5 ASR cloud provider; no local model download required. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-experimental-speech-to-text'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-credentials'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import type { SpeechProviderId } from '@deepseek-ai/dsh-experimental-speech-to-text/types'
import { Config } from './config.ts'
import { transcribe, type TranscribeOptions } from './client.ts'

export { Config } from './config.ts'
export const name = 'experimental-speech-to-text-mimo'
export const inject = ['speechToText']

/**
 * Resolve the MiMo API key from literal config, credential reference, or environment.
 * @param ctx - plugin context supplying the credential and environment planes.
 * @param apiKey - literal key from config, or undefined.
 * @param apiKeyEnv - credential reference to resolve.
 * @returns the resolved key, or undefined if none is configured.
 */
async function resolveApiKey(ctx: Context, apiKey: string | undefined, apiKeyEnv: string): Promise<string | undefined> {
  if (apiKey !== undefined && apiKey.length > 0) return apiKey
  const ref = credentialRef(apiKeyEnv)
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) return (await credentials.resolve(ref))?.value
  const ambient = launchEnvironmentOf(ctx).get(ref)
  return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined
}

/**
 * Register the MiMo cloud recognizer; no preparation or local download is needed.
 * @param ctx - Host registry.
 * @param config - validated API configuration.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.effect(() => {
    const unregister = ctx.speechToText.register({
      info: {
        id: config.providerId as SpeechProviderId,
        name: `MiMo V2.5 ASR (${config.model.get()})`,
        location: 'cloud',
        languages: ['auto', 'zh', 'en'],
      },
      transcribe: async (input, signal) => {
        const resolvedKey = await resolveApiKey(ctx, config.apiKey.get(), config.apiKeyEnv.get())
        if (resolvedKey === undefined) {
          throw new Error(`MiMo API key is not configured. Set it in the plugin settings or via the ${config.apiKeyEnv.get()} environment variable.`)
        }
        const options: TranscribeOptions = {
          endpoint: config.endpoint.get(),
          model: config.model.get(),
          apiKey: resolvedKey,
          maxAudioBytes: config.maxAudioBytes,
          timeoutMs: config.timeoutMs,
        }
        return await transcribe(options, input.audio, input.language, signal)
      },
    })
    return () => unregister()
  })
}
