declare module '@tanstack/react-query' {
  export interface QueryOptions<TData = unknown, TError = unknown> {
    queryKey: unknown[];
    queryFn: (context: any) => Promise<TData>;
    getNextPageParam?: (lastPage: any) => any;
    initialPageParam?: any;
  }

  export interface InfiniteQueryResult<TData = unknown, TError = unknown> {
    data?: {
      pages: TData[];
    };
    fetchNextPage: () => Promise<any>;
    hasNextPage: boolean | undefined;
    isLoading: boolean;
    isError: boolean;
    error?: TError;
  }

  export function useInfiniteQuery<TData = unknown, TError = unknown>(options: QueryOptions<TData, TError>): InfiniteQueryResult<TData, TError>;
}
