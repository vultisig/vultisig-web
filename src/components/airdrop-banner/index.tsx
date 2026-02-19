import { FC } from "react";
import { Alert } from "antd";

const AirdropBanner: FC = () => {
  return (
    <Alert
      message={
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          Airdrop is discontinued.{" "}
          <a
            href="https://x.com/vultisig/status/2006823008854298799"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#33e6bf",
              textDecoration: "underline",
              fontWeight: 600,
            }}
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
        backgroundColor: "rgba(51, 230, 191, 0.15)",
        borderColor: "rgba(51, 230, 191, 0.4)",
        borderBottom: "2px solid rgba(51, 230, 191, 0.4)",
        color: "#fff",
        padding: "16px 24px",
        minHeight: "56px",
      }}
    />
  );
};

export default AirdropBanner;
