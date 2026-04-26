# n8n-nodes-usefastlaneai

N8n community node package for Fastlane AI - AI-powered content generation for social media.

## Features

This node provides integration with the Fastlane AI API, enabling automated content generation workflows in n8n.

### Supported Operations

| Operation | Description |
|-----------|-------------|
| **Pop Blitz** | Generate new content from the AI discovery queue |
| **Get Content** | Retrieve content items from your library |
| **Get Content by ID** | Get a specific content item |
| **Delete Content** | Delete unwanted content |
| **Get Preferences** | Get discovery queue tuning settings |
| **Update Preferences** | Update content type weights and other settings |
| **Get Angles** | List all content angles |
| **Create Angle** | Create a new content angle |
| **Update Angle** | Update an existing content angle |
| **Delete Angle** | Delete a content angle |
| **Get Connections** | List connected social media accounts |
| **Schedule Content** | Schedule content for posting |
| **Get Posts** | Get scheduled and posted posts |
| **Get Post by ID** | Get a specific post |
| **Cancel Posts** | Cancel scheduled posts |
| **Get Post Analytics** | Get engagement metrics for posts |

## Installation

### In n8n

1. Go to **Settings** → **Community Nodes**
2. Enter `n8n-nodes-usefastlaneai` and install

### Manual Installation

```bash
npm install n8n-nodes-usefastlaneai
```

## Setup

### 1. Get API Key

1. Log in to [Fastlane](https://app.usefastlane.ai)
2. Go to **Settings** → **API Keys**
3. Create a new API key
4. Copy the key (it will only be shown once)

### 2. Configure Credentials in n8n

1. Add a new credential in n8n
2. Select **Fastlane AI API**
3. Enter your API key
4. Test the connection

## Usage

### Basic: Pop a Blitz

Generate new AI content:

1. Add **Fastlane AI** node to your workflow
2. Select `Pop Blitz` operation
3. Connect your Fastlane AI credentials
4. Execute to generate content

The response includes:
- `contentId` - ID for polling status
- `suggestion` - Generated content details
- `swipesRemaining` - Remaining daily quota

### Example: Schedule Content Workflow

```
[Pop Blitz] → [Wait] → [Get Content by ID] → [Schedule Content]
```

1. **Pop Blitz** - Generate new content
2. **Wait** - Wait ~30 seconds for rendering
3. **Get Content** - Check status (poll until CREATED)
4. **Schedule Content** - Set platform and time

### Example: Batch Analytics

```
[Get Posts] → [Get Post Analytics]
```

Get engagement metrics for all your posts.

## Content Types

The API supports four content types:
- **Slideshow** - Multi-image carousel posts
- **Wall of Text** - Text-based posts
- **Green Screen** - Video with green screen background
- **Video Hook** - Short video hooks for social

## Documentation

- [Fastlane API Documentation](https://github.com/akshaynexus/usefastlane-api)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Development mode
bun run dev
```

## AI Agent Tool Usage

This node supports n8n AI Agent tool usage. When connected to an AI Agent, the node operations appear as available tools the agent can call.

### Requirements

For **self-hosted n8n**, set this environment variable:

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

For Docker Compose:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

Then restart n8n and connect this node to the AI Agent Tool port.

### Usage in AI Agents

Connect the Fastlane AI node to an AI Agent's tool port. The agent can then call operations like:
- "Pop a blitz to generate new content"
- "Get my recent posts"
- "Schedule content for tomorrow"

The node returns clean JSON output that AI agents can easily read.

## License

MIT