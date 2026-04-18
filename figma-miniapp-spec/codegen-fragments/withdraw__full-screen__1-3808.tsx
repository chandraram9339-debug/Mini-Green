/** Figma MCP — Withdraw node 1:3808 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/9f692c49-f175-4e7b-b413-45724bf3d684";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/0a84d0da-5aa3-4952-9097-850954f40c59";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/ad87857f-c42b-4f5b-bfa4-5e727c148f8c";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/2dd8ca53-19f5-4828-ab0e-67221f4744e9";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/3162a0e4-5414-447e-a51f-ddc432748b7c";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/235f37bd-69d4-4bc1-995a-3a5479b2211a";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/db8b10dc-2fe4-40ad-a461-65b20a1dc400";
const imgLine = "https://www.figma.com/api/mcp/asset/2604dc4e-b63b-4182-913b-dbe7271b4835";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/6fe77dd2-8c34-48b7-acbc-9da45de6aeb7";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/2e928858-845e-4046-9bbb-67b471bd9ce2";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/4b9d9d4b-acf6-4fa2-b545-2f0cbb92b08d";
const imgIndicator = "https://www.figma.com/api/mcp/asset/426da049-97df-44ad-9838-a2d8f47cccea";
const img941 = "https://www.figma.com/api/mcp/asset/d8b39394-c507-4a88-a9d1-26c40a1344a8";

type BtnProps = {
  className?: string;
  property1?: "Btn Main No Icon" | "Close Initial" | "Back Initial";
};

function Btn({ className, property1 = "Btn Main No Icon" }: BtnProps) {
  const isBackInitial = property1 === "Back Initial";
  const isCloseInitial = property1 === "Close Initial";
  const isCloseInitialOrBackInitial = ["Close Initial", "Back Initial"].includes(property1);
  return (
    <div className={className || `content-stretch flex relative ${isCloseInitialOrBackInitial ? "items-start p-[4px] rounded-[30px] size-[32px]" : "bg-[#2d6e93] items-center justify-center px-[20px] py-[16px] rounded-[54px] w-[350px]"}`} id={isBackInitial ? "node-1_3291" : isCloseInitial ? "node-1_3289" : "node-1_3257"}>
      {isCloseInitialOrBackInitial && (
        <div className="flex items-center justify-center relative shrink-0 size-[24px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <div className="overflow-clip relative size-[24px]" id={isBackInitial ? "node-1_3292" : "node-1_3290"} data-name="Icons">
              {isCloseInitial && (
                <div className="absolute flex inset-[-4.17%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                    <div className="relative size-full" data-node-id="I1:3290;1:3158" data-name="Group">
                      <div className="absolute inset-[-4.35%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isBackInitial && (
                <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3292;1:3112" data-name="Group">
                  <div className="absolute inset-[-9.43%_-5%]">
                    <img alt="" className="block max-w-none size-full" src={imgGroup1} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {property1 === "Btn Main No Icon" && (
        <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="1:3258">
          Withdraw
        </p>
      )}
    </div>
  );
}

type ListItemProps = {
  className?: string;
  property1?: "Ph" | "Variant26";
};

function ListItem({ className, property1 = "Ph" }: ListItemProps) {
  const isVariant26 = property1 === "Variant26";
  return (
    <div className={className || `bg-[#e3e6eb] content-stretch flex gap-[8px] items-center px-[20px] py-[15px] relative rounded-[12px] w-[350px] ${isVariant26 ? "leading-[normal] whitespace-nowrap" : ""}`} id={isVariant26 ? "node-1_3439" : "node-1_3435"}>
      <p className={`relative shrink-0 text-[18px] ${isVariant26 ? 'font-["Outfit:Medium",sans-serif] font-medium text-[#192b48] tracking-[0.18px]' : 'font-["Outfit:Regular",sans-serif] font-normal leading-[normal] text-[#55647b] w-[307px]'}`} id={isVariant26 ? "node-1_3440" : "node-1_3436"}>
        {isVariant26 ? "150" : "Address name"}
      </p>
      {property1 === "Ph" && (
        <div className="-translate-y-1/2 absolute left-[306px] overflow-clip size-[24px] top-1/2" data-node-id="1:3437" data-name="Icons">
          <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3437;1:3239" data-name="Group">
            <div className="absolute inset-[-6.25%_-5.56%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup2} />
            </div>
          </div>
        </div>
      )}
      <p className={`font-["Outfit:Regular",sans-serif] font-normal text-[#759ac6] text-[13px] ${isVariant26 ? "relative shrink-0" : "absolute leading-[normal] left-[263px] top-[calc(50%-8.5px)] whitespace-nowrap"}`} id={isVariant26 ? "node-1_3441" : "node-1_3438"}>
        {isVariant26 ? "USDT" : "Paste"}
      </p>
    </div>
  );
}

export default function WithdrawScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3808" data-name="1| Withdraw">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3809" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3809;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3809;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3809;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3809;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3809;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3809;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3809;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3809;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3809;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3809;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3809;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3809;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3809;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <a className="-translate-x-1/2 absolute bg-[#2d6e93] content-stretch cursor-pointer flex items-center justify-center left-1/2 px-[20px] py-[16px] rounded-[54px] top-[670px] w-[350px]" data-node-id="1:3810" data-name="Btn">
        <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#759ac6] text-[16px] text-left whitespace-nowrap" data-node-id="I1:3810;1:3258">
          Continue
        </p>
      </a>
      <a className="-translate-x-1/2 absolute bg-[#2d6e93] content-stretch cursor-pointer flex items-center justify-center left-1/2 px-[20px] py-[16px] rounded-[54px] top-[670px] w-[350px]" data-node-id="1:3811" data-name="Btn">
        <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-left text-white whitespace-nowrap" data-node-id="I1:3811;1:3258">
          Continue
        </p>
      </a>
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[18px] left-[20px] text-[#8494af] text-[12px] top-[226px] w-[350px]" data-node-id="1:3812">
        The withdrawal process is automatic. Usually, it takes anywhere from 10 minutes to 2-3 hours. However, as a maximum, it can take up to 7 days. The bot needs to close all active trades in order to withdraw the money.
      </p>
      <ListItem className="absolute bg-[#e3e6eb] content-stretch flex gap-[8px] items-center left-[20px] px-[20px] py-[15px] rounded-[12px] top-[141px] w-[350px]" />
      <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[9px] items-end left-[20px] text-[#8494af] text-right top-[403px]" data-node-id="1:3814" data-name="Info">
        <p className="leading-[0] relative shrink-0 text-[0px] w-[350px]" data-node-id="1:3815">
          <span className="leading-[normal] text-[15px]">{`Current balance: `}</span>
          <span className="font-['Outfit:Bold',sans-serif] font-bold leading-[normal] text-[15px]">{`725.62 `}</span>
          <span className="leading-[normal] text-[12px]">USDT</span>
        </p>
        <p className="leading-[0] relative shrink-0 text-[0px] w-[350px]" data-node-id="1:3816">
          <span className="leading-[normal] text-[15px]">{`Available for withdrawal*: `}</span>
          <span className="font-['Outfit:Bold',sans-serif] font-bold leading-[normal] text-[15px]">{`653.06 `}</span>
          <span className="leading-[normal] text-[12px]">USDT</span>
        </p>
        <p className="leading-[18px] relative shrink-0 text-[12px] w-[268px]" data-node-id="1:3817">
          *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
        </p>
      </div>
      <ListItem className="absolute bg-[#e3e6eb] content-stretch flex gap-[8px] items-center leading-[normal] left-[20px] px-[20px] py-[15px] rounded-[12px] top-[330px] w-[350px] whitespace-nowrap" property1="Variant26" />
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3819" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3819;1:3321" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] tracking-[0.4px] whitespace-nowrap" data-node-id="I1:3819;1:3322">
          Withdraw
        </p>
        <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
          </div>
        </div>
        <div className="absolute flex items-center justify-center left-[342px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Close Initial" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3820" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3820;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3820;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3820;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3820;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3820;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3820;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3820;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3820;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
