import { FC, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { LayoutKey } from "utils/constants";

import Header from "components/header";
import ChangeLanguage from "modals/change-language";

const Component: FC = () => {
  const componentDidMount = (): void => {};

  useEffect(componentDidMount, []);

  return (
    <>
      <div className="layout layout-account">
        <Header layout={LayoutKey.DEFAULT} />
        <Outlet
          context={{
            layout: LayoutKey.DEFAULT,
          }}
        />
      </div>

      <ChangeLanguage />
    </>
  );
};

export default Component;
