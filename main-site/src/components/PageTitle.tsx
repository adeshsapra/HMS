import { Link } from "react-router-dom";

interface PageTitleProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

const PageTitle = ({ title, description, breadcrumbs }: PageTitleProps) => {
  return (
    <div className="page-title">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="breadcrumbs">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <li
                  key={index}
                  className={`breadcrumb-item ${
                    index === breadcrumbs.length - 1 ? "active current" : ""
                  }`}
                >
                  {crumb.path ? (
                    <Link to={crumb.path}>
                      {index === 0 && <i className="bi bi-house"></i>}{" "}
                      {crumb.label}
                    </Link>
                  ) : (
                    <>
                      {index === 0 && <i className="bi bi-house"></i>}{" "}
                      {crumb.label}
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      {/* <div className="title-wrapper">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div> */}
      <div className="title-wrapper">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

export default PageTitle;
