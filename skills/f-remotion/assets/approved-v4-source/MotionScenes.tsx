import type {ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";

const FONT = "Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
const BLUE = "#1d95ff";
const GREEN = "#42df82";
const RED = "#ff626b";
const AMBER = "#f1b94d";
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

const SceneShell: React.FC<{
  children: ReactNode;
  duration: number;
  name: string;
  tint: string;
}> = ({children, duration, name, tint}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name={name}
      style={{
        opacity: interpolate(frame, [0, 18, duration - 26, duration - 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: [EASE_OUT, Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
        }),
      }}
    >
      <Interactive.Div
        name="Left readability gradient"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(3,7,12,0.69) 0%, rgba(3,7,12,0.47) 29%, rgba(3,7,12,0.17) 51%, rgba(3,7,12,0.025) 70%, transparent 80%)",
        }}
      />
      <Interactive.Div
        name="Subtle color grade"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${tint} 0%, transparent 58%)`,
          mixBlendMode: "color",
          opacity: 0.58,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const SceneHeader: React.FC<{
  section: string;
  title: string;
  micro: string;
}> = ({section, title, micro}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={`${section} ${title}`}
      style={{
        position: "absolute",
        left: 92,
        top: 88,
        width: 920,
        minHeight: 142,
        paddingLeft: 25,
        fontFamily: FONT,
        opacity: interpolate(frame, [4, 28], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        translate: interpolate(frame, [4, 34], ["-22px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 2,
          width: 4,
          height: interpolate(frame, [4, 28], [0, 58], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          }),
          borderRadius: 4,
          backgroundColor: BLUE,
          boxShadow: `0 0 14px ${BLUE}88`,
        }}
      />
      <div
        style={{
          color: BLUE,
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 900,
          letterSpacing: 5,
          whiteSpace: "nowrap",
        }}
      >
        微信小程序 · {section}
      </div>
      <div
        style={{
          marginTop: 10,
          color: "white",
          fontSize: 29,
          lineHeight: 1.1,
          fontWeight: 850,
          letterSpacing: 2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 34,
          color: "rgba(255,255,255,0.62)",
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 750,
          letterSpacing: 6,
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [20, 44], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {micro}
      </div>
    </Interactive.Div>
  );
};

const Stage: React.FC<{
  children: ReactNode;
  name: string;
  start: number;
  end: number;
}> = ({children, name, start, end}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        inset: 0,
        opacity: interpolate(frame, [start, start + 20, end - 20, end], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: [EASE_OUT, Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
        }),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

const FadeMove: React.FC<{
  children: ReactNode;
  name: string;
  start: number;
  left: number;
  top: number;
  width: number;
  from?: string;
}> = ({children, name, start, left, top, width, from = "-28px 14px"}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left,
        top,
        width,
        fontFamily: FONT,
        opacity: interpolate(frame, [start, start + 28], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        translate: interpolate(frame, [start, start + 36], [from, "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        scale: interpolate(frame, [start, start + 36], [0.975, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
          output: "perceptual-scale",
        }),
        transformOrigin: "left center",
      }}
    >
      {children}
    </Interactive.Div>
  );
};

const Panel: React.FC<{
  children: ReactNode;
  name: string;
  start: number;
  left: number;
  top: number;
  width: number;
  height: number;
  accent?: string;
  from?: string;
}> = ({children, name, start, left, top, width, height, accent = BLUE, from}) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        display: "flex",
        alignItems: "center",
        padding: "22px 28px",
        borderRadius: 15,
        border: `1px solid ${accent}88`,
        backgroundColor: "rgba(5,7,13,0.86)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.25)",
        fontFamily: FONT,
        opacity: interpolate(frame, [start, start + 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        translate: interpolate(frame, [start, start + 36], [from ?? "0px 24px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        scale: interpolate(frame, [start, start + 36], [0.985, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
          output: "perceptual-scale",
        }),
      }}
    >
      <div
        style={{
          width: 4,
          height: "64%",
          flex: "0 0 auto",
          marginRight: 22,
          borderRadius: 4,
          backgroundColor: accent,
          boxShadow: `0 0 13px ${accent}88`,
        }}
      />
      {children}
    </Interactive.Div>
  );
};

const Connector: React.FC<{
  start: number;
  left: number;
  top: number;
  height: number;
  color?: string;
}> = ({start, left, top, height, color = BLUE}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 3,
        height: interpolate(frame, [start, start + 34], [0, height], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        }),
        borderRadius: 4,
        backgroundColor: color,
        boxShadow: `0 0 12px ${color}77`,
      }}
    />
  );
};

const StatusStep: React.FC<{
  start: number;
  top: number;
  number: string;
  title: string;
  detail: string;
  color: string;
  mark: string;
}> = ({start, top, number, title, detail, color, mark}) => (
  <Panel
    name={`${number} ${title}`}
    start={start}
    left={124}
    top={top}
    width={880}
    height={118}
    accent={color}
    from="-42px 0px"
  >
    <div
      style={{
        width: 62,
        height: 62,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: "0 0 auto",
        borderRadius: "50%",
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}99`,
        fontSize: 22,
        fontWeight: 900,
      }}
    >
      {number}
    </div>
    <div style={{marginLeft: 24}}>
      <div style={{color: "white", fontSize: 31, fontWeight: 850, letterSpacing: 2}}>
        {title}
      </div>
      <div style={{marginTop: 7, color: "rgba(255,255,255,0.65)", fontSize: 20, fontWeight: 700}}>
        {detail}
      </div>
    </div>
    <div style={{marginLeft: "auto", color, fontSize: 34, fontWeight: 950}}>{mark}</div>
  </Panel>
);

