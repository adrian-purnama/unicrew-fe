import Navigation from '../../component/Navigation';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Star,
  Database,
  ChevronRight,
  ShieldCheck,
  Wrench,
  EyeClosed,
  Briefcase,
} from 'lucide-react';
import Footer from '../../component/Footer';

function CardLink({ to, title, subtitle, Icon }) {
  return (
    <Link
      to={to}
      className="
        group relative rounded-xl border border-gray bg-color-2 p-5
        hover:shadow-md hover:border-[rgb(var(--color-primary))]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]
        transition
        flex flex-col
      "
    >
      {/* icon */}
      <div className="
        mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg
        bg-primary-20 text-primary
        group-hover:scale-105 transition
      ">
        <Icon className="h-5 w-5" />
      </div>

      {/* content */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-color">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray">{subtitle}</p>}
      </div>

      {/* arrow */}
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
        Go
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>

      {/* subtle accent gradient */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-xl opacity-0
          group-hover:opacity-100 transition
        "
        style={{
          background:
            'linear-gradient(180deg, rgba(var(--color-primary),0.08), transparent 60%)',
        }}
      />
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <>
      <div className='bg-color-1'>

      <main className="mx-auto max-w-6xl p-6 space-y-8 bg-color-1">
        {/* Header */}
        <header className="rounded-xl border border-gray bg-color-2 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-color">Admin</h1>
              <p className="mt-1 text-sm text-gray">
                Manage users, companies, content, and reference data.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray bg-color-1 px-3 py-2 text-sm text-color">
                <ShieldCheck className="h-4 w-4 text-primary" />
                You have admin access
              </span>
            </div>
          </div>
        </header>

        {/* Primary sections */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardLink
              to="/admin/users"
              title="Users"
              subtitle="Search, activate/deactivate, and remove user accounts."
              Icon={Users}
            />
            <CardLink
              to="/admin/companies"
              title="Companies"
              subtitle="Review company profiles, status, and ratings."
              Icon={Building2}
            />
            <CardLink
              to="/admin/reviews"
              title="Reviews"
              subtitle="Browse feedback and remove inappropriate reviews."
              Icon={Star}
            />
            <CardLink
              to="/admin/jobs"
              title="Job Management"
              subtitle="View job posts and manage applications with status tracking."
              Icon={Briefcase}
            />
            <CardLink
              to="/admin/entry"
              title="Data Entry"
              subtitle="Locations, skills, industries, study programs, universities."
              Icon={Database}
            />
            <CardLink
              to="/admin/resetpassword"
              title="Reset Password"
              subtitle="Run Indonesia Provinsi/Kabupaten/Kecamatan sync."
              Icon={EyeClosed}
            />
          </div>
        </section>

        {/* Tips / Shortcuts */}
        {/* <section className="rounded-xl border border-gray bg-color-2 p-5">
          <h2 className="text-base font-semibold text-color">Quick tips</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray">
            <li>
              • Use <span className="font-medium text-color">Reviews</span> to delete spam or abusive
              feedback.
            </li>
            <li>
              • In <span className="font-medium text-color">Data Entry</span>, you can edit names inline and search where available.
            </li>
            <li>
              • Location <span className="font-medium text-color">Sync</span> shows streaming progress and can be stopped anytime.
            </li>
          </ul>
        </section> */}
      </main>
      </div>

    </>
  );
}
