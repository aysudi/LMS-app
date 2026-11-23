import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FaServer } from "react-icons/fa";
import { api } from "../../services/api";
import { queryClient } from "../../utils/queryClient";
import {
  getServerStatus,
  subscribeServerStatus,
} from "../../utils/serverStatus";

const AUTO_CHECK_INTERVAL_MS = 10000;
const MAX_AUTO_CHECKS = 12;

const ServerStatusBanner = () => {
  const status = useSyncExternalStore(subscribeServerStatus, getServerStatus);
  const [isChecking, setIsChecking] = useState(false);
  const checking = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const checkServer = useCallback(async (signal?: AbortSignal) => {
    if (checking.current) return;
    checking.current = true;
    setIsChecking(true);
    try {
      await api.get("/health", { signal });
      await queryClient.refetchQueries({
        type: "active",
        predicate: (query) => query.state.status === "error",
      });
    } catch {
    } finally {
      checking.current = false;
      if (mounted.current) setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "unavailable") return;

    const controller = new AbortController();
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts += 1;
      if (attempts > MAX_AUTO_CHECKS) {
        clearInterval(intervalId);
        return;
      }
      void checkServer(controller.signal);
    }, AUTO_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [status, checkServer]);

  if (status !== "unavailable") return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-3 bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900 shadow"
    >
      <FaServer className="shrink-0 text-amber-600" />
      <span>
        The server is starting up or temporarily unavailable. This can take up
        to a minute. We are retrying automatically.
      </span>
      <button
        type="button"
        onClick={() => void checkServer()}
        disabled={isChecking}
        className="shrink-0 rounded-md bg-amber-600 px-3 py-1 font-medium text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
      >
        {isChecking ? "Checking..." : "Retry now"}
      </button>
    </div>
  );
};

export default ServerStatusBanner;
