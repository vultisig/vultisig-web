import { FC } from "react";
import { Outlet } from "react-router-dom";

import VaultContext from "context/vault";

const Component: FC = () => (
  <VaultContext>
    <Outlet />
  </VaultContext>
);

export default Component;
