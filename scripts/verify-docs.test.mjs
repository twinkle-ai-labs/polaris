import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Run the actual verifier against disposable content, including all translations.
function verify(change) {
  const dir = mkdtempSync(join(tmpdir(), 'polaris-docs-'));
  try {
    cpSync(resolve('content'), join(dir, 'content'), { recursive: true });
    if (change) {
      const file = join(dir, 'content/apps/stock-calculator/privacy/en/1.md');
      writeFileSync(file, change(readFileSync(file, 'utf8')));
    }
    return spawnSync(process.execPath, [resolve('scripts/verify-docs.mjs')], { cwd: dir, encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('notice periods, status and Google URLs do not cause false translation failures', () => {
  const result = verify();
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
test('a wrong age still fails when the policy includes a notice period', () => {
  const result = verify(text => text.replace('children under 16.', 'children under 15.'));
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /연령 15 ≠ 우리 기준 16/);
});
test('a missing age cannot be replaced by the 30-day notice period', () => {
  const result = verify(text => text.replace('children under 16.', 'children.'));
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /연령 문장이 없다/);
});
test('a real conflicting operator pronoun still fails', () => {
  const result = verify(text => text.replace('the Operator explains how', 'we explain how'));
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /«Operator» 와 «we »/);
});
