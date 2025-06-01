import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import { CodeSandboxOutlined } from "@ant-design/icons";

import { PositionProps } from "utils/interfaces";
import { useBaseContext } from "context";
import constantKeys from "i18n/constant-keys";

import { Check, Hyperlink } from "icons";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  data?: PositionProps[];
  text: string;
  title: string;
}

const Component: FC<ComponentProps> = ({ data, text, title }) => {
  const { t } = useTranslation();
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
                        {`${item.base.tokenAmount} ${item.base.tiker}`}
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
                  <span className="counted">
                    <Check />
                    {t(constantKeys.COUNTED)}
                  </span>
                  <span className="balance">
                    {(item.base || item.target) &&
                      (
                        ((Number(item.base?.reward) || 0) +
                          (Number(item.base?.price) || 0) +
                          (Number(item.target?.price) || 0)) *
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
                      className="link"
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
