<!-- Rút từ github.com/obra/superpowers · skills/systematic-debugging/defense-in-depth.md (MIT, © 2025 Jesse Vincent), bản 6.4.1. -->

# Phòng thủ nhiều tầng

Fixing at the source blocks the broken path you have seen. Other paths (a new call, a mock in a test, another branch) can still feed a wrong value
in. After fixing the source, consider adding checks at the layers the data passes through — only when that bug is costly (data loss, wrong money, data
exposure), do not add them for every bug.

| Tầng | Kiểm gì |
|---|---|
| Đầu vào | reject invalid input at the boundary (API, file read, config read) |
| Logic | the business function checks the conditions it needs (not empty, within range) |
| Môi trường | block dangerous operations in the wrong context (e.g. writing outside the temp folder while running tests) |
| Ghi nhận | log enough context to investigate quickly next time (do not log sensitive values) |

The project's stack standard already sets which layer checks what → follow that standard (the stack standard beats a preferred way of working). An extra check
outside the fixed spot is a separate behavior change (rejecting input = changing the contract) → treat as a separate change and ask the USER.

Every extra check gets a red test first (bugfix flow). A check that hides errors (swallowing an exception, silently returning a default) does not.
