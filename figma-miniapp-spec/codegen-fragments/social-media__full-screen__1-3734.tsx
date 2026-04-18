/** Figma MCP — Social Media node 1:3734 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/5e184f38-092e-4cad-9e6d-a0019020d303";
const imgFrame2312 = "https://www.figma.com/api/mcp/asset/18cab184-0415-482a-babe-968217f4b05a";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/9ed33023-b484-47bf-a54a-2b3d1bf9caf2";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/8158c2bd-c760-4ddb-96c2-e349eea106e3";
const imgVector = "https://www.figma.com/api/mcp/asset/890396d6-971b-43b0-a67d-fcfd3d526baa";
const imgVector1 = "https://www.figma.com/api/mcp/asset/f735d85c-c920-406f-83eb-3194636cb01d";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/63771ac7-ad61-46e2-8693-84bc2974dcb5";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/2ad7ba5b-6552-4471-9c29-9894b30cddd0";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/a62abe71-426a-4c42-8de9-f5e938a9f340";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/3e2f12a8-c25c-45b4-a65a-12b203f9d7bf";
const imgFrame2313 = "https://www.figma.com/api/mcp/asset/3e1f75a1-3960-47df-8804-2d7834bc31ff";
const imgFrame2314 = "https://www.figma.com/api/mcp/asset/29bdef29-96db-497b-9e7c-296b09a0e77a";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/737d9c12-4c23-4b68-b1e3-8c3fa63a6276";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/5a4f117a-26ba-4a9b-9d55-1e1a72af8864";
const imgLine = "https://www.figma.com/api/mcp/asset/1d14cd7c-28cf-4351-a6bc-528290ff31db";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/592cbea0-cdb6-42b0-8c8d-8db38f5e3074";
const imgGroup10 = "https://www.figma.com/api/mcp/asset/7c8aa598-a00b-4be2-a732-2fe82dd76da7";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/badd4077-595a-4f79-b135-b9e087dd61d7";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/03173b5e-108a-4af6-aa5f-22cf2e195f98";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/8cad907f-4ddb-4565-88e5-02579a28dffd";
const imgIndicator = "https://www.figma.com/api/mcp/asset/067cc8dd-4b20-4018-88bf-6266213ea2e1";
const img941 = "https://www.figma.com/api/mcp/asset/362b902f-cb3b-4569-88fe-2c8e484f54c2";

type BtnProps = {
  className?: string;
  property1?: "Opened" | "Avatar" | "Back Initial";
};

function Btn({ className, property1 = "Opened" }: BtnProps) {
  const isAvatar = property1 === "Avatar";
  const isBackInitial = property1 === "Back Initial";
  return (
    <div className={className || `content-stretch flex items-start relative ${isBackInitial ? "p-[4px] rounded-[30px] size-[32px]" : isAvatar ? "bg-[#2d6e93] p-[3.556px] rounded-[26.667px] size-[24px]" : "bg-[#2d6e93] p-[6px] rounded-[30px] size-[28px]"}`} id={isBackInitial ? "node-1_3291" : isAvatar ? "node-1_3273" : "node-1_3265"}>
      <div className={`relative shrink-0 ${isBackInitial ? "flex items-center justify-center size-[24px]" : isAvatar ? "size-[16.889px]" : "flex items-center justify-center size-[16px]"}`} id={isAvatar ? "node-1_3274" : undefined}>
        {["Opened", "Back Initial"].includes(property1) && (
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
        )}
        {isAvatar && <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2312} />}
      </div>
    </div>
  );
}

type IconsProps = {
  className?: string;
  property1?: "Plus | 16" | "logos:youtube-icon";
};

function Icons({ className, property1 = "Plus | 16" }: IconsProps) {
  const isLogosYoutubeIcon = property1 === "logos:youtube-icon";
  return (
    <div className={className || `overflow-clip relative ${isLogosYoutubeIcon ? "h-[24px] w-[34px]" : "size-[16px]"}`} id={isLogosYoutubeIcon ? "node-1_3220" : "node-1_3149"}>
      {property1 === "Plus | 16" && (
        <div className="absolute inset-1/4" data-node-id="1:3150" data-name="Group">
          <div className="absolute inset-[-6.25%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup2} />
          </div>
        </div>
      )}
      {isLogosYoutubeIcon && (
        <>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[23.729px] left-1/2 top-1/2 w-[33.882px]" data-node-id="1:3221" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} />
          </div>
          <div className="absolute inset-[28.25%_34.31%_29.38%_39.87%]" data-node-id="1:3222" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
          </div>
        </>
      )}
    </div>
  );
}

export default function SocialMediaScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3734" data-name="1 | Social Media">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[752px] w-[390px]" data-node-id="1:3735" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch cursor-pointer flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3735;1:3334" data-name="Navigation">
          <a className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3735;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3735;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3735;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup3} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3735;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3735;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3735;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3735;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3735;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3735;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3735;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3735;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3735;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[20px] top-[130px]" data-node-id="1:3736" data-name="List">
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3737" data-name="Channels">
          <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3738" data-name="List item/SM">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <Btn className="bg-[#2d6e93] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" property1="Avatar" />
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3739" data-name="List item/SM">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#73c1b1] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" data-node-id="I1:3739;185:4992" data-name="Btn">
                  <div className="relative shrink-0 size-[16.889px]" data-node-id="I1:3739;185:4992;1:3274">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2313} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3740" data-name="List item/SM">
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[var(--blue-light,#759ac6)] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" data-node-id="I1:3740;185:4992" data-name="Btn">
                  <div className="relative shrink-0 size-[16.889px]" data-node-id="I1:3740;185:4992;1:3274">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2314} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0" data-node-id="1:3741" data-name="Youtube Tab">
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3742" data-name="List item">
            <Icons className="h-[24px] overflow-clip relative shrink-0 w-[34px]" property1="logos:youtube-icon" />
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3742;1:3465">
              YouTube channels
            </p>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[307px] size-[24px] top-1/2">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3742;1:3466" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3742;1:3466;1:3270" data-name="Icons">
                        <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3742;1:3466;1:3270;50:2695" data-name="Group">
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
        <div className="content-stretch flex flex-col gap-[13px] items-start relative shrink-0" data-node-id="1:3743" data-name="Youtube List">
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3744" data-name="List item">
            <Icons className="h-[24px] overflow-clip relative shrink-0 w-[34px]" property1="logos:youtube-icon" />
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3744;1:3465">
              YouTube channels
            </p>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[307px] size-[24px] top-1/2">
              <div className="-scale-y-100 flex-none rotate-90">
                <div className="bg-[#2d6e93] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3744;1:3466" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <div className="overflow-clip relative size-[16px]" data-node-id="I1:3744;1:3466;1:3270" data-name="Icons">
                        <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-1/4" data-node-id="I1:3744;1:3466;1:3270;50:2695" data-name="Group">
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
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[307px] size-[24px] top-1/2">
              <div className="-rotate-90 -scale-y-100 flex-none">
                <div className="bg-[#c0e3dc] content-stretch flex items-start p-[5.143px] relative rounded-[17.143px]" data-node-id="I1:3744;1:3467" data-name="Btn">
                  <div className="flex items-center justify-center relative shrink-0 size-[13.714px]">
                    <div className="-scale-y-100 flex-none rotate-90">
                      <div className="overflow-clip relative size-[13.714px]" data-node-id="I1:3744;1:3467;1:3266" data-name="Icons">
                        <div className="absolute bottom-[16.67%] flex items-center justify-center left-1/4 right-1/4 top-[16.67%]" style={{ containerType: "size" }}>
                          <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                            <div className="relative size-full" data-node-id="I1:3744;1:3467;1:3266;1:3132" data-name="Group">
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
          </div>
          <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3745" data-name="List">
            <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3746" data-name="List item/SM">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="bg-[#73c1b1] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" data-node-id="I1:3746;185:4992" data-name="Btn">
                    <div className="relative shrink-0 size-[16.889px]" data-node-id="I1:3746;185:4992;1:3274">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2313} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3747" data-name="List item/SM">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="bg-[var(--blue-light,#759ac6)] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" data-node-id="I1:3747;185:4992" data-name="Btn">
                    <div className="relative shrink-0 size-[16.889px]" data-node-id="I1:3747;185:4992;1:3274">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2314} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white content-stretch flex items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3748" data-name="List item/SM">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="bg-[var(--blue-light,#759ac6)] content-stretch flex items-start p-[3.556px] relative rounded-[26.667px]" data-node-id="I1:3748;185:4992" data-name="Btn">
                    <div className="relative shrink-0 size-[16.889px]" data-node-id="I1:3748;185:4992;1:3274">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame2314} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3749" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3749;1:3315" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <a className="absolute block cursor-pointer left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="I1:3749;1:3316" data-name="Icons">
          <div className="absolute inset-[8.33%]" data-node-id="I1:3749;1:3316;1:3196" data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup9} />
          </div>
        </a>
        <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="I1:3749;1:3317" data-name="Icons">
          <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3749;1:3317;1:3188" data-name="Group">
            <div className="absolute inset-[-4.21%_-4.44%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup10} />
            </div>
          </div>
          <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3749;1:3317;1:3192">
            <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3749;1:3317;1:3193">
              <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3749;1:3317;1:3194">
                25
              </p>
            </div>
          </div>
        </a>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] whitespace-nowrap" data-node-id="I1:3749;1:3318">
          Social Media
        </p>
        <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3750" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3750;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3750;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3750;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3750;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3750;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3750;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3750;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3750;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
