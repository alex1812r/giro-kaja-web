"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchClientsList } from "../services/fetchClientsList";

export const clientsQueryKeys = {
  all: ["clients"] as const,
  list: () => [...clientsQueryKeys.all, "list"] as const,
};

export function useClientsList() {
  return useQuery({
    queryKey: clientsQueryKeys.list(),
    queryFn: fetchClientsList,
  });
}
