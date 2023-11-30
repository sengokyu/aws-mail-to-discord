import { SESReceipt } from "aws-lambda";

export const isSpam = (receipt: SESReceipt): boolean =>
  receipt.dkimVerdict.status === "FAIL" ||
  receipt.spamVerdict.status === "FAIL" ||
  receipt.spfVerdict.status === "FAIL" ||
  receipt.virusVerdict.status === "FAIL";
