import { homeAssets } from "../home/homeAssets";

export type GraphicChartAssets = {
  vector25: string;
  line: string;
};

const CHART_SCALES = [
  "7.00%",
  "6.00%",
  "5.00%",
  "4.00%",
  "3.00%",
  "2.00%",
  "1.00%",
  "0.00%",
  "-1.00%",
  "-2.00%",
];

/**
 * Performance chart — узел 1:3505 из эталона `home__full-screen__1-3644.tsx`.
 * Разметка: шкала absolute left-0 top-0; линия графика absolute left-[25px] top-[42px] поверх сетки.
 *
 * Прим.: графику на экранах не дорабатываем до отдельной задачи «полная реализация графики» — только связанный с этим блоком рефакторинг/правки верстки вне графика.
 */
export function FigmaGraphic({ chart }: { chart?: GraphicChartAssets }) {
  const assets = chart ?? {
    vector25: homeAssets.vector25,
    line: homeAssets.line,
  };

  return (
    <div className="fm-chart" data-node-id="1:3505" data-name="Graphic">
      <div className="fm-chart-scale">
        {CHART_SCALES.map((label) => (
          <div key={label} className="fm-scale-row">
            <p className="fm-scale-label">{label}</p>
            <div className="fm-scale-line">
              <div className="fm-scale-line-imgwrap">
                <img alt="" src={assets.vector25} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fm-chart-line">
        <div className="fm-chart-line-imgwrap">
          <img alt="" src={assets.line} />
        </div>
      </div>
    </div>
  );
}
