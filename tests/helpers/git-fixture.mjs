// A throwaway git repository for tests. Commits read their message from stdin, so footers and
// blank lines arrive exactly as written.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

export function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-fixture-'));
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Ledger Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', '/dev/null');
  const write = (file, text) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  };
  return {
    dir,
    git,
    write,
    commit(message, files = {}) {
      for (const [file, text] of Object.entries(files)) write(file, text);
      git('add', '-A');
      execFileSync('git', ['-C', dir, 'commit', '-q', '--allow-empty', '-F', '-'], { input: message, stdio: ['pipe', 'pipe', 'pipe'] });
      return git('rev-parse', 'HEAD').trim();
    },
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
