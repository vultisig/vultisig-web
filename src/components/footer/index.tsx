import { FC } from "react";
import { useTranslation } from "react-i18next";
import translation from "i18n/constant-keys";
import { Link } from "react-router-dom";

interface ComponentProps {
}

const Component: FC<ComponentProps> = () => {
    const { t } = useTranslation();

    return (
        <>
            <div className="footer-container">
                <span className="powered_by">{t(translation.POWERED_BY)} <Link to="https://vultisig.com/">Vultisig</Link></span>
            </div>
        </>
    );
};

export default Component;