(function () {
    'use strict';

    // 配置常量
    const ENGINES = Object.freeze({
        bing: { icon: 'images/bing.svg', url: 'https://www.bing.com/search?q=' },
        baidu: { icon: 'images/baidu.svg', url: 'https://www.baidu.com/s?wd=' },
        google: { icon: 'images/google.svg', url: 'https://www.google.com/search?q=' },
        zhihu: { icon: 'images/zhihu.svg', url: 'https://www.zhihu.com/search?q=' },
        sogou: { icon: 'images/sogou.svg', url: 'https://www.sogou.com/web?query=' },
        toutiao: { icon: 'images/toutiao.svg', url: 'https://www.toutiao.com/search?keyword=' },
        360: { icon: 'images/360.svg', url: 'https://www.so.com/s?q=' }
    });

    // 状态管理
    const state = {
        currentEngine: 'bing',
        activeSuggestion: -1,
        suggestionsData: [],
        searchAbortController: null
    };

    // 引擎选择模块
    function initEngineSelect() {
        const engineBtn = document.querySelector('.engine-btn');
        const engineList = document.querySelector('.engine-list');

        document.querySelectorAll('.engine-option').forEach(option => {
            option.addEventListener('click', () => {
                state.currentEngine = option.dataset.engine;
                engineBtn.replaceChildren(option.cloneNode(true));
                engineList.classList.remove('show');
            });
        });

        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            engineList.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.engine-select')) {
                engineList.classList.remove('show');
            }
        });
    }

    // 搜索功能模块
    function initSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        const suggestionsContainer = document.querySelector('.search-suggestions');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.open(`${ENGINES[state.currentEngine].url}${encodeURIComponent(query)}`, '_self');
            }
        };

        // 事件绑定
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());

        // 输入处理
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleKeyNavigation);
        document.addEventListener('click', handleClickOutside);

        // 搜索建议处理
        async function handleSearchInput(e) {
            state.searchAbortController?.abort();
            state.searchAbortController = new AbortController();

            const keyword = e.target.value.trim();
            if (!keyword) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                getSuggestions(keyword);
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            }
        }

        function getSuggestions(keyword) {
            const script = document.createElement('script');
            script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(keyword)}&cb=handleBaiduResponse`;
            
            window.handleBaiduResponse = (data) => {
                showSuggestions(data.s || []);
                document.body.removeChild(script);
                delete window.handleBaiduResponse;
            };
            
            document.body.appendChild(script);
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
                
                item.addEventListener('click', () => {
                    searchInput.value = keyword;
                    suggestionsContainer.style.display = 'none';
                    performSearch();
                });
                
                suggestionsContainer.appendChild(item);
            });
            
            suggestionsContainer.style.display = state.suggestionsData.length ? 'block' : 'none';
        }

        // 键盘导航
        function handleKeyNavigation(e) {
            if (!suggestionsContainer || suggestionsContainer.style.display === 'none') return;

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    state.activeSuggestion = 
                        state.activeSuggestion >= state.suggestionsData.length - 1 
                            ? 0 
                            : state.activeSuggestion + 1;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    state.activeSuggestion = 
                        state.activeSuggestion <= 0 
                            ? state.suggestionsData.length - 1 
                            : state.activeSuggestion - 1;
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (state.activeSuggestion > -1) {
                        searchInput.value = state.suggestionsData[state.activeSuggestion];
                        suggestionsContainer.style.display = 'none';
                        performSearch();
                    }
                    break;
                case 'Escape':
                    suggestionsContainer.style.display = 'none';
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
                isActive && item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        }

        function handleClickOutside(e) {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.style.display = 'none';
                state.activeSuggestion = -1;
            }
        }
    }

    // 导航模块
    function initNavigation() {
        const navCategories = document.querySelector('.nav-categories');
        const navHighlight = document.querySelector('.nav-highlight');

        document.querySelectorAll('.nav-category').forEach(category => {
            category.addEventListener('click', function() {
                document.querySelectorAll('.nav-category').forEach(c => 
                    c.classList.remove('active')
                );
                this.classList.add('active');
                updateHighlight(this);
                
                document.querySelectorAll('.nav-items').forEach(item => {
                    item.classList.remove('active');
                    item.dataset.category === this.dataset.category && 
                        item.classList.add('active');
                });

                if (window.matchMedia("(max-width: 768px)").matches) {
                    this.parentElement.scrollTo({
                        left: this.offsetLeft - (this.parentElement.offsetWidth/2 - this.offsetWidth/2),
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
            setTimeout(() => {
                navHighlight.style.transition = '';
            }, 10);
        });
    }

    // 初始化
    function init() {
        initEngineSelect();
        initSearch();
        initNavigation();
        
        // 初始高亮定位
        const initialActive = document.querySelector('.nav-category.active');
        initialActive && updateHighlight(initialActive);
    }

    window.addEventListener('DOMContentLoaded', init);
})();