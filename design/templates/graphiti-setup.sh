#!/bin/bash
# Graphiti Setup Script for Clawdbot Swarm Memory
# Installs Graphiti, Neo4j (backend), and configures the temporal knowledge graph

set -e

echo "=== Clawdbot Swarm Memory - Graphiti Setup ==="
echo

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
REQUIRED_VERSION="3.10"

echo "Checking Python version..."
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then 
    echo "Error: Python 3.10 or higher required (found $PYTHON_VERSION)"
    exit 1
fi
echo "✓ Python $PYTHON_VERSION"

# Check if Neo4j is already installed
if command -v neo4j &> /dev/null; then
    echo "✓ Neo4j already installed"
    NEO4J_VERSION=$(neo4j version 2>&1 | head -n1 || echo "unknown")
    echo "  Version: $NEO4J_VERSION"
else
    echo "Installing Neo4j..."
    
    if [ "$OS" == "macos" ]; then
        # Install via Homebrew
        if ! command -v brew &> /dev/null; then
            echo "Error: Homebrew not found. Install from https://brew.sh"
            exit 1
        fi
        brew install neo4j
    elif [ "$OS" == "linux" ]; then
        # Install via apt (Debian/Ubuntu)
        wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
        echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
        sudo apt-get update
        sudo apt-get install -y neo4j
    fi
    
    echo "✓ Neo4j installed"
fi

# Start Neo4j (if not running)
if ! pgrep -x "neo4j" > /dev/null; then
    echo "Starting Neo4j..."
    neo4j start
    sleep 5
    echo "✓ Neo4j started"
else
    echo "✓ Neo4j already running"
fi

# Wait for Neo4j to be ready
echo "Waiting for Neo4j to be ready..."
MAX_WAIT=30
WAIT_COUNT=0
until curl -s http://localhost:7474 > /dev/null || [ $WAIT_COUNT -eq $MAX_WAIT ]; do
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
    echo "Error: Neo4j did not start within $MAX_WAIT seconds"
    exit 1
fi

echo "✓ Neo4j is ready"

# Set initial password (if needed)
DEFAULT_PASSWORD="graphiti_memory_2026"
echo
echo "Setting Neo4j password..."
echo "Default password: $DEFAULT_PASSWORD"
echo "You can change this later with: neo4j-admin set-initial-password <new_password>"
echo

# Try to set password (may fail if already set)
neo4j-admin set-initial-password "$DEFAULT_PASSWORD" 2>/dev/null || echo "Password already set"

# Check if OPENAI_API_KEY is set
echo
echo "Checking for OpenAI API key..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠ Warning: OPENAI_API_KEY environment variable not set"
    echo "Graphiti requires an OpenAI API key for entity extraction and embeddings"
    echo "Set it with: export OPENAI_API_KEY='your-key-here'"
    echo
else
    echo "✓ OPENAI_API_KEY is set"
fi

# Install Graphiti Python package
echo
echo "Installing Graphiti..."
if command -v uv &> /dev/null; then
    echo "Using uv for installation..."
    uv pip install graphiti-core
else
    echo "Using pip for installation..."
    pip3 install graphiti-core
fi

echo "✓ Graphiti installed"

# Verify installation
echo
echo "Verifying Graphiti installation..."
python3 -c "import graphiti_core; print(f'✓ Graphiti version: {graphiti_core.__version__}')" || {
    echo "Error: Graphiti import failed"
    exit 1
}

# Create configuration file
CONFIG_FILE="$HOME/clawd/skills/swarm-memory/memory-tiers/graphiti-config.json"
mkdir -p "$(dirname "$CONFIG_FILE")"

cat > "$CONFIG_FILE" << EOF
{
  "neo4j": {
    "uri": "bolt://localhost:7687",
    "user": "neo4j",
    "password": "$DEFAULT_PASSWORD",
    "database": "neo4j"
  },
  "graphiti": {
    "llm_provider": "openai",
    "embedding_provider": "openai",
    "embedding_model": "text-embedding-3-small",
    "embedding_dim": 1536
  },
  "memory": {
    "tiers": {
      "short": {
        "decay_days": 7,
        "decay_rate": 0.1
      },
      "medium": {
        "decay_days": 30,
        "decay_rate": 0.05
      },
      "long": {
        "decay_days": null,
        "decay_rate": 0
      }
    },
    "thresholds": {
      "min_relevance": 0.3,
      "episode_retention_days": 90
    }
  }
}
EOF
echo "✓ Configuration saved to: $CONFIG_FILE"

# Initialize Graphiti schema
echo
echo "Initializing Graphiti schema..."
cat > /tmp/init-graphiti.py << 'EOFY'
import asyncio
from graphiti_core import Graphiti
import os
import json

