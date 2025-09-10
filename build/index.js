"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.error("=== Network Utility MCP Server Starting ===");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const net_1 = __importDefault(require("net"));
const promises_1 = __importDefault(require("dns/promises"));
const server = new mcp_js_1.McpServer({
    name: "network-utils",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
async function checkPortOpen(host, port) {
    return new Promise((resolve) => {
        const socket = new net_1.default.Socket();
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
server.tool("check_port", "Check if a host/port is open or closed", {
    host: zod_1.z.string().describe("Hostname or IP to check"),
    port: zod_1.z.number().min(1).max(65535).describe("Port number"),
}, async (args) => {
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
});
server.tool("dns_lookup", "Perform a DNS query (A, AAAA, MX, CNAME, TXT, etc.)", {
    host: zod_1.z.string().describe("Hostname to resolve"),
    recordType: zod_1.z.string().describe("DNS record type like A, AAAA, MX, CNAME, TXT"),
}, async (args) => {
    const { host, recordType } = args;
    try {
        const records = await promises_1.default.resolve(host, recordType);
        return {
            content: [
                {
                    type: "text",
                    text: `DNS ${recordType} records for ${host}:\n${JSON.stringify(records, null, 2)}`,
                },
            ],
        };
    }
    catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to lookup ${recordType} for ${host}. Error: ${err.message || err}`,
                },
            ],
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Network MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Fatal error in main()", err);
    process.exit(1);
});
