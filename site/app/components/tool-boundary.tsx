// An error boundary around one tool (a calculator, the deal editor): a tool that throws on odd input shows a notice in its place, and
// the rest of the page stands. `resetKey`: a new value (another index, other fields) tries the tool again. `onReset`: for a tool that
// reads fields kept on the device, which would throw again after a reload, the notice offers to put them back to the site's example.
import { Component, type ReactNode } from "react";
import { system } from "../copy";
import { Button, Callout } from "./kit";

interface Props {
  children: ReactNode;
  resetKey?: string;
  /** Puts the fields the tool reads back to the site's example; the tool is then tried again. */
  onReset?: () => void;
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
    const { onReset } = this.props;
    return (
      <Callout tone="caution" title={system.toolFailed.title}>
        <p>{system.toolFailed.line}</p>
        <div className="flex flex-wrap gap-x-6">
          {onReset && (
            <Button
              variant="quiet"
              flush
              onClick={() => {
                onReset();
                this.setState({ failed: false });
              }}
            >
              {system.toolFailed.resetFields}
            </Button>
          )}
          <Button variant="quiet" flush onClick={() => window.location.reload()}>
            {system.toolFailed.reload}
          </Button>
        </div>
      </Callout>
    );
  }
}
