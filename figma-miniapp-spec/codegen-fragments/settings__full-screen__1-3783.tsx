/** Figma MCP — Settings node 1:3783 fileKey BBrbpnfGElX0afHLm7ccxP */
const imgGroup = "https://www.figma.com/api/mcp/asset/70859073-57a1-4b63-9197-d052e2e2c5e7";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/87c7b527-a428-4303-beeb-c349f2bca631";
const imgProperty1UserPlusCopy1 = "https://www.figma.com/api/mcp/asset/a8148c76-78bb-460d-90ed-de48109160ec";
const imgGroup2 = "https://www.figma.com/api/mcp/asset/e2e4e627-32b1-407c-89fc-e7afe9f8e197";
const imgGroup3 = "https://www.figma.com/api/mcp/asset/f31d045c-00e4-46ae-badc-b29dafb010ca";
const imgGroup4 = "https://www.figma.com/api/mcp/asset/52068f05-5f8d-4850-a8f5-3f24fb1e6984";
const imgGroup5 = "https://www.figma.com/api/mcp/asset/048bd933-f1c7-4927-8eab-7e9874b03476";
const imgAlertTriangleCopy1 = "https://www.figma.com/api/mcp/asset/69e225a1-4599-42f2-a9a7-89e9f98e66ec";
const imgMobile165146252 = "https://www.figma.com/api/mcp/asset/c5f1c266-2e09-4ca8-9d30-3ea559a66f07";
const imgGroup6 = "https://www.figma.com/api/mcp/asset/9386a42f-ff3e-47f6-8f32-3434808eb026";
const imgLine = "https://www.figma.com/api/mcp/asset/664e1f35-5e0a-45fd-b91b-c881aa671a26";
const imgGroup7 = "https://www.figma.com/api/mcp/asset/7b0fd492-2640-4a34-a5ec-42823ba861e7";
const imgGroup8 = "https://www.figma.com/api/mcp/asset/3b862ed6-aa28-4dc2-b6f7-9699a399232b";
const imgLine1 = "https://www.figma.com/api/mcp/asset/4b318e88-4c6b-4ac6-b5d5-46ca75413805";
const imgGroup9 = "https://www.figma.com/api/mcp/asset/4969d79c-2a64-4698-84b3-e39894ab48e0";
const imgNetworkSignalLight = "https://www.figma.com/api/mcp/asset/d031c0a1-67a9-49c1-a0d8-77a0e145a4c5";
const imgWiFiSignalLight = "https://www.figma.com/api/mcp/asset/8a0800da-920a-43a6-a2a9-08a0b7f06b5a";
const imgBatteryLight = "https://www.figma.com/api/mcp/asset/5578894e-044f-464c-8103-ff9d4ac85d82";
const imgIndicator = "https://www.figma.com/api/mcp/asset/0f665304-a66b-4bff-9154-08217f500496";
const img941 = "https://www.figma.com/api/mcp/asset/2a9b1250-481d-42e0-a921-86d8eba476dd";

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

type IconsProps = {
  className?: string;
  property1?: "Back" | "notification" | "translate" | "file" | "user-plus copy 1";
};

function Icons({ className, property1 = "Back" }: IconsProps) {
  const isFile = property1 === "file";
  const isNotification = property1 === "notification";
  const isTranslate = property1 === "translate";
  const isUserPlusCopy1 = property1 === "user-plus copy 1";
  return (
    <div className={className || `relative ${isUserPlusCopy1 ? "size-[18px]" : "overflow-clip size-[24px]"}`} id={isUserPlusCopy1 ? "node-1_3247" : isFile ? "node-1_3230" : isTranslate ? "node-1_3223" : isNotification ? "node-1_3182" : "node-1_3111"}>
      {["Back", "notification", "translate", "file"].includes(property1) && (
        <div className={`absolute ${isFile ? "inset-[12.5%_16.67%]" : isTranslate ? "inset-[12.5%]" : isNotification ? "inset-[12.5%_12.5%_8.33%_12.5%]" : "bottom-1/4 left-[16.67%] right-[16.67%] top-1/4"}`} id={isFile ? "node-1_3231" : isTranslate ? "node-1_3224" : isNotification ? "node-1_3183" : "node-1_3112"} data-name="Group">
          <div className={`absolute ${isFile ? "inset-[-4.44%_-5%]" : isTranslate ? "inset-[-4.44%_-5.96%_-5.96%_-5.96%]" : isNotification ? "inset-[-4.21%_-4.44%]" : "inset-[-9.43%_-5%]"}`}>
            <img alt="" className="block max-w-none size-full" src={isFile ? imgGroup5 : isTranslate ? imgGroup4 : isNotification ? imgGroup3 : imgGroup2} />
          </div>
        </div>
      )}
      {isUserPlusCopy1 && <img alt="" className="absolute block inset-0 max-w-none size-full" height="18" src={imgProperty1UserPlusCopy1} width="18" />}
    </div>
  );
}

