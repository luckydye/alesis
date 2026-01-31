# Alesis V49 Browser Editor

Browser-based MIDI configuration editor for the Alesis V49 keyboard controller.

Built with:
- **Web MIDI API** - SysEx communication with V49
- **Preact** - Lightweight React alternative
- **Vite** - Fast dev server and build tool
- **TailwindCSS** - Utility-first styling
- **TypeScript** - Type-safe development

**Browser Support:** Chrome, Edge, Brave (Web MIDI API required)

## Development

### Setup

Use [mise](https://mise.jdx.dev/getting-started.html) to install all dependencies

```shell
mise install
```

OR install them manually with versions pinned in [.mise.toml](.mise.toml).

See

```shell
task
```

to list all available commands.

<br/>

## Initial Setup

Run the following command to setup the project on your system:

```shell
task setup
```

The setup task can be rerun to update dependencies and configurations.

<br/>

## Usage

1. Connect your Alesis V49 via USB
2. Run `task dev` to start the development server
3. Open http://localhost:3000 in Chrome/Edge/Brave
4. Click "Connect to V49" and grant MIDI access
5. Edit knobs, pads, and buttons configuration
6. Click "Send to Device" to apply changes

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details.

<br/>
