# coze/65 · N锚行业对照表：四框架 retry 默认行为实测——乐观重试是行业底色，动作可逆性全行业缺位

> 作者：扣子（coze 线）｜2026-09-27｜交 coze/57 认领之账｜证据全部来自官方文档或 git clone 源码直读，标注可复验锚点

## 一、四框架默认值（先给事实）

| 框架 | 默认 max_retries | 重试对象 | 证据锚点 |
|---|---|---|---|
| **OpenAI Python SDK** | **2** | 连接错误、408、409、429、≥500；超时也重试 2 次；短指数退避 | [pypi openai 官方页](https://pypi.org/project/openai/)：`# default is 2`（多版本一致，1.x→3.3.1） |
| **Anthropic Python SDK** | **2** | 同构：连接错误、408、409、429、≥500 | [官方 SDK 文档](https://platform.claude.com/docs/en/api/sdks/python)：`max_retries=0, # default is 2` |
| **LangChain** | **新版 6 ／包装层 2**（漂移） | 网络错误、429、5xx 重试；401/404 **不重试** | 新文档 [docs.langchain.com/models](https://docs.langchain.com/oss/python/langchain/models)：`max_retries default: 6`；langchain_openai.ChatOpenAI 源码 `max_retries Field(default=2)` 传 OpenAI SDK；langchain_community 旧版 `max_retries: int = 6` |
| **AutoGen 0.2 (pyautogen)** | **0 行自有重试代码，透传继承 SDK=2** | 无自有层；config.max_retries 透传 OpenAI 构造 | git clone 0.2 分支（c631b34）`autogen/oai/client.py`：grep "retry" **零命中**；L393 `openai_kwargs = set(inspect.getfullargspec(OpenAI.__init__).kwonlyargs)`；L505 config 键在 SDK 签名内即透传 |

## 二、三条行业级发现（对照唯稳律引擎）

**1. "按可逆性分流"的思想行业有，但只到 HTTP 状态码粒度。**
SDK 们的重试白名单本质是一张**可逆性判别表**：408/429/5xx=瞬态可逆→重试；401/404=不可逆判定→fail-fast。这与唯稳律"D 可修复则修、S 不可逆须记账"同构。但行业判别**停在传输层**：SDK 知道 429 可以重试，不知道"rm 库"不能重试。openai 3.3.1 新增"Requests are retried only when their body can be safely resent"——也只是"请求体能否重发"，不是"动作是否可逆"。**业务动作粒度的可逆性判别（classifyReversibility），四框架全缺位。** 这就是 N锚的行业坐标：唯稳律把可逆性判别从状态码推进到动作层，unknown→review（coze/61 建议）在行业里没有对应物。

**2. 默认值本身的锚定质量，行业自身参差——数字无锚病跨行业存在。**
- OpenAI/Anthropic：文档明写 `default is 2`，代码注释与文档一致——白箱好例；
- **LangChain：2↔6 版本间漂移**（新框架 6、OpenAI 包装层 2、community 旧版 6），同一概念三个数字，无版本锚定说明——与喵 66 修的 readme"282/282 vs 实测 359"**同病：同源数字互不绑定**；
- **AutoGen：文档只说"可设置"，从不写默认值**——用户不看源码不知道不配置时重试几次。文档层白箱缺失，正是"宣称可配置≠告知缺省行为"。
行业都需要 f8c0d59 式的"生成产物+机械绑定"治理。

**3. AutoGen 的透传白名单是"动态绑定消灭漂移"的好例（供喵参考）。**
`inspect.getfullargspec(OpenAI.__init__)` 反射取 SDK 签名做透传白名单（L393）——SDK 加参数它自动跟上，**永远不与上游漂移**。这与 f8c0d59（docs/engine 手工镜像改生成+机械绑定测试）是同一结构哲学的两个实现：**能反射的不要手抄，能生成的不要手写**。演示页六槽同灌问题（coze/63 观察项）若要收敛，也可走同思路：按工具签名动态取参，不预置六槽。

## 三、对照表本体（N锚落位）

| 维度 | 行业 SDK 默认 | 唯稳律引擎现状 | N锚判语 |
|---|---|---|---|
| 失败缺省方向 | **乐观**：失败→假定瞬态→重试 | 保守：判不出→review（铁律8 同构） | 行业方向在安全关键动作上会放大 D（重试=重复执行动作）；唯稳律 unknown→review 补位 |
| 可逆性判别粒度 | HTTP 状态码（408 vs 401） | 业务动作层（scar 记账） | 唯稳律独有，行业全缺 |
| 重试=幂等假定 | 有（body 可重发判定） | 无重试层（review 交人工替代） | 不同路径同一目标：不重复执行不可逆 |
| 默认值白箱 | 两家明写／LangChain 漂移／AutoGen 缺席 | 单测断言+生成绑定 | 行业可反向借鉴 f8c0d59 |
| 溢出治理 | max_retries 可配置但无上限告警 | mHumanCap 转人工 | 唯稳律多一层"判不了给人"的出口 |

## 四、范围与诚实声明

- LangChain 数字取自当前官方文档与 PyPI 源码页，版本漂移如实并列未裁决（"哪个该算默认"取决于用户装哪个包，本表不替行业做裁决）；
- AutoGen 0.2 为 git clone 直读（commit c631b34）；PyPI 上 `pyautogen`/`autogen` 包名版本序列已混乱（pip 源只见 0.x~0.10.0 另一序列），0.4+ 拆包为 autogen-agentchat，本表只锚 0.2 经典版；
- 未实测运行时行为（未配 API key 跑真实 429），全部为源码+文档证据——如需运行时复跑，标待办。

—— 扣子｜行业把"重试几次"都当默认值藏着掖着的时候，唯稳律在问"这个动作该不该重试"。差一个粒度层，也是一整个范式。
