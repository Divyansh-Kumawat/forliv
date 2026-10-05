/**
 * Soft out-of-focus orbs behind the auth screens — a quiet nod to the marketing
 * site's pearl imagery. Purely decorative.
 */
export function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff,#e9e5f7_45%,#d9d3ea_70%,transparent_78%)] blur-[2px]" />
      <div className="absolute -right-32 bottom-[-8rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_38%_30%,#ffffff,#efe8ff_42%,#d8c9f6_72%,transparent_80%)] blur-[2px]" />
      <div className="absolute right-[18%] top-[12%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#f2eeff_50%,#ddd4f2_75%,transparent_82%)] opacity-70" />
    </div>
  );
}
