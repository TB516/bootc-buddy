import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Effect } from "effect";
import { getBootcStatus } from "../bootc/commands/status.ts";
import { nodeProcessLayer } from "../bootc/runtime/node-process-layer.ts";

/** Snapshot of the latest `bootc status` request. */
export type BootcStatusSnapshot =
  | {
      readonly state: "loading";
      readonly data: null;
      readonly error: null;
    }
  | {
      readonly state: "loaded";
      readonly data: Effect.Success<typeof getBootcStatus>;
      readonly error: null;
    }
  | {
      readonly state: "error";
      readonly data: null;
      readonly error: Effect.Error<typeof getBootcStatus>;
    };

type BootcStatusContextValue = BootcStatusSnapshot & {
  readonly refreshStatus: () => Promise<void>;
};

type BootcStatusProviderProps = {
  readonly children: ReactNode;
};

const BootcStatusContext = createContext<BootcStatusContextValue | null>(null);

/**
 * Provide `bootc status` data to descendant components.
 *
 * The provider starts one status request on mount and exposes `refreshStatus`
 * for manual reloads. Concurrent refresh calls share the same in-flight request.
 *
 * @param props Provider props.
 * @returns The rendered context provider.
 */
export function BootcStatusProvider(props: BootcStatusProviderProps): ReactNode {
  const [snapshot, setSnapshot] = useState<BootcStatusSnapshot>({
    state: "loading",
    data: null,
    error: null,
  });
  const statusRequestInFlight = useRef<Promise<void> | null>(null);

  const refreshStatus = useCallback(async (): Promise<void> => {
    if (statusRequestInFlight.current !== null) {
      return await statusRequestInFlight.current;
    }

    setSnapshot({ state: "loading", data: null, error: null });

    const statusRequest = Effect.runPromise(
      getBootcStatus.pipe(
        Effect.match({
          onFailure: (error): BootcStatusSnapshot => ({
            state: "error",
            data: null,
            error,
          }),
          onSuccess: (data): BootcStatusSnapshot => ({
            state: "loaded",
            data,
            error: null,
          }),
        }),
        Effect.provide(nodeProcessLayer),
      ),
    ).then((snapshot): void => {
      setSnapshot(snapshot);
    });

    statusRequestInFlight.current = statusRequest;

    try {
      await statusRequest;
    } finally {
      if (statusRequestInFlight.current === statusRequest) {
        statusRequestInFlight.current = null;
      }
    }
  }, []);

  useEffect((): void => {
    void refreshStatus();
  }, [refreshStatus]);

  return <BootcStatusContext value={{ ...snapshot, refreshStatus }}>{props.children}</BootcStatusContext>;
}

/**
 * Read the current `bootc status` snapshot from context.
 *
 * @returns Current status snapshot and refresh callback.
 */
export function useBootcStatus(): BootcStatusContextValue {
  const context = useContext(BootcStatusContext);

  if (context === null) {
    throw new Error("useBootcStatus must be used within BootcStatusProvider");
  }

  return context;
}
