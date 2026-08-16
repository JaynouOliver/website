---
title: What I learned building Raft from scratch
date: 2026-05-02
image:
summary: Consensus looks simple in the paper. Then you try to implement leader election with real clocks and real networks.
---
I spent six weekends implementing Raft in Go for [keyv-lite](https://github.com/octocat/keyv-lite). The paper is famously readable. The implementation is famously humbling.

## The paper hides the hard parts

The Raft paper is precise about safety and vague about liveness in practice. Election timers, for example: the paper says "randomized timeouts," but tuning them against real network jitter is where the actual engineering lives.

```go
timeout := baseTimeout + time.Duration(rand.Int63n(int64(baseTimeout)))
```

## Three bugs that taught me the most

- **Stale term acceptance** — I applied entries from a leader I should have rejected. Safety violation, found only by the chaos harness.
- **Snapshot races** — log compaction while a follower was catching up corrupted its state machine.
- **The clock lies** — a paused VM made a healthy leader look dead. Never trust a single timer.

If you want to understand distributed systems, do not read about them. Build one, break it on purpose, and keep notes.
