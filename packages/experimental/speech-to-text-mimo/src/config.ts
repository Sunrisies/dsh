/** Deployment configuration for the Xiaomi MiMo V2.5 ASR cloud recognizer. */
import type { Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

const DEFAULT_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions'
const DEFAULT_MODEL = 'mimo-v2.5-asr'
const DEFAULT_API_KEY_ENV = 'MIMO_API_KEY'

/** Cloud API connection settings; all fields are Volatile so the Web settings UI can change them at runtime. */
export interface Config {
  /** Unique registration id; consumers select this exact id. */
  providerId: string
  /** Literal MiMo API key; prefer {@link apiKeyEnv} so no secret enters configuration files. */
  apiKey: Volatile<string | undefined>
  /** Credential reference resolved for each transcription; defaults to `MIMO_API_KEY`. */
  apiKeyEnv: Volatile<string>
  /** API endpoint; defaults to the official MiMo endpoint. */
  endpoint: Volatile<string>
  /** Model identifier; defaults to mimo-v2.5-asr. */
  model: Volatile<string>
  /** Maximum transcription request size in bytes. */
  maxAudioBytes: number
  /** Timeout for a single transcription request in milliseconds. */
  timeoutMs: number
}

/** Validate deployment-varying runtime choices at plugin activation. */
export const Config = z.object({
  providerId: z.string().min(1).default(DEFAULT_MODEL),
  apiKey: z.string().role('secret').volatile(),
  apiKeyEnv: z.string().role('credential-ref').default(DEFAULT_API_KEY_ENV).volatile(),
  endpoint: z.string().default(DEFAULT_ENDPOINT).volatile(),
  model: z.string().min(1).default(DEFAULT_MODEL).volatile(),
  maxAudioBytes: z.natural().min(46).default(4 * 1024 * 1024),
  timeoutMs: z.natural().min(1).max(300_000).default(60_000),
})
