/**
 * Device connection selector.
 * Shows list of discovered devices or connection status.
 */

export interface V49Device {
  name: string;
  inputId: string;
  outputId: string;
}

interface DeviceSelectorProps {
  connected: boolean;
  connectedDevice: string | null;
  devices: V49Device[];
  discovering: boolean;
  onDiscover: () => void;
  onConnect: (device: V49Device) => void;
}

export function DeviceSelector({
  connected,
  connectedDevice,
  devices,
  discovering,
  onDiscover,
  onConnect,
}: DeviceSelectorProps) {
  if (connected && connectedDevice) {
    return (
      <div class="flex items-center gap-2 bg-green-950 border border-green-700 px-4 py-2 rounded-lg">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-green-300 font-semibold text-sm">{connectedDevice}</span>
      </div>
    );
  }

  if (discovering) {
    return (
      <div class="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg">
        <div class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span class="text-gray-300 text-sm">Discovering devices...</span>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <button
        onClick={onDiscover}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
      >
        Discover Devices
      </button>
    );
  }

  return (
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 min-w-80">
      <div class="text-xs text-gray-400 mb-2">Select device to connect:</div>
      <div class="space-y-2">
        {devices.map((device) => (
          <button
            key={device.inputId}
            onClick={() => onConnect(device)}
            class="w-full text-left px-3 py-2 bg-gray-900 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded transition-colors flex items-center gap-2"
          >
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-gray-200 text-sm font-medium">{device.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onDiscover}
        class="w-full mt-2 text-xs text-gray-500 hover:text-gray-300 py-1"
      >
        Refresh
      </button>
    </div>
  );
}
