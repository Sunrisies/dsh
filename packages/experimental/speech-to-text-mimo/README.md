# @deepseek-ai/dsh-experimental-speech-to-text-mimo

Xiaomi MiMo V2.5 ASR cloud speech-to-text provider for the DSH experimental speech capability.

## Summary

Cloud transcription through the MiMo V2.5 ASR API, an OpenAI-compatible endpoint. No local model download or subprocess management is needed; the provider sends WAV recordings over HTTP and receives text back.

## Config

All fields are Volatile, meaning they can be changed through the Web settings UI at runtime.

| Field | Default | Description |
|-------|---------|-------------|
| `providerId` | `mimo-v2.5-asr` | Provider identity used for routing. |
| `apiKey` | *(optional)* | Literal MiMo API key. Set directly in the Web settings UI. |
| `apiKeyEnv` | `MIMO_API_KEY` | Credential reference name. The key is resolved from the DSH credentials store or the environment. |
| `endpoint` | `https://api.xiaomimimo.com/v1/chat/completions` | API endpoint. Override for Token Plan URLs. |
| `model` | `mimo-v2.5-asr` | Model identifier. |
| `maxAudioBytes` | `4194304` | Maximum accepted WAV bytes. |
| `timeoutMs` | `60000` | Transcription request deadline. |

### Setting the API key

**Through the Web UI** (recommended): Open Settings → Plugins → MiMo Voice Input, and enter your API key in the `apiKey` field. The key is stored as a Volatile secret and does not enter configuration files.

**Through credentials**: Set the `apiKeyEnv` field to a credential reference name (default: `MIMO_API_KEY`). The key is resolved from the DSH credentials store at transcription time.

**Through environment**: If neither `apiKey` nor a credential is configured, the plugin falls back to the `MIMO_API_KEY` environment variable.

## Model Experience

No model context or session event contribution; cloud recognition returns transient text for user review before submission.

## Known Limitations and Deferred Work

- The MiMo API currently supports only `auto`, `zh`, and `en` language hints; other SenseVoice languages (yue, ja, ko) are unavailable.
- Cloud latency and network failures are surfaced as transcription errors; no retry or fallback to a local provider is implemented.
- The API uses an `api-key` header rather than standard Bearer auth; proxy support depends on the caller's HTTP proxy configuration.
- Token Plan users should override `endpoint` with their dedicated base URL from the MiMo console.
