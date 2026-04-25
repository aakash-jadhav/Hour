import { Dispatch, SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";
import { brandIconUrl } from "../brandIcon";
import { IconAnalytics, IconMoon, IconPlay, IconSun, IconTasks } from "./icons";

type Props = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

export function MainNav({ darkMode, setDarkMode }: Props) {
  const { pathname } = useLocation();
  const onTasks = pathname === "/" || pathname === "";
  const onAnalytics = pathname === "/analytics";

  return (
    <header className="main-nav brutal-card">
      <Link to="/" className="main-nav__brand" aria-label="Hour Focus home">
        <img src={brandIconUrl} alt="" className="main-nav__brand-icon" width={40} height={40} decoding="async" />
        <span className="brand-title">Hour Focus</span>
      </Link>

      <div role="tablist" aria-label="Main sections" className="main-nav__tablist">
        <Link
          to="/"
          role="tab"
          aria-selected={onTasks}
          className={`main-nav__tab btn-with-icon${onTasks ? " main-nav__tab--active" : ""}`}
        >
          <IconTasks />
          <span className="btn-label">Tasks</span>
        </Link>
        <Link
          to="/analytics"
          role="tab"
          aria-selected={onAnalytics}
          className={`main-nav__tab btn-with-icon${onAnalytics ? " main-nav__tab--active" : ""}`}
        >
          <IconAnalytics />
          <span className="btn-label">Analytics</span>
        </Link>
      </div>

      <div className="main-nav__actions">
        {onAnalytics ? (
          <Link to="/" className="main-nav__cta btn-with-icon" aria-label="Start timer on tasks page">
            <IconPlay />
            <span className="btn-label">Start timer</span>
          </Link>
        ) : null}
        <button
          type="button"
          className="btn-theme-toggle btn-with-icon"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDarkMode((prev) => !prev)}
        >
          <span className="btn-theme-toggle__inner">
            {darkMode ? <IconSun /> : <IconMoon />}
            <span className="btn-label">{darkMode ? "Light" : "Dark"}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
