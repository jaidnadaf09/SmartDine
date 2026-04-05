import React from "react";

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumb,
  title,
  subtitle
}) => {
  return (
    <div className="page-header">
      
      <div className="page-breadcrumb">
        {breadcrumb}
      </div>

      <h1 className="page-title">
        {title}
      </h1>

      {subtitle && (
        <p className="page-subtitle">
          {subtitle}
        </p>
      )}

    </div>
  );
};

export default PageHeader;
