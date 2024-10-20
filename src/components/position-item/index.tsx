import type { FC } from "react";
import { Tooltip } from "antd";

import { PositionInfo } from "utils/constants";
import TokenImage from "components/token-image";
import { useBaseContext } from "context/base";
import { Hyperlink } from "icons";

interface ComponentProps {
  data?: PositionInfo[];
  title?: string;
}

const Component: FC<ComponentProps> = ({ data, title }) => {
  const { currency } = useBaseContext();

  return (
    <div className="position-item-wrapper">
      <h4 className="title">{title} :</h4>
      <div className="lp">
        {data?.map((item, index) => (
          <>
            <div className="lp-row" key={index}>
              <div className="lp-pool">
                {item.base && (
                  <div className="type lp-item">
                    <TokenImage alt={item.base.baseTiker} />
                    <span className="name">{item.base.baseChain}</span>

                    <span className="text">
                      {item.base.baseTokenAmount
                        ? Number(item.base.baseTokenAmount).toLocaleString()
                        : 0}{" "}
                      {item.base.baseTiker}
                    </span>
                  </div>
                )}

                {item.base && item.target && (
                  <div className="convert lp-item">
                    <img src="/images/convert.svg" />
                  </div>
                )}

                {item.target && (
                  <div className="type lp-item">
                    <TokenImage alt={item.target.targetChain} />
                    <span className="name">{item.target.targetChain}</span>
                    <span className="text">
                      {item.target.targetTokenAmount
                        ? Number(item.target.targetTokenAmount).toLocaleString()
                        : 0}{" "}
                      {item.target.targetTiker}
                    </span>
                  </div>
                )}
              </div>

              <div className="lp-amount">
                <div className="lp-item">
                  {(item.base || item.target) &&
                    (
                      (Number(item.base?.reward) || 0) +
                      (item.base
                        ? item.base.baseTokenAmount * item.base.basePriceUsd
                        : 0) +
                      (item.target
                        ? item.target.targetTokenAmount *
                          item.target.targetPriceUsd
                        : 0)
                    ).toValueFormat(currency)}
                </div>
                <div className="lp-item link-to-address">
                  <Tooltip title="Link to Address">
                    <a
                      href={
                        item.target
                          ? item.target.targetTokenAddress
                          : "" + item.base
                          ? item.base?.baseTokenAddress
                          : ""
                      }
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Hyperlink />
                    </a>
                  </Tooltip>
                </div>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default Component;
