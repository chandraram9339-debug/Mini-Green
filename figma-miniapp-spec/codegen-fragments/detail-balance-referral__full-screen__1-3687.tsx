/** Figma MCP — Detail Balance Referral node 1:3687 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/a91ec3e0-000f-4c06-9308-edd635446cdc";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/3d4f30d7-e0cb-4e40-8608-db58171d8e6b";
const imgLine = "https://www.figma.com/api/mcp/asset/658ef1a4-31dc-4c11-a807-c95a70c094cb";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/345a78f0-cc04-432e-a220-24d2a76d6641";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/3a163bd6-0c56-4cd0-9c3f-2cac4ca63468";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/4476aaff-cd93-40b6-8b32-ff404b431d1b";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/37171f07-0d3a-453e-8b06-a1c59255365f";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/caf56a02-b3b1-43a4-9626-f130480c00f4";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/4be027f5-59db-4a45-a809-3356f24177f1";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/172b5223-c867-452a-a8e3-10aea55ab13b";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/9e3c2931-0fc4-4d25-b45c-ea163eb48d04";
const imgGroup10 = "https://www.figma.com/api/mcp/asset/1e2f5932-c30a-48ba-b84d-24a77d975030";
const imgGroup11 = "https://www.figma.com/api/mcp/asset/faff324a-63a3-48bf-8139-0835093aae3b";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/50a4211d-59a6-4948-80f2-4c6587409ff6";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/7be383e8-92f5-4970-8a45-54a5718888ea";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/2bece4dd-7f18-4c16-9bad-0cff8f70ff72";
const imgIndicator = "https://www.figma.com/api/mcp/asset/8d41010a-34f6-4938-bc31-3f43ec4a7fef";
const img941 = "https://www.figma.com/api/mcp/asset/b7b76466-27d1-41ad-b7e1-bb50187086ba";

type BtnProps = {
  className?: string;
  property1?: "Opened" | "Back Initial";
};

function Btn({ className, property1 = "Opened" }: BtnProps) {
  const isBackInitial = property1 === "Back Initial";
  return (
    <div className={className || `content-stretch flex items-start relative rounded-[30px] ${isBackInitial ? "p-[4px] size-[32px]" : "bg-[#2d6e93] p-[6px] size-[28px]"}`} id={isBackInitial ? "node-1_3291" : "node-1_3265"}>
      <div className={`flex items-center justify-center relative shrink-0 ${isBackInitial ? "size-[24px]" : "size-[16px]"}`}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className={`overflow-clip relative ${isBackInitial ? "size-[24px]" : "size-[16px]"}`} id={isBackInitial ? "node-1_3292" : "node-1_3266"} data-name="Icons">
            {property1 === "Opened" && (
              <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                  <div className="relative size-full" data-node-id="I1:3266;1:3132" data-name="Group">
                    <div className="absolute inset-[-8.84%_-4.69%]">
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
    </div>
  );
}

type AppBarProps = {
  className?: string;
  property1?: "Header+Logo";
};

function AppBar({ className, property1 = "Header+Logo" }: AppBarProps) {
  return (
    <div className={className || "bg-[#ecf1f4] h-[56px] overflow-clip relative w-[390px]"} data-node-id="1:3309">
      <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="1:3310" data-name="Line">
        <div className="absolute inset-[-0.8px_0]">
          <img alt="" className="block max-w-none size-full" src={imgLine} />
        </div>
      </div>
      <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="1:3311" data-name="Icons">
        <div className="absolute inset-[8.33%]" data-node-id="I1:3311;1:3196" data-name="Group">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup2} />
        </div>
      </a>
      <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="1:3312" data-name="Icons">
        <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3312;1:3188" data-name="Group">
          <div className="absolute inset-[-4.21%_-4.44%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
          </div>
        </div>
        <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3312;1:3192">
          <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3312;1:3193">
            <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3312;1:3194">
              25
            </p>
          </div>
        </div>
      </a>
      <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
        <div className="-scale-y-100 flex-none rotate-90">
          <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
        </div>
      </div>
    </div>
  );
}

type AmountProps = {
  className?: string;
  property1?: "Amount M" | "Wallet Number";
};

function Amount({ className, property1 = "Amount M" }: AmountProps) {
  const isWalletNumber = property1 === "Wallet Number";
  return (
    <div className={className || `content-stretch flex items-start relative ${isWalletNumber ? "" : "gap-[4px] leading-[normal] whitespace-nowrap"}`} id={isWalletNumber ? "node-1_3353" : "node-1_3344"}>
      <p className={`relative shrink-0 ${isWalletNumber ? 'font-["Inter:Regular",sans-serif] font-normal leading-[normal] not-italic text-[#55647b] text-[11px] whitespace-nowrap' : 'font-["Outfit:Medium",sans-serif] font-medium text-[#192b48] text-[20px]'}`} id={isWalletNumber ? "node-1_3354" : "node-1_3345"}>
        {isWalletNumber ? "UQBw8SGT.......6l48HPv4iB" : "425.22"}
      </p>
      {property1 === "Amount M" && (
        <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="1:3346">
          USDT
        </p>
      )}
    </div>
  );
}

export default function DetailBalanceReferralScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3687" data-name="1 | Detail Balance | Referral">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[843px] w-[390px]" data-node-id="1:3688" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3688;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3688;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3688;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3688;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3688;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3688;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3688;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3688;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3688;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3688;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3688;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3688;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3688;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup7} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[13px] items-end left-[20px] top-[347px]" data-node-id="1:3689" data-name="Actions History">
        <div className="content-stretch flex gap-[13px] items-start relative shrink-0" data-node-id="I1:3689;1:3845" data-name="Tabs">
          <div className="bg-[#f4f7f8] h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3689;1:3846" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] size-[28px] top-[99px]">
              <div className="flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[6px] relative rounded-[20px]" data-node-id="I1:3689;1:3846;1:3479" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3846;1:3479;1:3266" data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" data-node-id="I1:3689;1:3846;1:3479;1:3266;1:3132" data-name="Group">
                              <div className="absolute inset-[-8.84%_-4.69%]">
                                <img alt="" className="block max-w-none size-full" src={imgGroup8} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3689;1:3846;1:3480">
              Deposit
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3689;1:3846;1:3481" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3689;1:3846;1:3482">
                Number of deposits made:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3689;1:3846;1:3483" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3689;1:3846;1:3483;1:3348">
                  28
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3689;1:3846;1:3483;1:3349">
                  Times
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3689;1:3846;1:3484" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3689;1:3846;1:3485">
                Total deposited amount:
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3689;1:3846;1:3486" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3846;1:3486;1:3345">
                  725.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3689;1:3846;1:3486;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#f4f7f8] h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3689;1:3847" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] size-[28px] top-[99px]">
              <div className="flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[6px] relative rounded-[20px]" data-node-id="I1:3689;1:3847;1:3479" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3847;1:3479;1:3266" data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" data-node-id="I1:3689;1:3847;1:3479;1:3266;1:3132" data-name="Group">
                              <div className="absolute inset-[-8.84%_-4.69%]">
                                <img alt="" className="block max-w-none size-full" src={imgGroup8} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3689;1:3847;1:3480">
              Withdraw
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3689;1:3847;1:3481" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3689;1:3847;1:3482">
                Number of deposits made:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3689;1:3847;1:3483" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3689;1:3847;1:3483;1:3348">
                  534
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3689;1:3847;1:3483;1:3349">
                  Times
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3689;1:3847;1:3484" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3689;1:3847;1:3485">
                Total withdraw amount
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3689;1:3847;1:3486" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3847;1:3486;1:3345">
                  4250.98
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3689;1:3847;1:3486;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3689;1:3848" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] top-[99px]">
              <div className="-scale-y-100 flex-none">
                <div className="bg-[#b5ddd5] content-stretch flex items-start p-[6px] relative rounded-[30px]" data-node-id="I1:3689;1:3848;1:3488" data-name="Btn">
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I1:3689;1:3848;1:3488;1:3268" data-name="Icons">
                    <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-node-id="I1:3689;1:3848;1:3488;1:3268;1:3132" data-name="Group">
                          <div className="absolute inset-[-8.84%_-4.69%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup8} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3689;1:3848;1:3489">
              Refferal
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3689;1:3848;1:3490" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3689;1:3848;1:3491">
                Total number of invited users:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3689;1:3848;1:3492" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3689;1:3848;1:3492;1:3348">
                  25
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3689;1:3848;1:3492;1:3349">
                  People
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3689;1:3848;1:3493" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3689;1:3848;1:3494">
                Bonuses received from:
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3689;1:3848;1:3495" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3848;1:3495;1:3345">
                  25.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3689;1:3848;1:3495;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="I1:3689;1:3849" data-name="List">
          <div className="bg-white content-stretch flex gap-[10px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[349px]" data-node-id="I1:3689;1:3850" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#8494af] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3689;1:3850;1:3469" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3850;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3689;1:3850;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3689;1:3850;1:3470">
              @Anna_
            </p>
            <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3689;1:3850;1:3471">
              <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3689;1:3850;1:3472" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3850;1:3472;1:3345">
                  +5.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3689;1:3850;1:3472;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[349px]" data-node-id="I1:3689;1:3851" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#8494af] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3689;1:3851;1:3469" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3851;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3689;1:3851;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3689;1:3851;1:3470">
              @Maksim_254
            </p>
            <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3689;1:3851;1:3471">
              <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3689;1:3851;1:3472" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3851;1:3472;1:3345">
                  +20.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3689;1:3851;1:3472;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[349px]" data-node-id="I1:3689;1:3852" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#8494af] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3689;1:3852;1:3469" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3852;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3689;1:3852;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3689;1:3852;1:3470">
              @AlexV
            </p>
            <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3689;1:3852;1:3471">
              <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3689;1:3852;1:3472" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3852;1:3472;1:3345">
                  +5.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3689;1:3852;1:3472;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[349px]" data-node-id="I1:3689;1:3853" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#8494af] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3689;1:3853;1:3469" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3853;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3689;1:3853;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3689;1:3853;1:3470">
              @bingo765
            </p>
            <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3689;1:3853;1:3471">
              <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3689;1:3853;1:3472" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3853;1:3472;1:3345">
                  +700.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3689;1:3853;1:3472;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[349px]" data-node-id="I1:3689;1:3854" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#8494af] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3689;1:3854;1:3469" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3689;1:3854;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3689;1:3854;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3689;1:3854;1:3470">
              @Max
            </p>
            <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3689;1:3854;1:3471">
              <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3689;1:3854;1:3472" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3689;1:3854;1:3472;1:3345">
                  +11.10
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3689;1:3854;1:3472;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[30px] text-[#8494af] text-[10px] text-right top-[535px] uppercase whitespace-nowrap" data-node-id="1:3690">
        31.12.2024 00:00
      </p>
      <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[30px] text-[#8494af] text-[10px] text-right top-[796px] uppercase whitespace-nowrap" data-node-id="1:3691">
        31.12.2024 00:00
      </p>
      <div className="absolute h-[187px] left-0 top-[130px] w-[390px]" data-node-id="1:3692" data-name="Current Balance">
        <div className="absolute bg-[#759ac6] content-stretch flex gap-[8px] items-center justify-center left-[201px] px-[20px] py-[14px] rounded-[54px] top-[135px] w-[169px]" data-node-id="1:3693" data-name="Btn">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3693;1:3260" data-name="Icons">
            <div className="absolute bottom-1/4 flex items-center justify-center left-[31.25%] right-[31.25%] top-1/4" style={{ containerType: "size" }}>
              <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                <div className="relative size-full" data-node-id="I1:3693;1:3260;1:3124" data-name="Group">
                  <div className="absolute inset-[-10.21%_-5.42%]">
                    <img alt="" className="block max-w-none size-full" src={imgGroup10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3693;1:3261">
            Withdraw
          </p>
        </div>
        <div className="absolute bg-[#73c1b1] content-stretch flex gap-[8px] items-center justify-center left-[20px] px-[20px] py-[14px] rounded-[54px] top-[135px] w-[169px]" data-node-id="1:3694" data-name="Btn">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3694;1:3260" data-name="Icons">
            <div className="absolute inset-1/4" data-node-id="I1:3694;1:3260;1:3146" data-name="Group">
              <div className="absolute inset-[-6.67%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup11} />
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3694;1:3261">
            Top up
          </p>
        </div>
        <div className="-translate-x-1/2 absolute contents left-[calc(50%+18.5px)] top-0" data-node-id="1:3695" data-name="Current Balance">
          <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-0 tracking-[0.4px] whitespace-nowrap" data-node-id="1:3696">
            Current balance
          </p>
          <Amount className="-translate-x-1/2 absolute content-stretch flex items-start left-[calc(50%+0.5px)] top-[92px]" property1="Wallet Number" />
          <div className="-translate-x-1/2 absolute content-stretch flex gap-[3px] items-start leading-[normal] left-[calc(50%+18.5px)] top-[41px] whitespace-nowrap" data-node-id="1:3698" data-name="Amount">
            <p className="font-['Outfit:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#192b48] text-[52px]" data-node-id="I1:3698;1:3351">
              725.62
            </p>
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[12px]" data-node-id="I1:3698;1:3352">
              USDT
            </p>
          </div>
        </div>
      </div>
      <AppBar className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" />
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3700" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3700;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3700;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3700;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3700;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3700;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3700;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3700;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3700;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}