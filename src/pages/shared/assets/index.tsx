import { FC } from "react";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { useSharedContext } from "context/shared";
import constantPaths from "routes/constant-paths";
import useGoBack from "hooks/go-back";

import { ArrowRight } from "icons";
import AssetItem from "components/asset-item";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";

const Component: FC = () => {
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
          <ArrowRight />
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
            {chain.balance.toValueFormat(currency)}
          </span>
          <TokenActions address={chain.address} name={chain.name} />
        </div>
        {chain.coins.map(({ ticker, ...res }) => (
          <AssetItem key={ticker} {...{ ...res, ticker }} />
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Component;
