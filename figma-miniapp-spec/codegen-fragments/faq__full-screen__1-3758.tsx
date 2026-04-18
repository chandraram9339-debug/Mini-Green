/** Figma MCP — FAQ node 1:3758 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/c5aca073-4ecc-495d-af91-1bcf35e3581d";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/6ba83c09-3656-41ab-8830-a4e375dad8c4";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/6884742f-709b-43d1-85d8-2ba0c76be1dc";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/f66b9cbf-155c-4729-9c0f-3224ae81c8bc";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/ccd1837a-68f1-4b50-ae7d-300e50676df7";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/86018c10-0898-409f-b259-d7fdd161a2d0";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/2fd85b3f-a18c-43e8-9600-1ef68b11ceed";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/b257512b-59ca-460e-839c-02b4890037f1";
const imgLine = "https://www.figma.com/api/mcp/asset/a7c9cf90-99c6-410e-b3e5-72cbf6d75a35";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/94c34d13-3860-4535-9782-2241d911e405";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/52e2b151-943d-4407-a350-21d4c5bfb506";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/180ab2c5-9245-4598-9ca2-a1da745aed5d";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/d44381d7-2bfb-42a6-90e4-c3c44ea97a1a";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/b8970251-eadf-4a81-ae1f-3b92b61fbbe6";
const imgIndicator = "https://www.figma.com/api/mcp/asset/0bbe1fe6-7f0a-4344-aeb1-0d6610d0a5d2";
const img941 = "https://www.figma.com/api/mcp/asset/941907bb-44df-404c-baf5-50eba58d115b";

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

export default function FaqScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3758" data-name="1| FAQ">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[887px] w-[390px]" data-node-id="1:3759" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3759;1:3334" data-name="Navigation">
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3759;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3759;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3759;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup2} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3759;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3759;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3759;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3759;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3759;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3759;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3759;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3759;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3759;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[9px] items-start left-[20px] top-[130px]" data-node-id="1:3760" data-name="List">
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3761" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3761;1:3456">
            How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3761;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3761;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3761;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3762" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3762;1:3456">
            How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3762;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3762;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3762;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white content-stretch flex flex-col gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3763" data-name="List item">
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="I1:3763;1:3459">
            <p className="col-1 font-['Outfit:Medium',sans-serif] font-medium leading-[normal] ml-0 mt-0 relative row-1 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3763;1:3460">
              How to withdraw money?
            </p>
          </div>
          <div className="font-['Outfit:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#55647b] text-[0px] w-[315px] whitespace-pre-wrap" data-node-id="I1:3763;1:3461">
            <p className="leading-[normal] mb-0 text-[16px]">{`To withdraw money, go to the menu section "My account" - "Withdrawal of funds" - "Withdrawal request" enter the required available amount and the USDT TRC20 wallet.  `}</p>
            <p className="leading-[normal] mb-0 text-[16px]">{`The withdrawal process is automatic and takes from 10 minutes to 2-3 hours. The maximum withdrawal time is up to 7 days. `}</p>
            <p className="leading-[normal] mb-0 text-[16px]">{`During the consideration, trading for your account will be stopped. `}</p>
            <p className="leading-[normal] mb-0 text-[16px]">{` `}</p>
            <p className="leading-[normal] mb-0 text-[16px]">{` `}</p>
            <p className="mb-0 text-[16px]">
              <span className="leading-[normal]">{`Attention ! Replenishment is realized only to the `}</span>
              <span className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] text-[#73c1b1]">USDT TRC20</span>
              <span className="leading-[normal]">{` wallet!  `}</span>
            </p>
            <p className="text-[16px]">
              <span className="leading-[normal]">{`The minimum amount is `}</span>
              <span className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] text-[#73c1b1]">5 USDT</span>
              <span className="leading-[normal]">!</span>
            </p>
          </div>
          <div className="absolute flex items-center justify-center left-[310px] size-[24px] top-[12px]">
            <div className="-rotate-90 -scale-y-100 flex-none">
              <div className="bg-[#c0e3dc] content-stretch flex items-start p-[5.143px] relative rounded-[17.143px]" data-node-id="I1:3763;1:3462" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0 size-[13.714px]">
                  <div className="-scale-y-100 flex-none rotate-90">
                    <div className="overflow-clip relative size-[13.714px]" data-node-id="I1:3763;1:3462;1:3266" data-name="Icons">
                      <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                        <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                          <div className="relative size-full" data-node-id="I1:3763;1:3462;1:3266;1:3132" data-name="Group">
                            <div className="absolute inset-[-8.84%_-4.69%]">
                              <img alt="" className="block max-w-none size-full" src={imgGroup7} />
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
        </div>
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3764" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3764;1:3456">
            How to withdraw money? How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3764;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3764;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3764;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3765" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3765;1:3456">
            How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3765;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3765;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3765;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3766" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3766;1:3456">
            How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3766;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3766;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3766;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white content-stretch flex gap-[16px] items-start px-[19px] py-[12px] relative rounded-[12px] shrink-0" data-node-id="1:3767" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] w-[271px]" data-node-id="I1:3767;1:3456">
            How to withdraw money?
          </p>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3767;1:3457" data-name="Btn">
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <div className="overflow-clip relative size-[16px]" data-node-id="I1:3767;1:3457;1:3270" data-name="Icons">
                      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3767;1:3457;1:3270;50:2695" data-name="Group">
                        <div className="absolute inset-[-8.84%_-4.69%]">
                          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
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
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3768" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3768;1:3315" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="I1:3768;1:3316" data-name="Icons">
          <div className="absolute inset-[8.33%]" data-node-id="I1:3768;1:3316;1:3196" data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
          </div>
        </a>
        <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="I1:3768;1:3317" data-name="Icons">
          <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3768;1:3317;1:3188" data-name="Group">
            <div className="absolute inset-[-4.21%_-4.44%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup9} />
            </div>
          </div>
          <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3768;1:3317;1:3192">
            <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3768;1:3317;1:3193">
              <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3768;1:3317;1:3194">
                25
              </p>
            </div>
          </div>
        </a>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] whitespace-nowrap" data-node-id="I1:3768;1:3318">
          FAQ
        </p>
        <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3769" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3769;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3769;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3769;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3769;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3769;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3769;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3769;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3769;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
