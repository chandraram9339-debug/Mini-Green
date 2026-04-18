/** Figma MCP — Done (withdraw flow) node 1:3893 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/3056e353-fc58-4a1c-96c7-20b5c3f07909";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/1d300ef1-3f71-40cd-b398-7dabe815827d";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/7e6a2e59-6157-47d9-adf4-d37f43713c9c";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/5fc4aef1-b474-4d18-aa3a-26d9db1aebd7";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/3e6786eb-fd78-4e3f-9cb9-73574e2463dd";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/d83186bd-b0b9-4a07-be51-f58b7f287804";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/e6ee6e04-e2f2-489b-a412-a55aa8648664";
const imgLine = "https://www.figma.com/api/mcp/asset/42985514-ba67-4700-813b-dc3f1e1737e0";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/5a620473-de68-4ea8-bee8-e1a4f2f0afdb";
const imgLine1 = "https://www.figma.com/api/mcp/asset/ab082317-6471-4b33-8b5b-5bd1010f43f4";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/671347c8-d14e-4a86-a809-56fa99cf3cc6";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/a7106408-1a44-43a9-a803-f6d3b794fdc5";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/3534d243-9cac-4c9f-af7e-b3ce4f974acd";
const imgIndicator = "https://www.figma.com/api/mcp/asset/e482db4c-a2f1-43d9-a0b8-673a552212ed";
const img941 = "https://www.figma.com/api/mcp/asset/003c0d4e-44dd-4766-9618-2d0d7154c75f";

type BtnProps = {
  className?: string;
  property1?: "Successful" | "Close Initial" | "Back Initial";
};

function Btn({ className, property1 = "Successful" }: BtnProps) {
  const isBackInitial = property1 === "Back Initial";
  const isCloseInitial = property1 === "Close Initial";
  const isCloseInitialOrBackInitial = ["Close Initial", "Back Initial"].includes(property1);
  return (
    <div className={className || `content-stretch flex items-start p-[4px] relative rounded-[30px] ${isCloseInitialOrBackInitial ? "size-[32px]" : "bg-[#73c1b1] size-[24px]"}`} id={isBackInitial ? "node-1_3291" : isCloseInitial ? "node-1_3289" : "node-1_3276"}>
      <div className={`flex items-center justify-center relative shrink-0 ${isCloseInitialOrBackInitial ? "size-[24px]" : "size-[16px]"}`}>
        <div className="-scale-y-100 flex-none rotate-90">
          {isCloseInitialOrBackInitial && (
            <div className="overflow-clip relative size-[24px]" id={isBackInitial ? "node-1_3292" : "node-1_3290"} data-name="Icons">
              {isCloseInitial && (
                <div className="absolute flex inset-[-4.17%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                    <div className="relative size-full" data-node-id="I1:3290;1:3158" data-name="Group">
                      <div className="absolute inset-[-4.35%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup1} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isBackInitial && (
                <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3292;1:3112" data-name="Group">
                  <div className="absolute inset-[-9.43%_-5%]">
                    <img alt="" className="block max-w-none size-full" src={imgGroup2} />
                  </div>
                </div>
              )}
            </div>
          )}
          {property1 === "Successful" && (
            <div className="relative size-[16px]" data-node-id="1:3277" data-name="Group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WithdrawDoneScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3893" data-name="1 | Done">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3894" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3894;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3894;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3894;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3894;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3894;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3894;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3894;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3894;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3894;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3894;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3894;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3894;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3894;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-[20px] top-[130px]" data-node-id="1:3895" data-name="List">
        <div className="bg-white h-[49px] relative rounded-tl-[12px] rounded-tr-[12px] shrink-0 w-[350px]" data-node-id="1:3896" data-name="List item">
          <div className="absolute h-0 left-[20px] top-[48px] w-[310px]" data-node-id="I1:3896;1:3474" data-name="Line">
            <div className="absolute inset-[-0.8px_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine} />
            </div>
          </div>
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px] whitespace-nowrap" data-node-id="I1:3896;1:3475">
            Recipient
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[330px] text-[#192b48] text-[18px] text-right top-[calc(50%-11.5px)] whitespace-nowrap" data-node-id="I1:3896;1:3476">
            UQC4...754C
          </p>
        </div>
        <div className="bg-white h-[49px] relative shrink-0 w-[350px]" data-node-id="1:3897" data-name="List item">
          <div className="absolute h-0 left-[20px] top-[48px] w-[310px]" data-node-id="I1:3897;1:3474" data-name="Line">
            <div className="absolute inset-[-0.8px_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine} />
            </div>
          </div>
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px] whitespace-nowrap" data-node-id="I1:3897;1:3475">
            Amount
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[0] left-[330px] text-[#192b48] text-[0px] text-right top-[calc(50%-11.5px)] whitespace-nowrap" data-node-id="I1:3897;1:3476">
            <span className="leading-[normal] text-[18px]">{`150 `}</span>
            <span className="leading-[normal] text-[#8494af] text-[13px]">USDT</span>
          </p>
        </div>
        <div className="bg-white h-[49px] relative rounded-bl-[12px] rounded-br-[12px] shrink-0 w-[350px] whitespace-nowrap" data-node-id="1:3898" data-name="List item">
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[20px] text-[#55647b] text-[15px] top-[15px]" data-node-id="I1:3898;1:3475">
            Comission
          </p>
          <p className="-translate-x-full absolute font-['Outfit:Medium',sans-serif] font-medium leading-[0] left-[330px] text-[#192b48] text-[0px] text-right top-[calc(50%-11.5px)]" data-node-id="I1:3898;1:3476">
            <span className="leading-[normal] text-[18px]">{`15 `}</span>
            <span className="leading-[normal] text-[#8494af] text-[13px]">USDT</span>
          </p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[12px] items-center left-1/2 top-[633px]" data-node-id="1:3899" data-name="Done">
        <div className="flex items-center justify-center relative shrink-0 size-[52px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <div className="bg-[#73c1b1] content-stretch flex items-start p-[8.667px] relative rounded-[30px]" data-node-id="1:3900" data-name="Btn">
              <div className="flex items-center justify-center relative shrink-0 size-[34.667px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="relative size-[34.667px]" data-node-id="I1:3900;1:3277" data-name="Group">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup7} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#55647b] text-[20px] text-right whitespace-nowrap" data-node-id="1:3901">
          Done!
        </p>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3902" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3902;1:3321" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine1} />
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] tracking-[0.4px] whitespace-nowrap" data-node-id="I1:3902;1:3322">
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
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3903" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3903;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3903;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3903;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3903;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3903;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3903;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3903;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3903;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
