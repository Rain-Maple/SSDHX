class FloatingTools extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
        }

        .tool-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #2196F3;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
          transition: transform 0.2s;
        }

        .tool-btn:hover {
          transform: scale(1.1) rotate(15deg);
        }
      </style>

      <button class="tool-btn">🔐</button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.toggleGenerator();
    });
  }

  toggleGenerator() {
    const existing = document.querySelector('password-generator');
    existing ? existing.remove() : this._showGenerator();
  }

  _showGenerator() {
    const generator = document.createElement('password-generator');
    generator.style.position = 'fixed';
    generator.style.top = '50%';
    generator.style.left = '50%';
    generator.style.transform = 'translate(-50%, -50%)';
    generator.style.zIndex = '1001';
    document.body.appendChild(generator);
  }
}

customElements.define('floating-tools', FloatingTools);