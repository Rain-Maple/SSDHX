(function () {
    'use strict';

    const ENGINES = Object.freeze({
        bing: { icon: 'images/bing.svg', url: 'https://www.bing.com/search?q=' },
        baidu: { icon: 'images/baidu.svg', url: 'https://www.baidu.com/s?wd=' },
        google: { icon: 'images/google.svg', url: 'https://www.google.com/search?q=' },
        zhihu: { icon: 'images/zhihu.svg', url: 'https://www.zhihu.com/search?q=' },
        sogou: { icon: 'images/sogou.svg', url: 'https://www.sogou.com/web?query=' },
        toutiao: { icon: 'images/toutiao.svg', url: 'https://www.toutiao.com/search?keyword=' },
        360: { icon: 'images/360.svg', url: 'https://www.so.com/s?q=' }
    });

    const state = {
        currentEngine: 'bing',
        activeSuggestion: -1,
        suggestionsData: [],
        requestId: 0 // 用于忽略过期请求
    };

    // ---------- 图标错误处理（备用方案）----------
    function handleNavIconError(img, originalSrc) {
        // 尝试从原URL提取域名
        try {
            const urlMatch = originalSrc.match(/[?&]url=([^&]+)/);
            if (urlMatch && urlMatch[1]) {
                const domain = decodeURIComponent(urlMatch[1]);
                // 使用Google Favicon服务作为备用
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                img.onerror = () => {
                    // 如果Google也失败，则使用一个占位图
                    img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23ccc\'/%3E%3Ctext x=\'8\' y=\'20\' font-family=\'Arial\' font-size=\'12\' fill=\'%23666\'%3E?%3C/text%3E%3C/svg%3E';
                };
            }
        } catch (e) {
            // 忽略错误
        }
    }

    function initIconFallback() {
        document.querySelectorAll('.nav-icon').forEach(img => {
            const originalSrc = img.src;
            img.addEventListener('error', () => handleNavIconError(img, originalSrc), { once: true });
        });
    }

    // ---------- 引擎选择 ----------
    function initEngineSelect() {
        const engineBtn = document.querySelector('.engine-btn');
        const engineList = document.querySelector('.engine-list');

        document.querySelectorAll('.engine-option').forEach(option => {
            option.addEventListener('click', () => {
                state.currentEngine = option.dataset.engine;
                const clonedIcon = option.querySelector('.engine-icon').cloneNode(true);
                clonedIcon.alt = `${state.currentEngine} logo`;
                engineBtn.replaceChildren(clonedIcon);
                engineList.classList.remove('show');
                engineBtn.classList.remove('active');
            });
        });

        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            engineList.classList.toggle('show');
            engineBtn.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            engineList.classList.remove('show');
            engineBtn.classList.remove('active');
        });
    }

    // ---------- 搜索功能 ----------
    function initSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        const suggestionsContainer = document.querySelector('.search-suggestions');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.open(`${ENGINES[state.currentEngine].url}${encodeURIComponent(query)}`, '_blank');
            }
        };

        searchBtn.addEventListener('click', performSearch);

        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleKeyNavigation);
        document.addEventListener('click', handleClickOutside);

        let debounceTimer;
        async function handleSearchInput(e) {
            clearTimeout(debounceTimer);
            const keyword = e.target.value.trim();
            if (!keyword) {
                suggestionsContainer.classList.remove('show');
                return;
            }

            // 增加请求ID，用于忽略过期回调
            const currentRequestId = ++state.requestId;
            debounceTimer = setTimeout(async () => {
                try {
                    await getSuggestions(keyword, currentRequestId);
                } catch (err) {
                    console.error('搜索建议获取失败', err);
                }
            }, 300);
        }

        function getSuggestions(keyword, requestId) {
            return new Promise((resolve, reject) => {
                const callbackName = `baidu_cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const script = document.createElement('script');
                script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(keyword)}&cb=${callbackName}`;

                // 超时处理
                const timeout = setTimeout(() => {
                    cleanup();
                    reject(new Error('请求超时'));
                }, 5000);

                window[callbackName] = (data) => {
                    cleanup();
                    // 只处理最新请求
                    if (requestId === state.requestId) {
                        showSuggestions(data.s || []);
                    }
                    resolve(data);
                };

                const cleanup = () => {
                    clearTimeout(timeout);
                    document.body.removeChild(script);
                    delete window[callbackName];
                };

                script.onerror = () => {
                    cleanup();
                    reject(new Error('JSONP加载失败'));
                };

                document.body.appendChild(script);
            });
        }

        function showSuggestions(keywords) {
            suggestionsContainer.innerHTML = '';
            state.activeSuggestion = -1;
            state.suggestionsData = keywords.slice(0, 8);

            state.suggestionsData.forEach((keyword, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <img src="images/search.svg" class="suggestion-icon">
                    ${keyword}
                `;

                item.addEventListener('mouseenter', () => {
                    state.activeSuggestion = index;
                    updateActiveSuggestion();
                });

                item.addEventListener('touchstart', (e) => {
                    state.activeSuggestion = index;
                    searchInput.value = keyword;
                    updateActiveSuggestion();
                    e.preventDefault();
                });

                item.addEventListener('click', () => {
                    searchInput.value = keyword;
                    suggestionsContainer.classList.remove('show');
                    performSearch();
                });

                suggestionsContainer.appendChild(item);
            });

            const hasSuggestions = keywords.length > 0;
            suggestionsContainer.classList.toggle('show', hasSuggestions);
        }

        function handleKeyNavigation(e) {
            if (!suggestionsContainer.classList.contains('show')) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    state.activeSuggestion = state.activeSuggestion >= state.suggestionsData.length - 1 ? 0 : state.activeSuggestion + 1;
                    searchInput.value = state.suggestionsData[state.activeSuggestion];
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    state.activeSuggestion = state.activeSuggestion <= 0 ? state.suggestionsData.length - 1 : state.activeSuggestion - 1;
                    searchInput.value = state.suggestionsData[state.activeSuggestion];
                    break;
                case 'Enter':
                    e.preventDefault();
                    suggestionsContainer.classList.remove('show');
                    performSearch();
                    break;
                case 'Escape':
                    suggestionsContainer.classList.remove('show');
                    state.activeSuggestion = -1;
                    break;
            }
            updateActiveSuggestion();
        }

        function updateActiveSuggestion() {
            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            items.forEach((item, index) => {
                const isActive = index === state.activeSuggestion;
                item.classList.toggle('active', isActive);
                if (isActive) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        }

        function handleClickOutside(e) {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.classList.remove('show');
                state.activeSuggestion = -1;
            }
        }
    }

    // ---------- 导航栏 ----------
    function initNavigation() {
        const navCategories = document.querySelector('.nav-categories');
        const navHighlight = document.querySelector('.nav-highlight');
        const initialActive = document.querySelector('.nav-category.active');

        if (initialActive) {
            updateHighlight(initialActive);
            navHighlight.style.opacity = '1';
        }

        document.querySelectorAll('.nav-category').forEach(category => {
            category.addEventListener('click', function () {
                document.querySelectorAll('.nav-category').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                updateHighlight(this);

                document.querySelectorAll('.nav-items').forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.category === this.dataset.category) {
                        item.classList.add('active');
                    }
                });

                if (window.matchMedia("(max-width: 768px)").matches) {
                    this.parentElement.scrollTo({
                        left: this.offsetLeft - (this.parentElement.offsetWidth / 2 - this.offsetWidth / 2),
                        behavior: 'smooth'
                    });
                }
            });
        });

        function updateHighlight(target) {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            if (isMobile) {
                navHighlight.style.cssText = `
                    width: ${target.offsetWidth}px;
                    left: ${target.offsetLeft}px;
                    top: 50%;
                    transform: translateY(-50%);
                `;
            } else {
                navHighlight.style.cssText = `
                    width: calc(100% - 24px);
                    height: ${target.offsetHeight}px;
                    left: 12px;
                    top: ${target.offsetTop}px;
                    transform: none;
                `;
            }
        }

        window.addEventListener('resize', () => {
            const active = document.querySelector('.nav-category.active');
            if (!active) return;
            navHighlight.style.transition = 'none';
            updateHighlight(active);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    navHighlight.style.transition = '';
                });
            });
        });
    }

    function init() {
        initEngineSelect();
        initSearch();
        initNavigation();
        initIconFallback(); // 添加图标备用处理
    }

    window.addEventListener('DOMContentLoaded', init);
})();