# dynout

A command-line tool for extracting the contents of a DynamoDB table.

## configuration

Dynout requires 3 environment variables to be set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## usage

Dynout uses a config file like the one below.

The attributes Array is ordered and the order represents the order of the
columns in the output.

The `output.format` property can be set to `"csv"` or `"json"`, and it defaults
to JSON.

```jsonc
{
  "table_name": "polyseam-events",
  "attributes": [
    "event_type",
    "redirect_target",
    "event_version",
    "request_pathname",
    "is_bot",
    "user_agent_header",
    "event_timestamp",
    "referer_header",
    "utm_id",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_source",
    "x_forwarded_for_header"
  ],
  "project_nulls": false, //  if true the JSON output will have a `null` value for missing attributes
  "output": {
    "format": "csv"
  }
}
```
