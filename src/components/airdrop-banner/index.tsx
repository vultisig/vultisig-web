import { FC } from "react";
import { Alert } from "antd";

const AirdropBanner: FC = () => {
  return (
    <Alert
      message={
        <span>
          Airdrop is discontinued.{" "}
          <a
            href="https://x.com/vultisig/status/2006823008854298799"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#33e6bf", textDecoration: "underline" }}
          >
            Read details here
          </a>
        </span>
      }
      type="info"
      banner
      closable={false}
      style={{
        textAlign: "center",
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        backgroundColor: "rgba(51, 230, 191, 0.1)",
        borderColor: "rgba(51, 230, 191, 0.3)",
        color: "#fff",
      }}
    />
  );
};

export default AirdropBanner;
