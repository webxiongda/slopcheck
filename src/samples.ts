export interface Sample {
  name: string
  desc: string
  text: string
}

export const SAMPLES: Sample[] = [
  {
    name: '典型 AI 味文案',
    desc: '满是陈词滥调与模板句式',
    text: `In today's fast-paced world, the landscape of modern collaboration is constantly evolving. It's worth noting that leveraging robust tools can seamlessly empower teams to navigate this multifaceted realm. Not just a passing trend, but a fundamental shift in the way we work together.

Furthermore, organizations must foster a culture of continuous learning. Moreover, by delving into the tapestry of data, leaders can uncover pivotal insights that are paramount to long-term success. Additionally, a testament to this approach is the seamless integration of diverse perspectives. 🎉🔥✨

In conclusion, embarking on this journey requires a holistic mindset. In order to move forward, we must utilize every resource at our disposal. Ultimately, the future belongs to those who embrace change.`,
  },
  {
    name: '技术文案',
    desc: '开发者文档里常见的堆砌',
    text: `In order to utilize the API, you need to leverage a robust client. The landscape of available SDKs is vast, and it's worth noting that seamless integration is paramount for production systems.

Delve into the documentation to understand the underlying architecture. Furthermore, ensure you foster proper error handling. It's not just about speed, it's about reliability.

Due to the fact that requests may time out, implement retries with a reasonable backoff.`,
  },
  {
    name: '正常文案',
    desc: '说人话的例子，几乎零命中',
    text: `今天我把上周的会议记录整理了一遍，发现还有两个问题没解决：一个是接口偶尔超时，另一个是测试环境的数据不同步。

我打算先修接口超时的问题，明天再和测试同学一起看数据同步的情况。如果你有空，帮我看一下第二段日志，里面好像有一条报错。

修完以后我会更新文档，然后把结果发到群里。`,
  },
]
