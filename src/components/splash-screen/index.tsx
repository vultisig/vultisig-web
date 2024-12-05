import { useTranslation } from "react-i18next";

import constantKeys from "i18n/constant-keys";

const Component = () => {
  const { t } = useTranslation();

  return (
    <div className="splash-screen">
      <img src="/images/logo-radiation.svg" className="logo" alt="Logo" />
      <h1 className="heading">{t(constantKeys.VULTISIG)}</h1>
      <p className="text">{t(constantKeys.SECURE_CRYPTO_VAULT)}</p>
    </div>
  );
};

export default Component;
