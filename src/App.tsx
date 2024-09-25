import { ConfigProvider, theme } from "antd";

import BaseContext from "context/base";
import Routes from "routes";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Modal: {
            //colorBgElevated: "#02122b",
            paddingLG: 8,
          },
          Dropdown: {
            paddingBlock: 8,
          },
          List: {
            itemPadding: "12px 0",
          },
          Message: {
            //contentBg: "#11284a",
          },
          Tooltip: {
            // colorBgSpotlight: "#33e6bf",
            // colorTextLightSolid: "#000",
          },
        },
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
