/**
 * Device connection button.
 * Shows connect button when disconnected, status when connected.
 */

interface DeviceSelectorProps {
  connected: boolean;
  onConnect: () => void;
}

export function DeviceSelector({ connected, onConnect }: DeviceSelectorProps) {
  if (connected) {
    return (
      <div class="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
        <span class="text-green-800 font-semibold">✓ Connected to Alesis V49</span>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
    >
      Connect to V49
    </button>
  );
}
