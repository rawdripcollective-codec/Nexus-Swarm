/**
 * Nexus Swarm v3 - Tool Registry
 * Dynamic tool management and capability discovery
 */

class ToolRegistry {
  constructor() {
    this.tools = [];
    this.installedTools = new Map();
    this.categories = [
      'browser',
      'github',
      'notion',
      'slack',
      'email',
      'database',
      'cloud',
      'filesystem',
      'search',
      'ocr',
      'image-analysis'
    ];
  }

  registerTool(toolConfig) {
    if (!this.categories.includes(toolConfig.category)) {
      this.categories.push(toolConfig.category);
    }

    const tool = {
      id: toolConfig.id || `tool_${Date.now()}`,
      name: toolConfig.name,
      category: toolConfig.category,
      description: toolConfig.description,
      permissions: toolConfig.permissions || [],
      enabled: toolConfig.enabled !== false,
      version: toolConfig.version || '1.0.0',
      dependencies: toolConfig.dependencies || [],
      acquiredAt: toolConfig.acquiredAt || null,
      executor: toolConfig.executor
    };
    
    const existingIndex = this.tools.findIndex(t => t.id === tool.id);
    if (existingIndex >= 0) {
      this.tools[existingIndex] = { ...this.tools[existingIndex], ...tool };
    } else {
      this.tools.push(tool);
    }
    this.installedTools.set(tool.id, tool);
    return tool.id;
  }

  acquireTool(toolConfig, requestedPermissions = []) {
    const tool = {
      ...toolConfig,
      permissions: requestedPermissions.length ? requestedPermissions : (toolConfig.permissions || []),
      enabled: toolConfig.enabled !== false,
      acquiredAt: new Date().toISOString()
    };
    this.registerTool(tool);
    return this.getTool(tool.id);
  }

  recommendToolsForMission(mission = '') {
    const text = mission.toLowerCase();
    const categoryHints = {
      browser: ['browser', 'website', 'webpage', 'crawl'],
      Browser: ['browser', 'website', 'webpage', 'crawl'],
      github: ['code', 'repo', 'pull request', 'github'],
      notion: ['knowledge base', 'notes', 'documentation'],
      slack: ['team', 'notify', 'alert'],
      email: ['lead', 'outreach', 'email'],
      database: ['data', 'database', 'sql'],
      cloud: ['deploy', 'cloud', 'hosting'],
      filesystem: ['file', 'document', 'folder'],
      search: ['research', 'search', 'competitor'],
      ocr: ['screenshot', 'pdf', 'scan'],
      'image-analysis': ['image', 'photo', 'diagram', 'wireframe'],
      'Image Analysis': ['image', 'photo', 'diagram', 'wireframe']
    };

    return this.tools.filter(tool => {
      const hints = categoryHints[tool.category] || [];
      return hints.some(hint => text.includes(hint));
    });
  }

  getToolsByCategory(category) {
    return this.tools.filter(t => t.category === category && t.enabled);
  }

  getTool(id) {
    return this.tools.find(t => t.id === id);
  }

  enableTool(id) {
    const tool = this.getTool(id);
    if (tool) tool.enabled = true;
  }

  disableTool(id) {
    const tool = this.getTool(id);
    if (tool) tool.enabled = false;
  }

  async executeTool(toolId, input) {
    const tool = this.getTool(toolId);
    if (!tool || !tool.enabled) {
      throw new Error(`Tool ${toolId} not found or disabled`);
    }
    
    try {
      if (tool.executor) {
        return await tool.executor(input);
      }
      return { success: true, result: `Tool ${tool.name} executed` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  export() {
    return {
      totalTools: this.tools.length,
      enabledTools: this.tools.filter(t => t.enabled).length,
      tools: this.tools.map(({ executor, ...tool }) => tool),
      toolsByCategory: this.categories.map(cat => ({
        category: cat,
        count: this.getToolsByCategory(cat).length
      }))
    };
  }
}

// Pre-configured tool templates
const TOOL_TEMPLATES = {
  BROWSER_TOOLS: [
    {
      id: 'browser-fetch',
      name: 'HTTP Fetch',
      category: 'browser',
      description: 'Fetch URLs and retrieve content',
      permissions: ['read:network']
    },
    {
      id: 'browser-dom',
      name: 'DOM Parser',
      category: 'browser',
      description: 'Parse and navigate DOM structures',
      permissions: ['read:dom']
    }
  ],
  
  GITHUB_TOOLS: [
    {
      id: 'github-api',
      name: 'GitHub API',
      category: 'github',
      description: 'Interact with GitHub repositories',
      permissions: ['read:repos', 'write:repos']
    },
    {
      id: 'github-search',
      name: 'GitHub Search',
      category: 'github',
      description: 'Search GitHub code and issues',
      permissions: ['read:search']
    }
  ],
  
  SEARCH_TOOLS: [
    {
      id: 'web-search',
      name: 'Web Search',
      category: 'search',
      description: 'Search the internet',
      permissions: ['read:search']
    },
    {
      id: 'news-search',
      name: 'News Search',
      category: 'search',
      description: 'Search news and headlines',
      permissions: ['read:search']
    }
  ]
};

function createToolRegistry(templates = []) {
  const registry = new ToolRegistry();
  templates.forEach(toolList => {
    Object.values(toolList).forEach(tool => {
      registry.registerTool(tool);
    });
  });
  return registry;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ToolRegistry,
    TOOL_TEMPLATES,
    createToolRegistry
  };
}
