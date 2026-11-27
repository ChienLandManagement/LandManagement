<!-- Rút từ github.com/obra/superpowers · skills/systematic-debugging/root-cause-tracing.md (MIT, © 2025 Jesse Vincent), bản 6.4.1. -->

# Truy ngược tới nguồn

An error often shows up deep in the call stack, far from where the wrong value was born. Fixing where it shows up is fixing the symptom.

## Cách làm

1. **Record the symptom:** which value is wrong, in which function, at which file:line.
2. **Find the nearest source:** which function passes that value in? Use find-references or CodeGraph if available to get the callers, do not grep and guess.
3. **Ask: is the value already wrong here?** Already wrong → go up one more layer, repeat step 2. Still correct → the source lies between this layer and the
   layer below.
4. **Stop where the value starts to be wrong** (reading config, user input, DB data, a default value). Fix it there.

## Khi không lần theo tay được

Add a diagnostic log right before the broken operation (only when a file-editing step is allowed, after `intent.md`): print the calling function,
parameters as yes / no / length (do not print the value, do not print a hash), the working directory, relevant environment variables (names,
not values). Run once, read the log, then remove it.

## Ví dụ trung tính

Triệu chứng: báo cáo xuất ra thiếu dòng của một khách hàng.
- The export function already receives an incomplete list → go up one layer.
- The filter function receives the full list and returns an incomplete one → the filter condition compares dates in the server's time zone.
- Source: the date value is read from configuration without a time zone. Fix at the place that reads the configuration, do not patch the export function.
