/** Figma MCP — Confirm (withdraw flow) node 1:3883 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/8776bda3-0b0b-486b-8e95-b84fd749f08f";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/5d005bba-6f68-42d3-b246-32b6172f224c";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/9697c62e-45cf-4739-bd48-2bd4c1b2e130";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/d791740b-da41-4172-a759-9b91c2b69dbd";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/898459f0-651b-4b95-b50a-8f5b0da383b9";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/44cfd76e-c4a2-4b7a-bff1-cd1047c2cb47";
const imgLine = "https://www.figma.com/api/mcp/asset/d68108a3-1cae-4621-bb1b-3e039f43ead8";
const imgLine1 = "https://www.figma.com/api/mcp/asset/44df14c4-9329-4bc9-a5bb-7a4182dc966f";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/19cb434e-1057-4ade-9d5d-482def74e358";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/1d9ff0ad-bb94-437d-a3df-3e095b239b65";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/87ca96a0-0afb-446d-80d2-4cc6d96b81a9";
const imgIndicator = "https://www.figma.com/api/mcp/asset/9284b363-b823-4961-9052-9d8cf79f9c47";
const img941 = "https://www.figma.com/api/mcp/asset/c9e8bd69-8c91-4d59-87d1-b3140ce30f3d";

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

export default function WithdrawConfirmScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3883" data-name="1| Confirm">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3884" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3884;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3884;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3884;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3884;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup2} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3884;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3884;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3884;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3884;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3884;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3884;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3884;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3884;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3884;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <a className="-translate-x-1/2 absolute bg-[#2d6e93] content-stretch cursor-pointer flex items-center justify-center left-1/2 px-[20px] py-[16px] rounded-[54px] top-[670px] w-[350px]" data-node-id="1:3885" data-name="Btn">
        <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-left text-white whitespace-nowrap" data-node-id="I1:3885;1:3258">
          Confirm and Send
        </p>
      </a>
      <div className="absolute contents left-[20px] top-[130px]" data-node-id="1:3886" data-name="Сheque">
        <div className="absolute bg-white h-[49px] left-[20px] rounded-tl-[12px] rounded-tr-[12px] top-[130px] w-[350px]" data-node-id="1:3887" data-name="List item">
          <div className="absolute h-0 left-[20px] top-[48px] w-[310px]" data-node-id="I1:3887;1:3474" data-name="Line">
            <div className="absolute inset-[-0.8px_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine} />
            </div>
          </div>
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px] whitespace-nowrap" data-node-id="I1:3887;1:3475">
            Recipient
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[330px] text-[#192b48] text-[18px] text-right top-[calc(50%-11.5px)] whitespace-nowrap" data-node-id="I1:3887;1:3476">
            UQC4...754C
          </p>
        </div>
        <div className="absolute bg-white h-[49px] left-[20px] top-[179px] w-[350px]" data-node-id="1:3888" data-name="List item">
          <div className="absolute h-0 left-[20px] top-[48px] w-[310px]" data-node-id="I1:3888;1:3474" data-name="Line">
            <div className="absolute inset-[-0.8px_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine} />
            </div>
          </div>
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px] whitespace-nowrap" data-node-id="I1:3888;1:3475">
            Amount
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[0] left-[330px] text-[#192b48] text-[0px] text-right top-[calc(50%-11.5px)] whitespace-nowrap" data-node-id="I1:3888;1:3476">
            <span className="leading-[normal] text-[18px]">{`150 `}</span>
            <span className="leading-[normal] text-[#8494af] text-[13px]">USDT</span>
          </p>
        </div>
        <div className="absolute bg-white h-[49px] left-[20px] rounded-bl-[12px] rounded-br-[12px] top-[228px] w-[350px] whitespace-nowrap" data-node-id="1:3889" data-name="List item">
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px]" data-node-id="I1:3889;1:3475">
            Comission
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[0] left-[330px] text-[#192b48] text-[0px] text-right top-[calc(50%-11.5px)]" data-node-id="I1:3889;1:3476">
            <span className="leading-[normal] text-[18px]">{`15 `}</span>
            <span className="leading-[normal] text-[#8494af] text-[13px]">USDT</span>
          </p>
        </div>
      </div>
      <p className="-translate-x-full absolute font-['Outfit:Regular',sans-serif] font-normal leading-[18px] left-[368px] text-[#8494af] text-[12px] text-right top-[297px] w-[268px]" data-node-id="1:3890">
        *The commission is charged from the remaining balance. We charge a 10% fee on withdrawals.
      </p>
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3891" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3891;1:3321" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine1} />
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] tracking-[0.4px] whitespace-nowrap" data-node-id="I1:3891;1:3322">
          USDT Transfer
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
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3892" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3892;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3892;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3892;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3892;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3892;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3892;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3892;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3892;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
