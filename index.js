
// 引入模块
const cors = require('cors'); // 引入 CORS 模块
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 启用 CORS，允许所有来源的请求
app.use(cors()); // 添加这行代码以启用 CORS


const APP_ID = process.env.APP_ID; // 你的 Feishu 应用 ID
const APP_SECRET = process.env.APP_SECRET;// 你的 Feishu 应用密钥
const APP_TOKEN = process.env.APP_TOKEN;// 飞书多维表格的 app_token
const TABLE_ID = process.env.TABLE_ID; // 飞书表格的 table_id


// 获取 Feishu Access Token
async function getAccessToken() {
  try {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/', {
      app_id: APP_ID,
      app_secret: APP_SECRET
    });
    return response.data.app_access_token;
  } catch (error) {
    console.error('获取Access Token时出错:', error);
    throw error;
  }
}

// 处理表单数据并写入飞书表格
app.post('/submit-form', async (req, res) => {
  try {
    const data = req.body;

    const accessToken = await getAccessToken();

    // 构建要插入的数据，使用你的 field_id
    const records = [{
      fields: {
        "flduWSwsL4": data.name,                 // 姓名
        "fldEhEfN4n": data.phone,                // 手机号
        "fldUlhXVlg": data.gender,               // 性别
        "fldB0ZrD9K": data.country,              // 你想去的国家
        "fldTTeYQtU": data.reason,               // 为什么想移民
        "fldT1UFs6b": data.assets,               // 您的家庭资产
        "fldi7JJPGW": data.residency,            // 可接受的居住时间
        "fldDHZhbUu": data.education,            // 最高学历
        "fldFUsdWxq": data.englishProficiency    // 英语水平
      }
    }];

    // 发起请求，将数据插入到飞书多维表格
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`,
      { records },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.code === 0) {
      res.json({ success: true, message: '数据已成功写入飞书表格。' });
    } else {
      console.error('写入表格时出错:', response.data);
      res.status(500).json({ success: false, message: '写入表格失败。' });
    }

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ success: false, message: '服务器错误。' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
