import { Navigate, useLocation, useParams } from "react-router-dom";
import { LEGACY_TYPE_TO_BASE } from "./boardPaths";

/** 예전 /main/4/cat/:cat 전용 → /profile/:cat */
export function LegacyProfileFromMain() {
  const { cat } = useParams();
  const location = useLocation();
  return <Navigate to={`/profile/${cat}${location.search}${location.hash}`} replace />;
}

/** 예전 /main/:type 및 /main/:type/search/... */
export function LegacyMainRedirect() {
  const { type } = useParams();
  const location = useLocation();

  const base = LEGACY_TYPE_TO_BASE[type ?? ""] ?? "/home";
  const prefix = `/main/${type}`;
  const suffix = location.pathname.startsWith(prefix) ? location.pathname.slice(prefix.length) : "";
  const to = `${base}${suffix}`;

  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
}
