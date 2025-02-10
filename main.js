import axios from 'axios';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import {HttpsProxyAgent} from 'https-proxy-agent';


async function sign(privateKey,proxy) {
        const { username, password, ip, port } = proxy;
        const proxyUrl = `http://${username}:${password}@${ip}:${port}`;
        const agent = new HttpsProxyAgent(proxyUrl);
        const wallet = new ethers.Wallet(privateKey);
        const address = await wallet.getAddress()
        let messageResponse = null
        try {
            messageResponse = await axios.get(`https://api.x.ink/v1/get-sign-message2?walletAddress=${address}`,{httpsAgent: agent});
        } catch (error) {
            console.error("获取签名信息报错",error.response.data); // 错误处理
        }
        console.log("签名信息----",messageResponse.data)
        const signature = await wallet.signMessage(messageResponse.data.message);
        let signResponse = null
        try {
        signResponse = await axios.post('https://api.x.ink/v1/verify-signature2', 
            {
              walletAddress: address,
              signMessage: messageResponse.data.message,
              signature: signature,
              referrer: "393TUP"
            }, 
            {
              headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'content-type': 'application/json',
                'origin': 'https://x.ink',
                'priority': 'u=1, i',
                'referer': 'https://x.ink/',
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
              },
              httpsAgent: agent
            })
    } catch (error) {
        console.error("签名报错"); // 错误处理
    }

    const authorizationHeader = `Bearer ${signResponse.data.token}`;  // 构建完整的 Authorization 头
    try {
      const response = await axios.post(
        "https://api.x.ink/v1/check-in", 
        {}, // 空的请求体
        {
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'authorization': authorizationHeader,  // 使用构建的 Authorization 头
            'content-type': 'application/json',
            'priority': 'u=1, i',
            'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'Referer': 'https://x.ink/',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          },
          httpsAgent: agent
        }
      );
      console.log('Response data:', response.data);  // 输出响应内容
      return response.data;
    } catch (error) {
      console.error('签到请求出错:');  // 错误处理
    }
}



// 读取所有代理配置
async function loadProxies() {
    const data = await fs.readFile('./proxy.txt', 'utf-8');
    return data.trim().split('\n').map(line => {
        const [ip, port, username, password] = line.split(':');
        return { ip, port, username, password };
    });
  }
async function wallet1() {
    const data = await fs.readFile('./wallet.txt', 'utf-8');
    return data.trim().split('\n')
  }

async function main() {
    const proxies = await loadProxies();
    const wallet = await wallet1();
    for (let i = 0; i < proxies.length; i++) {
        console.log("ip--",proxies[i].ip)
        const proxy = proxies[i];
        await sign(wallet[i],proxy);
    }
}

// checkIn()
main()
// loadProxies()