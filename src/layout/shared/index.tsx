import { FC } from "react";
import { Outlet } from "react-router-dom";

import SharedContext from "context/shared";

const Component: FC = () => (
  <SharedContext>
    <Outlet />
  </SharedContext>
);

export default Component;
