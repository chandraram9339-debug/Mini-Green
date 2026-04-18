/** Figma MCP — Detail Bot node 1:3701 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/00ca227b-3437-4649-9e4e-3225634d7a68";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/60e3ba52-0715-4c7c-a71f-a7f2850047b8";
const imgLine = "https://www.figma.com/api/mcp/asset/16ac003a-b1d6-483c-961f-f04e960e9eab";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/ded25713-2d3b-4545-962a-ad33c4d3af98";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/d7fd4d19-2be1-4dea-9f4d-3c17ad153e30";
const imgDot = "https://www.figma.com/api/mcp/asset/87a3c8c1-6273-4458-8aa0-bd87d20b4398";
const imgVector25 = "https://www.figma.com/api/mcp/asset/a2e2a053-935e-4666-a052-48b942683bb4";
const imgLine1 = "https://www.figma.com/api/mcp/asset/cee25af1-57f2-43fc-84be-3d15362d0dad";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/5e9e6db8-ab5f-4123-8cf1-681fba240b35";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/413aba48-0ea7-4f15-bdc5-137ad8f341ea";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/076ada21-704d-4257-93bb-0adbd226bec4";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/1b0f9b7e-ac49-4838-99fd-05537285b3d0";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/d4e4e6c8-b0c5-4edc-b3f2-de2e97c807ee";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/668fd8a8-8022-40c1-a43d-7451faf7deb8";
const imgGroup10 = "https://www.figma.com/api/mcp/asset/07a2b567-4bbe-4a0e-a61a-1ba2768f441d";
const imgGroup11 = "https://www.figma.com/api/mcp/asset/51e6c706-e97d-4ce0-80f6-df48205adba1";
const imgGroup12 = "https://www.figma.com/api/mcp/asset/d51e9f30-20eb-4fae-a871-7ad0ac21214d";
const imgGroup13 = "https://www.figma.com/api/mcp/asset/cb01ae1b-def8-4af4-a1c5-fce35d9ad30b";
const imgGroup14 = "https://www.figma.com/api/mcp/asset/f8528179-7f8a-4edb-8741-16a11b0b05d4";
const imgGroup15 = "https://www.figma.com/api/mcp/asset/75f217c6-f967-4525-93ff-a4521b89ab76";
const imgGroup16 = "https://www.figma.com/api/mcp/asset/2949f939-41d3-414d-8a19-27f2d81b8645";
const imgGroup17 = "https://www.figma.com/api/mcp/asset/858fb761-d9a8-459d-9335-d0193fb8085c";
const imgGroup18 = "https://www.figma.com/api/mcp/asset/9ac871a5-e36f-454e-b442-01012fb65b9a";
const imgGroup19 = "https://www.figma.com/api/mcp/asset/da2741c7-5c55-494c-beef-584186ce40d2";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/f6f7993a-fb55-4382-991b-c9c6389a489c";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/5938bc8d-1207-432b-b0e5-d7268fcd4c56";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/8e8a3841-e673-4a76-8e43-fd9806dab079";
const imgIndicator = "https://www.figma.com/api/mcp/asset/dc800ee6-962c-4986-be16-b37258cd1326";
const img941 = "https://www.figma.com/api/mcp/asset/154c1aaa-bed4-4ed5-a4cf-fe841af07d4f";

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

type StatusBotProps = {
  className?: string;
  property1?: "Active";
};

function StatusBot({ className, property1 = "Active" }: StatusBotProps) {
  return (
    <div className={className || "content-stretch flex gap-[6px] items-end relative"} data-node-id="1:3526">
      <div className="relative shrink-0 size-[10px]" data-node-id="1:3527" data-name="Dot">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDot} />
      </div>
      <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#73c1b1] text-[20px] whitespace-nowrap" data-node-id="1:3528">
        Active
      </p>
    </div>
  );
}

function Graphic({ className }: { className?: string }) {
  return (
    <div className={className || "h-[167px] relative w-[350px]"} data-node-id="1:3505" data-name="Graphic">
      <div className="absolute content-stretch flex flex-col items-start left-0 top-0" data-node-id="1:3506" data-name="Scale">
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3507" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3507;1:3521">
            7.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3507;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3508" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3508;1:3521">
            6.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3508;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3509" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3509;1:3521">
            5.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3509;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3510" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3510;1:3521">
            4.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3510;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3511" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3511;1:3521">
            3.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3511;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3512" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3512;1:3521">
            2.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3512;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3513" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3513;1:3521">
            1.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3513;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3514" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3514;1:3521">
            0.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3514;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3515" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3515;1:3521">
            -1.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3515;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[4px] items-center justify-end pb-[14px] relative shrink-0" data-node-id="1:3516" data-name="Scale">
          <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[6px] text-right w-[20px]" data-node-id="I1:3516;1:3521">
            -2.00%
          </p>
          <div className="h-0 relative shrink-0 w-[326px]" data-node-id="I1:3516;1:3522">
            <div className="absolute inset-[-0.3px_0]">
              <img alt="" className="block max-w-none size-full" src={imgVector25} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[122px] left-[25px] top-[42px] w-[325px]" data-node-id="1:3517" data-name="Line">
        <div className="absolute inset-[-0.66%_0_0_-0.23%]">
          <img alt="" className="block max-w-none size-full" src={imgLine1} />
        </div>
      </div>
    </div>
  );
}

function Stats({ className }: { className?: string }) {
  return (
    <div className={className || "bg-white content-stretch flex items-center justify-center py-[10px] relative rounded-[8px] w-[80px]"} data-node-id="1:3523" data-name="Stats">
      <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#2d6e93] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="1:3524">
        24h
      </p>
    </div>
  );
}

export default function BotDetailScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3701" data-name="1| Detail Bot">
      <div className="absolute bg-white h-[72px] left-0 overflow-clip rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_20px_0px_rgba(45,110,147,0.08)] top-[1216px] w-[390px]" data-node-id="1:3702" data-name="Tab Bar">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[30px] items-start left-1/2 top-1/2" data-node-id="I1:3702;1:3334" data-name="Navigation">
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3702;1:3335" data-name="Home">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3702;1:3336" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3702;1:3336;1:3200" data-name="Group">
                <div className="absolute inset-[-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup4} />
                </div>
              </div>
            </div>
          </a>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3702;1:3337" data-name="Wallet">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3702;1:3338" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%]" data-node-id="I1:3702;1:3338;1:3178" data-name="Group">
                <div className="absolute inset-[-5%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup5} />
                </div>
              </div>
            </div>
          </a>
          <div className="bg-[#2d6e93] content-stretch flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3702;1:3339" data-name="Bot">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3702;1:3340" data-name="Icons">
              <div className="absolute inset-[16.67%]" data-node-id="I1:3702;1:3340;1:3168" data-name="Group">
                <div className="absolute inset-[-5%_-7.07%_-5%_-5%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup6} />
                </div>
              </div>
            </div>
          </div>
          <a className="content-stretch cursor-pointer flex items-start p-[14px] relative rounded-[30px] shrink-0" data-node-id="I1:3702;1:3341" data-name="Support">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3702;1:3342" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3702;1:3342;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup7} />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="absolute h-[409px] left-0 overflow-clip top-[777px] w-[390px]" data-node-id="1:3703" data-name="Trading Stats">
        <div className="absolute content-stretch flex flex-col gap-[9px] items-start left-[20px] top-[45px]" data-node-id="1:3704" data-name="List">
          <div className="bg-white content-stretch flex flex-col gap-[10px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3705" data-name="List item">
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3705;1:3408" data-name="Title">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="bg-[#cfd9e9] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3705;1:3409" data-name="Btn">
                    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                      <div className="-scale-y-100 flex-none rotate-90">
                        <div className="overflow-clip relative size-[16px]" data-node-id="I1:3705;1:3409;1:3294" data-name="flag">
                          <div className="absolute inset-[18.75%_15.99%_14.58%_21.26%]" data-node-id="I1:3705;1:3409;1:3295" data-name="Group">
                            <div className="absolute inset-[-7.5%_-7.97%]">
                              <img alt="" className="block max-w-none size-full" src={imgGroup8} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] whitespace-nowrap" data-node-id="I1:3705;1:3410">
                Opening new trade...
              </p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3705;1:3411" data-name="Description">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3705;1:3412" data-name="Icons/Variant34">
                <div className="absolute flex inset-1/4 items-center justify-center" style={{ containerType: "size" }}>
                  <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
                    <div className="relative size-full" data-node-id="I1:3705;1:3412;154:3746" data-name="Group">
                      <div className="absolute inset-[-9.43%_-9.43%_-6.67%_-6.67%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup9} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3705;1:3413">
                Actual price:
              </p>
              <div className="content-stretch flex gap-[4px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3705;1:3414" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3705;1:3414;1:3345">
                  69 425.22
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3705;1:3414;1:3346">
                  USDT/BTC
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white content-stretch flex flex-col gap-[12px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3706" data-name="List item">
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3706;1:3384" data-name="Title">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <Btn className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" />
                </div>
              </div>
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3706;1:3386">
                Prediction was successful!
              </p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3706;1:3387" data-name="Price">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3706;1:3388" data-name="Icons/Variant29">
                <div className="absolute flex inset-1/4 items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                    <div className="relative size-full" data-node-id="I1:3706;1:3388;151:3537" data-name="Group">
                      <div className="absolute inset-[-9.43%_-9.43%_-6.67%_-6.67%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup10} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3706;1:3389">
                Price is DOWN
              </p>
              <div className="content-stretch flex gap-[4px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3706;1:3390" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3706;1:3390;1:3345">
                  to 69569.32
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3706;1:3390;1:3346">
                  USDT/BTC
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3706;1:3391" data-name="Profit">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3706;1:3392" data-name="Icons">
                <div className="absolute flex inset-[29.17%_12.5%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-180 -scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                    <div className="relative size-full" data-node-id="I1:3706;1:3392;1:3214" data-name="Group">
                      <div className="absolute inset-[-5.66%_-4.44%_-8%_-3.14%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup11} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3706;1:3393">
                Profit of trade is:
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3706;1:3394">
                0.13 %
              </p>
            </div>
          </div>
          <div className="bg-white content-stretch flex flex-col gap-[12px] items-start justify-center px-[10px] py-[16px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3707" data-name="List item">
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3707;1:3396" data-name="Title">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="bg-[#df7f7f] content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3707;1:3397" data-name="Btn">
                    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                      <div className="-scale-y-100 flex-none rotate-90">
                        <div className="overflow-clip relative size-[16px]" data-node-id="I1:3707;1:3397;1:3281" data-name="Icons">
                          <div className="absolute flex inset-[6.25%] items-center justify-center" style={{ containerType: "size" }}>
                            <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                              <div className="relative size-full" data-node-id="I1:3707;1:3397;1:3282" data-name="Group">
                                <div className="absolute inset-[-8.08%]">
                                  <img alt="" className="block max-w-none size-full" src={imgGroup12} />
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
              <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3707;1:3398">
                Prediction was unsuccessful.
              </p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3707;1:3399">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3707;1:3400" data-name="Icons/Variant34">
                <div className="absolute flex inset-1/4 items-center justify-center" style={{ containerType: "size" }}>
                  <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
                    <div className="relative size-full" data-node-id="I1:3707;1:3400;154:3746" data-name="Group">
                      <div className="absolute inset-[-9.43%_-9.43%_-6.67%_-6.67%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3707;1:3401">
                Price is UP
              </p>
              <div className="content-stretch flex gap-[4px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="I1:3707;1:3402" data-name="Amount">
                <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[16px]" data-node-id="I1:3707;1:3402;1:3345">
                  to 69569.32
                </p>
                <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3707;1:3402;1:3346">
                  USDT/BTC
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3707;1:3403">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3707;1:3404" data-name="Icons">
                <div className="absolute flex inset-[29.17%_12.5%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-180 -scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                    <div className="relative size-full" data-node-id="I1:3707;1:3404;1:3214" data-name="Group">
                      <div className="absolute inset-[-5.66%_-4.44%_-8%_-3.14%]">
                        <img alt="" className="block max-w-none size-full" src={imgGroup14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3707;1:3405">
                Loss of trade is:
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3707;1:3406">{` 0.16 %`}</p>
            </div>
          </div>
        </div>
        <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[calc(50%-175px)] text-[#192b48] text-[20px] top-0 tracking-[0.4px] whitespace-nowrap" data-node-id="1:3708">{` trading:`}</p>
        <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[30px] text-[#8494af] text-[10px] text-right top-[255px] uppercase whitespace-nowrap" data-node-id="1:3709">
          31.12.2024 00:00
        </p>
        <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[30px] text-[#8494af] text-[10px] text-right top-[392px] uppercase whitespace-nowrap" data-node-id="1:3710">
          31.12.2024 00:00
        </p>
        <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] right-[30px] text-[#8494af] text-[10px] text-right top-[118px] uppercase whitespace-nowrap" data-node-id="1:3711">
          31.12.2024 00:00
        </p>
      </div>
      <div className="absolute h-[265px] left-0 top-[482px] w-[390px]" data-node-id="1:3712" data-name="Stats">
        <div className="absolute bg-white content-stretch flex flex-col gap-[12px] items-start justify-center left-[20px] px-[10px] py-[16px] rounded-[12px] top-[101px] w-[350px]" data-node-id="1:3713" data-name="List item">
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3713;1:3367" data-name="Deals">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3713;1:3368" data-name="Icons">
              <div className="absolute inset-[12.5%]" data-node-id="I1:3713;1:3368;1:3208" data-name="Group">
                <div className="absolute inset-[-4.87%_-4.87%_-4.44%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup15} />
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3369">
              Total deals:
            </p>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3370">
              78
            </p>
          </div>
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3713;1:3371" data-name="Successful">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3713;1:3372" data-name="Icons">
              <div className="absolute inset-[29.17%_16.67%_29.17%_20.83%]" data-node-id="I1:3713;1:3372;1:3218" data-name="Group">
                <div className="absolute inset-[-14.14%_-9.43%_-10%_-9.43%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup16} />
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3373">
              Successful:
            </p>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3374">
              39
            </p>
          </div>
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3713;1:3375" data-name="Unsuccessful">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3713;1:3376" data-name="Icons">
              <div className="absolute flex inset-[-4.17%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                  <div className="relative size-full" data-node-id="I1:3713;1:3376;1:3158" data-name="Group">
                    <div className="absolute inset-[-4.35%]">
                      <img alt="" className="block max-w-none size-full" src={imgGroup17} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3377">
              Unsuccessful:
            </p>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3378">
              39
            </p>
          </div>
          <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="I1:3713;1:3379" data-name="Profit">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3713;1:3380" data-name="Icons">
              <div className="absolute flex inset-[29.17%_12.5%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-180 -scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                  <div className="relative size-full" data-node-id="I1:3713;1:3380;1:3214" data-name="Group">
                    <div className="absolute inset-[-5.66%_-4.44%_-8%_-3.14%]">
                      <img alt="" className="block max-w-none size-full" src={imgGroup11} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3381">
              Percentage of profit:
            </p>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[16px] whitespace-nowrap" data-node-id="I1:3713;1:3382">
              -0.72 %
            </p>
          </div>
        </div>
        <div className="absolute contents left-[20px] top-[45px]" data-node-id="1:3714" data-name="Stats tabs">
          <Stats className="absolute bg-white content-stretch flex items-center justify-center left-[20px] py-[10px] rounded-[8px] top-[45px] w-[80px]" />
          <div className="absolute bg-[#f4f7f8] content-stretch flex items-center justify-center left-[110px] py-[10px] rounded-[8px] top-[45px] w-[80px]" data-node-id="1:3716" data-name="Stats">
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#2d6e93] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3716;1:3524">
              3d
            </p>
          </div>
          <div className="absolute bg-[#f4f7f8] content-stretch flex items-center justify-center left-[200px] py-[10px] rounded-[8px] top-[45px] w-[80px]" data-node-id="1:3717" data-name="Stats">
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#2d6e93] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3717;1:3524">
              7d
            </p>
          </div>
          <div className="absolute bg-[#f4f7f8] content-stretch flex items-center justify-center left-[290px] py-[10px] rounded-[8px] top-[45px] w-[80px]" data-node-id="1:3718" data-name="Stats">
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#2d6e93] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3718;1:3524">
              1m
            </p>
          </div>
        </div>
        <p className="absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-[calc(50%-175px)] text-[#192b48] text-[20px] top-0 tracking-[0.4px] whitespace-nowrap" data-node-id="1:3719">
          Trading bot statistics for the period:
        </p>
      </div>
      <Graphic className="absolute h-[167px] left-[20px] top-[285px] w-[350px]" />
      <div className="absolute h-[155px] left-0 top-[100px] w-[390px]" data-node-id="1:3721" data-name="Status Bot">
        <div className="absolute contents left-[20px] top-[103px]" data-node-id="1:3722" data-name="Btns">
          <div className="absolute bg-[#df7f7f] content-stretch flex gap-[8px] items-center justify-center left-[201px] px-[20px] py-[14px] rounded-[54px] top-[103px] w-[169px]" data-node-id="1:3723" data-name="Btn">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3723;1:3260" data-name="Icons">
              <div className="absolute flex inset-[-4.17%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-45 flex-none h-[hypot(50cqw,50cqh)] w-[hypot(50cqw,-50cqh)]">
                  <div className="relative size-full" data-node-id="I1:3723;1:3260;1:3158" data-name="Group">
                    <div className="absolute inset-[-4.35%]">
                      <img alt="" className="block max-w-none size-full" src={imgGroup18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3723;1:3261">
              Stop
            </p>
          </div>
          <div className="absolute bg-[#2d6e93] content-stretch flex gap-[8px] items-center justify-center left-[20px] px-[20px] py-[14px] rounded-[54px] top-[103px] w-[169px]" data-node-id="1:3724" data-name="Btn">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3724;1:3260" data-name="Icons">
              <div className="absolute inset-[12.5%]" data-node-id="I1:3724;1:3260;1:3208" data-name="Group">
                <div className="absolute inset-[-4.87%_-4.87%_-4.44%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup19} />
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="I1:3724;1:3261">
              Start
            </p>
          </div>
        </div>
        <div className="absolute contents left-[20px] top-[30px]" data-node-id="1:3725" data-name="Status+Price">
          <div className="absolute content-stretch flex gap-[7px] items-end leading-[normal] left-[20px] top-[59px] whitespace-nowrap" data-node-id="1:3726" data-name="Price">
            <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#8494af] text-[13px]" data-node-id="1:3727">
              Actual price
            </p>
            <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-node-id="1:3728" data-name="Amount">
              <p className="font-['Outfit:Medium',sans-serif] font-medium relative shrink-0 text-[#192b48] text-[20px]" data-node-id="I1:3728;1:3345">
                69 425.22
              </p>
              <p className="font-['Outfit:Regular',sans-serif] font-normal relative shrink-0 text-[#55647b] text-[9px]" data-node-id="I1:3728;1:3346">
                USDT/BTC
              </p>
            </div>
          </div>
          <div className="absolute content-stretch flex gap-[20px] items-end left-[20px] top-[30px]" data-node-id="1:3729" data-name="Status">
            <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#8494af] text-[13px] whitespace-nowrap" data-node-id="1:3730">
              Bot status
            </p>
            <StatusBot className="content-stretch flex gap-[6px] items-end relative shrink-0" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3732" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3732;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3732;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3732;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3732;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3732;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3732;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3732;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3732;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
      <AppBar className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" />
    </div>
  );
}