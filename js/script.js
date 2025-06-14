// 搜索和导航功能模块
// 该模块实现了搜索引擎选择、搜索建议、搜索功能和导航栏的交互
(function () {
    'use strict';

    // 搜索引擎配置
    // 使用Object.freeze()来防止对象被修改
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
                const clonedIcon = option.querySelector('.engine-icon').cloneNode(true);
                clonedIcon.alt = `${state.currentEngine} logo`;
                engineBtn.replaceChildren(clonedIcon);
                engineList.classList.remove('show');
            });
        });

        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            engineList.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            engineList.classList.remove('show');
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
                window.open(`${ENGINES[state.currentEngine].url}${encodeURIComponent(query)}`, '_blank');
            }
        };

        // 搜索按钮点击事件
        searchBtn.addEventListener('click', performSearch);

        // 搜索输入框输入处理
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleKeyNavigation);
        document.addEventListener('click', handleClickOutside);

        // 搜索建议处理
        async function handleSearchInput(e) {
            state.searchAbortController?.abort();
            state.searchAbortController = new AbortController();

            const keyword = e.target.value.trim();
            if (!keyword) {
                suggestionsContainer.classList.remove('show');
                return;
            }

            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                getSuggestions(keyword);
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            }
        }

        // 百度搜索建议API
        // 通过动态创建script标签来获取百度搜索建议
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

        // 显示搜索建议
        // 通过动态创建div标签来显示搜索建议
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

                // 鼠标悬停事件
                item.addEventListener('mouseenter', () => {
                    state.activeSuggestion = index;
                    updateActiveSuggestion();
                });

                // 触摸事件
                item.addEventListener('touchstart', () => {
                    state.activeSuggestion = index;
                    searchInput.value = keyword;
                    updateActiveSuggestion();
                    e.preventDefault(); // 防止触发click事件
                });

                // 点击事件（仅填充不执行搜索）
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

        // 键盘导航处理
        // 通过键盘事件来处理搜索建议的选择和搜索操作
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
                    state.activeSuggestion =
                        state.activeSuggestion >= state.suggestionsData.length - 1
                            ? 0
                            : state.activeSuggestion + 1;
                    searchInput.value = state.suggestionsData[state.activeSuggestion];
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    state.activeSuggestion =
                        state.activeSuggestion <= 0
                            ? state.suggestionsData.length - 1
                            : state.activeSuggestion - 1;
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

        // 更新高亮的搜索建议
        // 通过动态添加active类来高亮当前选中的搜索建议
        function updateActiveSuggestion() {
            const items = suggestionsContainer.querySelectorAll('.suggestion-item');
            items.forEach((item, index) => {
                const isActive = index === state.activeSuggestion;
                item.classList.toggle('active', isActive);
                isActive && item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        }

        // 点击外部区域关闭搜索建议
        // 通过点击事件来判断是否点击在搜索建议区域外
        function handleClickOutside(e) {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.classList.remove('show');
                state.activeSuggestion = -1; // 清除高亮
            }
        }
    }

    // 导航栏模块
    // 该模块实现了导航栏的交互，包括高亮显示和点击切换
    function initNavigation() {
        const navCategories = document.querySelector('.nav-categories'); // 导航分类
        const navHighlight = document.querySelector('.nav-highlight'); // 高亮元素
        const initialActive = document.querySelector('.nav-category.active'); // 初始化选择器

        // 设置高亮元素的初始位置和大小
        if (initialActive) {
            updateHighlight(initialActive); // 更新高亮位置
            navHighlight.style.opacity = '1'; // 显示高亮元素
        }

        // 点击导航分类事件
        // 通过点击事件来处理导航分类的切换和高亮显示
        document.querySelectorAll('.nav-category').forEach(category => {
            category.addEventListener('click', function () {
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
                        left: this.offsetLeft - (this.parentElement.offsetWidth / 2 - this.offsetWidth / 2),
                        behavior: 'smooth'
                    });
                }
            });
        });

        // 更新高亮元素位置和大小
        // 通过动态计算元素的offset和大小来更新高亮元素的位置和大小
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

        // 监听窗口大小变化事件
        // 通过resize事件来处理窗口大小变化时的高亮元素位置更新
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
    }

    window.addEventListener('DOMContentLoaded', init);
})();