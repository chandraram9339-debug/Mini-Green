/** Figma MCP — Support node 1:3751 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/05b961e0-e195-4d3c-8386-30a58b726eae";
const imgLine = "https://www.figma.com/api/mcp/asset/a9419092-3dc6-45d3-a75f-39c6939035f3";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/94d8453b-dc4b-4b2d-a8ac-02242494ad0a";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/ff014ec0-9197-4ba5-84f7-cb97f5f3c5b3";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/0a213578-75c9-491f-a2bc-4e0807e8fa91";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/5b7e6ed9-75b2-401d-af8d-168a7dabc425";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/69d39213-fc23-459a-9b55-872c5328063e";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/4447f50b-8e0f-4e35-81ee-d7624ab5bb22";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/5d9aa918-4ff4-4bfb-97fd-79bb242e2809";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/2b94ce85-4494-4d23-b9ac-6a525ab65afb";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/b8a1ec21-b674-44a6-bc1d-5d662af2f3f5";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/75deaebb-d4b2-45c8-88b0-d75c7c1c26a6";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/cefe6373-3cf8-482b-9ef9-4c7429c65ee8";
const imgIndicator = "https://www.figma.com/api/mcp/asset/d1bef4c1-6b36-44ee-9a99-72c573110c82";
const img941 = "https://www.figma.com/api/mcp/asset/9c1ae1f9-0ad9-435f-8c59-074c65a8c391";

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

type AppBarProps = {
  className?: string;
  property1?: "Header Title";
};

function AppBar({ className, property1 = "Header Title" }: AppBarProps) {
  return (
    <div className={className || "bg-[#ecf1f4] h-[56px] overflow-clip relative w-[390px]"} data-node-id="1:3314">
      <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="1:3315" data-name="Line">
        <div className="absolute inset-[-0.8px_0]">
          <img alt="" className="block max-w-none size-full" src={imgLine} />
        </div>
      </div>
      <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="1:3316" data-name="Icons">
        <div className="absolute inset-[8.33%]" data-node-id="I1:3316;1:3196" data-name="Group">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
        </div>
      </a>
      <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="1:3317" data-name="Icons">
        <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3317;1:3188" data-name="Group">
          <div className="absolute inset-[-4.21%_-4.44%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup2} />
          </div>
        </div>
        <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3317;1:3192">
          <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3317;1:3193">
            <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3317;1:3194">
              25
            </p>
          </div>
        </div>
      </a>
      <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] whitespace-nowrap" data-node-id="1:3318">
        Support
      </p>
      <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
        <div className="-scale-y-100 flex-none rotate-90">
          <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" />
        </div>
      </div>
    </div>
  );
}

export default function SupportScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3751" data-name="1 | Support">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3752" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3752;1:3334" data-name="Navigation">
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3752;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3752;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3752;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3752;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3752;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3752;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3752;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3752;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3752;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <div className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3752;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3752;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3752;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[9px] items-start left-[20px] top-[130px]" data-node-id="1:3753" data-name="List">
        <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3754" data-name="List item">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3754;1:3453" data-name="Icons">
            <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3754;1:3453;1:3162" data-name="Group">
              <div className="absolute inset-[-4.71%_-4.44%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup7} />
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3754;1:3454">
            Support Chat
          </p>
        </div>
        <a className="bg-white content-stretch cursor-pointer flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3755" data-name="List item">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3755;1:3453" data-name="Icons">
            <div className="absolute inset-[20.83%_33.31%_20.79%_33.33%]" data-node-id="I1:3755;1:3453;1:3235" data-name="Group">
              <div className="absolute inset-[-5.71%_-9.99%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup8} />
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] text-left tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3755;1:3454">
            FAQ
          </p>
        </a>
      </div>
      <AppBar className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" />
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3757" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3757;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3757;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3757;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3757;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3757;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3757;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3757;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3757;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
