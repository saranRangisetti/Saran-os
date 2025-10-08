import { memo, type FC } from "react";
import StyledAIButton from "components/system/Taskbar/AI/StyledAIButton";
import { DIV_BUTTON_PROPS } from "utils/constants";
import { label } from "utils/functions";

type CopilotButtonProps = {
  open: boolean;
  toggle: () => void;
};

const CopilotButton: FC<CopilotButtonProps> = ({ toggle }) => (
  <StyledAIButton onClick={toggle} {...DIV_BUTTON_PROPS} {...label("Copilot")}>🤖</StyledAIButton>
);

export default memo(CopilotButton);