const RightsCard: React.FC<{
  start: number;
  left: number;
  top: number;
  icon: string;
  title: string;
  color: string;
}> = ({start, left, top, icon, title, color}) => (
  <Panel
    name={`${title} 权益`}
    start={start}
    left={left}
    top={top}
    width={380}
    height={126}
    accent={color}
  >
    <div
      style={{
        width: 58,
        height: 58,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: "0 0 auto",
        borderRadius: "50%",
        backgroundColor: `${color}1d`,
        color,
        fontSize: 27,
        fontWeight: 900,
      }}
    >
      {icon}
    </div>
    <div style={{marginLeft: 22, color: "white", fontSize: 30, fontWeight: 850, letterSpacing: 2}}>
      {title}
    </div>
  </Panel>
);

export const PaymentAccessScene: React.FC = () => (
  <SceneShell duration={606} name="01 个人开发者好消息" tint="rgba(0,118,255,0.28)">
    <SceneHeader section="01" title="支付能力更新" micro="个人开发者 · 小程序收款" />

    <Stage name="开场中文钩子" start={0} end={286}>
      <FadeMove name="个人开发者" start={24} left={92} top={300} width={950}>
        <div style={{color: "white", fontSize: 118, lineHeight: 1, fontWeight: 950, letterSpacing: -4}}>
          个人开发者
        </div>
      </FadeMove>
      <FadeMove name="超级好消息" start={92} left={92} top={440} width={1080} from="-34px 0px">
        <div style={{color: BLUE, fontSize: 102, lineHeight: 1.08, fontWeight: 950, letterSpacing: -3}}>
          收款迎来好消息
        </div>
      </FadeMove>
      <FadeMove name="重磅更新标签" start={148} left={98} top={585} width={540} from="0px 18px">
        <div
          style={{
            display: "inline-flex",
            padding: "13px 20px",
            borderLeft: `4px solid ${BLUE}`,
            color: "rgba(255,255,255,0.78)",
            backgroundColor: "rgba(5,7,13,0.64)",
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: 3,
          }}
        >
          微信小程序支付迎来新变化
        </div>
      </FadeMove>
    </Stage>

    <Stage name="过去收款条件" start={300} end={606}>
      <FadeMove name="过去条件标题" start={302} left={92} top={286} width={900}>
        <div style={{color: BLUE, fontSize: 23, fontWeight: 900, letterSpacing: 5}}>过去的收款条件</div>
        <div style={{marginTop: 12, color: "white", fontSize: 58, fontWeight: 900, letterSpacing: 1}}>
          小程序想要实现收款
        </div>
      </FadeMove>
      <Panel name="开通收款功能" start={330} left={92} top={480} width={760} height={120} accent={BLUE}>
        <div style={{color: "white", fontSize: 34, fontWeight: 850}}>开通收款功能</div>
        <div style={{marginLeft: "auto", color: BLUE, fontSize: 26, fontWeight: 900}}>需要经营主体</div>
      </Panel>
      <Connector start={396} left={470} top={600} height={84} />
      <Panel name="注册公司" start={450} left={92} top={684} width={360} height={116} accent={GREEN}>
        <div style={{color: "white", fontSize: 31, fontWeight: 850}}>注册公司</div>
      </Panel>
      <Panel name="个体工商户" start={522} left={478} top={684} width={374} height={116} accent={AMBER}>
        <div style={{color: "white", fontSize: 31, fontWeight: 850}}>个体工商户</div>
      </Panel>
    </Stage>
  </SceneShell>
);

