// An error boundary around one tool (a calculator, the deal editor): a tool that throws on odd input shows a notice in its place, and
// the rest of the page stands. `resetKey`: a new value (another index) tries the tool again.
import { Component, type ReactNode } from "react";
import { system } from "../copy";
import { Button, Callout } from "./kit";

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  failed: boolean;
  /** The `resetKey` the tool was last drawn under. */
  key: string | undefined;
}

export class ToolBoundary extends Component<Props, State> {
  override state: State = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null;
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <Callout tone="caution" title={system.toolFailed.title}>
        <p>{system.toolFailed.line}</p>
        <Button variant="quiet" flush onClick={() => window.location.reload()}>
          {system.toolFailed.reload}
        </Button>
      </Callout>
    );
  }
}
