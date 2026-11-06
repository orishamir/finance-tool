# Flags on changes, by size

Since 2026-11-06 a change's checks depend on its size (CLAUDE.md, "Checks scale with the size of a change";
`research/2026-11-06-process-by-size.md`). Every flag the founder raises on a change made under that rule is logged
here with the change's size, so that after two weeks we can tell whether small changes need more checks: if more than
about one flag in five lands on a small change, small changes get medium checks.

Changes are counted from the commit messages (`git log --since=2026-11-06 --grep="^Size:"`); flags are added here as
he raises them. A flag on work made before the rule (the indices page branch of 5 and 6 November) is not counted.

Review due: 2026-11-20.

| Date | His flag, in his words | The change it lands on (commit) | Size | Which check would have caught it |
|---|---|---|---|---|
