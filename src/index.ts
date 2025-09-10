console.error("MCP Server Start");

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import net from "net";
import dns from "dns/promises";

const server = new McpServer({
  name: "network-utils",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

async function checkPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const cleanup = () => {
      if (!done) {
        done = true;
        socket.destroy();
      }
    };

    socket.setTimeout(3000); 

    socket.once("connect", () => {
      cleanup();
      resolve(true);
    });

    socket.once("timeout", () => {
      cleanup();
      resolve(false);
    });

    socket.once("error", () => {
      cleanup();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

server.tool(
  "check_port",
  "Check if a host/port is open or closed",
  {
    host: z.string().describe("Hostname or IP to check"),
    port: z.number().min(1).max(65535).describe("Port number"),
  },
  async (args: { host: string; port: number }) => {
    const { host, port } = args;
    const isOpen = await checkPortOpen(host, port);
    return {
      content: [
        {
          type: "text",
          text: `Host ${host} port ${port} is ${isOpen ? "OPEN" : "CLOSED"}`,
        },
      ],
    };
  }
);

server.tool(
  "dns_lookup",
  "Perform a DNS query (A, AAAA, MX, CNAME, TXT, etc.)",
  {
    host: z.string().describe("Hostname to resolve"),
    recordType: z.string().describe("DNS record type like A, AAAA, MX, CNAME, TXT"),
  },
  async (args: { host: string; recordType: string }) => {
    const { host, recordType } = args;
    try {
      const records = await dns.resolve(host, recordType as any);
      return {
        content: [
          {
            type: "text",
            text: `DNS ${recordType} records for ${host}:\n${JSON.stringify(records, null, 2)}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to lookup ${recordType} for ${host}. Error: ${err.message || err}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Network MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error in main()", err);
  process.exit(1);
});
