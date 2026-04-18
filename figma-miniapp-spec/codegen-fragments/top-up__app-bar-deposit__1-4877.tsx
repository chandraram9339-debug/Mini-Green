/** Figma MCP get_design_context — node 1:4877 (инстанс App Bar для экрана Top up — заголовок «Deposit») */
const imgGroup = "https://www.figma.com/api/mcp/asset/cf4654b2-ce90-4b9f-810c-76febe190d31";
const imgLine = "https://www.figma.com/api/mcp/asset/de3cc3a6-70fc-48db-a753-2fd4f8fa0dc0";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/4d325042-f9ae-4ac2-9307-9fb522b991d7";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/d95c93bc-cb26-4b71-ad87-4050f519e1ea";

type BtnProps = {
  className?: string;
  property1?: "Back Initial";
};

function Btn({ className, property1 = "Back Initial" }: BtnProps) {
  return (
    <div className={className || "content-stretch flex items-start p-[4px] relative rounded-[30px] size-[32px]"} data-node-id="1:3291">
      <div className="flex items-center justify-center relative shrink-0 size-[24px]">
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="overflow-clip relative size-[24px]" data-node-id="1:3292" data-name="Icons">
            <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3292;1:3112" data-name="Group">
              <div className="absolute inset-[-9.43%_-5%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppBar() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:4877" data-name="App Bar">
      <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:4877;1:3315" data-name="Line">
        <div className="absolute inset-[-0.8px_0]">
          <img alt="" className="block max-w-none size-full" src={imgLine} />
        </div>
      </div>
      <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="I1:4877;1:3316" data-name="Icons">
        <div className="absolute inset-[8.33%]" data-node-id="I1:4877;1:3316;1:3196" data-name="Group">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
        </div>
      </a>
      <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="I1:4877;1:3317" data-name="Icons">
        <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:4877;1:3317;1:3188" data-name="Group">
          <div className="absolute inset-[-4.21%_-4.44%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup2} />
          </div>
        </div>
        <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:4877;1:3317;1:3192">
          <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:4877;1:3317;1:3193">
            <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:4877;1:3317;1:3194">
              3
            </p>
          </div>
        </div>
      </a>
      <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] tracking-[0.4px] whitespace-nowrap" data-node-id="I1:4877;1:3318">
        Deposit
      </p>
      <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
        <div className="-scale-y-100 flex-none rotate-90">
          <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" />
        </div>
      </div>
    </div>
  );
}
