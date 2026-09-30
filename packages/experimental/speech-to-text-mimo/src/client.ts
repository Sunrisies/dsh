/** HTTP client for the Xiaomi MiMo V2.5 ASR OpenAI-compatible API. */
import type { Transcript } from '@deepseek-ai/dsh-experimental-speech-to-text/types'
import { validateWave } from '@deepseek-ai/dsh-experimental-speech-to-text/wave'

/** Response shape returned by the MiMo ASR endpoint (OpenAI chat completion). */
interface MiMoResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  error?: {
    message: string
  }
}

/** Options for one MiMo ASR transcription call. */
export interface TranscribeOptions {
  /** API endpoint; defaults to the official MiMo endpoint. */
  endpoint: string
  /** Model identifier. */
  model: string
  /** MiMo API key for authentication. */
  apiKey: string
  /** Maximum transcription request size in bytes. */
  maxAudioBytes: number
  /** Timeout for a single transcription request in milliseconds. */
  timeoutMs: number
}

/**
 * Transcribe one WAV recording through the MiMo V2.5 ASR cloud API.
 * @param options - validated API endpoint, credentials, model, and limits.
 * @param audio - canonical 16 kHz mono PCM16 WAV bytes.
 * @param language - language hint ('auto', 'zh', or 'en').
 * @param signal - caller cancellation.
 * @returns final transcript with measured durations.
 */
export async function transcribe(options: TranscribeOptions, audio: Uint8Array, language: string, signal: AbortSignal): Promise<Transcript> {
  const audioSeconds = validateWave(audio, options.maxAudioBytes / 32000)

  const audioBase64 = Buffer.from(audio).toString('base64')
  const dataUrl = `data:audio/wav;base64,${audioBase64}`

  const body = {
    model: options.model,
    messages: [{
      role: 'user',
      content: [{
        type: 'input_audio',
        input_audio: {
          data: dataUrl,
          format: 'wav',
        },
      }],
    }],
    asr_options: {
      language: language === 'auto' || language === 'zh' || language === 'en' ? language : 'auto',
    },
  }

  const started = performance.now()

  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'api-key': options.apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  const elapsed = (performance.now() - started) / 1000

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`MiMo ASR request failed (HTTP ${response.status}): ${text.slice(0, 500)}`)
  }

  const result = await response.json() as MiMoResponse

  if (result.error) {
    throw new Error(`MiMo ASR returned an error: ${result.error.message}`)
  }

  const text = result.choices?.[0]?.message?.content ?? ''

  return {
    text: text.trim(),
    audioSeconds,
    inferenceSeconds: elapsed,
  }
}
