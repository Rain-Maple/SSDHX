// 搜索引擎配置
const engines = {
    bing: { icon: 'images/bing.svg', url: 'https://www.bing.com/search?q=' },
    baidu: { icon: 'images/baidu.svg', url: 'https://www.baidu.com/s?wd=' },
    google: { icon: 'images/google.svg', url: 'https://www.google.com/search?q=' },
    zhihu: { icon: 'images/zhihu.svg', url: 'https://www.zhihu.com/search?q=' },
    sogou: { icon: 'images/sogou.svg', url: 'https://www.sogou.com/web?query=' },
    toutiao: { icon: 'images/toutiao.svg', url: 'https://www.toutiao.com/search?keyword=' },
    360: { icon: 'images/360.svg', url: 'https://www.so.com/s?q=' }
};

let currentEngine = 'bing';
let activeSuggestionIndex = -1;
let suggestionsData = [];

//引擎选择功能
document.querySelectorAll('.engine-option').forEach(option => {
    option.addEventListener('click', () => {
        currentEngine = option.dataset.engine;
        document.querySelector('.engine-btn').innerHTML = 
            `<img src="${engines[currentEngine].icon}" class="engine-icon" alt="${currentEngine}">`;
        document.querySelector('.engine-list').classList.remove('show');
    });
});

//显示/隐藏引擎列表
document.querySelector('.engine-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.engine-list').classList.toggle('show');
});

//点击空白处隐藏引擎列表
document.addEventListener('click', (e) => {
    if (!e.target.closest('.engine-select')) {
        document.querySelector('.engine-list').classList.remove('show');
    }
});

// 整合后的搜索建议功能
        function getSuggestions(keyword, callback) {
            const script = document.createElement('script');
            script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(keyword)}&cb=baiduSuggestion`;
            document.body.appendChild(script);
            
            window.baiduSuggestion = (data) => {
                callback(data.s);
                document.body.removeChild(script);
                delete window.baiduSuggestion;
            }
        }

        const debounce = (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };

        function showSuggestions(keywords) {
            const container = document.querySelector('.search-suggestions');
            container.innerHTML = '';
            activeSuggestionIndex = -1;
            suggestionsData = keywords.slice(0, 8);
            
            suggestionsData.forEach((keyword, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <img src="images/search.svg" class="suggestion-icon">
                    ${keyword}
                `;

                item.addEventListener('mouseenter', () => {
                    activeSuggestionIndex = index;
                    updateActiveSuggestion();
                });
                
                item.addEventListener('click', () => {
                    selectSuggestion(index);
                    container.style.display = 'none';
                });
                
                container.appendChild(item);
            });
            
            container.style.display = suggestionsData.length ? 'block' : 'none';
        }

        function handleKeyNavigation(e) {
            const container = document.querySelector('.search-suggestions');
            if (!container || container.style.display === 'none') return;

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    activeSuggestionIndex = 
                        activeSuggestionIndex >= suggestionsData.length - 1 ? 0 : activeSuggestionIndex + 1;
                    updateActiveSuggestion();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    activeSuggestionIndex = 
                        activeSuggestionIndex <= 0 ? suggestionsData.length - 1 : activeSuggestionIndex - 1;
                    updateActiveSuggestion();
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (activeSuggestionIndex > -1) {
                        selectSuggestion(activeSuggestionIndex);
                        container.style.display = 'none';
                    } else {
                        search();
                    }
                    break;
                    
                case 'Escape':
                    container.style.display = 'none';
                    activeSuggestionIndex = -1;
                    break;
            }
        }

        function updateActiveSuggestion() {
            const items = document.querySelectorAll('.suggestion-item');
            items.forEach((item, index) => {
                const isActive = index === activeSuggestionIndex;
                item.classList.toggle('active', isActive);
                if (isActive) {
                    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }

        function selectSuggestion(index) {
            const input = document.querySelector('.search-input');
            input.value = suggestionsData[index];
            search();
        }

        // 更新后的搜索功能
        function search() {
            const input = document.querySelector('.search-input');
            const keyword = encodeURIComponent(input.value.trim());
            if (keyword) {
                window.open(engines[currentEngine].url + keyword, '_self');
            }
        }

        // 事件监听整合
        document.querySelector('.search-input').addEventListener('input', debounce(e => {
            const keyword = e.target.value.trim();
            if (!keyword) {
                document.querySelector('.search-suggestions').style.display = 'none';
                return;
            }
            getSuggestions(keyword, suggestions => showSuggestions(suggestions || []));
        }, 300));

        document.querySelector('.search-input').addEventListener('keydown', handleKeyNavigation);

// 导航栏高亮功能
function updateHighlight(target) {
    const highlight = document.querySelector('.nav-highlight');
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        const container = target.parentElement;
        const scrollLeft = container.scrollLeft;
        const relativeLeft = target.offsetLeft - (container.offsetWidth/2 - target.offsetWidth/2);
        
        highlight.style.width = `${target.offsetWidth}px`;
        highlight.style.left = `${target.offsetLeft}px`;
        highlight.style.top = '50%';
        highlight.style.transform = 'translateY(-50%)';
    } else {
        highlight.style.width = 'calc(100% - 24px)';
        highlight.style.left = '12px';
        highlight.style.height = `${target.offsetHeight}px`;
        highlight.style.top = `${target.offsetTop}px`;
        highlight.style.transform = 'none';
    }
}

//导航分类点击事件
document.querySelectorAll('.nav-category').forEach(category => {
    category.addEventListener('click', function() {
        document.querySelectorAll('.nav-category').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        updateHighlight(this);
        
        document.querySelectorAll('.nav-items').forEach(item => {
            item.classList.remove('active');
            if(item.dataset.category === this.dataset.category) item.classList.add('active');
        });
        //移动端自动滚动
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.parentElement.scrollTo({
                left: this.offsetLeft - (this.parentElement.offsetWidth/2 - this.offsetWidth/2),
                behavior: 'smooth'
            });
        }
    });
});

// 监听窗口大小变化，更新高亮位置
window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-category.active');
    if (active) {
        document.querySelector('.nav-highlight').style.transition = 'none';
        updateHighlight(active);
        setTimeout(() => {
            document.querySelector('.nav-highlight').style.transition = '';
        }, 10);
    }
});

// 初始化高亮位置
updateHighlight(document.querySelector('.nav-category.active'));