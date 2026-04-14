import { Link } from "react-router-dom";
import { ApplicationForm } from "../components/ApplicationForm";

export function InternshipApplicationPage({ internshipType }) {
  return (
    <main className="section-shell py-10 sm:py-14 lg:py-16">
      <section className="mx-auto max-w-4xl animate-fadeUp">
        <Link to="/" className="secondary-button mb-5 w-fit px-4 py-2 text-sm">
          Back
        </Link>
        <ApplicationForm internshipType={internshipType} />
      </section>
    </main>
  );
}
