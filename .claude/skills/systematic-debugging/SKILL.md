---
name: systematic-debugging
description: Find the root cause before fixing a bug. Use when there is a bug, a red test, a stack trace, "lỗi", "sai", "không chạy", "prod lỗi", "người dùng báo", or a red verify with an unclear cause — even when the bug looks obvious.
---
<!-- Rút từ github.com/obra/superpowers · skills/systematic-debugging/ (MIT, © 2025 Jesse Vincent), bản 6.4.1. -->

# Điều tra lỗi

**Do not propose a fix until you have found the root cause.** Fixing a symptom is a failure, even when the test is green.

## Hai loại bước

| Loại | Gồm | Chạy được ở |
|---|---|---|
| **Chỉ đọc** | read the error and existing logs · reproduce in dev/test without editing files · trace backwards · compare · `git log` / `git diff`. Reproducing needs writing shared data or calling an external service → ask the USER | every call |
| **Có sửa file** | insert a diagnostic log · change one variable to test a hypothesis | a file-editing task within the confirmed scope. |

## 1 · Bằng chứng

1. Read the whole error message and stack trace: line numbers, paths, error codes.
2. Reproduce reliably: the exact steps; does it happen every time? Cannot reproduce → collect more data, do not guess.
3. Check recent changes: `git log`, `git diff`, dependencies, configuration, environment.
4. Multi-layer system (CI → build → deploy, API → service → DB): log the data going in / out at each boundary (inserting a
   log = editing a file), run once, see which layer breaks, and only then dig into that layer.
5. Where the wrong value is born: trace backwards from the broken spot up to the source with find-references or CodeGraph — `references/truy-nguoc.md`.

## 2 · So sánh

Find similar code in the repo that works correctly. List **every** difference between what works and what is broken, even
things that "surely don't matter". Understand its dependencies: configuration, environment, assumptions.

## 3 · Giả thuyết

Write down one hypothesis: "X is the cause because Y". Test it with the smallest change, one variable at a time. Wrong → a
new hypothesis, do not pile on more fixes. Do not understand something → say "I do not understand X", do not pretend. A test
change is temporary: revert it with your own Edit (no `checkout` / `restore`) before step 4.

## 4 · Sửa

Bugfix flow: a reproducing test red first, one change aimed at the root cause, no fixing extra
things "while you are there". Costly bug (data loss, wrong money, data exposure) → `references/phong-thu-nhieu-tang.md`.
The cap on fix rounds and how to stop when stuck follow the project's verify rule; several failed fixes in a row signal a wrong architecture → stop, discuss with
the USER, do not try again. Investigation finished and the cause is outside the code (flaky external service, environment) → record what
was checked, handle it deliberately (timeout, retry with a cap, clear error report), add a log.

## Log chẩn đoán

- Print only match / no match, yes / no, length — **do not print the value, do not print a hash of the value** (national ID, OTP,
  password hashes can still be reversed). To compare two places, compare in code.
- Remove all temporary logs before commit.

## Ngụy biện

| Nghĩ | Thật |
|---|---|
| "Gấp, sửa nhanh rồi điều tra sau" | A guessed fix costs more than an investigation; an urgent prod issue must be fixed in the right place all the more |
| "Thêm retry / tăng timeout là xong" | That hides the symptom; find out why it is slow and why it breaks |
| "Thử thêm một cách nữa" | fix-round cap reached → stop, ask the USER |
| "Sự cố prod, chèn log vào code cho nhanh" | At the incident investigation step (#1) files are not edited yet; propose the experiment to the USER |
