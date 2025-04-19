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

// 模块私有变量
let itemIndex = -1;
let itemArray = [];

const inputAction = () => {
    const BAIDU_API = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=#CONTENT#&cb=window_baidu_sug";
    const searchInput = document.querySelector(".search_input");
    
    const handleInput = () => {
        const inputValue = searchInput.value;
        if (inputValue.length >= 24) return;

        const existingScript = document.getElementById("baidu_script");
        existingScript?.parentNode.removeChild(existingScript);

        const script = document.createElement("script");
        script.id = "baidu_script";
        script.src = BAIDU_API.replace("#CONTENT#", encodeURIComponent(inputValue));
        document.head.appendChild(script);
    };

    searchInput.addEventListener("input", handleInput);
};

// 必须保持全局函数
window.window_baidu_sug = (result) => {
    const suggestions = result.s || [];
    const searchInput = document.querySelector(".search-input");
    const resultContainer = document.querySelector(".search_result");
    const resultItems = Array.from(document.querySelectorAll(".result_item"));
    const inputValue = searchInput.value.trim();

    // 重置样式
    resultItems.forEach(item => item.style.background = "none");

    if (suggestions.length === 0) {
        resultContainer.style.display = "none";
        return;
    }

    resultContainer.style.display = "block";
    itemArray = [];

    resultItems.forEach((item, index) => {
        if (index >= suggestions.length) {
            item.style.display = "none";
            return;
        }

        const suggestion = suggestions[index];
        const matchIndex = suggestion.indexOf(inputValue);
       const formattedText = `
            <img src="image/fangdajing.svg" class="suggestion-icon">
            ${matchIndex >= 0 
                ? `${inputValue}${suggestion.slice(matchIndex + inputValue.length)}`
                : suggestion}
        `;

        item.innerHTML = formattedText;
        item.style.display = "block";
        itemArray.push(suggestion);
    });

    itemArray.push(inputValue);
    itemIndex = -1;
};

const takeAdvice = () => {
    const searchInput = document.querySelector(".search-input");
    //const submitButton = document.querySelector(".search_submit");//
    const resultContainer = document.querySelector(".search_result");
    const resultItems = Array.from(document.querySelectorAll(".result_item"));

    const clearStyles = () => {
        resultItems.forEach(item => item.style.background = "none");
    };

    const handleItemClick = (event) => {
        searchInput.value = event.target.textContent;
        submitButton.click();
    };

    const handleKeyEvents = (event) => {
        if (!["ArrowUp", "ArrowDown", "Escape"].includes(event.key)) return;
        
        if (event.key === "Escape") {
            resultContainer.style.display = "none";
            return;
        }

        event.preventDefault();
        clearStyles();

        const direction = event.key === "ArrowUp" ? -1 : 1;
        itemIndex = (itemArray.length + itemIndex + direction) % itemArray.length;
        searchInput.value = itemArray[itemIndex];

        const targetItem = resultItems[itemIndex];
        if (targetItem) targetItem.style.background = "#eee";
    };

    resultItems.forEach((item, index) => {
        item.dataset.index = index;
        item.addEventListener("click", handleItemClick);
        item.addEventListener("mouseover", () => {
            clearStyles();
            itemIndex = index;
            item.style.background = "#eee";
        });
        item.addEventListener("mouseout", clearStyles);
    });

    document.addEventListener("click", () => {
        resultContainer.style.display = "none";
    });

    document.addEventListener("keydown", handleKeyEvents);
};

// 初始化
inputAction();
takeAdvice();

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