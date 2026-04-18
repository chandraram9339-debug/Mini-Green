/** Figma MCP get_design_context — node 1:4875 */
const imgGroup = "https://www.figma.com/api/mcp/asset/a7899071-15ea-4b14-ad59-55914c428937";

export default function Btn() {
  return (
    <div className="bg-[#e3e6eb] content-stretch flex gap-[8px] items-center justify-center px-[20px] py-[14px] relative rounded-[54px] size-full" data-node-id="1:4875" data-name="Btn">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:4875;1:3255" data-name="Icons">
        <div className="absolute inset-[12.5%]" data-node-id="I1:4875;1:3255;1:3244" data-name="Group">
          <div className="absolute inset-[-4.44%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup} />
          </div>
        </div>
      </div>
      <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#55647b] text-[16px] whitespace-nowrap" data-node-id="I1:4875;1:3256">
        Copy
      </p>
    </div>
  );
}
