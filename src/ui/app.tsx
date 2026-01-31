/**
 * Main application component.
 * Orchestrates MIDI connection, state management, and UI rendering.
 */

import { Component } from "preact";
import { ErrorBoundary } from "./error-boundary.tsx";
import { DeviceSelector } from "./device-selector.tsx";
import { KnobEditor, PadEditor, ButtonEditor } from "./controls.tsx";
import type { V49Config } from "../model/config.ts";
import type { V49State } from "../model/state.ts";

interface AppProps {
  state: V49State;
  onConnect: () => Promise<void>;
  onSendToDevice: () => Promise<void>;
}

interface AppState {
  connected: boolean;
  config: V49Config | null;
  sending: boolean;
}

export class App extends Component<AppProps, AppState> {
  state: AppState = {
    connected: false,
    config: null,
    sending: false,
  };

  unsubscribe: (() => void) | null = null;

  componentDidMount(): void {
    this.unsubscribe = this.props.state.subscribe((config) => {
      console.log("App received config update:", config);
      this.setState({ config });
    });

    if (this.props.state.config) {
      console.log("Initial config already exists:", this.props.state.config);
      this.setState({ config: this.props.state.config });
    }
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleConnect = async () => {
    await this.props.onConnect();
    this.setState({ connected: true });
  };

  handleSendToDevice = async () => {
    this.setState({ sending: true });
    try {
      await this.props.onSendToDevice();
    } finally {
      this.setState({ sending: false });
    }
  };

  render() {
    const { config, connected, sending } = this.state;
    const { state } = this.props;

    return (
      <ErrorBoundary>
        <div class="min-h-screen bg-gray-50 p-8">
          <div class="max-w-7xl mx-auto">
            <header class="mb-8">
              <h1 class="text-4xl font-bold mb-2">Alesis V49 Editor</h1>
              <p class="text-gray-600">Browser-based MIDI configuration editor</p>
            </header>

            <div class="mb-6">
              <DeviceSelector connected={connected} onConnect={this.handleConnect} />
            </div>

            {connected && config && (
              <>
                <section class="mb-8">
                  <h2 class="text-2xl font-semibold mb-4">Knobs</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {config.knobs.map((knob, i) => (
                      <KnobEditor
                        key={i}
                        index={i}
                        config={knob}
                        onUpdate={(idx, updates) => state.updateKnob(idx, updates)}
                      />
                    ))}
                  </div>
                </section>

                <section class="mb-8">
                  <h2 class="text-2xl font-semibold mb-4">Pads</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {config.pads.map((pad, i) => (
                      <PadEditor
                        key={i}
                        index={i}
                        config={pad}
                        onUpdate={(idx, updates) => state.updatePad(idx, updates)}
                      />
                    ))}
                  </div>
                </section>

                <section class="mb-8">
                  <h2 class="text-2xl font-semibold mb-4">Buttons</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {config.buttons.map((button, i) => (
                      <ButtonEditor
                        key={i}
                        index={i}
                        config={button}
                        onUpdate={(idx, updates) => state.updateButton(idx, updates)}
                      />
                    ))}
                  </div>
                </section>

                <div class="sticky bottom-8 flex justify-end">
                  <button
                    onClick={this.handleSendToDevice}
                    disabled={sending}
                    class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-colors"
                  >
                    {sending ? "Sending..." : "Send to Device"}
                  </button>
                </div>
              </>
            )}

            {connected && !config && (
              <div class="text-center py-12 text-gray-500">Loading configuration...</div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}
