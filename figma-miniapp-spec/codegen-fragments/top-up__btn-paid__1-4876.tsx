/** Figma MCP get_design_context — node 1:4876 */
const imgGroup = "https://www.figma.com/api/mcp/asset/38991d2b-235a-47fc-822c-71bff97d1edc";

export default function Btn() {
  return (
    <a className="bg-[#2d6e93] content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[20px] py-[14px] relative rounded-[54px] size-full" data-node-id="1:4876" data-name="Btn">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="I1:4876;1:3255" data-name="Icons">
        <div className="absolute inset-[29.17%_16.67%_29.17%_20.83%]" data-node-id="I1:4876;1:3255;1:3218" data-name="Group">
          <div className="absolute inset-[-14.14%_-9.43%_-10%_-9.43%]">
            <img alt="" className="block max-w-none size-full" src={imgGroup} />
          </div>
        </div>
      </div>
      <p className="font-['Outfit:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-left text-white whitespace-nowrap" data-node-id="I1:4876;1:3256">
        Paid
      </p>
    </a>
  );
}
