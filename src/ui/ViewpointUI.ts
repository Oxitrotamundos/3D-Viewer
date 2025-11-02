export class ViewpointUI {
  private container: HTMLElement;
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private onViewpointChangeCallback: ((viewpointName: string) => void) | null = null;

  constructor(containerId: string = 'ui-container') {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = container;
  }

  // Crea botones para cada viewpoint
  public createViewpointButtons(viewpointNames: string[]): void {
    this.container.innerHTML = '';
    this.buttons.clear();

    viewpointNames.forEach((name, index) => {
      const button = document.createElement('button');
      button.className = 'ui-button';
      button.textContent = this.formatViewpointName(name);
      button.dataset.viewpoint = name;

      // Primer botón activo por defecto
      if (index === 0) {
        button.classList.add('active');
      }

      button.addEventListener('click', () => {
        this.setActiveButton(name);
        if (this.onViewpointChangeCallback) {
          this.onViewpointChangeCallback(name);
        }
      });

      this.buttons.set(name, button);
      this.container.appendChild(button);
    });
  }

  // Establece botón activo
  public setActiveButton(viewpointName: string): void {
    this.buttons.forEach((button, name) => {
      if (name === viewpointName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Callback para cambio de viewpoint
  public onViewpointChange(callback: (viewpointName: string) => void): void {
    this.onViewpointChangeCallback = callback;
  }

  // Formatea nombre del viewpoint para mostrar
  private formatViewpointName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Muestra/oculta UI
  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }
}
