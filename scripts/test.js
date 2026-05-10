#!/usr/bin/env node
/**
 * GEM-THAL hook script tests.
 * Runs without external dependencies — uses Node.js child_process.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SCRIPTS = path.join(__dirname);
const FLAG = path.join(os.homedir(), '.gemini', '.compress-active');
const SESSION_START = path.join(SCRIPTS, 'session-start.js');
const BEFORE_AGENT = path.join(SCRIPTS, 'before-agent.js');

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
        failed++;
    }
}

function clearFlag() {
    try { fs.unlinkSync(FLAG); } catch (_) {}
}

function writeFlag(mode) {
    fs.writeFileSync(FLAG, mode, 'utf8');
}

function readFlag() {
    try { return fs.readFileSync(FLAG, 'utf8').trim(); } catch (_) { return null; }
}

function runScript(script, input = '') {
    const result = spawnSync('node', [script], {
        input,
        encoding: 'utf8',
        timeout: 5000,
    });
    let json = null;
    try { json = JSON.parse(result.stdout.trim()); } catch (_) {}
    return { stdout: result.stdout, stderr: result.stderr, status: result.status, json };
}

// ── config.js ─────────────────────────────────────────────────────────────────
console.log('\nconfig.js');
const { readFlag: cfgRead, writeFlag: cfgWrite, removeFlag: cfgRemove } =
    require(path.join(SCRIPTS, 'config'));

clearFlag();
assert('readFlag returns null when no flag file', cfgRead() === null);

cfgWrite('full');
assert('writeFlag writes mode to flag file', readFlag() === 'full');
assert('readFlag reads back valid mode', cfgRead() === 'full');

cfgWrite('lite');
assert('readFlag reads lite', cfgRead() === 'lite');

cfgWrite('ultra');
assert('readFlag reads ultra', cfgRead() === 'ultra');

// wenyan intentionally excluded from VALID_MODES — write raw to test rejection
fs.writeFileSync(FLAG, 'wenyan', 'utf8');
assert('readFlag rejects wenyan (not in VALID_MODES)', cfgRead() === null);

cfgRemove();
assert('removeFlag deletes flag file', readFlag() === null && cfgRead() === null);

// Symlink attack prevention
const LINK = FLAG + '.lnk';
try { fs.unlinkSync(LINK); } catch (_) {}
fs.symlinkSync(LINK, FLAG);
cfgWrite('full'); // should be silently ignored
const symlinkStillExists = fs.lstatSync(FLAG).isSymbolicLink();
assert('writeFlag refuses to overwrite symlink', symlinkStillExists);
try { fs.unlinkSync(FLAG); } catch (_) {}
assert('readFlag returns null for symlink', cfgRead() === null);

// ── session-start.js ──────────────────────────────────────────────────────────
console.log('\nsession-start.js');
clearFlag();

const noFlag = runScript(SESSION_START);
assert('exits 0 with no output when no flag', noFlag.status === 0 && noFlag.stdout.trim() === '');

cfgWrite('full');
const fullSession = runScript(SESSION_START);
assert('outputs valid JSON when flag=full', fullSession.json !== null);
assert('additionalContext contains COMPRESS FULL',
    fullSession.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS FULL'));
assert('systemMessage NOT inside hookSpecificOutput',
    fullSession.json?.hookSpecificOutput?.systemMessage === undefined);
assert('additionalContext NOT empty string',
    fullSession.json?.hookSpecificOutput?.additionalContext?.length > 10);

cfgWrite('lite');
const liteSession = runScript(SESSION_START);
assert('additionalContext contains COMPRESS LITE for lite mode',
    liteSession.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS LITE'));

cfgWrite('ultra');
const ultraSession = runScript(SESSION_START);
assert('additionalContext contains COMPRESS ULTRA for ultra mode',
    ultraSession.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS ULTRA'));

clearFlag();

// ── before-agent.js ───────────────────────────────────────────────────────────
console.log('\nbefore-agent.js');
clearFlag();

// Activate full
const activateFull = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'activate compress full', hook_event_name: 'BeforeAgent' }));
assert('activate compress full → exits 0', activateFull.status === 0);
assert('activate compress full → writes flag', readFlag() === 'full');
assert('activate compress full → outputs JSON', activateFull.json !== null);
assert('activate compress full → reinforcement mentions COMPRESS FULL',
    activateFull.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS FULL'));

// Normal prompt while active → reinforcement injected
clearFlag(); cfgWrite('full');
const normalPrompt = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'summarize this code', hook_event_name: 'BeforeAgent' }));
assert('active full + normal prompt → reinforcement injected', normalPrompt.json !== null &&
    normalPrompt.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS FULL'));

// Activate lite
clearFlag();
const activateLite = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'activate compress lite', hook_event_name: 'BeforeAgent' }));
assert('activate compress lite → writes lite flag', readFlag() === 'lite');
assert('activate compress lite → reinforcement mentions COMPRESS LITE',
    activateLite.json?.hookSpecificOutput?.additionalContext?.includes('COMPRESS LITE'));

// Activate ultra
clearFlag();
const activateUltra = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'switch to compress ultra', hook_event_name: 'BeforeAgent' }));
assert('activate compress ultra → writes ultra flag', readFlag() === 'ultra');

// Deactivate via "normal mode"
cfgWrite('full');
const deactivate = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'normal mode', hook_event_name: 'BeforeAgent' }));
assert('normal mode → exits 0', deactivate.status === 0);
assert('normal mode → flag removed', readFlag() === null);

// Deactivate via "stop compress"
cfgWrite('full');
const deactivateStop = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'stop compress', hook_event_name: 'BeforeAgent' }));
assert('stop compress → flag removed', readFlag() === null);

// No output when mode off and no activation keyword
clearFlag();
const offPrompt = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'what is the weather?', hook_event_name: 'BeforeAgent' }));
assert('no flag + unrelated prompt → exits 0 with no output',
    offPrompt.status === 0 && offPrompt.stdout.trim() === '');

// Wenyan activation falls back to full (design decision: wenyan excluded)
clearFlag();
const wenyanActivate = runScript(BEFORE_AGENT,
    JSON.stringify({ prompt: 'activate compress wenyan', hook_event_name: 'BeforeAgent' }));
const flagAfterWenyan = readFlag();
assert('wenyan activation → flag is null or full (not wenyan)',
    flagAfterWenyan !== 'wenyan');

clearFlag();

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
