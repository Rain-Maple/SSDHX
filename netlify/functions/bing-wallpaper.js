const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { size = 'desktop', region = 'zh-cn' } = event.queryStringParameters || {}; // 默认地区改为中国

    // 按北京时间每日更新
    const cnDate = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
    const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=${region}`;

    const apiRes = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // 检查API返回是否有效
    if (!apiRes.data.images || !apiRes.data.images[0]) {
      throw new Error('Bing API返回数据无效');
    }

    let imageUrl = `https://www.bing.com${apiRes.data.images[0].url}`;
    if (size === 'mobile') {
      imageUrl = imageUrl.replace('1920x1080', '1080x1920');
    }

    const imageRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': imageRes.headers['content-type'],
        'Cache-Control': 'public, max-age=300', // 缓存5分钟
        'Access-Control-Allow-Origin': '*'
      },
      body: Buffer.from(imageRes.data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('壁纸获取失败:', error);
    // 返回一个简单的默认背景（例如纯色或预置图片），避免白屏
    // 这里返回一个204 No Content，让前端保留上次背景或显示默认颜色
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  }
};