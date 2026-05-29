import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import useGetTask from "./use-get-task";

const getTask = vi.fn();

vi.mock("@/fetchers/task/get-task", () => ({
  default: (taskId: string) => getTask(taskId),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useGetTask", () => {
  it("does not request a task when no task id is selected", async () => {
    const { result } = renderHook(() => useGetTask(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(getTask).not.toHaveBeenCalled();
  });
});
