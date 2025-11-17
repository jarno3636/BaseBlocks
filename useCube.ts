"use client";

import { useReadContract } from "wagmi";
import { BASEBLOCKS_ADDRESS, BASEBLOCKS_ABI } from "@/lib/baseblocksAbi";

export function useCube(id?: string | number) {
  const enabled = Boolean(id);

  const { data: cubeData } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "getCubeData",
    args: enabled ? [BigInt(id!)] : undefined,
    query: { enabled },
  });

  const { data: tokenUri } = useReadContract({
    address: BASEBLOCKS_ADDRESS,
    abi: BASEBLOCKS_ABI,
    functionName: "tokenURI",
    args: enabled ? [BigInt(id!)] : undefined,
    query: { enabled },
  });

  return { cubeData, tokenUri };
}
