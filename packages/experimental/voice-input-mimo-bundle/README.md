# @deepseek-ai/dsh-experimental-voice-input-mimo-bundle

Experimental voice input composition using Xiaomi MiMo V2.5 ASR cloud transcription.

## Summary

Wires together the speech-to-text registry, MiMo cloud provider, API transport, and browser voice UI into a single installable bundle. Requires a `MIMO_API_KEY` environment variable at runtime.

## Model Experience

No model context or session event contribution; composes dictation and preparation plugins without adding any model-facing contribution.

## Known Limitations and Deferred Work

- Disjoint from the local SenseVoice bundle; only one default provider can be active at a time per profile.
- Requires outbound HTTPS access to `api.xiaomimimo.com`; air-gapped or proxied deployments need explicit HTTP proxy configuration.