export const EntryBarrierScene: React.FC = () => (
  <SceneShell duration={450} name="02 个人开发者现实门槛" tint="rgba(210,41,66,0.20)">
    <SceneHeader section="02" title="个人开发者的现实门槛" micro="产品还没完成 · 成本却要前置" />

    <FadeMove name="两难说明" start={52} left={92} top={286} width={900}>
      <div style={{color: "rgba(255,255,255,0.76)", fontSize: 24, fontWeight: 800, letterSpacing: 4}}>
        为了一个尚未完成的小程序
      </div>
    </FadeMove>
    <Panel name="产品尚未完成" start={126} left={92} top={366} width={810} height={142} accent={BLUE}>
      <div>
        <div style={{color: BLUE, fontSize: 21, fontWeight: 900, letterSpacing: 4}}>当前状态</div>
        <div style={{marginTop: 10, color: "white", fontSize: 39, fontWeight: 900}}>小程序还没做出来</div>
      </div>
    </Panel>
    <Connector start={176} left={494} top={508} height={92} color={RED} />
    <Panel name="提前注册主体" start={236} left={92} top={600} width={810} height={142} accent={RED}>
      <div>
        <div style={{color: RED, fontSize: 21, fontWeight: 900, letterSpacing: 4}}>却要先做</div>
        <div style={{marginTop: 10, color: "white", fontSize: 38, fontWeight: 900}}>注册公司 / 个体工商户</div>
      </div>
    </Panel>
    <Panel name="不太值当结论" start={384} left={92} top={790} width={560} height={116} accent={AMBER}>
      <div style={{color: AMBER, fontSize: 25, fontWeight: 900}}>成本前置</div>
      <div style={{marginLeft: 24, color: "white", fontSize: 38, fontWeight: 950}}>不太值当</div>
    </Panel>
  </SceneShell>
);

export const AiBlockedScene: React.FC = () => (
  <SceneShell duration={572} name="03 支付卡在最后一步" tint="rgba(0,151,111,0.20)">
    <SceneHeader section="03" title="AI 时代的变现断点" micro="会开发 · 却接不了支付" />
    <Connector start={58} left={154} top={350} height={520} color="rgba(29,149,255,0.55)" />
    <StatusStep
      start={66}
      top={292}
      number="01"
      title="想做小程序赚钱"
      detail="目标已经明确"
      color={BLUE}
      mark="→"
    />
    <StatusStep
      start={154}
      top={430}
      number="02"
      title="学会开发小程序"
      detail="开发能力已经具备"
      color={GREEN}
      mark="✓"
    />
    <StatusStep
      start={260}
      top={568}
      number="03"
      title="没有公司或个体户"
      detail="缺少可接入支付的经营主体"
      color={RED}
      mark="!"
    />
    <StatusStep
      start={398}
      top={706}
      number="04"
      title="无法接入支付"
      detail="变现流程在最后一步中断"
      color={RED}
      mark="×"
    />
    <Panel name="卡在门外" start={446} left={124} top={874} width={650} height={110} accent={AMBER}>
      <div style={{color: AMBER, fontSize: 24, fontWeight: 900}}>最终状态</div>
      <div style={{marginLeft: 24, color: "white", fontSize: 36, fontWeight: 950}}>被卡在门外</div>
    </Panel>
  </SceneShell>
);

export const VirtualPaymentScene: React.FC = () => (
  <SceneShell duration={778} name="04 个人虚拟支付" tint="rgba(0,118,255,0.27)">
    <SceneHeader section="04" title="新的支付能力来了" micro="个人主体 · 虚拟支付" />

    <Stage name="虚拟支付揭晓" start={0} end={218}>
      <FadeMove name="终于来了" start={18} left={92} top={300} width={500}>
        <div style={{color: BLUE, fontSize: 25, fontWeight: 900, letterSpacing: 6}}>今天终于来了</div>
      </FadeMove>
      <FadeMove name="个人小程序" start={96} left={92} top={382} width={960}>
        <div style={{color: "white", fontSize: 91, lineHeight: 1, fontWeight: 950, letterSpacing: -2}}>
          个人小程序
        </div>
      </FadeMove>
      <FadeMove name="虚拟支付" start={112} left={92} top={494} width={880} from="-38px 0px">
        <div style={{color: BLUE, fontSize: 116, lineHeight: 1, fontWeight: 950, letterSpacing: -3}}>
          虚拟支付
        </div>
      </FadeMove>
      <FadeMove name="正式开放" start={148} left={98} top={642} width={430} from="0px 18px">
        <div
          style={{
            display: "inline-flex",
            padding: "12px 19px",
            border: `1px solid ${GREEN}99`,
            borderRadius: 8,
            backgroundColor: "rgba(5,7,13,0.78)",
            color: GREEN,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 4,
          }}
        >
          正式开放
        </div>
      </FadeMove>
    </Stage>

    <Stage name="虚拟支付权益说明" start={226} end={778}>
      <Panel name="虚拟支付定义" start={226} left={92} top={292} width={950} height={178} accent={BLUE}>
        <div>
          <div style={{color: BLUE, fontSize: 22, fontWeight: 900, letterSpacing: 5}}>虚拟支付是什么？</div>
          <div style={{marginTop: 14, color: "white", fontSize: 43, fontWeight: 900}}>
            用户可以购买小程序内的权益
          </div>
        </div>
      </Panel>
      <FadeMove name="权益示例" start={386} left={92} top={518} width={600}>
        <div style={{color: "rgba(255,255,255,0.7)", fontSize: 22, fontWeight: 800, letterSpacing: 5}}>
          可以售卖的内容
        </div>
      </FadeMove>
      <RightsCard start={470} left={92} top={588} icon="会" title="小程序会员" color={BLUE} />
      <RightsCard start={576} left={492} top={588} icon="分" title="积分 / 使用权" color={GREEN} />
      <RightsCard start={678} left={92} top={736} icon="资" title="虚拟财产" color={AMBER} />
    </Stage>
  </SceneShell>
);

