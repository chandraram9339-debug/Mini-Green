/** Figma MCP — Actions History layout node 1:3821 (широкий референс трёх колонок). fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/a0887c0f-6261-4c8f-81e8-706ede6666b5";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/2ba92f84-b50e-46d3-a047-a1f5b1b98012";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/0e324603-a78d-4bfb-b8d9-9b80bc999f0f";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/beabb7f8-45be-4c3b-a4bd-7b2216d3986a";

type ActionsHistoryProps = {
  className?: string;
  property1?: "Refferal" | "Withdraw" | "Variant4";
};

export default function ActionsHistoryFrame3821({ className, property1 = "Withdraw" }: ActionsHistoryProps) {
  const isRefferal = property1 === "Refferal";
  const isVariant4 = property1 === "Variant4";
  const isVariant4OrWithdraw = ["Variant4", "Withdraw"].includes(property1);
  const isWithdraw = property1 === "Withdraw";
  const isWithdrawOrRefferal = ["Withdraw", "Refferal"].includes(property1);
  return (
    <div className={className || "content-stretch flex flex-col gap-[13px] items-end relative"} id={isRefferal ? "node-1_3844" : isWithdraw ? "node-1_3833" : "node-1_3822"}>
      <div className="content-stretch flex gap-[13px] items-start relative shrink-0" id={isRefferal ? "node-1_3845" : isWithdraw ? "node-1_3834" : "node-1_3823"}>
        <div className={`h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px] ${isWithdrawOrRefferal ? "bg-[#f4f7f8]" : "bg-white"}`} id={isRefferal ? "node-1_3846" : isWithdraw ? "node-1_3835" : "node-1_3824"} data-name="Tab">
          <div className={`absolute flex items-center justify-center left-[70px] top-[99px] ${isWithdrawOrRefferal ? "size-[28px]" : ""}`}>
            <div className={`flex-none ${isWithdrawOrRefferal ? "rotate-90" : "-scale-y-100"}`}>
              <div className={`content-stretch flex items-start p-[6px] relative ${isWithdrawOrRefferal ? "bg-[#2d6e93] rounded-[20px]" : "bg-[#b5ddd5] rounded-[30px]"}`} id={isRefferal ? "node-I1_3846-1_3479" : isWithdraw ? "node-I1_3835-1_3479" : "node-I1_3824-1_3488"} data-name="Btn">
                {isWithdrawOrRefferal && (
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" id={isRefferal ? "node-I1_3846-1_3479-1_3266" : "node-I1_3835-1_3479-1_3266"} data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" id={isRefferal ? "node-I1_3846-1_3479-1_3266-1_3132" : "node-I1_3835-1_3479-1_3266-1_3132"} data-name="Group">
                              <div className="absolute inset-[-8.84%_-4.69%]">
                                <img alt="" className="block max-w-none size-full" src={imgGroup} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isVariant4 && (
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I1:3824;1:3488;1:3268" data-name="Icons">
                    <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-node-id="I1:3824;1:3488;1:3268;1:3132" data-name="Group">
                          <div className="absolute inset-[-8.84%_-4.69%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className={`absolute leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap ${isWithdrawOrRefferal ? 'font-["Outfit:Medium",sans-serif] font-medium' : 'font-["Outfit:Regular",sans-serif] font-normal'}`} id={isRefferal ? "node-I1_3846-1_3480" : isWithdraw ? "node-I1_3835-1_3480" : "node-I1_3824-1_3489"}>
            Deposit
          </p>
          <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" id={isRefferal ? "node-I1_3846-1_3481" : isWithdraw ? "node-I1_3835-1_3481" : "node-I1_3824-1_3490"} data-name="Number">
            <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" id={isRefferal ? "node-I1_3846-1_3482" : isWithdraw ? "node-I1_3835-1_3482" : "node-I1_3824-1_3491"}>
              Number of deposits made:
            </p>
            <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" id={isRefferal ? "node-I1_3846-1_3483" : isWithdraw ? "node-I1_3835-1_3483" : "node-I1_3824-1_3492"} data-name="Amount">
              <p className="relative shrink-0 text-[#192b48] text-[12px]" id={isRefferal ? "node-I1_3846-1_3483-1_3348" : isWithdraw ? "node-I1_3835-1_3483-1_3348" : "node-I1_3824-1_3492-1_3348"}>
                28
              </p>
              <p className="relative shrink-0 text-[#8494af] text-[6px]" id={isRefferal ? "node-I1_3846-1_3483-1_3349" : isWithdraw ? "node-I1_3835-1_3483-1_3349" : "node-I1_3824-1_3492-1_3349"}>
                Times
              </p>
            </div>
          </div>
          <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" id={isRefferal ? "node-I1_3846-1_3484" : isWithdraw ? "node-I1_3835-1_3484" : "node-I1_3824-1_3493"} data-name="Total">
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" id={isRefferal ? "node-I1_3846-1_3485" : isWithdraw ? "node-I1_3835-1_3485" : "node-I1_3824-1_3494"}>
              Total deposited amount:
            </p>
            <div className="content-stretch flex gap-[4px] items-start relative shrink-0" id={isRefferal ? "node-I1_3846-1_3486" : isWithdraw ? "node-I1_3835-1_3486" : "node-I1_3824-1_3495"} data-name="Amount">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isRefferal ? "node-I1_3846-1_3486-1_3345" : isWithdraw ? "node-I1_3835-1_3486-1_3345" : "node-I1_3824-1_3495-1_3345"}>
                725.22
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isRefferal ? "node-I1_3846-1_3486-1_3346" : isWithdraw ? "node-I1_3835-1_3486-1_3346" : "node-I1_3824-1_3495-1_3346"}>
                USDT
              </p>
            </div>
          </div>
        </div>
        <div className={`h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px] ${isWithdraw ? "bg-white" : "bg-[#f4f7f8]"}`} id={isRefferal ? "node-1_3847" : isWithdraw ? "node-1_3836" : "node-1_3825"} data-name="Tab">
          <div className={`absolute flex items-center justify-center left-[70px] top-[99px] ${isWithdraw ? "" : "size-[28px]"}`}>
            <div className={`flex-none ${isWithdraw ? "-scale-y-100" : "rotate-90"}`}>
              <div className={`content-stretch flex items-start p-[6px] relative ${isWithdraw ? "bg-[#b5ddd5] rounded-[30px]" : "bg-[#2d6e93] rounded-[20px]"}`} id={isRefferal ? "node-I1_3847-1_3479" : isWithdraw ? "node-I1_3836-1_3488" : "node-I1_3825-1_3479"} data-name="Btn">
                {["Variant4", "Refferal"].includes(property1) && (
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" id={isRefferal ? "node-I1_3847-1_3479-1_3266" : "node-I1_3825-1_3479-1_3266"} data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" id={isRefferal ? "node-I1_3847-1_3479-1_3266-1_3132" : "node-I1_3825-1_3479-1_3266-1_3132"} data-name="Group">
                              <div className="absolute inset-[-8.84%_-4.69%]">
                                <img alt="" className="block max-w-none size-full" src={imgGroup} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isWithdraw && (
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I1:3836;1:3488;1:3268" data-name="Icons">
                    <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-node-id="I1:3836;1:3488;1:3268;1:3132" data-name="Group">
                          <div className="absolute inset-[-8.84%_-4.69%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className={`absolute leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap ${isWithdraw ? 'font-["Outfit:Regular",sans-serif] font-normal' : 'font-["Outfit:Medium",sans-serif] font-medium'}`} id={isRefferal ? "node-I1_3847-1_3480" : isWithdraw ? "node-I1_3836-1_3489" : "node-I1_3825-1_3480"}>
            Withdraw
          </p>
          <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" id={isRefferal ? "node-I1_3847-1_3481" : isWithdraw ? "node-I1_3836-1_3490" : "node-I1_3825-1_3481"} data-name="Number">
            <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" id={isRefferal ? "node-I1_3847-1_3482" : isWithdraw ? "node-I1_3836-1_3491" : "node-I1_3825-1_3482"}>
              Number of deposits made:
            </p>
            <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" id={isRefferal ? "node-I1_3847-1_3483" : isWithdraw ? "node-I1_3836-1_3492" : "node-I1_3825-1_3483"} data-name="Amount">
              <p className="relative shrink-0 text-[#192b48] text-[12px]" id={isRefferal ? "node-I1_3847-1_3483-1_3348" : isWithdraw ? "node-I1_3836-1_3492-1_3348" : "node-I1_3825-1_3483-1_3348"}>
                534
              </p>
              <p className="relative shrink-0 text-[#8494af] text-[6px]" id={isRefferal ? "node-I1_3847-1_3483-1_3349" : isWithdraw ? "node-I1_3836-1_3492-1_3349" : "node-I1_3825-1_3483-1_3349"}>
                Times
              </p>
            </div>
          </div>
          <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" id={isRefferal ? "node-I1_3847-1_3484" : isWithdraw ? "node-I1_3836-1_3493" : "node-I1_3825-1_3484"} data-name="Total">
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" id={isRefferal ? "node-I1_3847-1_3485" : isWithdraw ? "node-I1_3836-1_3494" : "node-I1_3825-1_3485"}>
              {isRefferal ? "Total withdraw amount" : isVariant4 ? "Total deposited amount:" : "Total withdraw amount"}
            </p>
            <div className="content-stretch flex gap-[4px] items-start relative shrink-0" id={isRefferal ? "node-I1_3847-1_3486" : isWithdraw ? "node-I1_3836-1_3495" : "node-I1_3825-1_3486"} data-name="Amount">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isRefferal ? "node-I1_3847-1_3486-1_3345" : isWithdraw ? "node-I1_3836-1_3495-1_3345" : "node-I1_3825-1_3486-1_3345"}>
                4250.98
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isRefferal ? "node-I1_3847-1_3486-1_3346" : isWithdraw ? "node-I1_3836-1_3495-1_3346" : "node-I1_3825-1_3486-1_3346"}>
                USDT
              </p>
            </div>
          </div>
        </div>
        <div className={`h-[137px] overflow-clip relative rounded-[8px] shrink-0 w-[108px] ${isRefferal ? "bg-white" : "bg-[#f4f7f8]"}`} id={isRefferal ? "node-1_3848" : isWithdraw ? "node-1_3837" : "node-1_3826"} data-name="Tab">
          <div className={`absolute flex items-center justify-center left-[70px] top-[99px] ${isRefferal ? "" : "size-[28px]"}`}>
            <div className={`flex-none ${isRefferal ? "-scale-y-100" : "rotate-90"}`}>
              <div className={`content-stretch flex items-start p-[6px] relative ${isRefferal ? "bg-[#b5ddd5] rounded-[30px]" : "bg-[#2d6e93] rounded-[20px]"}`} id={isRefferal ? "node-I1_3848-1_3488" : isWithdraw ? "node-I1_3837-1_3479" : "node-I1_3826-1_3479"} data-name="Btn">
                {isVariant4OrWithdraw && (
                  <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3837-1_3479-1_3266" : "node-I1_3826-1_3479-1_3266"} data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" id={isWithdraw ? "node-I1_3837-1_3479-1_3266-1_3132" : "node-I1_3826-1_3479-1_3266-1_3132"} data-name="Group">
                              <div className="absolute inset-[-8.84%_-4.69%]">
                                <img alt="" className="block max-w-none size-full" src={imgGroup} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isRefferal && (
                  <div className="overflow-clip relative shrink-0 size-[16px]" data-node-id="I1:3848;1:3488;1:3268" data-name="Icons">
                    <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-node-id="I1:3848;1:3488;1:3268;1:3132" data-name="Group">
                          <div className="absolute inset-[-8.84%_-4.69%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className={`absolute leading-[normal] left-[10px] text-[#2d6e93] text-[18px] top-[10px] tracking-[0.18px] whitespace-nowrap ${isRefferal ? 'font-["Outfit:Regular",sans-serif] font-normal' : 'font-["Outfit:Medium",sans-serif] font-medium'}`} id={isRefferal ? "node-I1_3848-1_3489" : isWithdraw ? "node-I1_3837-1_3480" : "node-I1_3826-1_3480"}>
            Refferal
          </p>
          <div className="absolute content-stretch flex flex-col font-['Outfit:Regular',sans-serif] font-normal gap-[10px] items-start leading-[normal] left-[10px] top-[93px]" id={isRefferal ? "node-I1_3848-1_3490" : isWithdraw ? "node-I1_3837-1_3481" : "node-I1_3826-1_3481"} data-name="Number">
            <p className="relative shrink-0 text-[#55647b] text-[8px] w-[57px]" id={isRefferal ? "node-I1_3848-1_3491" : isWithdraw ? "node-I1_3837-1_3482" : "node-I1_3826-1_3482"}>
              Total number of invited users:
            </p>
            <div className="content-stretch flex gap-[3px] items-start relative shrink-0 whitespace-nowrap" id={isRefferal ? "node-I1_3848-1_3492" : isWithdraw ? "node-I1_3837-1_3483" : "node-I1_3826-1_3483"} data-name="Amount">
              <p className="relative shrink-0 text-[#192b48] text-[12px]" id={isRefferal ? "node-I1_3848-1_3492-1_3348" : isWithdraw ? "node-I1_3837-1_3483-1_3348" : "node-I1_3826-1_3483-1_3348"}>
                25
              </p>
              <p className="relative shrink-0 text-[#8494af] text-[6px]" id={isRefferal ? "node-I1_3848-1_3492-1_3349" : isWithdraw ? "node-I1_3837-1_3483-1_3349" : "node-I1_3826-1_3483-1_3349"}>
                People
              </p>
            </div>
          </div>
          <div className="absolute content-stretch flex flex-col gap-[10px] items-start leading-[normal] left-[10px] top-[50px] whitespace-nowrap" id={isRefferal ? "node-I1_3848-1_3493" : isWithdraw ? "node-I1_3837-1_3484" : "node-I1_3826-1_3484"} data-name="Total">
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[8px]" id={isRefferal ? "node-I1_3848-1_3494" : isWithdraw ? "node-I1_3837-1_3485" : "node-I1_3826-1_3485"}>
              Bonuses received from:
            </p>
            <div className="content-stretch flex gap-[4px] items-start relative shrink-0" id={isRefferal ? "node-I1_3848-1_3495" : isWithdraw ? "node-I1_3837-1_3486" : "node-I1_3826-1_3486"} data-name="Amount">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isRefferal ? "node-I1_3848-1_3495-1_3345" : isWithdraw ? "node-I1_3837-1_3486-1_3345" : "node-I1_3826-1_3486-1_3345"}>
                25.22
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isRefferal ? "node-I1_3848-1_3495-1_3346" : isWithdraw ? "node-I1_3837-1_3486-1_3346" : "node-I1_3826-1_3486-1_3346"}>
                USDT
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" id={isRefferal ? "node-1_3849" : isWithdraw ? "node-1_3838" : "node-1_3827"} data-name="List">
        <div className={`bg-white content-stretch flex gap-[10px] px-[10px] py-[16px] relative rounded-[12px] shrink-0 ${isRefferal ? "items-center w-[349px]" : "items-start w-[350px]"}`} id={isRefferal ? "node-1_3850" : isWithdraw ? "node-1_3839" : "node-1_3828"} data-name="List item">
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className={`content-stretch flex items-start p-[4px] relative rounded-[30px] ${isRefferal ? "bg-[#8494af]" : isWithdraw ? "bg-[#759ac6]" : "bg-[#73c1b1]"}`} id={isRefferal ? "node-I1_3850-1_3469" : isWithdraw ? "node-I1_3839-1_3357" : "node-I1_3828-1_3357"} data-name="Btn">
                <div className={`flex items-center justify-center relative shrink-0 ${isWithdrawOrRefferal ? "size-[16px]" : ""}`}>
                  <div className={`-scale-y-100 flex-none ${isWithdrawOrRefferal ? "rotate-90" : "rotate-180"}`}>
                    {isVariant4OrWithdraw && (
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3839-1_3357-1_3272" : "node-I1_3828-1_3357-1_3270"} data-name="Icons">
                        <div className={`absolute ${isWithdraw ? "bottom-1/2 left-1/4 right-1/4 top-1/2" : "inset-1/4"}`} id={isWithdraw ? "node-I1_3839-1_3357-1_3272-1_3143" : "node-I1_3828-1_3357-1_3270-1_3150"} data-name="Group">
                          <div className={`absolute ${isWithdraw ? "inset-[-0.5px_-6.25%]" : "inset-[-6.25%]"}`}>
                            <img alt="" className="block max-w-none size-full" src={isWithdraw ? imgGroup2 : imgGroup1} />
                          </div>
                        </div>
                      </div>
                    )}
                    {isRefferal && (
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3850;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3850;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isVariant4OrWithdraw && (
            <>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" id={isWithdraw ? "node-I1_3839-1_3358" : "node-I1_3828-1_3358"} data-name="Titles">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" id={isWithdraw ? "node-I1_3839-1_3359" : "node-I1_3828-1_3359"}>
                  Replenishment
                </p>
                <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3839-1_3360" : "node-I1_3828-1_3360"}>
                  Сomission
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3839-1_3361" : "node-I1_3828-1_3361"}>
                  UQBw8....SGTF
                </p>
              </div>
              <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" id={isWithdraw ? "node-I1_3839-1_3362" : "node-I1_3828-1_3362"} data-name="Details">
                <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" id={isWithdraw ? "node-I1_3839-1_3363" : "node-I1_3828-1_3363"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isWithdraw ? "node-I1_3839-1_3363-1_3345" : "node-I1_3828-1_3363-1_3345"}>
                    +100.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isWithdraw ? "node-I1_3839-1_3363-1_3346" : "node-I1_3828-1_3363-1_3346"}>
                    USDT
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" id={isWithdraw ? "node-I1_3839-1_3364" : "node-I1_3828-1_3364"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" id={isWithdraw ? "node-I1_3839-1_3364-1_3345" : "node-I1_3828-1_3364-1_3345"}>
                    -10.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" id={isWithdraw ? "node-I1_3839-1_3364-1_3346" : "node-I1_3828-1_3364-1_3346"}>
                    USDT
                  </p>
                </div>
                <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" id={isWithdraw ? "node-I1_3839-1_3365" : "node-I1_3828-1_3365"}>
                  31.12.2024 00:00
                </p>
              </div>
            </>
          )}
          {isRefferal && (
            <>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3850;1:3470">
                @Anna_
              </p>
              <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3850;1:3471">
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3850;1:3472" data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3850;1:3472;1:3345">
                    +5.22
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3850;1:3472;1:3346">
                    USDT
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={`bg-white content-stretch flex gap-[10px] px-[10px] py-[16px] relative rounded-[12px] shrink-0 ${isRefferal ? "items-center w-[349px]" : "items-start w-[350px]"}`} id={isRefferal ? "node-1_3851" : isWithdraw ? "node-1_3840" : "node-1_3829"} data-name="List item">
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className={`content-stretch flex items-start p-[4px] relative rounded-[30px] ${isRefferal ? "bg-[#8494af]" : isWithdraw ? "bg-[#759ac6]" : "bg-[#73c1b1]"}`} id={isRefferal ? "node-I1_3851-1_3469" : isWithdraw ? "node-I1_3840-1_3357" : "node-I1_3829-1_3357"} data-name="Btn">
                <div className={`flex items-center justify-center relative shrink-0 ${isWithdrawOrRefferal ? "size-[16px]" : ""}`}>
                  <div className={`-scale-y-100 flex-none ${isWithdrawOrRefferal ? "rotate-90" : "rotate-180"}`}>
                    {isVariant4OrWithdraw && (
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3840-1_3357-1_3272" : "node-I1_3829-1_3357-1_3270"} data-name="Icons">
                        <div className={`absolute ${isWithdraw ? "bottom-1/2 left-1/4 right-1/4 top-1/2" : "inset-1/4"}`} id={isWithdraw ? "node-I1_3840-1_3357-1_3272-1_3143" : "node-I1_3829-1_3357-1_3270-1_3150"} data-name="Group">
                          <div className={`absolute ${isWithdraw ? "inset-[-0.5px_-6.25%]" : "inset-[-6.25%]"}`}>
                            <img alt="" className="block max-w-none size-full" src={isWithdraw ? imgGroup2 : imgGroup1} />
                          </div>
                        </div>
                      </div>
                    )}
                    {isRefferal && (
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3851;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3851;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isVariant4OrWithdraw && (
            <>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" id={isWithdraw ? "node-I1_3840-1_3358" : "node-I1_3829-1_3358"} data-name="Titles">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" id={isWithdraw ? "node-I1_3840-1_3359" : "node-I1_3829-1_3359"}>
                  Replenishment
                </p>
                <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3840-1_3360" : "node-I1_3829-1_3360"}>
                  Сomission
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3840-1_3361" : "node-I1_3829-1_3361"}>
                  UQBw8....SGTF
                </p>
              </div>
              <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" id={isWithdraw ? "node-I1_3840-1_3362" : "node-I1_3829-1_3362"} data-name="Details">
                <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" id={isWithdraw ? "node-I1_3840-1_3363" : "node-I1_3829-1_3363"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isWithdraw ? "node-I1_3840-1_3363-1_3345" : "node-I1_3829-1_3363-1_3345"}>
                    +450.11
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isWithdraw ? "node-I1_3840-1_3363-1_3346" : "node-I1_3829-1_3363-1_3346"}>
                    USDT
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" id={isWithdraw ? "node-I1_3840-1_3364" : "node-I1_3829-1_3364"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" id={isWithdraw ? "node-I1_3840-1_3364-1_3345" : "node-I1_3829-1_3364-1_3345"}>
                    -10.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" id={isWithdraw ? "node-I1_3840-1_3364-1_3346" : "node-I1_3829-1_3364-1_3346"}>
                    USDT
                  </p>
                </div>
                <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" id={isWithdraw ? "node-I1_3840-1_3365" : "node-I1_3829-1_3365"}>
                  31.12.2024 00:00
                </p>
              </div>
            </>
          )}
          {isRefferal && (
            <>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3851;1:3470">
                @Maksim_254
              </p>
              <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3851;1:3471">
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3851;1:3472" data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3851;1:3472;1:3345">
                    +20.22
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3851;1:3472;1:3346">
                    USDT
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={`bg-white content-stretch flex gap-[10px] px-[10px] py-[16px] relative rounded-[12px] shrink-0 ${isRefferal ? "items-center w-[349px]" : "items-start w-[350px]"}`} id={isRefferal ? "node-1_3852" : isWithdraw ? "node-1_3841" : "node-1_3830"} data-name="List item">
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className={`content-stretch flex items-start p-[4px] relative rounded-[30px] ${isRefferal ? "bg-[#8494af]" : isWithdraw ? "bg-[#759ac6]" : "bg-[#73c1b1]"}`} id={isRefferal ? "node-I1_3852-1_3469" : isWithdraw ? "node-I1_3841-1_3357" : "node-I1_3830-1_3357"} data-name="Btn">
                <div className={`flex items-center justify-center relative shrink-0 ${isWithdrawOrRefferal ? "size-[16px]" : ""}`}>
                  <div className={`-scale-y-100 flex-none ${isWithdrawOrRefferal ? "rotate-90" : "rotate-180"}`}>
                    {isVariant4OrWithdraw && (
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3841-1_3357-1_3272" : "node-I1_3830-1_3357-1_3270"} data-name="Icons">
                        <div className={`absolute ${isWithdraw ? "bottom-1/2 left-1/4 right-1/4 top-1/2" : "inset-1/4"}`} id={isWithdraw ? "node-I1_3841-1_3357-1_3272-1_3143" : "node-I1_3830-1_3357-1_3270-1_3150"} data-name="Group">
                          <div className={`absolute ${isWithdraw ? "inset-[-0.5px_-6.25%]" : "inset-[-6.25%]"}`}>
                            <img alt="" className="block max-w-none size-full" src={isWithdraw ? imgGroup2 : imgGroup1} />
                          </div>
                        </div>
                      </div>
                    )}
                    {isRefferal && (
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3852;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3852;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isVariant4OrWithdraw && (
            <>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" id={isWithdraw ? "node-I1_3841-1_3358" : "node-I1_3830-1_3358"} data-name="Titles">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" id={isWithdraw ? "node-I1_3841-1_3359" : "node-I1_3830-1_3359"}>
                  Replenishment
                </p>
                <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3841-1_3360" : "node-I1_3830-1_3360"}>
                  Сomission
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3841-1_3361" : "node-I1_3830-1_3361"}>
                  UQBw8....SGTF
                </p>
              </div>
              <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" id={isWithdraw ? "node-I1_3841-1_3362" : "node-I1_3830-1_3362"} data-name="Details">
                <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" id={isWithdraw ? "node-I1_3841-1_3363" : "node-I1_3830-1_3363"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isWithdraw ? "node-I1_3841-1_3363-1_3345" : "node-I1_3830-1_3363-1_3345"}>
                    +10.22
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isWithdraw ? "node-I1_3841-1_3363-1_3346" : "node-I1_3830-1_3363-1_3346"}>
                    USDT
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" id={isWithdraw ? "node-I1_3841-1_3364" : "node-I1_3830-1_3364"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" id={isWithdraw ? "node-I1_3841-1_3364-1_3345" : "node-I1_3830-1_3364-1_3345"}>
                    -10.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" id={isWithdraw ? "node-I1_3841-1_3364-1_3346" : "node-I1_3830-1_3364-1_3346"}>
                    USDT
                  </p>
                </div>
                <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" id={isWithdraw ? "node-I1_3841-1_3365" : "node-I1_3830-1_3365"}>
                  31.12.2024 00:00
                </p>
              </div>
            </>
          )}
          {isRefferal && (
            <>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3852;1:3470">
                @AlexV
              </p>
              <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3852;1:3471">
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3852;1:3472" data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3852;1:3472;1:3345">
                    +5.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3852;1:3472;1:3346">
                    USDT
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={`bg-white content-stretch flex gap-[10px] px-[10px] py-[16px] relative rounded-[12px] shrink-0 ${isRefferal ? "items-center w-[349px]" : "items-start w-[350px]"}`} id={isRefferal ? "node-1_3853" : isWithdraw ? "node-1_3842" : "node-1_3831"} data-name="List item">
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className={`content-stretch flex items-start p-[4px] relative rounded-[30px] ${isRefferal ? "bg-[#8494af]" : isWithdraw ? "bg-[#759ac6]" : "bg-[#73c1b1]"}`} id={isRefferal ? "node-I1_3853-1_3469" : isWithdraw ? "node-I1_3842-1_3357" : "node-I1_3831-1_3357"} data-name="Btn">
                <div className={`flex items-center justify-center relative shrink-0 ${isWithdrawOrRefferal ? "size-[16px]" : ""}`}>
                  <div className={`-scale-y-100 flex-none ${isWithdrawOrRefferal ? "rotate-90" : "rotate-180"}`}>
                    {isVariant4OrWithdraw && (
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3842-1_3357-1_3272" : "node-I1_3831-1_3357-1_3270"} data-name="Icons">
                        <div className={`absolute ${isWithdraw ? "bottom-1/2 left-1/4 right-1/4 top-1/2" : "inset-1/4"}`} id={isWithdraw ? "node-I1_3842-1_3357-1_3272-1_3143" : "node-I1_3831-1_3357-1_3270-1_3150"} data-name="Group">
                          <div className={`absolute ${isWithdraw ? "inset-[-0.5px_-6.25%]" : "inset-[-6.25%]"}`}>
                            <img alt="" className="block max-w-none size-full" src={isWithdraw ? imgGroup2 : imgGroup1} />
                          </div>
                        </div>
                      </div>
                    )}
                    {isRefferal && (
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3853;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3853;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isVariant4OrWithdraw && (
            <>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" id={isWithdraw ? "node-I1_3842-1_3358" : "node-I1_3831-1_3358"} data-name="Titles">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" id={isWithdraw ? "node-I1_3842-1_3359" : "node-I1_3831-1_3359"}>
                  Replenishment
                </p>
                <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3842-1_3360" : "node-I1_3831-1_3360"}>
                  Сomission
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3842-1_3361" : "node-I1_3831-1_3361"}>
                  UQBw8....SGTF
                </p>
              </div>
              <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" id={isWithdraw ? "node-I1_3842-1_3362" : "node-I1_3831-1_3362"} data-name="Details">
                <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" id={isWithdraw ? "node-I1_3842-1_3363" : "node-I1_3831-1_3363"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isWithdraw ? "node-I1_3842-1_3363-1_3345" : "node-I1_3831-1_3363-1_3345"}>
                    +70.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isWithdraw ? "node-I1_3842-1_3363-1_3346" : "node-I1_3831-1_3363-1_3346"}>
                    USDT
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" id={isWithdraw ? "node-I1_3842-1_3364" : "node-I1_3831-1_3364"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" id={isWithdraw ? "node-I1_3842-1_3364-1_3345" : "node-I1_3831-1_3364-1_3345"}>
                    -10.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" id={isWithdraw ? "node-I1_3842-1_3364-1_3346" : "node-I1_3831-1_3364-1_3346"}>
                    USDT
                  </p>
                </div>
                <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" id={isWithdraw ? "node-I1_3842-1_3365" : "node-I1_3831-1_3365"}>
                  31.12.2024 00:00
                </p>
              </div>
            </>
          )}
          {isRefferal && (
            <>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3853;1:3470">
                @bingo765
              </p>
              <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3853;1:3471">
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3853;1:3472" data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3853;1:3472;1:3345">
                    +700.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3853;1:3472;1:3346">
                    USDT
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={`bg-white content-stretch flex gap-[10px] px-[10px] py-[16px] relative rounded-[12px] shrink-0 ${isRefferal ? "items-center w-[349px]" : "items-start w-[350px]"}`} id={isRefferal ? "node-1_3854" : isWithdraw ? "node-1_3843" : "node-1_3832"} data-name="List item">
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className={`content-stretch flex items-start p-[4px] relative rounded-[30px] ${isRefferal ? "bg-[#8494af]" : isWithdraw ? "bg-[#759ac6]" : "bg-[#73c1b1]"}`} id={isRefferal ? "node-I1_3854-1_3469" : isWithdraw ? "node-I1_3843-1_3357" : "node-I1_3832-1_3357"} data-name="Btn">
                <div className={`flex items-center justify-center relative shrink-0 ${isWithdrawOrRefferal ? "size-[16px]" : ""}`}>
                  <div className={`-scale-y-100 flex-none ${isWithdrawOrRefferal ? "rotate-90" : "rotate-180"}`}>
                    {isVariant4OrWithdraw && (
                      <div className="overflow-clip relative size-[16px]" id={isWithdraw ? "node-I1_3843-1_3357-1_3272" : "node-I1_3832-1_3357-1_3270"} data-name="Icons">
                        <div className={`absolute ${isWithdraw ? "bottom-1/2 left-1/4 right-1/4 top-1/2" : "inset-1/4"}`} id={isWithdraw ? "node-I1_3843-1_3357-1_3272-1_3143" : "node-I1_3832-1_3357-1_3270-1_3150"} data-name="Group">
                          <div className={`absolute ${isWithdraw ? "inset-[-0.5px_-6.25%]" : "inset-[-6.25%]"}`}>
                            <img alt="" className="block max-w-none size-full" src={isWithdraw ? imgGroup2 : imgGroup1} />
                          </div>
                        </div>
                      </div>
                    )}
                    {isRefferal && (
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3854;1:3469;1:3299" data-name="Icons/Variant19">
                        <div className="absolute inset-[12.51%_12.5%_12.49%_12.5%]" data-node-id="I1:3854;1:3469;1:3299;94:2826" data-name="Group">
                          <div className="absolute inset-[-4.44%]">
                            <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isVariant4OrWithdraw && (
            <>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[normal] relative shrink-0 whitespace-nowrap" id={isWithdraw ? "node-I1_3843-1_3358" : "node-I1_3832-1_3358"} data-name="Titles">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px]" id={isWithdraw ? "node-I1_3843-1_3359" : "node-I1_3832-1_3359"}>
                  Replenishment
                </p>
                <p className="font-['Outfit:Regular','Noto_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3843-1_3360" : "node-I1_3832-1_3360"}>
                  Сomission
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" id={isWithdraw ? "node-I1_3843-1_3361" : "node-I1_3832-1_3361"}>
                  UQBw8....SGTF
                </p>
              </div>
              <div className="absolute content-stretch flex flex-col gap-[13px] items-end justify-center leading-[normal] right-[10px] text-right top-[23px] whitespace-nowrap" id={isWithdraw ? "node-I1_3843-1_3362" : "node-I1_3832-1_3362"} data-name="Details">
                <div className="content-stretch flex gap-[4px] h-[11px] items-start justify-end relative shrink-0" id={isWithdraw ? "node-I1_3843-1_3363" : "node-I1_3832-1_3363"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" id={isWithdraw ? "node-I1_3843-1_3363-1_3345" : "node-I1_3832-1_3363-1_3345"}>
                    +70.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[9px]" id={isWithdraw ? "node-I1_3843-1_3363-1_3346" : "node-I1_3832-1_3363-1_3346"}>
                    USDT
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] items-start justify-end relative shrink-0 text-[#8494af]" id={isWithdraw ? "node-I1_3843-1_3364" : "node-I1_3832-1_3364"} data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[13px]" id={isWithdraw ? "node-I1_3843-1_3364-1_3345" : "node-I1_3832-1_3364-1_3345"}>
                    -10.00
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[9px]" id={isWithdraw ? "node-I1_3843-1_3364-1_3346" : "node-I1_3832-1_3364-1_3346"}>
                    USDT
                  </p>
                </div>
                <p className="absolute font-['Outfit:Regular',sans-serif] font-normal right-0 text-[#8494af] text-[10px] top-[43px] uppercase" id={isWithdraw ? "node-I1_3843-1_3365" : "node-I1_3832-1_3365"}>
                  31.12.2024 00:00
                </p>
              </div>
            </>
          )}
          {isRefferal && (
            <>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[208px]" data-node-id="I1:3854;1:3470">
                @Max
              </p>
              <div className="-translate-y-1/2 absolute contents right-[10px] top-[calc(50%+0.5px)]" data-node-id="I1:3854;1:3471">
                <div className="-translate-y-1/2 absolute content-stretch flex gap-[4px] items-start leading-[normal] right-[10px] text-right top-[calc(50%+0.5px)] whitespace-nowrap" data-node-id="I1:3854;1:3472" data-name="Amount">
                  <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3854;1:3472;1:3345">
                    +11.10
                  </p>
                  <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3854;1:3472;1:3346">
                    USDT
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}