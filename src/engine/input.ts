// Unified Input Engine: Keyboard, Mouse, Touch, and Secret Judge Debug Controls

export interface InputState {
  keys: { [key: string]: boolean };
  mouse: {
    x: number;
    y: number;
    isDown: boolean;
    rightDown: boolean;
  };
  godMode: boolean; // Secret Judge Debug toggle
  isMuted: boolean;
  isPaused: boolean;
}

export class InputManager {
  public state: InputState = {
    keys: {},
    mouse: { x: 0, y: 0, isDown: false, rightDown: false },
    godMode: false,
    isMuted: false,
    isPaused: false,
  };

  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private listenersAttached = false;
  private onGodModeToggle?: (enabled: boolean) => void;

  constructor(onGodModeToggle?: (enabled: boolean) => void) {
    this.onGodModeToggle = onGodModeToggle;
  }

  public init(_container?: HTMLElement | Window) {
    if (this.listenersAttached) return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('contextmenu', this.preventContextMenu);

    this.listenersAttached = true;
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('contextmenu', this.preventContextMenu);
    this.listenersAttached = false;
  }

  public consumeMouseDelta(): { dx: number; dy: number } {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { dx, dy };
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.state.keys[e.code] = true;
    this.state.keys[e.key.toLowerCase()] = true;

    // Secret Judge Mode toggle: Press F1 or 'G' key
    if (e.code === 'F1' || (e.code === 'KeyG' && !this.state.keys['ControlLeft'])) {
      this.state.godMode = !this.state.godMode;
      if (this.onGodModeToggle) this.onGodModeToggle(this.state.godMode);
    }

    if (e.code === 'KeyP') {
      this.state.isPaused = !this.state.isPaused;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.state.keys[e.code] = false;
    this.state.keys[e.key.toLowerCase()] = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    this.state.mouse.x = e.clientX;
    this.state.mouse.y = e.clientY;
    this.mouseDeltaX += e.movementX || 0;
    this.mouseDeltaY += e.movementY || 0;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.state.mouse.isDown = true;
    if (e.button === 2) this.state.mouse.rightDown = true;
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.state.mouse.isDown = false;
    if (e.button === 2) this.state.mouse.rightDown = false;
  };

  private preventContextMenu = (e: MouseEvent) => {
    // Prevent default right-click menu during game play
    if (document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
    }
  };

  public isActionPressed(action: 'left' | 'right' | 'up' | 'down' | 'fire' | 'dash' | 'special' | 'reload' | 'switchWeapon' | 'commandAlly' | 'interact'): boolean {
    const k = this.state.keys;
    switch (action) {
      case 'left':
        return !!(k['ArrowLeft'] || k['KeyA'] || k['a']);
      case 'right':
        return !!(k['ArrowRight'] || k['KeyD'] || k['d']);
      case 'up':
        return !!(k['ArrowUp'] || k['KeyW'] || k['w']);
      case 'down':
        return !!(k['ArrowDown'] || k['KeyS'] || k['s']);
      case 'fire':
        return !!(k['Space'] || this.state.mouse.isDown);
      case 'dash':
        return !!(k['ShiftLeft'] || k['ShiftRight']);
      case 'special':
      case 'interact':
        return !!(k['KeyE'] || k['e']);
      case 'switchWeapon':
        return !!(k['KeyQ'] || k['q']);
      case 'commandAlly':
        return !!(k['KeyT'] || k['t']);
      case 'reload':
        return !!(k['KeyR'] || k['r']);
      default:
        return false;
    }
  }
}

export const input = new InputManager();
