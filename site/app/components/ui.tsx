// Legacy import path of the shared primitives: everything now lives in ./kit (see docs/design-system.md, "Kit"). New code imports from
// "components/kit". This file stays because provenance.tsx imports it, and it re-exports only the primitives that import no feature,
// so the provenance component and the kit can never import each other in a cycle.
export { cx } from "./kit/cx";
export { Button, LinkButton } from "./kit/button";
export { Tag } from "./kit/tag";
export { Callout } from "./kit/callout";
export { Card } from "./kit/card";
export { Disclosure } from "./kit/disclosure";
export { SegmentedControl, type SegmentOption } from "./kit/choice";
