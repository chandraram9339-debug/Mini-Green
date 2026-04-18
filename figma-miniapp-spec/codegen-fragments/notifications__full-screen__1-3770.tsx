/** Figma MCP — Notifications node 1:3770 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/f8b95711-4452-4c60-9de5-4da2d74b69c9";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/f09d5593-0cb6-45bb-8736-655aa25370bd";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/7835bf3a-9be0-4fba-b087-558506c1b641";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/355d3b2a-d4e1-475e-ac45-d0035495c718";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/99994d8e-aa48-4c17-a8ff-9a0bf086848c";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/0b65062f-9cdc-4382-a8cc-65499fd6c9d2";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/c294fe20-c7e4-496b-b480-678198922219";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/f41f46a3-84d1-4f26-9928-5772e4c3dd51";
const imgLine = "https://www.figma.com/api/mcp/asset/c48d5547-acd9-4325-88ce-1d8cae3c6c18";
const imgLine1 = "https://www.figma.com/api/mcp/asset/fe889bff-9946-4a91-acde-e246962fa4e7";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/53176fbc-6206-4354-a496-b9763184887c";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/cf823a7c-3f99-43e4-818b-c02f31cd11c8";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/6835eb8b-db0e-4f5c-ae2f-23a5b89d98a4";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/798afee2-421b-4049-aaba-9e22835c6b7f";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/f0d83559-3faf-4840-bd85-93b524f36f9a";
const imgIndicator = "https://www.figma.com/api/mcp/asset/ac67457d-8b4f-49f5-8f27-82da237bf2fc";
const img941 = "https://www.figma.com/api/mcp/asset/10758ced-a378-4c43-93e6-bb6d154182b6";

type BtnProps = {
  className?: string;
  property1?: "Successful" | "Back Initial";
};

function Btn({ className, property1 = "Successful" }: BtnProps) {
  const isBackInitial = property1 === "Back Initial";
  return (
    <div className={className || `content-stretch flex items-start p-[4px] relative rounded-[30px] ${isBackInitial ? "size-[32px]" : "bg-[#73c1b1] size-[24px]"}`} id={isBackInitial ? "node-1_3291" : "node-1_3276"}>
      <div className={`flex items-center justify-center relative shrink-0 ${isBackInitial ? "size-[24px]" : "size-[16px]"}`}>
        <div className="-scale-y-100 flex-none rotate-90">
          {property1 === "Successful" && (
            <div className="relative size-[16px]" data-node-id="1:3277" data-name="Group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
            </div>
          )}
          {isBackInitial && (
            <div className="overflow-clip relative size-[24px]" data-node-id="1:3292" data-name="Icons">
              <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3292;1:3112" data-name="Group">
                <div className="absolute inset-[-9.43%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup1} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ListItemProps = {
  className?: string;
  property1?: "Notificaton" | "Notificaton 2";
};

function ListItem({ className, property1 = "Notificaton" }: ListItemProps) {
  const isNotificaton2 = property1 === "Notificaton 2";
  return (
    <div className={className || "bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] w-[350px]"} id={isNotificaton2 ? "node-1_3423" : "node-1_3415"}>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0" id={isNotificaton2 ? "node-1_3424" : "node-1_3416"} data-name="Title">
        <div className="flex items-center justify-center relative shrink-0 size-[24px]">
          <div className="-scale-y-100 flex-none rotate-90">
            {property1 === "Notificaton" && <Btn className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" />}
            {isNotificaton2 && (
              <div className="bg-[#df7f7f] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="1:3425" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                  <div className="-scale-y-100 flex-none rotate-90">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3425;1:3281" data-name="Icons">
                      <div className="absolute flex inset-[6.25%] items-center justify-center" style={{ containerType: "size" }}>
                        <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                          <div className="relative size-full" data-node-id="I1:3425;1:3282" data-name="Group">
                            <div className="absolute inset-[-8.08%]">
                              <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" id={isNotificaton2 ? "node-1_3426" : "node-1_3418"}>
          {isNotificaton2 ? "Unsuccessful:" : "Successful:"}
        </p>
      </div>
      <div className="content-stretch flex gap-[10px] items-center relative shrink-0" id={isNotificaton2 ? "node-1_3427" : "node-1_3419"} data-name="Description">
        <div className="overflow-clip relative shrink-0 size-[24px]" id={isNotificaton2 ? "node-1_3428" : "node-1_3420"} data-name="Icons/Variant34">
          <div className="absolute flex inset-1/4 items-center justify-center" style={{ containerType: "size" }}>
            <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
              <div className="relative size-full" id={isNotificaton2 ? "node-I1_3428-154_3746" : "node-I1_3420-154_3746"} data-name="Group">
                <div className="absolute inset-[-9.43%_-9.43%_-6.67%_-6.67%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup2} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[15px] whitespace-nowrap" id={isNotificaton2 ? "node-1_3429" : "node-1_3421"}>
          {isNotificaton2 ? "Check your wallet address and try again." : "Withdrawal of 99 USDT completed."}
        </p>
      </div>
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[10px] text-[#8494af] text-[10px] text-right top-[21px] uppercase whitespace-nowrap" id={isNotificaton2 ? "node-1_3430" : "node-1_3422"}>
        31.12.2024 00:00
      </p>
    </div>
  );
}

export default function NotificationsScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3770" data-name="1 | Notification">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3771" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3771;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3771;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3771;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3771;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3771;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3771;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3771;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3771;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3771;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3771;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3771;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3771;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3771;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup7} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[30px] items-center left-[20px] top-[130px]" data-node-id="1:3772" data-name="List">
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3773" data-name="List">
          <ListItem className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" />
          <ListItem className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" property1="Notificaton 2" />
          <ListItem className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" />
        </div>
        <div className="h-0 relative shrink-0 w-[348px]" data-node-id="1:3777" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3778" data-name="List">
          <ListItem className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" property1="Notificaton 2" />
          <ListItem className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" />
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3781" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3781;1:3315" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine1} />
          </div>
        </div>
        <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="I1:3781;1:3316" data-name="Icons">
          <div className="absolute inset-[8.33%]" data-node-id="I1:3781;1:3316;1:3196" data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
          </div>
        </a>
        <div className="absolute left-[309px] size-[24px] top-[16px]" data-node-id="I1:3781;1:3317" data-name="Icons">
          <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3781;1:3317;1:3188" data-name="Group">
            <div className="absolute inset-[-4.21%_-4.44%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup9} />
            </div>
          </div>
          <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3781;1:3317;1:3192">
            <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3781;1:3317;1:3193">
              <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3781;1:3317;1:3194">
                3
              </p>
            </div>
          </div>
        </div>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] whitespace-nowrap" data-node-id="I1:3781;1:3318">
          Notification
        </p>
        <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3782" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3782;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3782;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3782;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3782;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3782;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3782;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3782;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3782;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
