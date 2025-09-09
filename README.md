Network Utility MCP Server

This project is a Model Context Protocol (MCP) Server that provides basic network diagnostic tools similar to classic utilities like telnet and nslookup. It is built with Node.js + TypeScript and communicates over stdio for integration with MCP clients (e.g., Claude Desktop).

Features

Check if a host/port is open or closed (like telnet).

 Perform DNS lookups (A, AAAA, CNAME, MX, TXT, etc.).

 Fast, lightweight, and runs fully on stdio for easy integration.

Getting Started
1. Clone the repository
git clone https://github.com/ravularajavardhan96/Durbhasi-gurukulam
.git
cd network-utils

2. Install dependencies
npm install

3. Build the project
npm run build


On Windows, you may see a warning about chmod. This can be ignored; the server will still work fine.

4. Run the server
node build/index.js


You should see:

 Network Utility MCP Server Started
Network MCP Server running on stdio

 Usage in Claude (or other MCP clients)

Add the following entry to your MCP client config (e.g., claude_desktop_config.json):

{
  "mcpServers": {
    "network-utils": {
      "command": "node",
      "args": ["C:/Users/your-username/Desktop/network-utils/build/index.js"]
    }
  }
}


Restart Claude Desktop after editing the config. The tools check_port and dns_lookup will then be available inside the client.

Available Tools
1. check_port

Checks if a given host/port is open.
Example:

Tool: check_port
Args: { "host": "google.com", "port": 80 }


Output:

Host google.com port 80 is OPEN

2. dns_lookup

Performs a DNS query for a given hostname and record type.
Example:

Tool: dns_lookup
Args: { "host": "google.com", "recordType": "A" }


Output:

DNS A records for google.com:
["142.250.182.14"]

 Tech Stack

Node.js

TypeScript

MCP SDK (@modelcontextprotocol/sdk)

Zod for schema validation
