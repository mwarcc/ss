// Unity WebGL Loader with improved logging and clarity
const UnityLoader = {
  // Configuration object to store Unity settings
  config: {
    dataUrl: null,
    frameworkUrl: null, 
    codeUrl: null,
    streamingAssetsUrl: null,
    companyName: null,
    productName: null,
    productVersion: null,
    showBanner: null
  },

  // Logging utilities
  logger: {
    info: (msg) => console.log(`[Unity Loader] ${msg}`),
    warn: (msg) => console.warn(`[Unity Loader] ${msg}`),
    error: (msg) => console.error(`[Unity Loader] ${msg}`)
  },

  // Initialize the loader with configuration
  init(config) {
    this.config = {...this.config, ...config};
    this.logger.info('Initializing Unity loader');
    this.logger.info(`Loading game from: ${this.config.dataUrl}`);
    
    return this.load();
  },

  // Main loading function
  async load() {
    try {
      // Check browser compatibility
      if (!this.checkCompatibility()) {
        throw new Error('Browser compatibility check failed');
      }

      // Load required files
      const [framework, code, data] = await Promise.all([
        this.loadFramework(),
        this.loadCode(), 
        this.loadData()
      ]);

      // Initialize Unity instance
      const unityInstance = await this.createUnityInstance(framework, code, data);
      
      this.logger.info('Unity loaded successfully');
      return unityInstance;

    } catch (error) {
      this.logger.error(`Failed to load Unity: ${error.message}`);
      throw error;
    }
  },

  // Check browser compatibility
  checkCompatibility() {
    const requirements = {
      webgl: !!window.WebGLRenderingContext,
      webgl2: !!window.WebGL2RenderingContext,
      webassembly: typeof WebAssembly === 'object'
    };

    this.logger.info('Browser compatibility:', requirements);

    if (!requirements.webgl) {
      throw new Error('WebGL not supported');
    }
    if (!requirements.webgl2) {
      throw new Error('WebGL 2 not supported');
    }
    if (!requirements.webassembly) {
      throw new Error('WebAssembly not supported');
    }

    return true;
  },

  // Load the Unity framework
  async loadFramework() {
    this.logger.info(`Loading framework from ${this.config.frameworkUrl}`);
    const response = await fetch(this.config.frameworkUrl);
    if (!response.ok) {
      throw new Error(`Failed to load framework: ${response.status}`);
    }
    return await response.text();
  },

  // Load Unity code (WebAssembly)
  async loadCode() {
    this.logger.info(`Loading code from ${this.config.codeUrl}`);
    const response = await fetch(this.config.codeUrl);
    if (!response.ok) {
      throw new Error(`Failed to load code: ${response.status}`);
    }
    return await response.arrayBuffer();
  },

  // Load game data
  async loadData() {
    this.logger.info(`Loading game data from ${this.config.dataUrl}`);
    const response = await fetch(this.config.dataUrl);
    if (!response.ok) {
      throw new Error(`Failed to load game data: ${response.status}`);
    }
    return await response.arrayBuffer();
  },

  // Create Unity instance
  async createUnityInstance(framework, code, data) {
    this.logger.info('Creating Unity instance');
    
    // Create canvas
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    // Initialize Unity
    const unityConfig = {
      dataUrl: URL.createObjectURL(new Blob([data])),
      frameworkUrl: URL.createObjectURL(new Blob([framework])),
      codeUrl: URL.createObjectURL(new Blob([code])),
      streamingAssetsUrl: this.config.streamingAssetsUrl,
      companyName: this.config.companyName,
      productName: this.config.productName,
      productVersion: this.config.productVersion,
      showBanner: this.config.showBanner
    };

    return new Promise((resolve, reject) => {
      try {
        // Initialize Unity (implementation depends on Unity version)
        const instance = {}; // Placeholder for actual Unity initialization
        resolve(instance);
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default UnityLoader;
