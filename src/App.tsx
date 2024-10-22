import { useEffect } from "react";
import { ConfigProvider, theme } from "antd";

import { changeTheme } from "utils/functions";
import BaseContext from "context";
import Routes from "routes";

const App = () => {
  const componentDidMount = (): void => {
    changeTheme();
  };

  useEffect(componentDidMount, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#33e6bf",
          colorPrimaryText: "#000",
          fontFamily: "inherit",
        },
      }}
    >
      <BaseContext>
        <Routes />
      </BaseContext>
    </ConfigProvider>
  );
};

export default App;
