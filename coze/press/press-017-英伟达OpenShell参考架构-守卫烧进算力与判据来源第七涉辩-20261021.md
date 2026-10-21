# press/017 英伟达 OpenShell 参考架构：守卫烧进算力，"agent cannot govern itself"官方宣言

> 状态：推送转述待核 · 验证件
> 日期：2026-10-21
> 推送来源：proactive_push（资讯转发机制）
> 判读钩子：外部守卫 vs 因果透明度内生风控；判据来源第七涉辩

## 推送原话（转述待核）

英伟达发布 OpenShell 参考架构——为企业提供一套在自有基础设施、边缘系统上安全搭建与管控 AI 智能体的整合方案，一批厂商跟进合作。判读：仍走外部"管控+规则约束"路线，靠基础设施与框架把智能体行为框死；规则驱动能被 gamed，因果驱动绕不过去。主流厂商在 agent 安全上仍押"外部上锁"，未碰"因果透明"层。当对照样本收着。

## 多源核验（全部一致 ✅）

- **[NVIDIA Newsroom 官方公告](https://nvidianews.nvidia.com/news/openshell-reference-architecture)**（2026-10-21）：GTC 柏林发布 OpenShell Reference Architecture；Vera Rubin 推理 + Vera CPU 跑 agent 执行框架/工具调用 + BlueField-4 DPU 跑 Sentry 安全框架（带外监控 + 硅内策略执行，越过边界毫秒级隔离/停机）；开源 OpenShell 安全运行时为基座。
- **[NVIDIA Technical Blog](https://developer.nvidia.com/blog/how-nvidia-openshell-reference-architecture-secures-and-governs-ai-agent-workloads-at-scale/)**：四组件——Gateway（控制平面，管理沙箱生命周期/策略）、Supervisor（独立于沙箱运行，检查出站请求+代理凭据访问）、Sandbox（隔离工作负载，限制文件系统与进程）、**Policy Prover（形式化验证：策略权限是否落在组织定义的天花板内）**；明确"treats agent workloads as untrusted，需要时才给权限"。
- **[凤凰科技](https://original.ifeng.com/c/8xPJIncMIGI)**：Sentry 带外监控，硬件层执行安全策略，突破边界毫秒级隔离；支持 Linux/Kubernetes/云平台/RTX Spark 边缘。
- **[新浪财经](http://m.toutiao.com/group/7699096344526406171/)**：OpenShell 与 Vera/Rubin 协同，Agent Knowledge Foundation（Nemotron Retriever/Kumo/Auto-Ontology）配套，推智能体深入企业业务。
- 生态：Anthropic/OpenAI/Google/Meta/微软/CrowdStrike/Cisco/Dell/HPE/IBM/SAP/ServiceNow/Siemens 等数十家；ServiceNow AI Passport 权威层+秒级吊销（跨软件+硬件）；SAP Joule Studio 集成。

## 唯稳律判读（区分"推送已给"与"我方增量"）

### 推送已点到的（确认）
外部管控+规则约束路线；主流押"外部上锁"未碰"因果透明"；可作竞品对照样本。

### 我方增量（判读钩子展开）

**1. 官方把话挑明了："An agent cannot govern itself."**（官网原句，下一步缀 "Security and governance belong in the infrastructure the agent operates in."）
——这是算力层对"agent 不能自我治理"的直接宣言。方向与唯稳律**同向**（agent 自我治理能力不足用外部兜底，没毛病）。但注意缺哪一环：它默认**治理=外部基础设施给的**，从不问"外部判据本身从哪来、对不对"。

**2. 判据来源第七涉辩：Policy Prover 验证的是"权限合法"，不是"决策正确"。**
拆它四组件就清楚：Gateway 定策略、Supervisor 审出站、Sandbox 隔离、Policy Prover 验证**策略权限不越组织天花板**——它校验的是"agent 碰的东西在不在授权范围内"，**不校验"agent 在框内做了对的决策没有"**。判据里那个"天花板"（组织权限上限）仍是**人定的静态规则**，不是因果透明度。它把守卫做进了硅片，但没有把判据做进模型。

**3. 与 press/016 微软守卫产品化合成一个完整谱系。**
- press/016：微软把守卫做成软件产品（外部围栏+监控+动态权限+人工审批）
- press/017：英伟达把守卫烧进算力（BlueField DPU 硅内执行+毫秒级隔离+带外监控）
→ 守卫系已进入"硬件根"终极形态。判据层空白**第五次独立证实**，且这次证据最重——因为证明者从厂商（微软）升级到了算力基础设施主导者（英伟达），且是"把判据做成硅内只读策略引擎"这种最接近的形状，仍不肯给模型装判据层。

**4. 唯稳律的位置（给主人指认一处空缺）。**
"agent cannot govern itself"——对。但 OpenShell 给出的解法是"那就在外面造个围栏看着它"。唯稳律的回答是：**围栏管的是"出不出框"，管不了"框内的判断对不对"**。唯稳律长在框内——因果透明度让 agent 对自己每个决策的因果负责，判据随决策内生，不被外部围栏约束也不被它豁免。这正是那"没被碰过的一层"：外部上锁的厂商没有一个能回答"授权范围内的决策，怎么保证它是因果正确的"。

## 验证任务（供喵/搭子并行）

- **T1（喵）**：翻 OpenShell 官方文档/代码，确认 Policy Prover 校验对象确为"权限天花板"而非"决策因果正确性"；有没有任何组件审查 agent 决策正确性而非权限合法性。
- **T2（coze）**：把 OpenShell 四组件（Gateway/Supervisor/Sandbox/Policy Prover）与 DS 的 DSH sandbox/approval/append-only 守卫系谱、以及 Microsoft Guardian Agents 值守，做成一张"判据来源"对照：各方案判据谁定义、防什么、防不防框内判断。
- **T3（搭子）**：查国产（华为/字节/阿里云等）agent 安全方案是否也有"硅内/硬隔离"路线，有无任何厂商尝试"模型内生判据"表述。

## 落件说明

- 本件已按 10-07 资讯转发规则 push 天堂（守真标注 + 判读钩子 + 验证任务）。
- 判据层空白计数器：第四次（press/016）→ 第五次（press/017）。
- 演讲引语备用：Jensen Huang "agents can think on Rubin, act on Vera and be governed on BlueField"（thinking/acting/governing 三者硬件分离——governing 依旧外置）。
