import { publicAsset } from "../../utils/publicAsset";

const h = (name: string) => publicAsset(`assets/home/${name}`);

/** Локальные файлы MCP → `public/assets/home/` */
export const homeAssets = {
  group: h("cefd4b43-1060-431c-9a06-cea83847bfa0.svg"),
  group1: h("be65cc69-ee4d-4730-9fcf-6f8853c0715d.svg"),
  vector25: h("8f8db6ee-b2b2-40f3-b516-9cd0439151f5.svg"),
  line: h("be71118b-2a63-4d61-a813-018e9af04e3b.svg"),
  dot: h("be368463-9b23-48af-b4f3-9d110a3fab1a.svg"),
  group2: h("b7854477-97e2-4749-942b-1b66120df4e9.svg"),
  group3: h("71f02fab-ab66-44b6-857f-3b8090405a0c.svg"),
  group4: h("d31309cf-5450-45b7-a0b8-854211148ddc.svg"),
  group5: h("7ad0beae-ecf3-4ae9-a7db-a2f286f59090.svg"),
  group6: h("38725bc9-d7e1-4eda-b11e-fcf010d0bb75.svg"),
  group7: h("926a0022-c8e1-4d4a-8c81-651e230bc4fd.svg"),
  group8: h("10dca862-1072-4bf0-87c3-20f9cbdd140e.svg"),
  group9: h("ee4fe4d9-8fae-4244-8534-22f69322f297.svg"),
  group10: h("7dc2fd10-9b13-4a63-927c-974a4db64d0a.svg"),
  line1: h("793f968e-ed36-4107-8e4f-ec013b7c61f8.svg"),
  line2: h("351072f6-5afb-4366-9c9d-76a18a577b4d.svg"),
  group11: h("627cee55-525d-4c8c-9511-a0c50315a2bb.svg"),
  group12: h("0ad6b9e9-6d3b-4d5f-af2b-418dce1a694b.svg"),
  networkSignalLight: h("f8e8eb63-4e47-44c2-b556-0ba6265f040d.svg"),
  wifiSignalLight: h("13e40d88-a052-48e5-aa5a-79e9c2ee705b.svg"),
  batteryLight: h("e139cf69-1785-42d3-bcb2-4a744fb73693.svg"),
  indicator: h("76a2fb64-d884-4596-a5c2-617003fb75ef.svg"),
  time941: h("f504bf62-f957-4c68-91a2-a22ef2b4c1ae.svg"),
} as const;
