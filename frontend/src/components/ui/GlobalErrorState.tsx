import { AlertTriangle } from "lucide-react";
import Button from "@ui/Button";

interface Props {
  title?: string;
  description?: string;
  onRetry: () => void;
}

const GlobalErrorState = ({
  title = "Unable to load data",
  description = "Something went wrong. Please try again.",
  onRetry
}: Props) => {
  return (
    <div className="global-error-wrapper">
      <div className="global-error-card">
        <div className="error-icon-wrapper">
          <AlertTriangle size={34} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        <Button onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

export default GlobalErrorState;
