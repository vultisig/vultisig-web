import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStoredVaults, setStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";

const Component: FC = () => {
  const { ecdsa, eddsa } = useParams();
  const navigate = useNavigate();

  const componentDidMount = (): void => {
    const vaults = getStoredVaults();

    if (vaults.length) {
      const index = vaults.findIndex(
        ({ publicKeyEcdsa, publicKeyEddsa }) =>
          publicKeyEcdsa === ecdsa && publicKeyEddsa == eddsa
      );

      if (index >= 0) {
        setStoredVaults(
          vaults.map((vault, ind) => ({ ...vault, isActive: ind === index }))
        );

        navigate(constantPaths.vault.chains, { replace: true });
      } else {
        navigate(constantPaths.default.import, { replace: true });
      }
    } else {
      navigate(constantPaths.default.import, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

  return false;
};

export default Component;
