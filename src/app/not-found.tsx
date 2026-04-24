import Link from "next/link";
import { LayoutShell } from "@/components/layout-shell";
import { Panel, PlainExplain } from "@/components/ui";

export default function NotFound() {
  return (
    <LayoutShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Panel className="max-w-2xl text-center">
          <div className="text-[11px] uppercase tracking-[0.36em] text-[var(--gold-muted)]">404</div>
          <h2 className="mt-4 font-serif text-3xl tracking-[0.08em] text-[var(--text-primary)] md:text-5xl">这个标的不在雷达里</h2>
          <p className="mt-5 text-[15px] leading-8 text-[var(--text-secondary)]">
            当前只提供 MSTR、CRCL、QQQ 的观察页。后面如果要扩更多标的，再继续加。
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/" className="rounded-full border border-[var(--border-gold)] bg-[var(--gold-brand)]/10 px-5 py-3 text-sm tracking-[0.18em] text-[var(--gold-soft)]">
              回观察列表
            </Link>
          </div>
          <div className="mt-6">
            <PlainExplain title="为什么不偷偷跳回 MSTR？">
              因为你输错标的时，页面如果还给你看别的内容，会让你误以为自己正在看对的观察对象。这里宁可直说没有，也不悄悄替你改答案。
            </PlainExplain>
          </div>
        </Panel>
      </div>
    </LayoutShell>
  );
}
