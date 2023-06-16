import {
  AttributeValue,
  Command,
  cyan,
  dotenv,
  DynamoDBClient,
  JSONC,
  path,
  ScanCommand,
  ScanCommandInput,
  SpinnerTypes,
  TerminalSpinner,
  unmarshall,
} from "deps";

type DynoutConfig = {
  table_name: string;
  output: {
    format: "csv" | "json";
    path?: string;
  };
  attributes: string[];
  project_nulls?: boolean;
};

export default async function main() {
  const dynoutCommand = await new Command()
    .version("0.1.0")
    .option("-c, --config <config:string>", "dynout.jsonc Config file", {
      default: "dynout.jsonc",
    })
    .parse(Deno.args);

  const env = await dotenv.load();

  const accessKeyId = env["AWS_ACCESS_KEY_ID"];
  const secretAccessKey = env["AWS_SECRET_ACCESS_KEY"];
  const region = env["AWS_REGION"];

  if (!accessKeyId) {
    console.log("You must specify AWS_ACCESS_KEY_ID in your environment");
    Deno.exit(1);
  }
  if (!secretAccessKey) {
    console.log("You must specify AWS_SECRET_ACCESS_KEY in your environment");
    Deno.exit(1);
  }
  if (!region) {
    console.log("You must specify AWS_REGION in your environment");
    Deno.exit(1);
  }

  const dynoutConfig = await JSONC.parse(
    await Deno.readTextFile(dynoutCommand.options.config),
  ) as DynoutConfig;

  const dynamoDB = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const documents: Array<Record<string, unknown>> = [];

  const doScan = async (lastEvaluatedKey?: Record<string, AttributeValue>) => {
    const scanCommandInput: ScanCommandInput = {
      TableName: dynoutConfig.table_name,
      Select: "ALL_ATTRIBUTES",
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const scanCommand = new ScanCommand(scanCommandInput);

    const { Items = [], LastEvaluatedKey } = await dynamoDB.send(scanCommand);

    documents.push(...Items.map((item) => {
      const unmarshalledDoc = unmarshall(item);
      const document: Record<string, unknown> = {};
      for (const attribute of dynoutConfig.attributes) {
        // project_nulls will add the value null for any attribute missing
        if (dynoutConfig?.project_nulls) {
          document[attribute] = unmarshalledDoc[attribute] ?? null;
        } else {
          document[attribute] = unmarshalledDoc[attribute];
        }
      }
      return document;
    }));

    if (LastEvaluatedKey) {
      await doScan(LastEvaluatedKey);
    }
  };
  const spinner = new TerminalSpinner({
    text: `exporting all documents from Table '${dynoutConfig.table_name}'`,
    color: "cyan",
    indent: 2,
    spinner: SpinnerTypes.windows,
    writer: Deno.stdout,
  });

  spinner.start();

  await doScan();

  const dateStr = new Date().toISOString();
  const outputPath = dynoutConfig.output.path ??
    path.join(Deno.cwd(), "results");

  if (dynoutConfig?.output?.format === "csv") {
    const columnHeaders = dynoutConfig.attributes.join(",");
    const rows = documents.map((document) =>
      dynoutConfig.attributes.map((attribute) => document[attribute]).join(
        ",",
      )
    ).join("\n");

    const csv = [
      columnHeaders,
      rows,
    ].join("\n");

    await Deno.writeTextFile(
      path.join(outputPath, `${dynoutConfig.table_name}_${dateStr}.csv`),
      csv,
    );
  } else {
    // if the user does not specify a format, or specifies json, we default to json
    await Deno.writeTextFile(
      path.join(outputPath, `${dynoutConfig.table_name}_${dateStr}.json`),
      JSON.stringify(documents, null, 2),
    );
  }

  spinner.succeed(`success! ${cyan(`${documents.length}`)} documents written`);
}
