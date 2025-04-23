class PasswordGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initTemplate();
    this._initElements();
    this._initEventListeners();
    this._initDrag();
    this._initClickOutside();
  }

  _initTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #2196F3;
          --background: rgba(255, 255, 255, 0.65);
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
          backdrop-filter: blur(10px);
        }

        .container {
          padding: 25px;
          background: var(--background);
          border-radius: var(--border-radius);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          user-select: none;
        }

        .header {
          cursor: move;
          padding: 0 0 15px 0;
          font-weight: bold;
          color: var(--primary-color);
          text-align: center;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #999;
          padding: 0;
          line-height: 1;
        }

        .close-btn:hover {
          color: #666;
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
          justify-content: space-between;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(5px);
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .option-item:hover {
          background: rgba(255, 255, 255, 0.7);
        }

        .length-control {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(5px);
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        input[type="range"] {
          flex-grow: 1;
        }

        .generate-btn {
          width: 100%;
          padding: 12px;
          /* background: var(--primary-color); */
          background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.1s;
          font-size: 16px;
          margin-top: 10px;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--primary-color);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
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
          
          .option-item {
            padding: 10px 12px;
          }
        }
      </style>

      <div class="container">
        <div class="header">
          <span>密码生成器</span>
          <button class="close-btn">&times;</button>
        </div>
        
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
            <label for="uppercase">包含大写</label>
            <label class="switch">
              <input type="checkbox" id="uppercase" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="option-item">
            <label for="lowercase">包含小写</label>
            <label class="switch">
              <input type="checkbox" id="lowercase" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="option-item">
            <label for="numbers">包含数字</label>
            <label class="switch">
              <input type="checkbox" id="numbers" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="option-item">
            <label for="symbols">包含符号</label>
            <label class="switch">
              <input type="checkbox" id="symbols" checked>
              <span class="slider"></span>
            </label>
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
    this.$closeBtn = this.shadowRoot.querySelector('.close-btn');
    this.$uppercase = this.shadowRoot.getElementById('uppercase');
    this.$lowercase = this.shadowRoot.getElementById('lowercase');
    this.$numbers = this.shadowRoot.getElementById('numbers');
    this.$symbols = this.shadowRoot.getElementById('symbols');
  }

  _initEventListeners() {
    this.$generateBtn.addEventListener('click', () => this.generate());
    this.$length.addEventListener('input', () => {
      this.$lengthValue.textContent = this.$length.value;
    });
    this.$output.addEventListener('click', () => this.copyToClipboard());
    this.$closeBtn.addEventListener('click', () => this.remove());
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
      if (e.target.classList.contains('close-btn')) return;
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

  _initClickOutside() {
    this._outsideClickHandler = (e) => {
      if (!this.contains(e.target) && !e.target.shadowRoot?.contains(this)) {
        this.remove();
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', this._outsideClickHandler);
    }, 0);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._outsideClickHandler);
  }

  generate() {
    const config = {
      length: parseInt(this.$length.value),
      uppercase: this.$uppercase.checked,
      lowercase: this.$lowercase.checked,
      numbers: this.$numbers.checked,
      symbols: this.$symbols.checked
    };

    const password = this._generatePassword(config);
    this.$output.textContent = password;
    
    // 只有当密码不是错误提示时才显示"点击复制"
    if (!password.startsWith('请至少选择一种字符类型')) {
      this.$clickHint.style.display = 'block';
    } else {
      this.$clickHint.style.display = 'none';
    }
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
    // 如果密码为空、是初始提示或是错误提示，则不执行复制操作
    if (!this.$output.textContent || 
        this.$output.textContent === '请点击生成密码按钮' || 
        this.$output.textContent.startsWith('请至少选择一种字符类型')) {
      return;
    }
    
    await navigator.clipboard.writeText(this.$output.textContent);
    this.$clickHint.style.display = 'none';
    this.$copiedHint.style.display = 'block';
    setTimeout(() => {
      this.$copiedHint.style.display = 'none';
    }, 60000);
  }
}

if (!customElements.get('password-generator')) {
  customElements.define('password-generator', PasswordGenerator);
}