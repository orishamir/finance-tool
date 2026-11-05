# Every flag teaches the reviewer

The founder, 2026-11-05: "when something in the site bothers me, i dont want you to simply fix it. i want you to make
the reviewer understand from it. understand whats the thing that annoys humans about it, and be able to flag it next
time. (but no overfitting yeah?)"

## When the founder flags something

1. **Keep the screen.** The whole screen he was looking at, before anything is changed, becomes a case in
   `bench/cases.jsonl` with his words and a neutral key (as `metric.md` describes). Nothing is fixed before this.
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
     reason, or a fresh instance made on purpose on another screen; a change that catches only the case it came from is
     memorising, and is dropped.
   - **No new noise:** on the held-out set, noise must not rise and the catch rate must not fall.
   - **A negative check:** on a screen where the reason does not apply, the instruction must stay silent.
   - **No project words:** the independence check finds none of the site's terms or rules in it.
6. **Keep the instruction set small.** It has a size limit. A new instruction merges with one about the same reason, or
   replaces the weakest; every few rounds, an instruction that no longer adds a held-out catch is removed. Every
   version is kept with its scores in `versions/`.
7. **Then fix the site**, in the shared piece and every place of the same kind (ground rule 7).

A catch in step 2 needs no change to the instructions; it is the evidence that the reviewer already sees what a person
sees.
