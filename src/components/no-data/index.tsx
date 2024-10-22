import type { FC } from "react";
import { CodeSandboxOutlined } from "@ant-design/icons";

interface ComponentProps {
  text: string;
  title?: string;
}

const Component: FC<ComponentProps> = ({ text, title }) => {
  return (
    <div className="no-data-wrapper">
      <h4 className="title">
        {title && (
          <>
            {title} {" :"}
          </>
        )}
      </h4>
      <div className="no-data">
        <CodeSandboxOutlined />
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Component;
