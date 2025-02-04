import { FC, useEffect } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context";
import { chooseToken, LayoutKey, PageKey } from "utils/constants";
import { VaultOutletContext } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { ArrowRight, CirclePlus } from "icons";
import AssetItem from "components/chain-asset-item";
import ChooseToken from "modals/choose-token";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";

const Component: FC = () => {
  const { t } = useTranslation();
  const { chainKey } = useParams();
  const { changePage, baseValue, currency } = useBaseContext();
  const { getTokens, layout, vault } = useOutletContext<VaultOutletContext>();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const chain = vault.chains.find(
    ({ name }) => name.toLowerCase() === chainKey
  );

  const componentDidMount = () => {
    if (chain) {
      if (layout === LayoutKey.VAULT) {
        changePage(PageKey.VAULT_CHAIN_ASSETS);

        if (chooseToken[chain.name]) {
          getTokens(chain)
            .then(() => {})
            .catch(() => {});
        }
      } else {
        changePage(PageKey.SHARED_CHAIN_ASSETS);
      }
    } else {
      navigate(constantPaths.vault.chains);
    }
  };

  useEffect(componentDidMount, []);

  return (
    chain && (
      <>
        <div className="layout-content assets-page">
          <div className="breadcrumb">
            <Button
              type="link"
              className="back"
              onClick={() =>
                goBack(
                  layout === LayoutKey.VAULT
                    ? constantPaths.vault.chains
                    : constantPaths.shared.chains
                        .replace(":alias", vault.alias.replace(/ /g, "-"))
                        .replace(":uid", vault.uid)
                )
              }
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
                {((chain.balance ?? 0) * baseValue).toValueFormat(currency)}
              </span>
              <TokenActions address={chain.address} name={chain.name} />
            </div>
            {chain.coins.map(({ balance, isNative, logo, ticker, value }) => (
              <AssetItem
                key={ticker}
                chain={chain.name}
                balance={balance}
                isNative={isNative}
                logo={logo}
                ticker={ticker}
                value={value}
              />
            ))}
          </div>
          {layout === LayoutKey.VAULT && chooseToken[chain.name] && (
            <Link
              to={`#${constantModals.CHOOSE_TOKEN}`}
              state={true}
              className="add"
            >
              <CirclePlus /> {t(constantKeys.CHOOSE_TOKEN)}
            </Link>
          )}
        </div>

        {layout === LayoutKey.VAULT && chooseToken[chain.name] && (
          <ChooseToken />
        )}
      </>
    )
  );
};

export default Component;
