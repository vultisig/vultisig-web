import type { FC } from "react";
import { Tooltip } from "antd";
import { CodeSandboxOutlined } from "@ant-design/icons";

import { PositionProps } from "utils/interfaces";
import { useBaseContext } from "context";
import { TickerKey } from "utils/constants";

import { Hyperlink } from "icons";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  data?: PositionProps[];
  text: string;
  title: string;
}

const Component: FC<ComponentProps> = ({ data, text, title }) => {
  const { baseValue, currency } = useBaseContext();

  return (
    <div className="position-item">
      <span className="title">{`${title}:`}</span>

      {data ? (
        data.length ? (
          <div className="list">
            {data.map((item, index) => (
              <div
                className={`item${item.base && item.target ? " full" : ""}`}
                key={index}
              >
                <div className="pool">
                  {item.base && (
                    <div className="type">
                      <TokenImage alt={item.base.tiker} />

                      <span className="name">{item.base.chain}</span>

                      <span className="text">
                        {item.base.tiker === TickerKey.WEWE
                          ? `${item.base.tokenAmount}% ${TickerKey.WEWE}/${TickerKey.USDC}`
                          : `${item.base.tokenAmount} ${item.base.tiker}`}
                      </span>
                    </div>
                  )}

                  {item.base && item.target && (
                    <img src="/images/convert.svg" className="convert" />
                  )}

                  {item.target && (
                    <div className="type">
                      <TokenImage alt={item.target.chain} />

                      <span className="name">{item.target.chain}</span>

                      <span className="text">
                        {`${item.target.tokenAmount} ${item.target.tiker}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="amount">
                  <span>
                    {(item.base || item.target) &&
                      (
                        ((Number(item.base?.reward) || 0) +
                          (item.base ? item.base.price : 0) +
                          (item.target ? item.target.price : 0)) *
                        baseValue
                      ).toValueFormat(currency)}
                  </span>
                  <Tooltip title="Link to Address">
                    <a
                      href={
                        item.target
                          ? item.target.tokenAddress
                          : item.base
                          ? item.base.tokenAddress
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
            ))}
          </div>
        ) : (
          <div className="empty">
            <CodeSandboxOutlined />
            <span>{text}</span>
          </div>
        )
      ) : (
        <div className="loading">
          <VultiLoading />
        </div>
      )}
    </div>
  );
};

export default Component;
