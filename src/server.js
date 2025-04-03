import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { whatsappTools } from './tools/index.js';
    import { whatsappResources } from './resources/index.js';

    // Create an MCP server for WhatsApp Business API
    const server = new McpServer({
      name: "WhatsApp Business API",
      version: "1.0.0",
      description: "MCP Server for interacting with WhatsApp Business API"
    });

    // Register all WhatsApp tools
    Object.entries(whatsappTools).forEach(([name, tool]) => {
      server.tool(
        name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    // Register all WhatsApp resources
    Object.entries(whatsappResources).forEach(([name, resource]) => {
      server.resource(
        name,
        new ResourceTemplate(resource.template, { list: resource.list }),
        resource.handler
      );
    });

    export { server };
