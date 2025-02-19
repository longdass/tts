// 全局变量
let expiredAt = null;
let endpoint = null;
let clientId = "76a75279-2ffa-4c3d-8db8-7b47252aa41c";

// 导出默认处理函数
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    }
};

async function handleRequest(request) {
    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;
    if (path === "/tts") {
        const text = requestUrl.searchParams.get("t") || "";
        const voiceName = requestUrl.searchParams.get("v") || "zh-CN-XiaoxiaoMultilingualNeural";
        const rate = Number(requestUrl.searchParams.get("r")) || 0;
        const pitch = Number(requestUrl.searchParams.get("p")) || 0;
        const outputFormat = requestUrl.searchParams.get("o") || "audio-24khz-48kbitrate-mono-mp3";
        const download = requestUrl.searchParams.get("d") || false;
        const response = await getVoice(text, voiceName, rate, pitch, outputFormat, download);
        return response;
    }
    if (path === "/voices") {
        const l = (requestUrl.searchParams.get("l") || "").toLowerCase();
        const f = requestUrl.searchParams.get("f");
        let response = await voiceList();
        if (l.length > 0) {
            response = response.filter((item) => item.Locale.toLowerCase().includes(l));
        }
        if (f === "0") {
            response = response.map((item) => {
                return `
- !!org.nobody.multitts.tts.speaker.Speaker
  avatar: ''
  code: ${item.ShortName}
  desc: ''
  extendUI: ''
  gender:${item.Gender === "Female" ? "0" : "1"}
  name: ${item.LocalName}
  note: 'wpm: ${item.WordsPerMinute || ""}'
  param: ''
  sampleRate: ${item.SampleRateHertz || "24000"}
  speed: 1.5
  type: 1
  volume: 1`;
            });
            return new Response(response.join("\n"), {
                headers: {
                    "Content-Type": "application/html; charset=utf-8"
                }
            });
        } else if (f === "1") {
            const map = new Map(response.map((item) => [item.ShortName, item.LocalName]));
            return new Response(JSON.stringify(Object.fromEntries(map)), {
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            });
        } else {
            return new Response(JSON.stringify(response), {
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            });
        }
    }
    const baseUrl = request.url.split("://")[0] + "://" + requestUrl.host;
    return new Response(`
  <ol>
  <li> /tts?t=[text]&v=[voice]&r=[rate]&p=[pitch]&o=[outputFormat] <a href="${baseUrl}/tts?t=hello, world&v=zh-CN-XiaoxiaoMultilingualNeural&r=0&p=0&o=audio-24khz-48kbitrate-mono-mp3">try</a> </li>
  <li> /voices?l=[locate, like zh|zh-CN]&f=[format, 0/1/empty 0(TTS-Server)|1(MultiTTS)] <a href="${baseUrl}/voices?l=zh&f=1">try</a> </li>
  </ol>
  `, { 
        status: 200, 
        headers: { 
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
        } 
    });
}

// ... 保持其他所有函数的定义 ...
