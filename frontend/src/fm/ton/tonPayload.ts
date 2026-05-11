import { Address, beginCell, toNano } from "@ton/core";

/** Text comment cell for native TON transfer (opcode 0 + tail). */
export function tonNativeCommentPayloadB64(comment: string): string {
  return beginCell()
    .storeUint(0, 32)
    .storeStringTail(comment)
    .endCell()
    .toBoc({ idx: false })
    .toString("base64");
}

/** Jetton (TEP-74) internal transfer body; message is sent **to the user's jetton wallet** contract. */
export function jettonTransferBodyB64(params: {
  jettonAmount: bigint;
  /** Owner address of treasury (receives jettons). */
  destinationFriendly: string;
  /** Excesses / bounce: usually the connected user's TON address. */
  responseDestinationFriendly: string;
  forwardTonAmount: bigint;
  comment: string;
}): string {
  const dest = Address.parse(params.destinationFriendly);
  const resp = Address.parse(params.responseDestinationFriendly);
  const forward = beginCell().storeUint(0, 32).storeStringTail(params.comment).endCell();
  return beginCell()
    .storeUint(0x0f8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(params.jettonAmount)
    .storeAddress(dest)
    .storeAddress(resp)
    .storeBit(0)
    .storeCoins(params.forwardTonAmount)
    .storeBit(1)
    .storeRef(forward)
    .endCell()
    .toBoc({ idx: false })
    .toString("base64");
}

export { toNano };
