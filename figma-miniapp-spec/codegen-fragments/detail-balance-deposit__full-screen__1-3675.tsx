/** Figma MCP get_design_context — экран «Detail Balance | Deposit» node 1:3675 (Actions History, Current Balance). fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/5bfae576-a44b-40e8-8e82-4a47502b6adc";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/ce464179-5c35-4cc9-ba8c-5632c2f17ecb";
const imgLine = "https://www.figma.com/api/mcp/asset/a140f325-5657-4636-bdc4-44b1a48ee084";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/9bddd41b-b983-45b3-9e18-7f77719a745e";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/102e23bc-759d-4196-babd-8ed0ffc9e51b";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/e550ae7a-26ca-42fd-b061-629703bf7812";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/3efe24fc-4c7a-422f-bb94-2deec46cc904";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/fc6aa8f9-462d-4eb0-a010-cbb4494442cc";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/fcb86a3d-4302-4f73-9c2a-b33c4847a07d";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/505ce3bc-d5d7-436c-83a2-9d040269c7ae";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/1b8ce94e-3234-46c4-b248-2a677ef0ce53";
const imgGroup10 = "https://www.figma.com/api/mcp/asset/93043ea7-1327-47eb-bf46-3c62489c0dc1";
const imgGroup11 = "https://www.figma.com/api/mcp/asset/4b0602ad-0153-4870-b51a-6933e3098397";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/ed470dca-948a-4554-ad09-3eb5da3d4985";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/d552bb9e-fbf3-47d5-9726-4623565efd17";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/26fa691e-1c42-4b8d-ab89-f62d82a6bce2";
const imgIndicator = "https://www.figma.com/api/mcp/asset/ddf09162-8c61-412b-a4f8-f8329fe2699a";
const img941 = "https://www.figma.com/api/mcp/asset/52f17119-7223-4ee9-bcfd-092af2f3d553";

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

export default function DetailBalanceDepositScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3675" data-name="1| Detail Balance | Deposit">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[1038px] w-[390px]" data-node-id="1:3676" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3676;1:3334" data-name="Navigation">
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3676;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3676;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3676;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <div className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3676;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3676;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3676;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </div>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3676;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3676;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3676;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3676;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3676;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3676;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup7} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[13px] items-end left-[20px] top-[347px]" data-node-id="1:3677" data-name="Actions History">
        <div className="content-stretch flex gap-[13px] items-start relative shrink-0" data-node-id="I1:3677;1:3823" data-name="Tabs">
          <div className="bg-white h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3677;1:3824" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] top-[99px]">
              <div className="-scale-y-100 flex-none">
                <div className="bg-[#b5ddd5] content-stretch flex items-start p-[6px] relative rounded-[30px]" data-node-id="I1:3677;1:3824;1:3488" data-name="Btn">
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I1:3677;1:3824;1:3488;1:3268" data-name="Icons">
                    <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-node-id="I1:3677;1:3824;1:3488;1:3268;1:3132" data-name="Group">
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
            <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3677;1:3824;1:3489">
              Deposit
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3677;1:3824;1:3490" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3677;1:3824;1:3491">
                Number of deposits made:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3824;1:3492" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3677;1:3824;1:3492;1:3348">
                  5
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3677;1:3824;1:3492;1:3349">
                  Times
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3677;1:3824;1:3493" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3677;1:3824;1:3494">
                Total deposited amount:
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3677;1:3824;1:3495" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3824;1:3495;1:3345">
                  5237.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3824;1:3495;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#f4f7f8] h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3677;1:3825" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] size-[28px] top-[99px]">
              <div className="flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[6px] relative rounded-[20px]" data-node-id="I1:3677;1:3825;1:3479" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3825;1:3479;1:3266" data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" data-node-id="I1:3677;1:3825;1:3479;1:3266;1:3132" data-name="Group">
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
            <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3677;1:3825;1:3480">
              Withdraw
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3677;1:3825;1:3481" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3677;1:3825;1:3482">
                Number of withdrawals:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3825;1:3483" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3677;1:3825;1:3483;1:3348">
                  4
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3677;1:3825;1:3483;1:3349">
                  Times
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3677;1:3825;1:3484" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3677;1:3825;1:3485">
                Total withdrawal amount:
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3677;1:3825;1:3486" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3825;1:3486;1:3345">
                  4250.98
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3825;1:3486;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#f4f7f8] h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px]" data-node-id="I1:3677;1:3826" data-name="Tab">
            <div className="absolute flex items-center justify-center left-[70px] size-[28px] top-[99px]">
              <div className="flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[6px] relative rounded-[20px]" data-node-id="I1:3677;1:3826;1:3479" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3826;1:3479;1:3266" data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" data-node-id="I1:3677;1:3826;1:3479;1:3266;1:3132" data-name="Group">
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
            <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3677;1:3826;1:3480">
              Refferal
            </p>
            <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" data-node-id="I1:3677;1:3826;1:3481" data-name="Number">
              <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" data-node-id="I1:3677;1:3826;1:3482">
                Total number of invited users:
              </p>
              <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3826;1:3483" data-name="Amount">
                <p className="relative shrink-0 text-[#192b48] text-[12px]" data-node-id="I1:3677;1:3826;1:3483;1:3348">
                  8
                </p>
                <p className="relative shrink-0 text-[#8494af] text-[6px]" data-node-id="I1:3677;1:3826;1:3483;1:3349">
                  People
                </p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" data-node-id="I1:3677;1:3826;1:3484" data-name="Total">
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" data-node-id="I1:3677;1:3826;1:3485">
                Bonuses received from:
              </p>
              <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="I1:3677;1:3826;1:3486" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3826;1:3486;1:3345">
                  603.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3826;1:3486;1:3346">
                  USDT
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="I1:3677;1:3827" data-name="List">
          <div className="bg-white content-stretch flex gap-[10px] items-start px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="I1:3677;1:3828" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3677;1:3828;1:3357" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3828;1:3357;1:3270" data-name="Icons">
                        <div className="absolute inset-1/4" data-node-id="I1:3677;1:3828;1:3357;1:3270;1:3150" data-name="Group">
                          <div className="absolute inset-[-6.25%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3828;1:3358" data-name="Titles">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" data-node-id="I1:3677;1:3828;1:3359">
                Replenishment
              </p>
              <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3828;1:3360">
                Сomission
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3828;1:3361">
                TQBw8....SGTF
              </p>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" data-node-id="I1:3677;1:3828;1:3362" data-name="Details">
              <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" data-node-id="I1:3677;1:3828;1:3363" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3828;1:3363;1:3345">
                  +1200.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3828;1:3363;1:3346">
                  USDT
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" data-node-id="I1:3677;1:3828;1:3364" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" data-node-id="I1:3677;1:3828;1:3364;1:3345">
                  -163.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" data-node-id="I1:3677;1:3828;1:3364;1:3346">
                  USDT
                </p>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" data-node-id="I1:3677;1:3828;1:3365">
                20.06.2025 13:05
              </p>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-start px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="I1:3677;1:3829" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3677;1:3829;1:3357" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3829;1:3357;1:3270" data-name="Icons">
                        <div className="absolute inset-1/4" data-node-id="I1:3677;1:3829;1:3357;1:3270;1:3150" data-name="Group">
                          <div className="absolute inset-[-6.25%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3829;1:3358" data-name="Titles">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" data-node-id="I1:3677;1:3829;1:3359">
                Replenishment
              </p>
              <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3829;1:3360">
                Сomission
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3829;1:3361">
                TfcD....jbTa
              </p>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" data-node-id="I1:3677;1:3829;1:3362" data-name="Details">
              <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" data-node-id="I1:3677;1:3829;1:3363" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3829;1:3363;1:3345">
                  +2340.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3829;1:3363;1:3346">
                  USDT
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" data-node-id="I1:3677;1:3829;1:3364" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" data-node-id="I1:3677;1:3829;1:3364;1:3345">
                  -311.20
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" data-node-id="I1:3677;1:3829;1:3364;1:3346">
                  USDT
                </p>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" data-node-id="I1:3677;1:3829;1:3365">
                05.06.2025 15:10
              </p>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-start px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="I1:3677;1:3830" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3677;1:3830;1:3357" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3830;1:3357;1:3270" data-name="Icons">
                        <div className="absolute inset-1/4" data-node-id="I1:3677;1:3830;1:3357;1:3270;1:3150" data-name="Group">
                          <div className="absolute inset-[-6.25%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3830;1:3358" data-name="Titles">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" data-node-id="I1:3677;1:3830;1:3359">
                Replenishment
              </p>
              <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3830;1:3360">
                Сomission
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3830;1:3361">
                TNem....ZncP
              </p>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" data-node-id="I1:3677;1:3830;1:3362" data-name="Details">
              <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" data-node-id="I1:3677;1:3830;1:3363" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3830;1:3363;1:3345">
                  +1037.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3830;1:3363;1:3346">
                  USDT
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" data-node-id="I1:3677;1:3830;1:3364" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" data-node-id="I1:3677;1:3830;1:3364;1:3345">
                  -141.81
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" data-node-id="I1:3677;1:3830;1:3364;1:3346">
                  USDT
                </p>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" data-node-id="I1:3677;1:3830;1:3365">
                15.05.2025 14:52
              </p>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-start px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="I1:3677;1:3831" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3677;1:3831;1:3357" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3831;1:3357;1:3270" data-name="Icons">
                        <div className="absolute inset-1/4" data-node-id="I1:3677;1:3831;1:3357;1:3270;1:3150" data-name="Group">
                          <div className="absolute inset-[-6.25%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3831;1:3358" data-name="Titles">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" data-node-id="I1:3677;1:3831;1:3359">
                Replenishment
              </p>
              <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3831;1:3360">
                Сomission
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3831;1:3361">
                TSd5f....x9bc
              </p>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" data-node-id="I1:3677;1:3831;1:3362" data-name="Details">
              <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" data-node-id="I1:3677;1:3831;1:3363" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3831;1:3363;1:3345">
                  +560.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3831;1:3363;1:3346">
                  USDT
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" data-node-id="I1:3677;1:3831;1:3364" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" data-node-id="I1:3677;1:3831;1:3364;1:3345">
                  -79.80
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" data-node-id="I1:3677;1:3831;1:3364;1:3346">
                  USDT
                </p>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" data-node-id="I1:3677;1:3831;1:3365">
                14.05.2025 09:20
              </p>
            </div>
          </div>
          <div className="bg-white content-stretch flex gap-[10px] items-start px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="I1:3677;1:3832" data-name="List item">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3677;1:3832;1:3357" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3677;1:3832;1:3357;1:3270" data-name="Icons">
                        <div className="absolute inset-1/4" data-node-id="I1:3677;1:3832;1:3357;1:3270;1:3150" data-name="Group">
                          <div className="absolute inset-[-6.25%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3677;1:3832;1:3358" data-name="Titles">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" data-node-id="I1:3677;1:3832;1:3359">
                Replenishment
              </p>
              <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3832;1:3360">
                Сomission
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="I1:3677;1:3832;1:3361">
                T7pZ....YicH
              </p>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" data-node-id="I1:3677;1:3832;1:3362" data-name="Details">
              <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" data-node-id="I1:3677;1:3832;1:3363" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3677;1:3832;1:3363;1:3345">
                  +100.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" data-node-id="I1:3677;1:3832;1:3363;1:3346">
                  USDT
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" data-node-id="I1:3677;1:3832;1:3364" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" data-node-id="I1:3677;1:3832;1:3364;1:3345">
                  -20.00
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" data-node-id="I1:3677;1:3832;1:3364;1:3346">
                  USDT
                </p>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" data-node-id="I1:3677;1:3832;1:3365">
                10.05.2025 13:21
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[187px] left-0 top-[130px] w-[390px]" data-node-id="1:3678" data-name="Current Balance">
        <div className="absolute bg-[#759ac6] content-stretch flex gap-[8px] items-center justify-center left-[201px] px-[20px] py-[14px] rounded-[54px] top-[135px] w-[169px]" data-node-id="1:3679" data-name="Btn">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3679;1:3260" data-name="Icons">
            <div className="absolute bottom-1/4 flex items-center justify-center left-[31.25%] right-[31.25%] top-1/4" style={{ containerType: "size" }}>
              <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                <div className="relative size-full" data-node-id="I1:3679;1:3260;1:3124" data-name="Group">
                  <div className="absolute inset-[-10.21%_-5.42%]">
                    <img alt="" className="block max-w-none size-full" src={imgGroup10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3679;1:3261">
            Withdraw
          </p>
        </div>
        <div className="absolute bg-[#73c1b1] content-stretch flex gap-[8px] items-center justify-center left-[20px] px-[20px] py-[14px] rounded-[54px] top-[135px] w-[169px]" data-node-id="1:3680" data-name="Btn">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3680;1:3260" data-name="Icons">
            <div className="absolute inset-1/4" data-node-id="I1:3680;1:3260;1:3146" data-name="Group">
              <div className="absolute inset-[-6.67%]">
                <img alt="" className="block max-w-none size-full" src={imgGroup11} />
              </div>
            </div>
          </div>
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3680;1:3261">
            Top up
          </p>
        </div>
        <div className="-translate-x-1/2 absolute contents left-[calc(50%+18.5px)] top-0" data-node-id="1:3681" data-name="Current Balance">
          <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-0 tracking-[0.4px] whitespace-nowrap" data-node-id="1:3682">
            Current balance
          </p>
          <div className="-translate-x-1/2 absolute content-stretch flex items-start left-[calc(50%+0.5px)] top-[92px]" data-node-id="1:3683" data-name="Amount">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#55647b] text-[11px] whitespace-nowrap" data-node-id="I1:3683;1:3354">
              TQBw8SGT.......6l48HPv4iB
            </p>
          </div>
          <div className="-translate-x-1/2 absolute content-stretch flex gap-[3px] items-start leading-[normal] left-[calc(50%+18.5px)] top-[41px] whitespace-nowrap" data-node-id="1:3684" data-name="Amount">
            <p className="font-['Outfit:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#192b48] text-[52px]" data-node-id="I1:3684;1:3351">
              8725.62
            </p>
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[12px]" data-node-id="I1:3684;1:3352">
              USDT
            </p>
          </div>
        </div>
      </div>
      <AppBar className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" />
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3686" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3686;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3686;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3686;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3686;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3686;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3686;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3686;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3686;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}