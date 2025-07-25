const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const { size = 'desktop' } = event.queryStringParameters || {};

    // 关键改进：在API URL中添加时间戳参数（按北京时间每日更新）
    const cnDate = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=zh-cn`; // 中国
    const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=ja-jp`; // 日本
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=en-gb`; // 英国
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=en-us`; // 美国
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=es-es`; // 西班牙
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=fr-fr`; // 法国
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=de-de`; // 德国
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=it-it`; // 意大利
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=es-cl`; // 智利
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=en-ca`; // 加拿大
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=en-au`; // 澳大利亚
    // const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&_=${cnDate}&mkt=pt-br`; // 巴西

    const apiRes = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

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
    return { statusCode: 500, body: 'Failed to fetch wallpaper' };
  }
};