export const PhysicalBoundaryScene: React.FC = () => (
  <SceneShell duration={460} name="05 实体商品边界" tint="rgba(211,42,62,0.22)">
    <SceneHeader section="05" title="虚拟支付的能力边界" micro="仅限虚拟权益 · 不含实体商品" />
    <FadeMove name="不能售卖实体商品" start={20} left={92} top={286} width={980}>
      <div style={{color: "white", fontSize: 63, fontWeight: 950, letterSpacing: 0}}>
        不能售卖实体商品
      </div>
      <div style={{marginTop: 14, width: 510, height: 4, borderRadius: 4, backgroundColor: RED}} />
    </FadeMove>
    <Panel name="服装不支持" start={104} left={92} top={478} width={330} height={126} accent={RED}>
      <div style={{color: RED, fontSize: 31, fontWeight: 950}}>×</div>
      <div style={{marginLeft: 20, color: "white", fontSize: 32, fontWeight: 900}}>服装</div>
    </Panel>
    <Panel name="食品不支持" start={200} left={442} top={478} width={330} height={126} accent={RED}>
      <div style={{color: RED, fontSize: 31, fontWeight: 950}}>×</div>
      <div style={{marginLeft: 20, color: "white", fontSize: 32, fontWeight: 900}}>食品</div>
    </Panel>
    <Panel name="电子产品不支持" start={222} left={92} top={626} width={680} height={126} accent={RED}>
      <div style={{color: RED, fontSize: 31, fontWeight: 950}}>×</div>
      <div style={{marginLeft: 20, color: "white", fontSize: 32, fontWeight: 900}}>电子产品</div>
    </Panel>
    <Panel name="不用担心" start={294} left={92} top={816} width={820} height={142} accent={GREEN}>
      <div style={{color: GREEN, fontSize: 35, fontWeight: 950}}>✓</div>
      <div style={{marginLeft: 22}}>
        <div style={{color: GREEN, fontSize: 23, fontWeight: 900, letterSpacing: 4}}>不过不用担心</div>
        <div style={{marginTop: 9, color: "white", fontSize: 31, fontWeight: 850}}>
          这些实体商品场景，个人开发者通常用不到
        </div>
      </div>
    </Panel>
  </SceneShell>
);

export const LicenseScene: React.FC = () => (
  <SceneShell duration={233} name="06 营业执照结论" tint="rgba(0,118,255,0.24)">
    <SceneHeader section="06" title="实体商品经营场景" micro="需要经营资质" />
    <FadeMove name="实体商品问题" start={18} left={92} top={300} width={900}>
      <div style={{color: "rgba(255,255,255,0.7)", fontSize: 24, fontWeight: 850, letterSpacing: 4}}>
        如果确实要卖这些实体商品
      </div>
    </FadeMove>
    <Connector start={54} left={123} top={372} height={96} />
    <Panel name="已经有营业执照" start={80} left={92} top={468} width={920} height={220} accent={BLUE} from="-36px 0px">
      <div
        style={{
          width: 78,
          height: 78,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: "0 0 auto",
          borderRadius: "50%",
          color: GREEN,
          backgroundColor: `${GREEN}1c`,
          border: `1px solid ${GREEN}99`,
          fontSize: 38,
          fontWeight: 950,
        }}
      >
        ✓
      </div>
      <div style={{marginLeft: 30}}>
        <div style={{color: "rgba(255,255,255,0.67)", fontSize: 23, fontWeight: 800, letterSpacing: 3}}>
          通常已经提前拥有
        </div>
        <div style={{marginTop: 10, color: "white", fontSize: 66, fontWeight: 950, letterSpacing: 1}}>
          营业执照
        </div>
      </div>
    </Panel>
    <FadeMove name="经营条件已具备" start={150} left={126} top={724} width={640} from="0px 16px">
      <div style={{color: BLUE, fontSize: 25, fontWeight: 900, letterSpacing: 4}}>实体经营条件已经具备</div>
    </FadeMove>
  </SceneShell>
);
