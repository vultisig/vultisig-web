import { FC, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import { chooseToken } from "utils/constants";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";
import useGoBack from "hooks/go-back";

import { CaretRightOutlined, PlusCircleFilled } from "icons";
import AssetItem from "components/asset-item";
import ChooseToken from "modals/choose-token";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

const Component: FC = () => {
  const { t } = useTranslation();
  const { chainKey } = useParams();
  const { currency } = useBaseContext();
  const { changeVault, getTokens, vault } = useVaultContext();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const chain =
    vault?.updated &&
    vault?.chains.find(({ name }) => name.toLowerCase() === chainKey);

  const chainDidUpdate = () => {
    if (chain) {
      if (chooseToken[chain.name]) {
        getTokens(chain)
          .then(() => {})
          .catch(() => {});
      }
    } else {
      navigate(constantPaths.vault.chains);
    }
  };

  const vaultDidUpdate = () => {
    if (vault && !vault.updated) changeVault(vault, true);
  };

  useEffect(chainDidUpdate, [chainKey]);
  useEffect(vaultDidUpdate, [vault]);

  return chain ? (
    <>
      <div className="layout-content assets-page">
        <div className="breadcrumb">
          <Button
            type="link"
            className="back"
            onClick={() => goBack(constantPaths.vault.chains)}
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
          {chain.coins.length ? (
            chain.coins
              .slice()
              .sort((a, b) => b.balance * b.value - a.balance * a.value)
              .map(({ ticker, ...res }) => (
                <AssetItem key={ticker} {...{ ...res, ticker }} />
              ))
          ) : (
            <Empty description="Choose a asset..." />
          )}
        </div>
        {chooseToken[chain.name] && (
          <Link
            to={`#${constantModals.CHOOSE_TOKEN}`}
            state={true}
            className="add"
          >
            <PlusCircleFilled /> {t(translation.CHOOSE_TOKEN)}
          </Link>
        )}
      </div>

      {chooseToken[chain.name] && <ChooseToken />}
    </>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
