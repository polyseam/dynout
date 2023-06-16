import { load } from "https://deno.land/std@0.177.1/dotenv/mod.ts";
export * as JSONC from "https://deno.land/std@0.192.0/jsonc/mod.ts";
export { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
export * as path from "https://deno.land/std@0.180.0/path/mod.ts";
export { cyan } from "https://deno.land/std@0.192.0/fmt/colors.ts";

export {
  SpinnerTypes,
  TerminalSpinner,
} from "https://deno.land/x/spinners@v1.1.2/mod.ts";

export {
  DynamoDBClient,
  ScanCommand,
} from "npm:@aws-sdk/client-dynamodb@3.267.0";

export { unmarshall } from "npm:@aws-sdk/util-dynamodb";

export type {
  AttributeValue,
  ScanCommandInput,
  ScanCommandOutput,
} from "npm:@aws-sdk/client-dynamodb@3.267.0";

const dotenv = {
  load,
};

export { dotenv };
