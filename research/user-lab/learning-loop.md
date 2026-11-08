# Every flag teaches the reviewer

The founder: "when something in the site bothers me, i dont want you to simply fix it. i want you to make the reviewer
understand from it. understand whats the thing that annoys humans about it, and be able to flag it next time. (but no
overfitting yeah?)"

Since 2026-11-08 this is no longer the first step for every problem he flags (`guidelines/working.md`: a flaw is fixed, then he is asked about a site-wide check). It sets no bar of
its own: whether the reviewer is adopted as the judge is `metric.md`'s bar, and whether it becomes a first pass on
every site change is `guidelines/working.md`'s.

## When the founder flags something

1. **Keep the screen.** The whole screen he was looking at, before anything is changed, becomes a case with his words
   and a neutral key (as `metric.md` describes), kept in `live/` (its README says the layout). Nothing is fixed before
   this.
2. **Ask the reviewer first.** Run the current instruction set on that screen, three times, with no context. Did the
   problem appear among its first 10 findings? Log the result in `lessons.md` (a catch or a miss); it counts toward the
   live miss rate.
3. **On a miss, find what annoys a person, not what was wrong with the element.** Write in `lessons.md` the human
   reason, in words that name no page, element, term, figure or decision of the site: what the person was trying to do,
   what they expected, and what the screen made them do instead (for example "a column whose numbers only make sense if
   you know how the site calculates", not "the gap column"). Look for the same reason behind earlier flags, and for a
   published finding in `behaviour-guide.md`.
4. **Change the instruction set at the level of that reason.** One instruction, stated as a general check a person
   would make, never as a description of the element that failed.
5. **Keep the change only if it generalises.**
   - **Not built from this case:** it must catch at least one other case, held out or from another page, of the same
     reason, or a fresh instance made on purpose on another screen (a planted problem, `planted.md`, placed on a
     page and device the flag did not come from); a change that catches only the case it came from is memorising, and
     is dropped. A flag whose reason is new also becomes a planted kind, so later versions are tested on it.
   - **No new noise:** on the held-out set, noise must not rise and the catch rate must not fall.
   - **A negative check:** on a screen where the reason does not apply, the instruction must stay silent.
   - **No project words:** the independence check finds none of the site's terms or rules in it.
6. **Keep the instruction set small.** It has a size limit. A new instruction merges with one about the same reason, or
   replaces the weakest; every few rounds, an instruction that no longer adds a held-out catch is removed. Every
   version is kept with its scores in `versions/`.
7. **Then fix the site**, in the shared piece and every place of the same kind, and teach the builders and the checks
   (guidelines/working.md): the reason goes, as one general rule, into the doc they build from (`docs/design-system.md`,
   `docs/copy.md`), and a guard or a script enforces it where it can be named.

A catch in step 2 needs no change to the instructions; it is the evidence that the reviewer already sees what a person
sees.
