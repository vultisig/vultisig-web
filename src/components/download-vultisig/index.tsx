import { FC } from "react";
import { useTranslation } from "react-i18next";

import constantKeys from "i18n/constant-keys";

const Component: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="download-vultisig">
      <p className="description">{t(constantKeys.DOWNLOAD_APP)}</p>
      <ul className="download">
        <li>
          <a
            href="https://testflight.apple.com/join/kpVufItl"
            target="_blank"
            rel="noopener noreferrer"
            className="image"
          >
            <img src="/images/app-store.png" alt="iPhone" />
          </a>
          <a
            href="https://testflight.apple.com/join/kpVufItl"
            target="_blank"
            rel="noopener noreferrer"
            className="text"
          >
            iPhone
          </a>
        </li>
        <li>
          <a
            href="https://play.google.com/store/apps/details?id=com.vultisig.wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="image"
          >
            <img src="/images/google-play.png" alt="Android" />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.vultisig.wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text"
          >
            Android
          </a>
        </li>
        <li>
          <a
            href="https://github.com/vultisig/vultisig-ios/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="image"
          >
            <img src="/images/github.png" alt="Mac" />
          </a>
          <a
            href="https://github.com/vultisig/vultisig-ios/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text"
          >
            Mac
          </a>
        </li>
        <li>
          <a
            href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
            target="_blank"
            rel="noopener noreferrer"
            className="image"
          >
            <img src="/images/chrome-extension.png" alt="Chrome" />
          </a>
          <a
            href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
            target="_blank"
            rel="noopener noreferrer"
            className="text"
          >
            Chrome
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Component;
