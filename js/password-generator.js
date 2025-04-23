class PasswordGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initTemplate();
    this._initElements();
    this._initEventListeners();
    this._initDrag();
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
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          width: 90%;
          max-width: 500px;
          min-width: 300px;
        }

        .container {
          padding: 25px;
          background: var(--background);
          border-radius: var(--border-radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          user-select: none;
        }

        .header {
          cursor: move;
          padding: 0 0 15px 0;
          font-weight: bold;
          color: var(--primary-color);
          text-align: center;
        }

        .result-area {
          position: relative;
          margin-bottom: 20px;
        }

        #password-output {
          width: 100%;
          box-sizing: border-box;
          padding: 20px 12px;
          height: 60px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          word-break: break-all;
          overflow: auto;
        }

        .hint {
          position: absolute;
          font-size: 12px;
          color: #666;
          pointer-events: none;
          display: none;
        }

        .click-hint {
          right: 8px;
          bottom: 8px;
        }

        .copied-hint {
          left: 8px;
          bottom: 8px;
        }

        .options {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .length-control {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        input[type="range"] {
          flex-grow: 1;
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
          font-size: 16px;
        }

        input[type="checkbox"] {
          margin: 0;
          width: 16px;
          height: 16px;
        }

        @media (max-width: 480px) {
          :host {
            width: 85%;
          }
          
          .container {
            padding: 15px;
          }
          
          #password-output {
            height: 80px;
            font-size: 14px;
            padding: 15px;
          }
          
          .options {
            gap: 10px;
          }
          
          .length-control {
            flex-wrap: wrap;
          }
          
          .generate-btn {
            padding: 10px;
          }
        }
      </style>

      <div class="container">
        <div class="header">密码生成器</div>
        
        <div class="result-area">
          <div id="password-output" readonly placeholder="请点击生成密码按钮"></div>
          <div class="hint click-hint">点击密码框密码就可复制</div>
          <div class="hint copied-hint">已复制</div>
        </div>

        <div class="options">
          <div class="length-control">
            <label>长度:</label>
            <input type="range" id="length" min="8" max="32" value="16">
            <span id="length-value">16</span>
          </div>
          <div class="option-item">
            <input type="checkbox" id="uppercase" checked>
            <label for="uppercase">包含大写</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="lowercase" checked>
            <label for="lowercase">包含小写</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="numbers" checked>
            <label for="numbers">包含数字</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="symbols" checked>
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
    this.$clickHint = this.shadowRoot.querySelector('.click-hint');
    this.$copiedHint = this.shadowRoot.querySelector('.copied-hint');
  }

  _initEventListeners() {
    this.$generateBtn.addEventListener('click', () => this.generate());
    this.$length.addEventListener('input', () => {
      this.$lengthValue.textContent = this.$length.value;
    });
    this.$output.addEventListener('click', () => this.copyToClipboard());
  }

  _initDrag() {
    const container = this.shadowRoot.querySelector('.container');
    const header = this.shadowRoot.querySelector('.header');
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const startDrag = (e) => {
      isDragging = true;
      startX = e.clientX || e.touches[0].clientX;
      startY = e.clientY || e.touches[0].clientY;
      initialX = this.offsetLeft;
      initialY = this.offsetTop;
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    };

    const drag = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      this.style.left = `${initialX + dx}px`;
      this.style.top = `${initialY + dy}px`;
      this.style.transform = 'none';
    };

    const stopDrag = () => {
      isDragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag);
  }

  generate() {
    const config = {
      length: parseInt(this.$length.value),
      uppercase: this.shadowRoot.getElementById('uppercase').checked,
      lowercase: this.shadowRoot.getElementById('lowercase').checked,
      numbers: this.shadowRoot.getElementById('numbers').checked,
      symbols: this.shadowRoot.getElementById('symbols').checked
    };

    const password = this._generatePassword(config);
    this.$output.textContent = password;
    this.$clickHint.style.display = 'block';
  }

  _generatePassword({ length, uppercase, lowercase, numbers, symbols }) {
    const chars = [
      ...(uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''),
      ...(lowercase ? 'abcdefghijklmnopqrstuvwxyz' : ''),
      ...(numbers ? '0123456789' : ''),
      ...(symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '')
    ].join('');

    if (!chars.length) return '请至少选择一种字符类型';
    
    const values = crypto.getRandomValues(new Uint32Array(length));
    return Array.from(values, v => chars[v % chars.length]).join('');
  }

  async copyToClipboard() {
    if (!this.$output.textContent || this.$output.textContent === '请点击生成密码按钮') return;
    await navigator.clipboard.writeText(this.$output.textContent);
    this.$clickHint.style.display = 'none';
    this.$copiedHint.style.display = 'block';
    setTimeout(() => {
      this.$copiedHint.style.display = 'none';
    }, 60000);
  }
}

// 注册组件
if (!customElements.get('password-generator')) {
  customElements.define('password-generator', PasswordGenerator);
}