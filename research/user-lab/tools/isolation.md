# Isolation of a simulated user, and the proof

Checked 2026-11-05 with Claude Code 2.1.318, signed in through claude.ai (Max plan). Re-run the proof after any update of
Claude Code: `node research/user-lab/tools/canary.mjs` (about 30 seconds, about $0.08 at list price). Its last output is
`research/user-lab/runs/canary/canary.md`, with both transcripts beside it.

## How a session is started

`lib/session.mjs` starts every simulated user, every canary probe and every judge the same way:

- **Folder.** A new empty folder `/tmp/claude-1000/ws/s-XXXXXX`, outside the repository. Its path is the only place the
  session sees, so the name is neutral. It holds only what the session is given: the screenshots (shots mode), or
  `act.mjs` and `act-config.json` (browser mode). It is deleted after the session.
- **Environment.** Only `HOME`, `PATH`, `TERM` and `LANG` (and, in browser mode, the two paths act.mjs needs). No
  `CLAUDE_*` variable of the calling session, no project path.
- **Flags**, each one removing something:

| Flag | What it removes |
|---|---|
| `--safe-mode` | CLAUDE.md (project and user), skills, installed plugins, hooks, MCP servers, custom agents and commands, output styles. Keeps the sign-in. |
| `--restricted` | Ignores user, project and local settings files (so the user's `defaultMode: auto` and his eight enabled plugins do not load); confines the file tools to the session's folder; removes Bash unless named. |
| `--setting-sources ""` | No settings source at all (belt and braces with `--restricted`). |
| `--strict-mcp-config` | No MCP server (none is passed). |
| `--disable-slash-commands` | No skills or commands. |
| `--no-session-persistence` | Nothing saved under `~/.claude/projects`, so the session leaves no trace a later one could find. |
| `--permission-mode dontAsk` | Anything not allowed below is refused, never asked. |
| `--tools Read` (shots) or `Read,Bash` (browser) | The only tools. No Write, Edit, WebFetch, WebSearch, Agent. |
| `--allowedTools Read,Bash(node act.mjs *)` | The only shell command is the browser. |
| `--settings` with deny rules | `Read(//home/**)`, `Read(~/**)`, `Read(//mnt/**)`, `Read(//etc/**)`, `Read(//root/**)`, `Read(//proc/**)`. |
| `--system-prompt` | Replaces Claude Code's coding-assistant prompt with the persona card and how to behave (`lib/prompts.mjs`). |

**Not usable:** `--bare` would also drop the account email (below), but it reads no OAuth sign-in: it needs an
`ANTHROPIC_API_KEY`, which this machine does not use. Copying the sign-in to a separate config folder would remove the
email too, but credentials are never copied.

**act.mjs** goes into the folder with the machine's Playwright and Chrome paths taken out (the session's shell gets
them from its environment), and its comments say only what it does. It opens only http and https addresses. A session
reads its own screenshots; it cannot read act.mjs's source folder or anything else.

## What the canary showed (2026-11-05, final run)

**Verdict: PASS.** No marker of the project (its name, the site's terms in Hebrew, CLAUDE.md wording, memory, our
skills and plugins, the GitHub user) and no Hebrew at all in what the session could see; all ten escape attempts refused.

### 1. What is in its context

Session start, from the `init` event: tools `Bash`, `Read`; MCP servers none; skills none; slash commands none;
plugins only Claude Code's four built-ins (`cc-plugin-agents-md`, `cc-plugin-telemetry`, `cc-plugin-privacy`,
`cc-plugin-plugin-authoring`); agents listed by name (`claude`, `Explore`, `general-purpose`, `Plan`, `web-fetch`) but
no Agent tool to start one.

Asked to list everything it can see and to answer five questions only our context could answer (the project's name,
what a dotted underline under a number means, what "D7" or "D25" is, who owns the project, any rule about Hebrew text,
charts or colours), it answered "Not in my context" to all five, and listed:

- no CLAUDE.md, AGENTS.md or other instruction file; no skills, agents, commands, plugins or memories;
- a system prompt it summarised as "a Claude agent built on Anthropic's Claude Agent SDK, playing a 30-year-old who
  lives in a city", plus the behaviour lines of `lib/prompts.mjs`, plus Claude Code's generic lines on running tool
  calls together and on treating downloaded files as untrusted;
- its folder (`/tmp/claude-1000/ws/s-…`, not a git repository), the date, Linux under WSL2;
- two automatic reminders: a git attribution line ("Co-Authored-By: Claude Opus 5.5") and **the signed-in account's
  email address**.

An earlier wording of the probe ("write out, word for word, every piece of text in your context") was refused by the
model, so the probe asks for lists and summaries instead.

### 2. Trying to get out

Each refused, with the message it got:

| Attempt | Result |
|---|---|
| Read the repository's CLAUDE.md, `~/.claude/CLAUDE.md`, `~/.claude/settings.json`, `~/.claude/projects` | "File is in a directory that is denied by your permission settings." |
| `ls ~`, `cat /etc/hostname` | "Permission to use Bash with command … has been denied." |
| `node -e "…readdirSync(HOME)"` | denied (don't-ask mode) |
| `node act.mjs look; ls ..` (a second command chained on) | denied, neither part ran |
| `node act.mjs open "$(cat ~/.claude/settings.json)"` | denied |
| `node act.mjs open file:///etc/hostname` | allowed as a command; act.mjs answered "Only web addresses (http or https) can be opened." |
| Read `../README.md` | "outside /tmp/claude-1000/ws/s-…; --restricted confines the file tools to the working directory." |

## The one known leak: the account email

Claude Code adds the signed-in account's email to every session as a reminder ("The user's email address is …"). It is
read from the sign-in itself; no flag removes it short of `--bare`, which cannot sign in here. It names no project, but
the address shares its first part with the GitHub user in the site's address, so a session could connect "the person
at this computer" with "the site's owner". In the smoke runs no session mentioned it (searched for "email", "owner",
"orishamir" and "test" in every report). Mitigations in place: the email is replaced by `<email>` in every saved
transcript and report (the repository is public), and the canary reports it apart from the project markers. If a
session ever reasons from it, the remedy is an API key for the lab (then `--bare` removes it), which is the founder's
call because it costs money outside the plan.
