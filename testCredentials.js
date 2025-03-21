const {
  DynamoDBClient,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

async function listTables() {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log("Tables:", response.TableNames);
  } catch (error) {
    console.error("Error publication tables:", error);
  }
}

listTables();
