import { FC } from "react";
import { useParams } from "react-router-dom";
//import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { useSharedContext } from "context/shared";
import constantPaths from "routes/constant-paths";
import useGoBack from "hooks/go-back";

import { CaretRightOutlined } from "icons";
import AssetItem from "components/asset-item";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";
//import translation from "i18n/constant-keys";

const Component: FC = () => {
  //const { t } = useTranslation();
  const { chainKey, uid } = useParams();
  const { currency } = useBaseContext();
  const { vault } = useSharedContext();
  const goBack = useGoBack();

  const chain = vault?.chains.find(
    ({ name }) => name.toLowerCase() === chainKey
  );

  return chain ? (
    <div className="layout-content assets-page">
      <div className="breadcrumb">
        <Button
          type="link"
          className="back"
          onClick={() => goBack(`${constantPaths.shared.root}/${uid}`)}
        >
          <CaretRightOutlined />
        </Button>
        <h1>{chain.name}</h1>
      </div>
      <div className="content">
        <div className="chain">
          <div className="type">
            <TokenImage alt={chain.name} />
            {chain.name}
          </div>
          <div className="key">
            <Truncate end={10} middle>
              {chain.address}
            </Truncate>
          </div>
          <span className="amount">
            {chain.coins
              .reduce((acc, coin) => acc + coin.balance * coin.value, 0)
              .toValueFormat(currency)}
          </span>
          <TokenActions address={chain.address} name={chain.name} />
        </div>
        {chain.coins
          .slice()
          .sort((a, b) => b.balance * b.value - a.balance * a.value)
          .map(({ ticker, ...res }) => (
            <AssetItem key={ticker} {...{ ...res, ticker }} />
          ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Component;
