class PasswordGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initTemplate();
    this._initElements();
    this._initEventListeners();
  }

  _initTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #2196F3;
          --background: rgba(255, 255, 255, 0.95);
          --border-radius: 12px;
          display: block;
          font-family: system-ui;
        }

        .container {
          padding: 20px;
          background: var(--background);
          border-radius: var(--border-radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: auto;
        }

        .result-area {
          position: relative;
          margin-bottom: 20px;
        }

        #password-output {
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.3s;
        }

        #password-output:hover {
          border-color: var(--primary-color);
        }

        .options {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }

        .length-control {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .generate-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .generate-btn:active {
          transform: scale(0.98);
        }

        /* 移动端优化 */
        @media (max-width: 480px) {
          .container {
            padding: 15px;
          }
          #password-output {
            font-size: 14px;
          }
        }
      </style>

      <div class="container">
        <div class="result-area">
          <input type="text" id="password-output" readonly placeholder="请点击生成密码按钮">
        </div>
        
        <div class="options">
          <div class="length-control">
            <label>长度:</label>
            <input type="range" id="length" min="8" max="32" value="16">
            <span id="length-value">16</span>
          </div>
          <div>
            <input type="checkbox" id="uppercase" checked>
            <label for="uppercase">包含大写</label>
          </div>
          <div>
            <input type="checkbox" id="numbers" checked>
            <label for="numbers">包含数字</label>
          </div>
          <div>
            <input type="checkbox" id="symbols">
            <label for="symbols">包含符号</label>
          </div>
        </div>

        <button class="generate-btn">生成密码</button>
      </div>
    `;
  }

  _initElements() {
    this.$output = this.shadowRoot.getElementById('password-output');
    this.$generateBtn = this.shadowRoot.querySelector('.generate-btn');
    this.$length = this.shadowRoot.getElementById('length');
    this.$lengthValue = this.shadowRoot.getElementById('length-value');
  }

  _initEventListeners() {
    this.$generateBtn.addEventListener('click', () => this.generate());
    this.$length.addEventListener('input', () => {
      this.$lengthValue.textContent = this.$length.value;
    });
    this.$output.addEventListener('click', () => this.copyToClipboard());
  }

  generate() {
    const config = {
      length: parseInt(this.$length.value),
      uppercase: this.shadowRoot.getElementById('uppercase').checked,
      numbers: this.shadowRoot.getElementById('numbers').checked,
      symbols: this.shadowRoot.getElementById('symbols').checked
    };

    const password = this._generatePassword(config);
    this.$output.value = password;
    this._showFeedback('密码已生成!');
  }

  _generatePassword({ length, uppercase, numbers, symbols }) {
    const chars = [
      ...(uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''),
      ...'abcdefghijklmnopqrstuvwxyz',
      ...(numbers ? '0123456789' : ''),
      ...(symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '')
    ].join('');

    const values = crypto.getRandomValues(new Uint32Array(length));
    return Array.from(values, v => chars[v % chars.length]).join('');
  }

  async copyToClipboard() {
    if (!this.$output.value) return;
    await navigator.clipboard.writeText(this.$output.value);
    this._showFeedback('已复制到剪贴板!');
  }

  _showFeedback(text) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }
}

if (!customElements.get('password-generator')) {
  customElements.define('password-generator', PasswordGenerator);
}