// The current MVP has no backend connection: the demo screens share localStorage.
export default function useConnection() {
  return { connected: true };
}