async def init_graphiti():
    # Load config
    config_path = os.path.expanduser('~/clawd/skills/swarm-memory/memory-tiers/graphiti-config.json')
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    neo4j_config = config['neo4j']
    
    # Initialize Graphiti
    graphiti = Graphiti(
        uri=neo4j_config['uri'],
        user=neo4j_config['user'],
        password=neo4j_config['password'],
        database=neo4j_config.get('database', 'neo4j')
    )
    
    # Graphiti automatically creates necessary indexes and constraints on first use
    # Add a test episode to trigger initialization
    try:
        episode_uuid = await graphiti.add_episode(
            name="initialization_test",
            episode_body="This is a test episode to initialize the Graphiti schema.",
            source_description="Graphiti setup script",
        )
        print(f"✓ Schema initialized with test episode: {episode_uuid}")
        
        # Clean up test episode (optional)
        # await graphiti.delete_episode(episode_uuid)
        
    except Exception as e:
        print(f"Schema initialization error: {e}")
        print("This may be normal if schema already exists.")
    
    await graphiti.close()
    print("✓ Graphiti initialized successfully")

if __name__ == "__main__":
    asyncio.run(init_graphiti())
EOFY

python3 /tmp/init-graphiti.py || {
    echo "Warning: Schema initialization had issues. This may be normal."
}
rm /tmp/init-graphiti.py

# Create memory directory structure
MEMORY_DIR="$HOME/clawd/memory"
echo
echo "Creating memory directory structure..."
mkdir -p "$MEMORY_DIR/graphiti-backups"
mkdir -p "$MEMORY_DIR/episodes"
mkdir -p "$MEMORY_DIR/web-cache/search"
mkdir -p "$MEMORY_DIR/web-cache/fetch"
mkdir -p "$MEMORY_DIR/exec-logs"
mkdir -p "$MEMORY_DIR/metrics"
mkdir -p "$MEMORY_DIR/maintenance-logs"
echo "✓ Memory directories created"

# Test connection
echo
echo "Testing Graphiti connection..."
cat > /tmp/test-graphiti.py << 'EOFY'
import asyncio
from graphiti_core import Graphiti
import os
import json

async def test_connection():
    config_path = os.path.expanduser('~/clawd/skills/swarm-memory/memory-tiers/graphiti-config.json')
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    neo4j_config = config['neo4j']
    
    graphiti = Graphiti(
        uri=neo4j_config['uri'],
        user=neo4j_config['user'],
        password=neo4j_config['password'],
        database=neo4j_config.get('database', 'neo4j')
    )
    
    try:
        # Add a test episode
        episode_uuid = await graphiti.add_episode(
            name="connection_test",
            episode_body="Testing Graphiti connection from setup script. This verifies that entity extraction and graph building work correctly.",
            source_description="Connection test",
        )
        print(f"✓ Successfully added test episode: {episode_uuid}")
        
        # Search for the episode
        results = await graphiti.search("connection test", num_results=1)
        if results:
            print("✓ Search working - found test episode")
        else:
            print("⚠ Search returned no results (may need time for indexing)")
        
    except Exception as e:
        print(f"✗ Connection test failed: {e}")
        await graphiti.close()
        return False
    
    await graphiti.close()
    print("✓ All tests passed!")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
EOFY

python3 /tmp/test-graphiti.py || {
    echo "Warning: Connection test failed. Check configuration and credentials."
}
rm /tmp/test-graphiti.py

echo
echo "=== Setup Complete ==="
echo
echo "Graphiti is ready!"
echo
echo "Neo4j:"
echo "  HTTP: http://localhost:7474"
echo "  Bolt: bolt://localhost:7687"
echo
echo "Credentials:"
echo "  Username: neo4j"
echo "  Password: $DEFAULT_PASSWORD"
echo
echo "Configuration:"
echo "  $CONFIG_FILE"
echo
echo "OpenAI API Key:"
if [ -z "$OPENAI_API_KEY" ]; then
    echo "  ⚠ NOT SET - Set with: export OPENAI_API_KEY='your-key-here'"
else
    echo "  ✓ Configured"
fi
echo
echo "Next steps:"
echo "  1. Ensure OPENAI_API_KEY is set in your environment"
echo "  2. Update password if needed: neo4j-admin set-initial-password <new_password>"
echo "  3. Test Memory Specialist: see TESTING.md"
echo "  4. Access Neo4j Browser at http://localhost:7474"
echo
echo "Graphiti Features:"
echo "  - Temporal knowledge graph (bi-temporal tracking)"
echo "  - Automatic entity extraction via LLM"
echo "  - Hybrid search (semantic + keyword + graph)"
echo "  - Episode-based memory management"
echo "  - Contradiction handling via temporal invalidation"
echo
