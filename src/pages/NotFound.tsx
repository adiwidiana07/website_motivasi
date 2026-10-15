import { Link } from "react-router-dom";
import { usePageTitle } from "../lib/hooks";
import { useI18n } from "../lib/i18n";

export default function NotFoundPage() {
  const { copy } = useI18n();
  usePageTitle(copy.notFound.label);

  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center pt-16 pb-24">
      <p className="label label-accent">{copy.notFound.label}</p>
      <h1 className="font-display display-hero mt-6 text-[clamp(2.25rem,6vw,4rem)] leading-tight font-medium">
        {copy.notFound.title}
      </h1>
      <p className="mt-5 max-w-sm text-muted">{copy.notFound.intro}</p>
      <div className="mt-9">
        <Link to="/" className="btn btn-primary">
          {copy.notFound.cta}
        </Link>
      </div>
    </div>
  );
}