function AlertTriangleCopy1({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[22px]"} data-node-id="1:3249" data-name="alert-triangle copy 1">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgAlertTriangleCopy1} />
    </div>
  );
}

function Mobile165146252({ className }: { className?: string }) {
  return (
    <div className={className || "h-[20px] relative w-[19px]"} data-node-id="1:3801" data-name="mobile_16514625 2">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMobile165146252} />
    </div>
  );
}

function IconsLogout({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-node-id="1:2622" data-name="Icons/logout">
      <div className="absolute inset-[12.5%_20.83%_12.5%_8.33%]" data-node-id="1:2623" data-name="Group">
        <div className="absolute inset-[-4.44%_-4.71%]">
          <img alt="" className="block max-w-none size-full" src={imgGroup6} />
        </div>
      </div>
    </div>
  );
}

type ListItemProps = {
  className?: string;
  property1?: "Language" | "Notification" | "User Agreement" | "Variant24";
};

function ListItem({ className, property1 = "Language" }: ListItemProps) {
  const isLanguageOrUserAgreementOrNotification = ["Language", "User Agreement", "Notification"].includes(property1);
  const isNotification = property1 === "Notification";
  const isUserAgreement = property1 === "User Agreement";
  const isVariant24 = property1 === "Variant24";
  return (
    <div className={className || `content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative w-[350px] ${isUserAgreement ? "rounded-[12px]" : isVariant24 ? "bg-white rounded-tl-[12px] rounded-tr-[12px]" : "bg-white rounded-[12px]"}`} id={isNotification ? "node-1_3448" : isUserAgreement ? "node-1_3445" : isVariant24 ? "node-1_3442" : "node-1_3431"}>
      {isLanguageOrUserAgreementOrNotification && (
        <>
          <Icons className="overflow-clip relative shrink-0 size-[24px]" property1={isNotification ? "notification" : isUserAgreement ? "file" : "translate"} />
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" id={isNotification ? "node-1_3450" : isUserAgreement ? "node-1_3447" : "node-1_3433"}>
            {isNotification ? "Push notifications" : isUserAgreement ? "User Agreement" : "Language"}
          </p>
        </>
      )}
      {property1 === "Language" && (
        <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[280px] text-[#55647b] text-[16px] top-[calc(50%-11px)] whitespace-nowrap" data-node-id="1:3434">
          English
        </p>
      )}
      {isVariant24 && (
        <>
          <div className="flex items-center justify-center relative shrink-0 size-[24px]">
            <div className="-scale-y-100 flex-none rotate-90">
              <Btn className="bg-[#73c1b1] content-stretch flex items-start p-[4px] relative rounded-[30px]" />
            </div>
          </div>
          <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[279px] text-[#55647b] text-[16px] top-[14px] whitespace-nowrap" data-node-id="1:3444">
            English
          </p>
        </>
      )}
      {isNotification && (
        <div className="absolute h-[20px] left-[296px] top-[13.5px] w-[34px]" data-node-id="1:3451" data-name="Togle">
          <div className="absolute bg-[#e3e6eb] inset-[15%_8.82%] rounded-[10px]" data-node-id="I1:3451;1:3534" />
          <div className="absolute bg-[#73c1b1] inset-[0_0_0_41.18%] rounded-[10px]" data-node-id="I1:3451;1:3535" />
        </div>
      )}
    </div>
  );
}

export default function SettingsScreen() {
  return (
    <div className="bg-[#ecf1f4] relative size-full" data-node-id="1:3783" data-name="1 | Settings">
      <div className="absolute content-stretch flex flex-col gap-[20px] items-start left-[20px] top-[130px]" data-node-id="1:3784" data-name="List">
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3785" data-name="Language">
          <ListItem className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" />
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="1:3787" data-name="Language List">
            <ListItem className="bg-white col-1 content-stretch flex gap-[8px] items-center ml-0 mt-0 px-[10px] py-[12px] relative rounded-tl-[12px] rounded-tr-[12px] row-1 w-[350px]" property1="Variant24" />
            <div className="bg-white col-1 content-stretch flex gap-[8px] items-center ml-0 mt-[48px] px-[10px] py-[12px] relative rounded-bl-[12px] rounded-br-[12px] row-1 w-[350px]" data-node-id="1:3789" data-name="List item">
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-scale-y-100 flex-none rotate-90">
                  <div className="content-stretch flex items-start p-[4px] relative rounded-[30px]" data-node-id="I1:3789;1:3443" data-name="Btn">
                    <div className="flex items-center justify-center relative shrink-0 size-[16px]">
                      <div className="-scale-y-100 flex-none rotate-90">
                        <div className="relative size-[16px]" data-node-id="I1:3789;1:3443;1:3277" data-name="Group">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="absolute font-['Outfit:Regular',sans-serif] font-normal leading-[normal] left-[279px] text-[#55647b] text-[16px] top-[14px] whitespace-nowrap" data-node-id="I1:3789;1:3444">
                Spanish
              </p>
            </div>
          </div>
        </div>
        <div className="h-0 relative shrink-0 w-[348px]" data-node-id="1:3790" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <ListItem className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" property1="Notification" />
        <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3792" data-name="List item">
          <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-pre" data-node-id="I1:3792;1:3450">{`        Vibration`}</p>
          <div className="absolute h-[20px] left-[296px] top-[13.5px] w-[34px]" data-node-id="I1:3792;1:3451" data-name="Togle">
            <div className="absolute bg-[#e3e6eb] inset-[15%_8.82%] rounded-[10px]" data-node-id="I1:3792;1:3451;1:3534" />
            <div className="absolute bg-[#73c1b1] inset-[0_0_0_41.18%] rounded-[10px]" data-node-id="I1:3792;1:3451;1:3535" />
          </div>
        </div>
        <div className="h-0 relative shrink-0 w-[348px]" data-node-id="1:3793" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[9px] items-start relative shrink-0" data-node-id="1:3794" data-name="Support">
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3795" data-name="List item">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3795;1:3453" data-name="Icons">
              <div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="I1:3795;1:3453;1:3162" data-name="Group">
                <div className="absolute inset-[-4.71%_-4.44%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup7} />
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3795;1:3454">
              Support
            </p>
          </div>
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3796" data-name="List item">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:3796;1:3453" data-name="Icons">
              <div className="absolute inset-[20.83%_33.31%_20.79%_33.33%]" data-node-id="I1:3796;1:3453;1:3235" data-name="Group">
                <div className="absolute inset-[-5.71%_-9.99%]">
                  <img alt="" className="block max-w-none size-full" src={imgGroup8} />
                </div>
              </div>
            </div>
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-nowrap" data-node-id="I1:3796;1:3454">
              FAQ
            </p>
          </div>
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3797" data-name="List item">
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-pre" data-node-id="I1:3797;1:3454">{`        Refferal link`}</p>
          </div>
          <div className="bg-white content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" data-node-id="1:3798" data-name="List item">
            <p className="font-['Outfit:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#192b48] text-[18px] tracking-[0.18px] whitespace-pre" data-node-id="I1:3798;1:3454">{`        Seed code`}</p>
          </div>
        </div>
        <div className="h-0 relative shrink-0 w-[348px]" data-node-id="1:3799" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine} />
          </div>
        </div>
        <ListItem className="content-stretch flex gap-[8px] items-center px-[10px] py-[12px] relative rounded-[12px] shrink-0 w-[350px]" property1="User Agreement" />
        <Mobile165146252 className="absolute h-[20px] left-[12px] top-[274px] w-[19px]" />
      </div>
      <AlertTriangleCopy1 className="absolute left-[31px] size-[22px] top-[660px]" />
      <Icons className="absolute left-[33px] size-[18px] top-[604px]" property1="user-plus copy 1" />
      <div className="absolute bg-[#ecf1f4] h-[56px] left-0 overflow-clip top-[44px] w-[390px]" data-node-id="1:3805" data-name="App Bar">
        <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[55px] w-[350px]" data-node-id="I1:3805;1:3315" data-name="Line">
          <div className="absolute inset-[-0.8px_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine1} />
          </div>
        </div>
        <div className="absolute left-[346px] overflow-clip size-[24px] top-[16px]" data-node-id="I1:3805;1:3316" data-name="Icons">
          <div className="absolute inset-[8.33%]" data-node-id="I1:3805;1:3316;1:3196" data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup9} />
          </div>
        </div>
        <a className="absolute block cursor-pointer left-[309px] size-[24px] top-[16px]" data-node-id="I1:3805;1:3317" data-name="Icons">
          <div className="absolute inset-[12.5%_12.5%_8.33%_12.5%]" data-node-id="I1:3805;1:3317;1:3188" data-name="Group">
            <div className="absolute inset-[-4.21%_-4.44%]">
              <img alt="" className="block max-w-none size-full" src={imgGroup3} />
            </div>
          </div>
          <div className="absolute bg-[#2d6e93] bottom-[54.17%] content-stretch flex items-start left-1/2 p-[2.167px] right-[-4.17%] rounded-[10.833px] top-[-8.33%]" data-node-id="I1:3805;1:3317;1:3192">
            <div className="relative shrink-0 size-[8.667px]" data-node-id="I1:3805;1:3317;1:3193">
              <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[7px] text-center text-white top-[calc(50%-2.5px)] tracking-[0.14px] whitespace-nowrap" data-node-id="I1:3805;1:3317;1:3194">
                3
              </p>
            </div>
          </div>
        </a>
        <p className="-translate-x-1/2 absolute font-['Outfit:Medium',sans-serif] font-medium leading-[normal] left-1/2 text-[#192b48] text-[20px] text-center top-[15px] tracking-[0.4px] whitespace-nowrap" data-node-id="I1:3805;1:3318">
          Settings
        </p>
        <div className="absolute flex items-center justify-center left-[16px] size-[32px] top-[12px]">
          <div className="-scale-y-100 flex-none rotate-90">
            <Btn className="content-stretch flex items-start p-[4px] relative rounded-[30px]" property1="Back Initial" />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#ecf1f4] h-[44px] left-0 overflow-clip right-0 top-0" data-node-id="1:3806" data-name="Status Bar">
        <div className="absolute h-[30px] left-0 right-0 top-0" data-node-id="I1:3806;1:3077" data-name="Notch" />
        <div className="absolute content-stretch flex gap-[4px] items-center right-[20px] top-[16px]" data-node-id="I1:3806;1:3081" data-name="Status Icons">
          <div className="h-[14px] relative shrink-0 w-[20px]" data-node-id="I1:3806;1:3082" data-name="Network Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNetworkSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]" data-node-id="I1:3806;1:3091" data-name="WiFi Signal / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFiSignalLight} />
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]" data-node-id="I1:3806;1:3095" data-name="Battery / Light">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBatteryLight} />
          </div>
        </div>
        <div className="absolute right-[71px] size-[6px] top-[8px]" data-node-id="I1:3806;1:3105" data-name="Indicator">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicator} />
        </div>
        <div className="absolute h-[21px] left-[21px] overflow-clip rounded-[20px] top-[12px] w-[54px]" data-node-id="I1:3806;1:3107" data-name="Time / Light">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[15px] left-[calc(50%+0.5px)] top-1/2 w-[33px]" data-node-id="I1:3806;1:3108" data-name="9:41">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={img941} />
          </div>
        </div>
      </div>
    </div>
  );
}
